import { createTemplatesModule, ITemplatesModule } from "../createTemplatesModule";
import type { ITemplatesParameters } from "../Templates";
import { IMemoryTemplatesStrategyParameters, MemoryTemplatesStrategy } from "./MemoryTemplatesStrategy";

export interface IMemoryTemplatesModuleParameters extends IMemoryTemplatesStrategyParameters, Omit<ITemplatesParameters, 'strategy'> { }

/** Task templates held in memory, the ones captured since kept for as long as the module is. */
export const createMemoryTemplatesModule = (parameters: IMemoryTemplatesModuleParameters): ITemplatesModule => {
    const { templates, ...moduleParameters } = parameters;
    return createTemplatesModule({ ...moduleParameters, strategy: new MemoryTemplatesStrategy({ templates }) });
};
