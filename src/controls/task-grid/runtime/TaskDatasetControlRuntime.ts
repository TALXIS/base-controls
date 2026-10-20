import { EventEmitter, IColumn } from "@talxis/client-libraries";
import type { IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlRuntime } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDatasetControl } from "@controls/dataset-control/runtime/interfaces";
import type { IRibbonCommand } from "@controls/ribbon";
import type { IPcfContext } from "@interfaces";
import { HookRegistry, ILocalizationService, ServiceLocator } from "@utils";
import { ErrorHelper } from "@utils/error-handling";
import type { ICreateTaskOptions, IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "../provider";
import { mergeColumn } from "../provider/mergeColumn";
import { USER_QUERIES_GROUP } from "@controls/dataset-control/modules/user-queries/DatasetControlUserQueries";
import type { ITaskGridLabels } from "../labels";
import type { ITaskDatasetControlProps } from "../dataset-control/TaskDatasetControl";
import type { ITaskDatasetControlRuntime, ITaskDatasetControlRuntimeEvents, ITaskDatasetControlRuntimeServiceMap, ITaskGridSetting, TaskGridSettingsHook } from "./interfaces";

export interface ITaskDatasetControlRuntimeParameters {
    datasetControl: IDatasetControlRuntime;
    labels: ILocalizationService<ITaskGridLabels>;
    pcfContext: IPcfContext;
    /** The `TaskDatasetControl`'s current props. */
    onGetProps: () => ITaskDatasetControlProps;
}

export class TaskDatasetControlRuntime implements ITaskDatasetControlRuntime {
    public readonly services = new ServiceLocator<ITaskDatasetControlRuntimeServiceMap>();
    public readonly events = new EventEmitter<ITaskDatasetControlRuntimeEvents>();
    private _onGetProps: () => ITaskDatasetControlProps;
    private _settingsHooks = new HookRegistry<TaskGridSettingsHook>();
    private _view?: ITaskView;

    constructor(parameters: ITaskDatasetControlRuntimeParameters) {
        const datasetControl = parameters.datasetControl;
        this._onGetProps = parameters.onGetProps;
        this.services.register('datasetControl', () => datasetControl as IDatasetControl<ITaskViewData>);
        this.services.register('labels', () => parameters.labels);
        this.services.register('pcfContext', () => parameters.pcfContext);
        this._settingsHooks.register(this._addCoreSettings);
        datasetControl.parts.whenAvailable('ribbon', ribbon => ribbon.registerCommands(this._addCoreCommands));
    }

    public async load(parameters: IDatasetControlLoadParameters<ITaskViewData>): Promise<IDatasetControlLoadResult> {
        this._view = parameters.view;
        const { modules } = await this._onGetProps().onLoad(parameters);
        const provider = modules.dataSource.provider;
        if (this._view?.data) {
            this._applyView(provider, this._view.data);
        }
        this.services.register('provider', () => provider);
        for (const module of [modules.dataSource, ...modules.custom ?? []]) {
            await module.onLoad?.(this);
        }
        return { provider };
    }

    public getView(): ITaskView | undefined {
        return this._view;
    }

    public getCurrentViewData(): ITaskViewData {
        const provider = this.getProvider();
        return {
            columns: provider.getColumns().map(column => this._toSavedColumn(column)),
            sorting: provider.getSorting(),
            filtering: provider.getFiltering(),
            linking: provider.getLinking(),
            quickFindColumns: provider.getQuickFindColumns().map(column => column.name),
            searchQuery: provider.getSearchQuery() || undefined,
            isFlatList: this.isFlatList(),
        };
    }

    public getFieldMapping(): IFieldMapping {
        return this.getProvider().getFieldMapping();
    }

    public getProvider(): ITaskDataProvider {
        return this.services.get('provider');
    }

    public getLabels(): ILocalizationService<ITaskGridLabels> {
        return this.services.get('labels');
    }

    public isTaskCreationEnabled(): boolean {
        return !!this._onGetProps().enableTaskCreation;
    }

    public isFlatList(): boolean {
        return this.services.find('taskTree')?.isFlatList() ?? false;
    }

    public setFlatList(isFlatList: boolean): void {
        this.services.find('taskTree')?.setFlatList(isFlatList);
    }

    public async createTask(parentId?: string, options?: ICreateTaskOptions): Promise<void> {
        await this._execute(() => this.getProvider().createTask(parentId, options));
    }

    public async deleteTasks(taskIds: string[]): Promise<void> {
        const confirmation = await this.services.get('pcfContext').navigation.openConfirmDialog({ text: this.getLabels().getLocalizedString('confirmDeleteTasks') });
        if (confirmation.confirmed) {
            await this._execute(() => this.getProvider().deleteTasks(taskIds));
        }
    }

    public async openTasks(taskIds: string[]): Promise<void> {
        await this._execute(() => this.getProvider().openTasks(taskIds));
    }

    public registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void {
        return this._settingsHooks.register(hook, priority);
    }

    public getSettings(): ITaskGridSetting[] {
        const settings: ITaskGridSetting[] = [];
        this._settingsHooks.apply(settings);
        return settings;
    }

    /** Called as the mount goes. */
    public destroy(): void {
        this.events.dispatchEvent('onDestroyed');
        this.events.clearEventListeners();
        this.services.destroy();
    }

    private _applyView(provider: ITaskDataProvider, view: ITaskViewData): void {
        //a saved column keeps only its layout
        const definitions = this._getSystemViewColumns();
        provider.setColumns(view.columns.map(column => {
            const definition = definitions.get(column.name);
            return definition ? mergeColumn(definition, column) : column;
        }));
        provider.setSorting(view.sorting ?? []);
        provider.setFiltering(view.filtering ?? null);
        provider.setLinking(view.linking ?? []);
        provider.setQuickFindColumns(view.quickFindColumns ?? []);
        provider.setSearchQuery(view.searchQuery);
    }

    //the first system view to define a column wins
    private _getSystemViewColumns(): Map<string, IColumn> {
        const columns = new Map<string, IColumn>();
        const views = this.services.get('datasetControl').getViews().filter(view => view.group?.id !== USER_QUERIES_GROUP);
        for (const column of views.flatMap(view => view.data?.columns ?? [])) {
            if (!columns.has(column.name)) {
                columns.set(column.name, column);
            }
        }
        return columns;
    }

    private _toSavedColumn(column: IColumn): IColumn {
        const { name, isHidden, dataType, order, visualSizeFactor, isVirtual } = column;
        return { name, isHidden, dataType, order, visualSizeFactor, isVirtual };
    }

    //ahead of the consumer's own commands
    private _addCoreCommands = (commands: IRibbonCommand[]): void => {
        const labels = this.getLabels();
        const selectedIds = this.getProvider().getSelectedRecordIds();
        const coreCommands: IRibbonCommand[] = [];
        if (this.isTaskCreationEnabled()) {
            coreCommands.push({ id: 'new', label: labels.getLocalizedString('new'), iconName: 'Add', onExecute: () => this.createTask() });
        }
        if (selectedIds.length > 0) {
            coreCommands.push(
                { id: 'edit', label: labels.getLocalizedString('edit'), iconName: 'Edit', onExecute: () => this.openTasks(selectedIds) },
                { id: 'delete', label: labels.getLocalizedString('delete'), iconName: 'Delete', onExecute: () => this.deleteTasks(selectedIds) },
            );
        }
        commands.unshift(...coreCommands);
    };

    private _addCoreSettings = (settings: ITaskGridSetting[]): void => {
        const provider = this.getProvider();
        settings.push({
            key: 'hideInactiveTasks',
            label: this.getLabels().getLocalizedString('hideInactiveTasks'),
            isChecked: provider.areInactiveTasksHidden(),
            onChange: isChecked => provider.setInactiveTasksHidden(isChecked),
        });
    };

    private async _execute(operation: () => Promise<unknown>): Promise<void> {
        try {
            await operation();
        }
        catch (error) {
            await this.services.get('pcfContext').navigation.openErrorDialog({ message: ErrorHelper.getMessageFromError(error), details: error instanceof Error ? error.stack : undefined });
        }
    }
}
