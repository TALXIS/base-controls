import type { IGridServiceRegistry, IGridServiceMap } from "@controls/grid";
import type { ITaskDataProvider } from "../runtime/provider";
import type { ITaskExpansion } from "../runtime/tree";

/** The grid's services as a task grid has them. */
export interface ITaskGridServiceMap extends IGridServiceMap {
    provider: ITaskDataProvider;
    /** Which tasks are expanded. */
    taskExpansion: ITaskExpansion;
}

export type ITaskGridServiceRegistry = IGridServiceRegistry<ITaskGridServiceMap>;
