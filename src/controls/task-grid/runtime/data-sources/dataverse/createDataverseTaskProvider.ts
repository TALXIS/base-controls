import { createTaskProvider, ITaskProviderParameters } from "../createTaskProvider";

export interface IDataverseTaskProviderParameters extends ITaskProviderParameters { }

/** Tasks in Dataverse, read through FetchXML and opened in their forms. */
export const createDataverseTaskProvider = createTaskProvider;
