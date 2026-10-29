import { DataTypes, EventEmitter, IColumn } from "@talxis/client-libraries";
import type { ICommandBarItemProps, IContextualMenuItem } from "@fluentui/react";
import type { IRibbonCommand } from "@controls/ribbon";
import type { IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlRuntime } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDatasetControl } from "@controls/dataset-control/runtime/interfaces";
import type { IPcfContext } from "@interfaces";
import { HookRegistry, ILocalizationService, ServiceLocator } from "@utils";
import type { IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "../provider";
import { PATH_COLUMN_NAME } from "../provider/record-tree";
import type { ITaskGridLabels } from "../labels";
import type { ITaskDatasetControlProps } from "../dataset-control/TaskDatasetControl";
import { ITaskActions, TaskActions } from "./tasks";
import { runQuietly } from "./runQuietly";
import { TaskExecutor } from "./TaskExecutor";
import type { ITaskExecuteOptions, ITaskRuntime, ITaskRuntimeEvents, ITaskRuntimeServiceMap, TaskRibbonCommandUiHook } from "./interfaces";

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
    private _ribbonCommandUiHooks = new HookRegistry<TaskRibbonCommandUiHook>();
    private _unsaveWithViews: (() => void)[] = [];
    private _view?: ITaskView;
    public readonly tasks: ITaskActions = new TaskActions(this);
    private _executor = new TaskExecutor(this);
    private _unregisterCommands?: () => void;

    constructor(parameters: ITaskRuntimeParameters) {
        const datasetControl = parameters.datasetControl;
        this._onGetProps = parameters.onGetProps;
        this.services.register('datasetControl', () => datasetControl as IDatasetControl<ITaskViewData>);
        this.services.register('labels', () => parameters.labels);
        this.services.register('pcfContext', () => parameters.pcfContext);
        datasetControl.parts.whenAvailable('ribbon', ribbon => this._unregisterCommands = ribbon.registerCommands(this._addCommands));
        datasetControl.modules.whenAvailable('userQueries', userQueries => this._unsaveWithViews.push(
            userQueries.saveWithView('sorting', () => this.getProvider().getSorting()),
            userQueries.saveWithView('filtering', () => this.getProvider().getFiltering()),
            userQueries.saveWithView('quickFindColumns', () => this.getProvider().getQuickFindColumns().map(column => column.name)),
            userQueries.saveWithView('searchQuery', () => this.getProvider().getSearchQuery() || undefined),
        ));
    }

    public async load(parameters: IDatasetControlLoadParameters<ITaskViewData>): Promise<IDatasetControlLoadResult> {
        const { provider, fieldMapping, rootTaskId } = await this._onGetProps().onLoad({ ...parameters, taskRuntime: this });
        provider.initialize({ fieldMapping, rootTaskId, defaultCreatePosition: this._onGetProps().defaultCreatePosition, hoursPerDay: this._onGetProps().hoursPerDay });
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

    public getHoursPerDay(): number {
        return this._onGetProps().hoursPerDay ?? 24;
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
        this._unsaveWithViews.forEach(unregister => unregister());
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
            taskCommands.push({ id: 'edit', label: labels.getLocalizedString('edit'), iconName: 'Edit', onExecute: () => runQuietly(() => this.tasks.open(selectedIds)) });
        }
        if (this.isDeletionEnabled() && selectedIds.length > 0) {
            taskCommands.push({ id: 'delete', label: labels.getLocalizedString('delete'), iconName: 'Delete', onExecute: () => runQuietly(() => this.tasks.delete(selectedIds)) });
        }
        commands.unshift(...taskCommands);
    };

    //TODO: this kind of handling should be moved to some utility, as it's not specific to the task grid
    //form/dataset controls could use it too to display loading and handler errors the way it suits the app, instead of the default PCF error dialog
    public execute<T>(operation: () => Promise<T>, options: ITaskExecuteOptions & { error: { rethrow: false } }): Promise<T | undefined>;
    public execute<T>(operation: () => Promise<T>, options?: ITaskExecuteOptions): Promise<T>;
    public execute<T>(operation: () => Promise<T>, options?: ITaskExecuteOptions): Promise<T | undefined> {
        return this._executor.execute(operation, options);
    }
}
