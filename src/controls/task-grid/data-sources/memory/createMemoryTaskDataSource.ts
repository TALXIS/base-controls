import { createTaskDataSource, ITaskDataSourceParameters } from "../createTaskDataSource";

export interface IMemoryTaskDataSourceParameters extends ITaskDataSourceParameters { }

/** Tasks held in memory. */
export const createMemoryTaskDataSource = createTaskDataSource;
