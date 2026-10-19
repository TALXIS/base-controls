import type { IGridServiceLocator, IGridServiceMap } from "@controls/grid";
import type { ITaskDataProvider } from "../provider";
import type { ITaskExpansion } from "../tree";
import type { ITaskGridTree } from "../runtime";

/** The services a task grid's grid modules register; a module adds its own by augmenting this. */
export interface ITaskGridModuleServiceMap { }

/** What a task grid's grid modules see: the grid's services and the tasks' own, nothing outside the grid. */
export interface ITaskGridServiceMap extends IGridServiceMap, ITaskGridModuleServiceMap {
    provider: ITaskDataProvider;
    /** Which tasks are expanded. */
    taskExpansion: ITaskExpansion;
    /** How the tasks are drawn: as a tree or as a flat list. */
    taskTree: ITaskGridTree;
}

export type ITaskGridServiceLocator = IGridServiceLocator<ITaskGridServiceMap>;
