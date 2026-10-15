import type { IGridServiceLocator, IGridServiceMap } from "@controls/grid";
import type { ITaskDataProvider } from "../provider";
import type { ITaskGrid } from "../runtime";
import type { ITaskExpansion } from "../tree";

/** The services task modules register; a module adds its own by augmenting this. */
export interface ITaskGridModuleServiceMap { }

/** Everything a task grid is made of: the grid's services and the task grid's own. */
export interface ITaskGridServiceMap extends IGridServiceMap, ITaskGridModuleServiceMap {
    provider: ITaskDataProvider;
    /** The running task grid. */
    taskGrid: ITaskGrid;
    /** Which tasks are expanded. */
    taskExpansion: ITaskExpansion;
}

export type ITaskGridServiceLocator = IGridServiceLocator<ITaskGridServiceMap>;
