import { createTemplatesModule, ITemplatesModule } from "../createTemplatesModule";
import type { ITemplatesParameters } from "../Templates";
import { IMemoryTemplatesStoreParameters, MemoryTemplatesStore } from "./MemoryTemplatesStore";

export interface IMemoryTemplatesModuleParameters extends Omit<IMemoryTemplatesStoreParameters, 'taskRuntime'>, Omit<ITemplatesParameters, 'createStore'> { }

/** Task templates held in memory, the ones captured since kept for as long as the module is. */
export const createMemoryTemplatesModule = (parameters: IMemoryTemplatesModuleParameters): ITemplatesModule => {
    const { database, templates, ...moduleParameters } = parameters;
    return createTemplatesModule({ ...moduleParameters, createStore: taskRuntime => new MemoryTemplatesStore({ taskRuntime, database, templates }) });
};
