import type { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import type { MemoryTable } from "@core/state";
import { createLookupManyModule, ILookupManyModule } from "../createLookupManyModule";
import type { ILookupManyParameters } from "../LookupMany";
import { MemoryLookupManyStore } from "./MemoryLookupManyStore";

type Reference = ComponentFramework.EntityReference;

/** The records of one entity a memory lookup-many column picks from. */
export interface IMemoryLookupManySource {
    records: MemoryTable<IRawRecord>;
    metadata: IMemoryProviderEntityMetadata;
    columns: IColumn[];
}

/** A task's references, by column name; the row of the `values` table. */
export interface IMemoryLookupManyValues {
    taskId: string;
    values: { [columnName: string]: Reference[] };
}

export interface IMemoryLookupManyModuleParameters extends Omit<ILookupManyParameters, 'createStore'> {
    /** The sources by entity name, matched against each column's `entityName`. */
    sources: { [entityName: string]: IMemoryLookupManySource };
    /** The tasks' references, keyed by `taskId`. */
    values: MemoryTable<IMemoryLookupManyValues>;
}

/** Lookup-many columns over records and references kept in the tables you pass. */
export const createMemoryLookupManyModule = (parameters: IMemoryLookupManyModuleParameters): ILookupManyModule => {
    const { sources, values, ...moduleParameters } = parameters;
    return createLookupManyModule({ ...moduleParameters, createStore: () => new MemoryLookupManyStore({ sources, values }) });
};
