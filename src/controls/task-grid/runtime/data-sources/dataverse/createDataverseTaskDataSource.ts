import { createTaskDataSource, ITaskDataSourceParameters } from "../createTaskDataSource";

export interface IDataverseTaskDataSourceParameters extends ITaskDataSourceParameters { }

/** Tasks in Dataverse, read through FetchXML and opened in their forms. */
export const createDataverseTaskDataSource = createTaskDataSource;
