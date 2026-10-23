import { DataTypes, EventEmitter, IColumn } from "@talxis/client-libraries";
import type { ICommandBarItemProps, IContextualMenuItem } from "@fluentui/react";
import type { IRibbonCommand } from "@controls/ribbon";
import { ErrorHelper } from "@utils/error-handling";
import type { IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlRuntime } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDatasetControl } from "@controls/dataset-control/runtime/interfaces";
import type { IPcfContext } from "@interfaces";
import type { IGrid, IGridModule } from "@controls/grid";
import type { ITaskGridServiceMap } from "../services";
import { TaskTree } from "../tree/TaskTree";
import { HookRegistry, ILocalizationService, ServiceLocator } from "@utils";
import type { IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "../provider";
import { PATH_COLUMN_NAME } from "../provider/record-tree";
import type { ITaskGridLabels } from "../labels";
import type { ITaskDatasetControlProps } from "../dataset-control/TaskDatasetControl";
import { ITaskActions, TaskActions } from "./tasks";
import { runQuietly } from "./runQuietly";
import type { ITaskExecuteOptions, ITaskRuntime, ITaskRuntimeEvents, ITaskRuntimeServiceMap, ITaskGridSetting, TaskGridSettingsHook, TaskRibbonCommandUiHook } from "./interfaces";

export interface ITaskRuntimeParameters {
    datasetControl: IDatasetControlRuntime;
    labels: ILocalizationService<ITaskGridLabels>;
    pcfContext: IPcfContext;
    /** The `TaskDatasetControl`'s current props. */
    onGetProps: () => ITaskDatasetControlProps;
}

export class TaskRuntime implements ITaskRuntime {
    public readonly services = new ServiceLocator<ITaskRuntimeServiceMap>();
    public readonly events = new EventEmitter<ITaskRuntimeEvents>();
    private _onGetProps: () => ITaskDatasetControlProps;
    private _settingsHooks = new HookRegistry<TaskGridSettingsHook>();
    private _ribbonCommandUiHooks = new HookRegistry<TaskRibbonCommandUiHook>();
    private _view?: ITaskView;
    private _gridModules: IGridModule<ITaskGridServiceMap>[] = [];
    public readonly tasks: ITaskActions = new TaskActions(this);
    private _runs: { loadingMessage?: string }[] = [];
    //a nested run rethrows an error the inner one already showed
    private _shownErrors = new WeakSet<object>();
    private _unregisterCommands?: () => void;

    constructor(parameters: ITaskRuntimeParameters) {
        const datasetControl = parameters.datasetControl;
        this._onGetProps = parameters.onGetProps;
        this.services.register('datasetControl', () => datasetControl as IDatasetControl<ITaskViewData>);
        this.services.register('labels', () => parameters.labels);
        this.services.register('pcfContext', () => parameters.pcfContext);
        this._settingsHooks.register(this._addCoreSettings);
        //ahead of the modules, which attach to the grid after the tree
        datasetControl.parts.whenAvailable('grid', grid => new TaskTree({ grid: grid as IGrid<ITaskGridServiceMap>, runtime: this, state: datasetControl.getViewStateStore() }));
        datasetControl.parts.whenAvailable('ribbon', ribbon => this._unregisterCommands = ribbon.registerCommands(this._addCommands));
    }

    public async load(parameters: IDatasetControlLoadParameters<ITaskViewData>): Promise<IDatasetControlLoadResult> {
        const { provider, fieldMapping, rootTaskId } = await this._onGetProps().onLoad({ ...parameters, taskRuntime: this });
        provider.initialize({ fieldMapping, rootTaskId });
        provider.registerAvailableColumns(this._addPathColumn);
        //modules waiting for it add their columns, which a user view may keep
        this.services.register('provider', () => provider);
        if (parameters.view) {
            const definition = await parameters.view.resolve(provider);
            this._view = { ...parameters.view, ...definition };
            this._applyView(provider, definition.data ?? {});
        }
        return { provider };
    }

    public getView(): ITaskView | undefined {
        return this._view;
    }

    public getCurrentViewData(): ITaskViewData {
        const provider = this.getProvider();
        return {
            sorting: provider.getSorting(),
            filtering: provider.getFiltering(),
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

    public isFlatList(): boolean {
        return this.services.find('taskTree')?.isFlatList() ?? false;
    }

    public setFlatList(isFlatList: boolean): void {
        this.services.find('taskTree')?.setFlatList(isFlatList);
    }

    public isCreationEnabled(): boolean {
        return !!this._onGetProps().enableCreation;
    }

    public isEditingEnabled(): boolean {
        return !!this._onGetProps().enableEditing;
    }

    public isDeletionEnabled(): boolean {
        return !!this._onGetProps().enableDeletion;
    }

    public registerGridModule(module: IGridModule<ITaskGridServiceMap>): void {
        this._gridModules.push(module);
    }

    public getGridModules(): IGridModule<ITaskGridServiceMap>[] {
        return this._gridModules;
    }

    public registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void {
        return this._settingsHooks.register(hook, priority);
    }

    public getSettings(): ITaskGridSetting[] {
        const settings: ITaskGridSetting[] = [];
        this._settingsHooks.apply(settings);
        return settings;
    }

    public registerRibbonCommandUi(hook: TaskRibbonCommandUiHook, priority?: number): () => void {
        return this._ribbonCommandUiHooks.register(hook, priority);
    }

    public getRibbonCommandItems(items: ICommandBarItemProps[]): ICommandBarItemProps[] {
        return items.map(this._applyRibbonCommandUi);
    }

    /** Called as the mount goes. */
    public destroy(): void {
        this.events.dispatchEvent('onDestroyed');
        this.events.clearEventListeners();
        this._unregisterCommands?.();
        this.services.destroy();
    }

    private _applyView(provider: ITaskDataProvider, view: ITaskViewData): void {
        provider.setSorting(view.sorting ?? []);
        provider.setFiltering(view.filtering ?? null);
        provider.setQuickFindColumns(view.quickFindColumns ?? []);
        provider.setSearchQuery(view.searchQuery);
    }

    private _applyRibbonCommandUi = (item: IContextualMenuItem): IContextualMenuItem => {
        const result = { ...item };
        this._ribbonCommandUiHooks.apply(result);
        const subItems = result.subMenuProps?.items;
        return subItems ? { ...result, subMenuProps: { ...result.subMenuProps!, items: subItems.map(this._applyRibbonCommandUi) } } : result;
    };

    private _addPathColumn = (columns: IColumn[]): void => {
        if (!columns.some(column => column.name === PATH_COLUMN_NAME)) {
            columns.push({ name: PATH_COLUMN_NAME, displayName: this.getLabels().getLocalizedString('path'), dataType: DataTypes.Multiple, isVirtual: true, visualSizeFactor: 300 });
        }
    };

    //ahead of the consumer's own commands
    private _addCommands = (commands: IRibbonCommand[]): void => {
        const labels = this.getLabels();
        const selectedIds = this.getProvider().getSelectedRecordIds();
        const taskCommands: IRibbonCommand[] = [];
        if (this.isCreationEnabled()) {
            taskCommands.push({ id: 'new', label: labels.getLocalizedString('new'), iconName: 'Add', onExecute: () => runQuietly(() => this.tasks.create()) });
        }
        if (this.isEditingEnabled() && selectedIds.length > 0) {
            taskCommands.push({ id: 'edit', label: labels.getLocalizedString('edit'), iconName: 'Edit', onExecute: () => runQuietly(() => this.tasks.edit(selectedIds)) });
        }
        if (this.isDeletionEnabled() && selectedIds.length > 0) {
            taskCommands.push({ id: 'delete', label: labels.getLocalizedString('delete'), iconName: 'Delete', onExecute: () => runQuietly(() => this.tasks.delete(selectedIds)) });
        }
        commands.unshift(...taskCommands);
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

    //TODO: this kind of handling should be moved to some utility, as it's not specific to the task grid
    //form/dataset controls could use it too to display loading and handler errors the way it suits the app, instead of the default PCF error dialog
    public async execute<T>(operation: () => Promise<T>, options?: ITaskExecuteOptions): Promise<T> {
        const provider = this.getProvider();
        const run = { loadingMessage: options?.loadingMessage };
        this._runs.push(run);
        provider.setLoading(true, run.loadingMessage);
        try {
            return await operation();
        }
        catch (error) {
            const isObject = typeof error === 'object' && error !== null;
            if (!isObject || !this._shownErrors.has(error)) {
                if (isObject) {
                    this._shownErrors.add(error);
                }
                const message = options?.errorMessage ?? this.getLabels().getLocalizedString('actionFailed');
                await this.services.get('pcfContext').navigation.openErrorDialog({ message, details: ErrorHelper.getMessageFromError(error) });
            }
            throw error;
        }
        finally {
            this._runs.splice(this._runs.indexOf(run), 1);
            //the latest run still going shows its message again
            const latest = this._runs[this._runs.length - 1];
            if (latest) {
                provider.setLoading(true, latest.loadingMessage);
            }
            else {
                provider.setLoading(false);
                this._shownErrors = new WeakSet();
            }
        }
    }
}
