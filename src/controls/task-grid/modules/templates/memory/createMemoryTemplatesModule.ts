import { createTemplatesModule, ITemplatesModule } from "../createTemplatesModule";
import type { ITemplatesParameters } from "../Templates";
import { IMemoryTemplatesStoreParameters, MemoryTemplatesStore } from "./MemoryTemplatesStore";

export interface IMemoryTemplatesModuleParameters extends Omit<IMemoryTemplatesStoreParameters, 'taskRuntime'>, Omit<ITemplatesParameters, 'createStore'> { }

/** Task templates kept in the `templates` table, for tasks loaded through `MemoryTaskStore`. */
export const createMemoryTemplatesModule = (parameters: IMemoryTemplatesModuleParameters): ITemplatesModule => {
    const { templates, ...moduleParameters } = parameters;
    return createTemplatesModule({ ...moduleParameters, createStore: taskRuntime => new MemoryTemplatesStore({ taskRuntime, templates }) });
};
