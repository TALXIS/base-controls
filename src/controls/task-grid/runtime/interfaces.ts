import type { ICommandBarItemProps, IContextualMenuItem } from "@fluentui/react";
import type { ITaskSavingChains } from "./saving";
import type { IDatasetControl, IDatasetControlLoadResult } from "@controls/dataset-control/runtime";
import type { IPcfContext } from "@pcf/interfaces";
import type { IEventSubscriber, IRuntime, IServiceRegistry, IHookPoint } from "@core";
import type { ILabels, ILabelSet, Labels } from "@labels";
import type { IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "./provider";
import type { ITaskActions } from "./tasks";

/** A hook that changes an item `TaskDatasetControl.Ribbon` draws in place. */
export type TaskRibbonCommandUiHook = (item: IContextualMenuItem) => void;

/** What the runtime reads of the grid's task tree. */
export interface ITaskGridTree {
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
    /** Scrolls a task's row into view. */
    revealTask(taskId: string): void;
    /** Scrolls a task's row into view and opens its subject for typing, where cells can be edited. */
    editTaskSubject(taskId: string): void;
}

/** The services a provider's platform provides, by augmenting this. */
export interface ITaskRuntimeModuleServiceMap { }

export interface ITaskRuntimeServiceMap extends ITaskRuntimeModuleServiceMap {
    /** The DatasetControl of this mount. */
    datasetControl: IDatasetControl<ITaskViewData>;
    pcfContext: IPcfContext;
    /** The tasks of this mount, there once `onLoad` returned. */
    provider: ITaskDataProvider;
    /** The tree of the grid in the body, while it is drawn. */
    taskTree: ITaskGridTree;
    /** The tasks a save can reach, held as saving until it settles. */
    savingChains: ITaskSavingChains;
}

/** How `execute` shows a run while it goes. */
export interface ITaskExecuteLoading {
    /** `false` for a run in the background. */
    show?: boolean;
    /** Shown in the control's loading overlay. */
    message?: string;
}

/** How `execute` handles a run's failure. */
export interface ITaskExecuteError {
    /** Titles the error dialog. */
    title?: string;
    /** `false` resolves `undefined` once the dialog is shown. */
    rethrow?: boolean;
}

export interface ITaskExecuteParameters {
    loading?: ITaskExecuteLoading;
    error?: ITaskExecuteError;
}

export interface ITaskRuntimeHooks {
    /** Every item `TaskDatasetControl.Ribbon` draws, menus included. */
    readonly ribbonCommandUi: IHookPoint<TaskRibbonCommandUiHook>;
}

/** One mount of a `TaskDatasetControl`. */
export interface ITaskRuntime extends IRuntime {
    readonly services: IServiceRegistry<ITaskRuntimeServiceMap>;
    /** Every task action, run through the store under the loading overlay and its error shown. */
    readonly tasks: ITaskActions;
    /** Calls `onLoad`, then builds and provides the provider over the store it returns. */
    load(): Promise<IDatasetControlLoadResult<ITaskViewData>>;
    /** The view this mount loaded. */
    getView(): ITaskView | undefined;
    getFieldMapping(): IFieldMapping;
    getProvider(): ITaskDataProvider;
    /** The strings of one set, as the control's labelsService gives them. */
    getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T>;
    /** Whether the matching tasks are listed on their own, without the tree. */
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
    isCreationEnabled(): boolean;
    isEditingEnabled(): boolean;
    isDeletionEnabled(): boolean;
    /** How many hours a day of a task's duration holds. */
    getHoursPerDay(): number;
    /** Runs the operation under the loading overlay and shows its failure in a dialog. */
    execute<T>(operation: () => Promise<T>, options: ITaskExecuteParameters & { error: { rethrow: false } }): Promise<T | undefined>;
    execute<T>(operation: () => Promise<T>, parameters?: ITaskExecuteParameters): Promise<T>;
    readonly hooks: ITaskRuntimeHooks;
    /** Copies of the items with every ribbon command UI hook applied, sub-menus included. */
    getRibbonCommandItems(items: ICommandBarItemProps[]): ICommandBarItemProps[];
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** What runs the task grid inside the control. */
        taskRuntime: ITaskRuntime;
    }
}
