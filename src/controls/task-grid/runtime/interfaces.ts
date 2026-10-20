import type { IDatasetControl, IDatasetControlLoadParameters, IDatasetControlLoadResult } from "@controls/dataset-control/runtime";
import type { IPcfContext } from "@interfaces";
import type { IEventSubscriber, ILocalizationService, IServiceLocator } from "@utils";
import type { IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "../provider";
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

/** What the runtime reads of the grid's task tree. */
export interface ITaskGridTree {
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
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
    /** What the view shows right now, as task view data to save. */
    getCurrentViewData(): ITaskViewData;
    getFieldMapping(): IFieldMapping;
    getProvider(): ITaskDataProvider;
    getLabels(): ILocalizationService<ITaskGridLabels>;
    /** Whether the matching tasks are listed on their own, without the tree; remembered per view. */
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
    openTasks(taskIds: string[]): Promise<void>;
    /** Runs the operation, showing the error dialog when it throws. */
    execute(operation: () => Promise<unknown>): Promise<void>;
    /**
     * Registers a hook over the toggles `TaskDatasetControl.Settings` shows.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void;
    getSettings(): ITaskGridSetting[];
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlPartMap {
        /** The task dataset control the parts are drawn in. */
        taskDatasetControl: ITaskDatasetControlRuntime;
    }
}
