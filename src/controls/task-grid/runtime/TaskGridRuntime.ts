import { EventEmitter, Filtering, IDataProvider, IEventEmitter, Operators } from "@talxis/client-libraries";
import { Type } from "@talxis/client-libraries/dist/utils/fetch-xml/filter/Type";
import { IPcfContext } from "@interfaces";
import { ILocalizationService, IStateStore } from "@utils";
import { ErrorHelper } from "@utils/error-handling";
import type { IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlRuntime, IDatasetControlView } from "@controls/dataset-control";
import { ITaskGridLabels } from "../labels";
import { ITaskGridDescriptor, ITaskGridParameters } from "../interfaces";
import { ITaskGridServiceLocator, ITaskGridServiceMap, ServiceLocator } from "../services";
import { ITaskGridFeature } from "../modules/interfaces";
import { IDeleteTasksResult, ITaskDataProvider, TaskDataProvider } from "../providers/task";
import { TaskExpansionProvider } from "../providers/expansion";
import { ISavedQuery, ISavedQueryMetadata, PATH_COLUMN_NAME, SavedQueryDataProvider } from "../providers/saved-query";
import { MODULES_STATE_KEY } from "../providers/state";

const STATE_CODE_ACTIVE = 0;
const STATE_KEY = 'taskGrid';
const FLAT_LIST_STATE_KEY = 'flatList';

export interface ITaskGridRuntimeEvents {
    /** The task grid is going away; every provider still holds its data. */
    onDestroyed: () => void;
}

/** The task grid's services, settings and view actions. */
export interface ITaskGridRuntime {
    readonly events: IEventEmitter<ITaskGridRuntimeEvents>;
    readonly services: ITaskGridServiceLocator;
    /** The view loaded last, or being loaded. */
    getViewId(): string | undefined;
    /** What the task grid and its features keep for the view loaded last, or being loaded. */
    getViewStateStore(): IStateStore;
    isTaskCreatingEnabled(): boolean;
    isTaskEditingEnabled(): boolean;
    isTaskDeletingEnabled(): boolean;
    isRowDraggingEnabled(): boolean;
    isInlineCreateEnabled(): boolean;
    isQuickFindEnabled(): boolean;
    isViewSwitcherEnabled(): boolean;
    isEditColumnsEnabled(): boolean;
    isEditColumnsScopeSelectorEnabled(): boolean;
    isShowHierarchyToggleVisible(): boolean;
    isHideInactiveTasksToggleVisible(): boolean;
    /** Whether the view shows a flat list rather than the tree. */
    isFlatListEnabled(): boolean;
    toggleFlatList(enabled: boolean): void;
    /** Whether inactive tasks (`stateCode = 1`) pass the view's filter. */
    getInactiveTasksVisibility(): boolean;
    toggleHideInactiveTasks(hide: boolean): void;
    /** Loads another view, asking first when there are unsaved changes. */
    switchView(viewId: string): Promise<void>;
    /** Loads the views again, then the view shown. */
    reloadViews(): Promise<void>;
    /** Writes what the view keeps beside the provider's setup onto a personal view being saved. */
    captureView(metadata: Partial<ISavedQueryMetadata>): void;
}

export interface ITaskGridRuntimeParameters {
    descriptor: ITaskGridDescriptor;
    /** Initialized in this order, once per mount. */
    features: ITaskGridFeature[];
    labels: ILocalizationService<ITaskGridLabels>;
    onGetPcfContext: () => IPcfContext;
}

export class TaskGridRuntime implements ITaskGridRuntime {
    public readonly events: IEventEmitter<ITaskGridRuntimeEvents> = new EventEmitter<ITaskGridRuntimeEvents>();
    private _services = new ServiceLocator<ITaskGridServiceMap>();
    private _descriptor: ITaskGridDescriptor;
    private _features: ITaskGridFeature[];
    //built once the descriptor's dependencies have loaded
    private _savedQueries!: SavedQueryDataProvider;
    private _initialization?: Promise<void>;
    private _viewId?: string;

