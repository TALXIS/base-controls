import type { ICommandBarItemProps, IContextualMenuItem } from "@fluentui/react";
import type { IDatasetControl, IDatasetControlLoadParameters, IDatasetControlLoadResult } from "@controls/dataset-control/runtime";
import type { IPcfContext } from "@interfaces";
import type { IEventSubscriber, ILocalizationService, IServiceLocator } from "@utils";
import type { IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "../provider";
import type { ITaskActions } from "./tasks";
import type { ITaskGridLabels } from "../labels";

/** A hook over an item `TaskDatasetControl.Ribbon` draws, which it changes in place, such as to give a menu content of its own. */
export type TaskRibbonCommandUiHook = (item: IContextualMenuItem) => void;


/** What the runtime reads of the grid's task tree. */
export interface ITaskGridTree {
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
    /** Moves to a task the user just created and starts editing its subject. */
    focusNewTask(taskId: string): void;
}

/** The services a provider's platform registers; it adds its own by augmenting this. */
export interface ITaskRuntimeModuleServiceMap { }

export interface ITaskRuntimeServiceMap extends ITaskRuntimeModuleServiceMap {
    /** The DatasetControl of this mount. */
    datasetControl: IDatasetControl<ITaskViewData>;
    labels: ILocalizationService<ITaskGridLabels>;
    pcfContext: IPcfContext;
    /** The tasks of this mount, there once `onLoad` returned. */
    provider: ITaskDataProvider;
    /** The tree of the grid in the body, while it is drawn. */
    taskTree: ITaskGridTree;
}

export interface ITaskRuntimeEvents {
    /** The mount is going; release what was wired outside it. */
    onDestroyed: () => void;
}

/** One mount of a `TaskDatasetControl`: what its modules register on and its parts read. */
/** How `execute` shows a run while it goes; by default it shows the loading. */
export interface ITaskExecuteLoading {
    /** Defaults to `true`; `false` for a run in the background. */
    show?: boolean;
    /** Shown in the control's loading overlay. */
    message?: string;
}

/** How `execute` handles a run's failure; by default it shows the dialog and rethrows. */
export interface ITaskExecuteError {
    /** Titles the error dialog. */
    title?: string;
    /** Defaults to `true`; `false` resolves `undefined` once the dialog is shown. */
    rethrow?: boolean;
}

export interface ITaskExecuteOptions {
    loading?: ITaskExecuteLoading;
    error?: ITaskExecuteError;
}

export interface ITaskRuntime {
    readonly services: IServiceLocator<ITaskRuntimeServiceMap>;
    readonly events: IEventSubscriber<ITaskRuntimeEvents>;
    /** Every task action, run through the store under the loading overlay and its error shown. */
    readonly tasks: ITaskActions;
    /** Calls `onLoad`, then initializes and registers the provider it returns. */
    load(parameters: IDatasetControlLoadParameters<ITaskViewData>): Promise<IDatasetControlLoadResult>;
    /** The view this mount loaded. */
    getView(): ITaskView | undefined;
    getFieldMapping(): IFieldMapping;
    getProvider(): ITaskDataProvider;
    getLabels(): ILocalizationService<ITaskGridLabels>;
    /** Whether the matching tasks are listed on their own, without the tree; remembered per view. */
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
    isCreationEnabled(): boolean;
    isEditingEnabled(): boolean;
    isDeletionEnabled(): boolean;
    /** How many hours a day of a task's duration holds. */
    getHoursPerDay(): number;
    /** Runs the operation under the control's loading overlay, and shows its failure once in a dialog. */
    execute<T>(operation: () => Promise<T>, options: ITaskExecuteOptions & { error: { rethrow: false } }): Promise<T | undefined>;
    execute<T>(operation: () => Promise<T>, options?: ITaskExecuteOptions): Promise<T>;
    /**
     * Registers a hook over every item `TaskDatasetControl.Ribbon` draws, the ones in its menus included.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerRibbonCommandUi(hook: TaskRibbonCommandUiHook, priority?: number): () => void;
    /** Copies of the items with every ribbon command UI hook applied, sub-menus included. */
    getRibbonCommandItems(items: ICommandBarItemProps[]): ICommandBarItemProps[];
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlPartMap {
        /** What runs the task grid inside the control. */
        taskRuntime: ITaskRuntime;
    }
}
