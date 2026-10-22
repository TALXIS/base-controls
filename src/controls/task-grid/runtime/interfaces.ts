import type { ICommandBarItemProps, IContextualMenuItem } from "@fluentui/react";
import type { IDatasetControl, IDatasetControlLoadParameters, IDatasetControlLoadResult } from "@controls/dataset-control/runtime";
import type { IGridModule } from "@controls/grid";
import type { IPcfContext } from "@interfaces";
import type { ITaskGridServiceMap } from "../services";
import type { IEventSubscriber, ILocalizationService, IServiceLocator } from "@utils";
import type { ICreateTaskOptions, IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "../provider";
import type { ITaskGridLabels } from "../labels";

/** A toggle in `TaskDatasetControl.Settings`. */
export interface ITaskGridSetting {
    key: string;
    label: string;
    isChecked: boolean;
    onChange: (isChecked: boolean) => void;
}

/** A hook over the toggles `TaskDatasetControl.Settings` shows, which it adds to or changes in place. */
export type TaskGridSettingsHook = (settings: ITaskGridSetting[]) => void;

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
export interface ITaskDatasetControlRuntimeModuleServiceMap { }

export interface ITaskDatasetControlRuntimeServiceMap extends ITaskDatasetControlRuntimeModuleServiceMap {
    /** The DatasetControl of this mount. */
    datasetControl: IDatasetControl<ITaskViewData>;
    labels: ILocalizationService<ITaskGridLabels>;
    pcfContext: IPcfContext;
    /** The tasks of this mount, there once `onLoad` returned. */
    provider: ITaskDataProvider;
    /** The tree of the grid in the body, while it is drawn. */
    taskTree: ITaskGridTree;
}

export interface ITaskDatasetControlRuntimeEvents {
    /** The mount is going; release what was wired outside it. */
    onDestroyed: () => void;
}

/** One mount of a `TaskDatasetControl`: what its modules register on and its parts read. */
export interface ITaskDatasetControlRuntime {
    readonly services: IServiceLocator<ITaskDatasetControlRuntimeServiceMap>;
    readonly events: IEventSubscriber<ITaskDatasetControlRuntimeEvents>;
    /** Calls `onLoad`, then initializes and registers the provider it returns. */
    load(parameters: IDatasetControlLoadParameters<ITaskViewData>): Promise<IDatasetControlLoadResult>;
    /** The view this mount loaded. */
    getView(): ITaskView | undefined;
    /** What the view is set up with right now beside its columns, as task view data to save. */
    getCurrentViewData(): ITaskViewData;
    getFieldMapping(): IFieldMapping;
    getProvider(): ITaskDataProvider;
    getLabels(): ILocalizationService<ITaskGridLabels>;
    /** Whether the matching tasks are listed on their own, without the tree; remembered per view. */
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
    openTasks(taskIds: string[]): Promise<void>;
    isCreationEnabled(): boolean;
    isEditingEnabled(): boolean;
    isDeletionEnabled(): boolean;
    /** Creates a task, opens its parent, and starts editing its name when the grid edits. */
    createTask(parentId?: string, options?: ICreateTaskOptions): Promise<void>;
    /** Deletes the tasks and everything under them, once the user confirms. */
    deleteTasks(taskIds: string[]): Promise<void>;
    /** Adds a grid module to the mount's `TaskGrid`; a task module calls it in its `onLoad`. */
    registerGridModule(module: IGridModule<ITaskGridServiceMap>): void;
    getGridModules(): IGridModule<ITaskGridServiceMap>[];
    /** Runs the operation; a failure shows in the control's notifications, not as a rejection. */
    execute(operation: () => Promise<unknown>): Promise<void>;
    /**
     * Registers a hook over the toggles `TaskDatasetControl.Settings` shows.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void;
    getSettings(): ITaskGridSetting[];
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
        /** The task dataset control the parts are drawn in. */
        taskDatasetControl: ITaskDatasetControlRuntime;
    }
}