    constructor(parameters: ITaskGridRuntimeParameters) {
        this._descriptor = parameters.descriptor;
        this._features = parameters.features;
        this._services.register('taskGrid', () => this);
        this._services.register('descriptor', () => this._descriptor);
        this._services.register('localizationService', () => parameters.labels);
        this._services.register('pcfContext', parameters.onGetPcfContext);
    }

    public get services(): ITaskGridServiceLocator {
        return this._services;
    }

    private get _datasetControl(): IDatasetControlRuntime {
        return this._services.get('datasetControl');
    }

    private get _provider(): ITaskDataProvider {
        return this._services.get('taskDataProvider');
    }

    private get _parameters(): ITaskGridParameters {
        return this._services.get('gridParameters');
    }

    public getViewId(): string | undefined {
        return this._viewId;
    }

    public getViewStateStore(): IStateStore {
        return this._datasetControl.getViewStateStore(this._viewId).scope(STATE_KEY);
    }

    public isTaskCreatingEnabled(): boolean {
        return this._parameters.enableTaskCreation ?? false;
    }

    public isTaskEditingEnabled(): boolean {
        return this._parameters.enableTaskEditing ?? false;
    }

    public isTaskDeletingEnabled(): boolean {
        return this._parameters.enableTaskDeletion ?? false;
    }

    public isRowDraggingEnabled(): boolean {
        return this._parameters.enableRowDragging ?? false;
    }

    public isInlineCreateEnabled(): boolean {
        return this._parameters.enableInlineCreation ?? false;
    }

    public isQuickFindEnabled(): boolean {
        return this._parameters.enableQuickFind ?? false;
    }

    public isViewSwitcherEnabled(): boolean {
        return this._parameters.enableViewSwitcher ?? false;
    }

    public isEditColumnsEnabled(): boolean {
        return this._parameters.enableEditColumns ?? false;
    }

    public isEditColumnsScopeSelectorEnabled(): boolean {
        return this._parameters.enableEditColumnsScopeSelector ?? false;
    }

    public isShowHierarchyToggleVisible(): boolean {
        return this._parameters.enableShowHierarchyToggle ?? false;
    }

    public isHideInactiveTasksToggleVisible(): boolean {
        return this._parameters.enableHideInactiveTasksToggle ?? false;
    }

    public isFlatListEnabled(): boolean {
        return this.getViewStateStore().get<boolean>(FLAT_LIST_STATE_KEY) ?? this._savedQueries.getCurrentQuery().isFlatListEnabled ?? false;
    }

    public toggleFlatList(enabled: boolean): void {
        this.getViewStateStore().set(FLAT_LIST_STATE_KEY, enabled);
        const provider = this._provider;
        const pathColumn = provider.getColumnsMap()[this._services.get('nativeColumns').path];
        pathColumn.isHidden = !enabled;
        pathColumn.order = -1;
        //setting the columns again is what sorts them
        provider.setColumns(provider.getColumns());
        provider.refresh();
    }

    public getInactiveTasksVisibility(): boolean {
        const stateCode = this._services.get('nativeColumns').stateCode;
        const condition = this._provider.getFiltering()?.conditions?.find(condition => condition.attributeName === stateCode);
        switch (condition?.conditionOperator) {
            case Operators.In.Value:
                return condition.value?.includes('1') ?? false;
            case Operators.Equal.Value:
                return condition.value === '1';
            default:
                return true;
        }
    }

    public toggleHideInactiveTasks(hide: boolean): void {
        const provider = this._provider;
        const filtering = new Filtering(provider);
        const stateCodeFilter = filtering.getColumnFilter(this._services.get('nativeColumns').stateCode);
        stateCodeFilter.clear();
        if (hide) {
            const condition = stateCodeFilter.addCondition();
            condition.setOperator(Operators.Equal.Value);
            condition.setValue(STATE_CODE_ACTIVE);
        }
        const filterExpression = filtering.getFilterExpression(Type.And.Value);
        if (filterExpression) {
            provider.setFiltering(filterExpression);
        }
        provider.refresh();
    }

