import type { IGridServiceLocator, IGridServiceMap } from "@controls/grid";
import type { ITaskDataProvider } from "../provider";
import type { ITaskExpansion } from "../tree";

/** The grid's services as a task grid has them. */
export interface ITaskGridServiceMap extends IGridServiceMap {
    provider: ITaskDataProvider;
    /** Which tasks are expanded. */
    taskExpansion: ITaskExpansion;
}

export type ITaskGridServiceLocator = IGridServiceLocator<ITaskGridServiceMap>;
