import { createCustomColumnsModule, ICustomColumnsModule } from "../createCustomColumnsModule";
import type { ICustomColumnsParameters } from "../CustomColumns";
import { ITalxisCustomColumnsStoreParameters, TalxisCustomColumnsStore } from "./TalxisCustomColumnsStore";

export interface ITalxisCustomColumnsModuleParameters extends Omit<ITalxisCustomColumnsStoreParameters, 'taskRuntime'>, Omit<ICustomColumnsParameters, 'onCreateStore'> { }

/** The user's own task columns as TALXIS attribute definitions and values. */
export const createTalxisCustomColumnsModule = (parameters: ITalxisCustomColumnsModuleParameters): ICustomColumnsModule => {
    const { entityName, recordId, navigationPropertyName, ...moduleParameters } = parameters;
    return createCustomColumnsModule({ ...moduleParameters, onCreateStore: taskRuntime => new TalxisCustomColumnsStore({ taskRuntime, entityName, recordId, navigationPropertyName }) });
};