    public async switchView(viewId: string): Promise<void> {
        await this._datasetControl.reload({ viewId });
    }

    public async reloadViews(): Promise<void> {
        await this._savedQueries.refresh();
        await this._datasetControl.reload({ viewId: this._datasetControl.getViewId() });
    }

    public captureView(metadata: Partial<ISavedQueryMetadata>): void {
        const store = this.getViewStateStore();
        metadata.isFlatListEnabled = this.isFlatListEnabled();
        metadata.moduleState = structuredClone(store.get(MODULES_STATE_KEY) ?? {});
    }

    public attach(datasetControl: IDatasetControlRuntime): void {
        this._services.register('datasetControl', () => datasetControl);
        datasetControl.events.addEventListener('onLoaded', provider => this._onLoaded(provider));
    }

    public async load(parameters: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> {
        this._initialization ??= this._initialize();
        await this._initialization;
        const query = this._savedQueries.setCurrentQuery(parameters.viewId);
        this._viewId = query.id;
        this._seedViewState(query);
        const provider = new TaskDataProvider({
            strategy: this._descriptor.onCreateTaskStrategy({ services: this._services }),
            services: this._services,
            onIsFlatListEnabled: () => this.isFlatListEnabled(),
        });
        this._services.register('taskDataProvider', () => provider);
        //the view's first load prunes it
        const expansion = new TaskExpansionProvider({ services: this._services });
        this._services.register('taskExpansion', () => expansion);
        this._applyQuery(provider, query);
        this._registerProviderListeners(provider);
        return { provider, views: this._getViews(), viewId: query.id };
    }

    public destroy(): void {
        this.events.dispatchEvent('onDestroyed');
        this.events.clearEventListeners();
        this._savedQueries?.destroy();
        this._services.find('userQueriesModule')?.provider.destroy();
        this._services.find('customColumnsModule')?.provider.destroy();
        this._services.find('templatesModule')?.provider.destroy();
        this._services.destroy();
    }

    private async _initialize(): Promise<void> {
        await this._descriptor.onLoadDependencies?.();
        //both read what onLoadDependencies resolved
        this._services.register('gridParameters', () => this._descriptor.onGetGridParameters?.() ?? {});
        this._services.register('nativeColumns', () => ({ ...this._descriptor.onGetFieldMapping(), path: PATH_COLUMN_NAME }));
        //before the features, which hook into the views it loads
        this._savedQueries = new SavedQueryDataProvider({ strategy: this._descriptor.onCreateSavedQueryStrategy({ services: this._services }), services: this._services });
        this._services.register('savedQueryDataProvider', () => this._savedQueries);
        for (const feature of this._features) {
            feature.onInitialize?.(this._services);
        }
        this._registerFeatureListeners();
        await this._services.find('customColumnsModule')?.provider.refresh();
        await this._savedQueries.refresh();
        await this._services.find('projectModule')?.provider.refresh();
    }

    //a personal view brings what it was saved with until the user changes the view
    private _seedViewState(query: ISavedQuery): void {
        const store = this.getViewStateStore();
        if (query.moduleState && store.get(MODULES_STATE_KEY) === undefined) {
            store.set(MODULES_STATE_KEY, structuredClone(query.moduleState));
        }
    }

    private _applyQuery(provider: ITaskDataProvider, query: ISavedQuery): void {
        provider.setColumns(query.columns);
        if (query.filtering) {
            provider.setFiltering(query.filtering);
        }
        if (query.sorting) {
            provider.setSorting(query.sorting);
        }
        if (query.linking) {
            provider.setLinking(query.linking);
        }
        if (query.searchQuery) {
            provider.setSearchQuery(query.searchQuery);
        }
    }

    private _getViews(): IDatasetControlView[] {
        const labels = this._services.get('localizationService');
        const userQueries = this._services.find('userQueriesModule') ? this._savedQueries.getUserQueries() : [];
        return [
            ...userQueries.map(query => ({ id: query.id, name: query.name, group: labels.getLocalizedString('myViews') })),
            ...this._savedQueries.getSystemQueries().map(query => ({ id: query.id, name: query.name, group: labels.getLocalizedString('systemViews') })),
        ];
    }

    private async _onLoaded(provider: IDataProvider): Promise<void> {
        const taskIds = (provider as ITaskDataProvider).getAllRecords().map(record => record.getRecordId());
        await this._services.find('dependenciesModule')?.provider.refresh(taskIds);
        await this._services.find('checklistModule')?.provider.refresh(taskIds);
    }

    private _registerProviderListeners(provider: ITaskDataProvider): void {
        const setLoading = (isLoading: boolean) => provider.setLoading(isLoading);
        provider.taskEvents.addEventListener('onError', this._onError);
        provider.taskEvents.addEventListener('onBeforeTasksCreated', () => setLoading(true));
        provider.taskEvents.addEventListener('onAfterTasksCreated', () => setLoading(false));
        provider.taskEvents.addEventListener('onBeforeTasksDeleted', () => setLoading(true));
        provider.taskEvents.addEventListener('onAfterTasksDeleted', this._onTasksDeleted);
        provider.taskEvents.addEventListener('onBeforeTaskMoved', () => setLoading(true));
        provider.taskEvents.addEventListener('onAfterTaskMoved', () => setLoading(false));
        provider.taskEvents.addEventListener('onBeforeDatasetItemsOpened', () => setLoading(true));
        provider.taskEvents.addEventListener('onAfterDatasetItemsOpened', () => setLoading(false));
    }

    private _registerFeatureListeners(): void {
        const setLoading = (isLoading: boolean) => this._provider.setLoading(isLoading);
        const templates = this._services.find('templatesModule')?.provider.templateEvents;
        templates?.addEventListener('onError', this._onError);
        templates?.addEventListener('onBeforeTemplateCreated', () => setLoading(true));
        templates?.addEventListener('onAfterTemplateCreated', () => setLoading(false));
        templates?.addEventListener('onBeforeTasksFromTemplateCreated', () => setLoading(true));
        templates?.addEventListener('onAfterTasksFromTemplateCreated', () => setLoading(false));
        this._services.find('customColumnsModule')?.provider.events.addEventListener('onError', this._onError);
        const userQueries = this._services.find('userQueriesModule')?.provider.events;
        userQueries?.addEventListener('onError', this._onError);
        userQueries?.addEventListener('onAfterUserQueryCreated', this._onUserQueryCreated);
        userQueries?.addEventListener('onAfterUserQueryUpdated', () => setLoading(false));
    }

    private _onError = (error: any, message: string): void => {
        this._services.find('taskDataProvider')?.setLoading(false);
        this._services.get('pcfContext').navigation.openErrorDialog({ message, details: error });
    };

    private _onTasksDeleted = (result: IDeleteTasksResult | null): void => {
        const provider = this._provider;
        provider.setLoading(false);
        if (!result || result.success) {
            return;
        }
        this._services.get('pcfContext').navigation.openConfirmDialog({
            subtitle: this._services.get('localizationService').getLocalizedString('deletingTasksError'),
            text: result.errors.map(error => `${provider.getRecordsMap()[error.id].getNamedReference().name}: ${ErrorHelper.getMessageFromError(error.error)}`).join('\n'),
        });
    };

    private _onUserQueryCreated = async (queryId: string | null): Promise<void> => {
        this._provider.setLoading(false);
        if (!queryId) {
            return;
        }
        await this._savedQueries.refresh();
        await this.switchView(queryId);
    };
}
