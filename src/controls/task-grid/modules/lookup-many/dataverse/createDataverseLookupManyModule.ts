import type { IDataverseHostRecord } from "../../../runtime/data-sources/dataverse/DataverseTaskStore";
import { createLookupManyModule, ILookupManyModule } from "../createLookupManyModule";
import type { ILookupManyParameters } from "../LookupMany";
import { DataverseLookupManyStore, IDataverseLookupManyColumn } from "./DataverseLookupManyStore";

export interface IDataverseLookupManyModuleParameters extends Omit<ILookupManyParameters<IDataverseLookupManyColumn>, 'onCreateStore'> {
    /** The record the grid sits on, as `hostRecord` in a column's FetchXML. */
    hostRecord?: IDataverseHostRecord;
}

/** Lookup-many columns of Dataverse tasks, loaded and saved through their relationships. */
export const createDataverseLookupManyModule = (parameters: IDataverseLookupManyModuleParameters): ILookupManyModule => {
    const { hostRecord, ...moduleParameters } = parameters;
    return createLookupManyModule({ ...moduleParameters, onCreateStore: taskRuntime => new DataverseLookupManyStore({ taskRuntime, columns: parameters.columns, hostRecord }) });
};
