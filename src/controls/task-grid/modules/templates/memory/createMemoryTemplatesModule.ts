import { createTemplatesModule, ITemplatesModule } from "../createTemplatesModule";
import type { ITemplatesParameters } from "../Templates";
import { IMemoryTemplatesStoreParameters, MemoryTemplatesStore } from "./MemoryTemplatesStore";

export interface IMemoryTemplatesModuleParameters extends IMemoryTemplatesStoreParameters, Omit<ITemplatesParameters, 'onCreateStore'> { }

/** Task templates held in memory, the ones captured since kept for as long as the module is. */
export const createMemoryTemplatesModule = (parameters: IMemoryTemplatesModuleParameters): ITemplatesModule => {
    const { templates, ...moduleParameters } = parameters;
    return createTemplatesModule({ ...moduleParameters, onCreateStore: () => new MemoryTemplatesStore({ templates }) });
};
