import type { ISingleRecord } from "@talxis/client-libraries";
import { createLookupManyModule, ILookupManyModule } from "../createLookupManyModule";
import type { ILookupManyColumn, ILookupManyParameters } from "../LookupMany";
import { DataverseLookupManyStore } from "./DataverseLookupManyStore";

/** One Dataverse lookup-many column: the relationship it is reached through, and what it offers. */
export interface IDataverseLookupManyColumn extends ILookupManyColumn {
    /** Either side's navigation property of the 1:N or N:N relationship. */
    navigationPropertyName: string;
    /** The related records' columns to read, comma separated. */
    select?: string;
    /** Set when the relationship goes through an intersection entity of your own. */
    customIntersection?: {
        /** The intersection entity's navigation property to the related record. */
        navigationPropertyName: string;
    };
    /** Liquid FetchXML over `task`, `project` and `currentRecord` for the records offered; read-only without it. */
    fetchXml?: string;
}

export interface IDataverseLookupManyModuleParameters extends Omit<ILookupManyParameters<IDataverseLookupManyColumn>, 'onCreateStore'> {
    /** The record the grid sits on, as `currentRecord` in a column's FetchXML. */
    sourceRecord?: ISingleRecord;
}

/** Lookup-many columns of Dataverse tasks, loaded and saved through their relationships. */
export const createDataverseLookupManyModule = (parameters: IDataverseLookupManyModuleParameters): ILookupManyModule => {
    const { sourceRecord, ...moduleParameters } = parameters;
    return createLookupManyModule({ ...moduleParameters, onCreateStore: taskRuntime => new DataverseLookupManyStore({ taskRuntime, columns: parameters.columns, sourceRecord }) });
};
