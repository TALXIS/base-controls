import { createTemplatesModule, ITemplatesModule } from "../createTemplatesModule";
import type { ITemplatesParameters } from "../Templates";
import { IMemoryTemplatesStoreParameters, MemoryTemplatesStore } from "./MemoryTemplatesStore";

export interface IMemoryTemplatesModuleParameters extends Omit<IMemoryTemplatesStoreParameters, 'taskRuntime'>, Omit<ITemplatesParameters, 'createStore'> { }

/** Task templates kept in the `templates` table, creating their tasks in the `tasks` table. */
export const createMemoryTemplatesModule = (parameters: IMemoryTemplatesModuleParameters): ITemplatesModule => {
    const { tasks, templates, ...moduleParameters } = parameters;
    return createTemplatesModule({ ...moduleParameters, createStore: taskRuntime => new MemoryTemplatesStore({ taskRuntime, tasks, templates }) });
};
