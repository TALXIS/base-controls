import { DataTypes, EventEmitter, IColumn } from "@talxis/client-libraries";
import type { ICommandBarItemProps, IContextualMenuItem } from "@fluentui/react";
import type { IRibbonCommand } from "@controls/ribbon";
import type { IDatasetControlLoadResult, IDatasetControlRuntime } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDatasetControl, IDatasetControlView } from "@controls/dataset-control/runtime/interfaces";
import type { IPcfContext } from "@pcf/interfaces";
import { HookRegistry, ServiceLocator } from "@core";
import { ILabels, ILabelSet, Labels } from "@labels";
import type { IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "./provider";
import { PATH_COLUMN_NAME } from "./provider/record-tree";
import { TASK_GRID_LABELS } from "../labels";
import type { ITaskDatasetControlProps } from "../adapters/root/TaskDatasetControl";
import { ITaskActions, TaskActions } from "./tasks";
import { runQuietly } from "./runQuietly";
import { TaskExecutor } from "./TaskExecutor";
import { TaskSavingChains } from "./saving";
import type { ITaskExecuteOptions, ITaskRuntime, ITaskRuntimeEvents, ITaskRuntimeServiceMap, TaskRibbonCommandUiHook } from "./interfaces";

export interface ITaskRuntimeParameters {
    datasetControl: IDatasetControlRuntime;
    pcfContext: IPcfContext;
    /** The `TaskDatasetControl`'s current props. */
    onGetProps: () => ITaskDatasetControlProps;
}

export class TaskRuntime implements ITaskRuntime {
    public readonly services = new ServiceLocator<ITaskRuntimeServiceMap>();
    public readonly events = new EventEmitter<ITaskRuntimeEvents>();
    private _onGetProps: () => ITaskDatasetControlProps;
    private _ribbonCommandUiHooks = new HookRegistry<TaskRibbonCommandUiHook>();
    public readonly tasks: ITaskActions = new TaskActions(this);
    private _executor = new TaskExecutor(this);
    private _savingChains = new TaskSavingChains();

    constructor(parameters: ITaskRuntimeParameters) {
        const datasetControl = parameters.datasetControl;
        this._onGetProps = parameters.onGetProps;
        this.services.register('datasetControl', () => datasetControl as IDatasetControl<ITaskViewData>);
        this.services.register('pcfContext', () => parameters.pcfContext);
        this.services.register('savingChains', () => this._savingChains);
        this.services.observe('provider', provider => this._savingChains.attach(provider));
        datasetControl.parts.observe('ribbon', ribbon => { ribbon.registerCommands(this._addCommands); });
        datasetControl.modules.observe('userQueries', userQueries => {
            userQueries.saveWithView('sorting', () => this.getProvider().getSorting(), sorting => this.getProvider().setSorting(sorting));
            userQueries.saveWithView('filtering', () => this.getProvider().getFiltering(), filtering => this.getProvider().setFiltering(filtering));
            userQueries.saveWithView('quickFindColumns', () => this.getProvider().getQuickFindColumns().map(column => column.name), columns => this.getProvider().setQuickFindColumns(columns));
            userQueries.saveWithView('searchQuery', () => this.getProvider().getSearchQuery() || undefined, searchQuery => this.getProvider().setSearchQuery(searchQuery));
        });
    }

    public async load(): Promise<IDatasetControlLoadResult<ITaskViewData>> {
        const { provider, fieldMapping, rootTaskId, views } = await this._onGetProps().onLoad({ taskRuntime: this });
        provider.initialize({ fieldMapping, rootTaskId, defaultCreatePosition: this._onGetProps().defaultCreatePosition, hoursPerDay: this._onGetProps().hoursPerDay });
        provider.registerAvailableColumns(this._addPathColumn);
        //modules waiting for it add columns a user view may keep
        this.services.register('provider', () => provider);
        //a task view is only ever resolved with this task provider
        return { provider, views: views as IDatasetControlView<ITaskViewData>[] | undefined };
    }

    public getView(): ITaskView | undefined {
        return this.services.get('datasetControl').getView();
    }

    public getFieldMapping(): IFieldMapping {
        return this.getProvider().getFieldMapping();
    }

    public getProvider(): ITaskDataProvider {
        return this.services.get('provider');
    }

    public getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T> {
        return this.services.get('datasetControl').getLabels(set);
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
        this._savingChains.destroy();
        this.services.destroy();
    }

    private _applyRibbonCommandUi = (item: IContextualMenuItem): IContextualMenuItem => {
        const result = { ...item };
        this._ribbonCommandUiHooks.apply(result);
        const subItems = result.subMenuProps?.items;
        return subItems ? { ...result, subMenuProps: { ...result.subMenuProps!, items: subItems.map(this._applyRibbonCommandUi) } } : result;
    };

    private _addPathColumn = (columns: IColumn[]): void => {
        if (!columns.some(column => column.name === PATH_COLUMN_NAME)) {
            columns.push({ name: PATH_COLUMN_NAME, displayName: this.getLabels(TASK_GRID_LABELS).get('taskGrid.path'), dataType: DataTypes.Multiple, isVirtual: true, visualSizeFactor: 300 });
        }
    };

    //ahead of the consumer's own commands
    private _addCommands = (commands: IRibbonCommand[]): void => {
        const labels = this.getLabels(TASK_GRID_LABELS);
        const selectedIds = this.getProvider().getSelectedRecordIds();
        const taskCommands: IRibbonCommand[] = [];
        if (this.isCreationEnabled()) {
            //not returned to keep New enabled while the task is created
            taskCommands.push({ id: 'new', label: labels.get('taskGrid.new'), iconName: 'Add', onExecute: () => { runQuietly(() => this.tasks.create()); } });
        }
        if (this.isEditingEnabled() && selectedIds.length > 0) {
            taskCommands.push({ id: 'edit', label: labels.get('taskGrid.edit'), iconName: 'Edit', onExecute: () => runQuietly(() => this.tasks.open(selectedIds)) });
        }
        if (this.isDeletionEnabled() && selectedIds.length > 0) {
            taskCommands.push({ id: 'delete', label: labels.get('taskGrid.delete'), iconName: 'Delete', onExecute: () => runQuietly(() => this.tasks.delete(selectedIds)) });
        }
        commands.unshift(...taskCommands);
    };

    public execute<T>(operation: () => Promise<T>, options: ITaskExecuteOptions & { error: { rethrow: false } }): Promise<T | undefined>;
    public execute<T>(operation: () => Promise<T>, options?: ITaskExecuteOptions): Promise<T>;
    public execute<T>(operation: () => Promise<T>, options?: ITaskExecuteOptions): Promise<T | undefined> {
        return this._executor.execute(operation, options);
    }
}
