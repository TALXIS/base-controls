import { createTaskProvider, ITaskProviderParameters } from "../createTaskProvider";

export interface IMemoryTaskProviderParameters extends ITaskProviderParameters { }

/** Tasks held in memory. */
export const createMemoryTaskProvider = createTaskProvider;
