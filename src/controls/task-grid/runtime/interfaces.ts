import type { IGrid } from "@controls/grid";
import type { IEventSubscriber, ILocalizationService } from "@utils";
import type { ICreateTaskOptions, ITaskDataProvider } from "../provider";
import type { ITaskGridServiceMap } from "../services";
import type { ITaskGridLabels } from "../labels";

export interface ITaskGridEvents {
    onDestroyed: () => void;
}

/** A toggle in `TaskGridDatasetControl.Settings`. */
export interface ITaskGridSetting {
    key: string;
    label: string;
    isChecked: boolean;
    onChange: (isChecked: boolean) => void;
}

/** A hook over the toggles `TaskGridDatasetControl.Settings` shows, which it adds to or changes in place. */
export type TaskGridSettingsHook = (settings: ITaskGridSetting[]) => void;

/** The running task grid: what `onReady` hands you and what `control.parts.get('taskGrid')` returns; its commands are on the control's ribbon. */
export interface ITaskGrid {
    readonly events: IEventSubscriber<ITaskGridEvents>;
    /** The grid underneath, there from the moment the modules register. */
    readonly grid: IGrid<ITaskGridServiceMap>;
    getProvider(): ITaskDataProvider;
    /** Whether the matching tasks are listed on their own, without the tree; remembered per view. */
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
    getLabels(): ILocalizationService<ITaskGridLabels>;
    /** Creates a task, opens its parent, and starts editing its name when the grid edits. */
    createTask(parentId?: string, options?: ICreateTaskOptions): Promise<void>;
    /** Deletes the tasks and everything under them, once the user confirms. */
    deleteTasks(taskIds: string[]): Promise<void>;
    openTasks(taskIds: string[]): Promise<void>;
    /**
     * Registers a hook over the toggles `TaskGridDatasetControl.Settings` shows.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void;
    getSettings(): ITaskGridSetting[];
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlPartMap {
        /** `TaskGrid`, there once its modules registered. */
        taskGrid: ITaskGrid;
    }
}
