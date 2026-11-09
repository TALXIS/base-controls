import { DataTypes, IColumn } from "@talxis/client-libraries";
import type { ICommandBarItemProps, IContextualMenuItem } from "@fluentui/react";
import type { IRibbonCommand } from "@controls/ribbon";
import type { IDatasetControlLoadResult, IDatasetControlInternal } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDatasetControl, IDatasetControlView } from "@controls/dataset-control/runtime/interfaces";
import type { IPcfContext } from "@pcf/interfaces";
import { HookRegistry, IRuntimeLifecycle, ServiceRegistry } from "@core";
import { ILabels, ILabelSet, Labels } from "@labels";
import type { IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "./provider";
import { PATH_COLUMN_NAME } from "./provider/record-tree";
import { TaskDataProvider } from "./provider/TaskDataProvider";
import { TASK_GRID_LABELS } from "../labels";
import type { ITaskDatasetControlProps } from "../adapters/root/TaskDatasetControl";
import { ITaskActions, TaskActions } from "./tasks";
import { runQuietly } from "./runQuietly";
import { TaskExecutor } from "./TaskExecutor";
import { TaskSavingChains } from "./saving";
import type { ITaskExecuteParameters, ITaskRuntime, ITaskRuntimeServiceMap, TaskRibbonCommandUiHook } from "./interfaces";

export interface ITaskRuntimeParameters {
    datasetControl: IDatasetControlInternal;
    pcfContext: IPcfContext;
    /** The `TaskDatasetControl`'s current props. */
    getProps: () => ITaskDatasetControlProps;
}

export class TaskRuntime implements ITaskRuntime {
    public readonly services = new ServiceRegistry<ITaskRuntimeServiceMap>();
    private _getProps: () => ITaskDatasetControlProps;
    public readonly hooks = {
        ribbonCommandUi: new HookRegistry<TaskRibbonCommandUiHook>(),
    };
    public readonly tasks: ITaskActions = new TaskActions(this);
    private _executor = new TaskExecutor(this);
    private _savingChains = new TaskSavingChains();

    constructor(parameters: ITaskRuntimeParameters) {
        const datasetControl = parameters.datasetControl;
        this._getProps = parameters.getProps;
        this.services.provide('datasetControl', datasetControl as IDatasetControl<ITaskViewData>);
        this.services.provide('pcfContext', parameters.pcfContext);
        this.services.provide('savingChains', this._savingChains, { onDestroy: () => this._savingChains.destroy() });
        this.services.observe('provider', provider => this._savingChains.attach(provider));
        datasetControl.parts.observe('ribbon', ribbon => { ribbon.hooks.commands.add(this._addCommands); });
        datasetControl.modules.observe('userQueries', userQueries => {
            userQueries.saveWithView('sorting', () => this.getProvider().getSorting(), sorting => this.getProvider().setSorting(sorting));
            userQueries.saveWithView('filtering', () => this.getProvider().getFiltering(), filtering => this.getProvider().setFiltering(filtering));
            userQueries.saveWithView('quickFindColumns', () => this.getProvider().getQuickFindColumns().map(column => column.name), columns => this.getProvider().setQuickFindColumns(columns));
            userQueries.saveWithView('searchQuery', () => this.getProvider().getSearchQuery() || undefined, searchQuery => this.getProvider().setSearchQuery(searchQuery));
        });
    }

    public async load(): Promise<IDatasetControlLoadResult<ITaskViewData>> {
        const { store, fieldMapping, rootTaskId, hoursPerDay, views } = await this._getProps().onLoad(this);
        const provider = new TaskDataProvider({ store, formatting: this.services.get('pcfContext').formatting, fieldMapping, rootTaskId, hoursPerDay, defaultCreatePosition: this._getProps().defaultCreatePosition });
        provider.hooks.availableColumns.add(this._addPathColumn);
        //modules waiting for it add columns a user view may keep
        this.services.provide('provider', provider);
        //a task view is only ever resolved with this task provider
        return { provider, views: views as IDatasetControlView<ITaskViewData>[] | undefined };
    }

    public get lifecycle(): IRuntimeLifecycle {
        return this.services.get('datasetControl').lifecycle;
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
        return !!this._getProps().enableCreation;
    }

    public isEditingEnabled(): boolean {
        return !!this._getProps().enableEditing;
    }

    public isDeletionEnabled(): boolean {
        return !!this._getProps().enableDeletion;
    }

    public getHoursPerDay(): number {
        return this.getProvider().getHoursPerDay() ?? 24;
    }

    public getRibbonCommandItems(items: ICommandBarItemProps[]): ICommandBarItemProps[] {
        return items.map(this._applyRibbonCommandUi);
    }

    /** Called as the mount goes. */
    public destroy(): void {
        this.services.destroy();
    }

    private _applyRibbonCommandUi = (item: IContextualMenuItem): IContextualMenuItem => {
        const result = { ...item };
        this.hooks.ribbonCommandUi.apply(result);
        const subItems = result.subMenuProps?.items;
        return subItems ? { ...result, subMenuProps: { ...result.subMenuProps!, items: subItems.map(this._applyRibbonCommandUi) } } : result;
    };

    private _addPathColumn = (columns: IColumn[]): void => {
        if (!columns.some(column => column.name === PATH_COLUMN_NAME)) {
            columns.push({ name: PATH_COLUMN_NAME, displayName: this.getLabels(TASK_GRID_LABELS).get('taskGrid.path'), dataType: DataTypes.SingleLineText, isVirtual: true, visualSizeFactor: 300 });
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

    public execute<T>(operation: () => Promise<T>, options: ITaskExecuteParameters & { error: { rethrow: false } }): Promise<T | undefined>;
    public execute<T>(operation: () => Promise<T>, parameters?: ITaskExecuteParameters): Promise<T>;
    public execute<T>(operation: () => Promise<T>, parameters?: ITaskExecuteParameters): Promise<T | undefined> {
        return this._executor.execute(operation, parameters);
    }
}
