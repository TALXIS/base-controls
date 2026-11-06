import type { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import { createLookupManyModule, ILookupManyModule } from "../createLookupManyModule";
import type { ILookupManyParameters } from "../LookupMany";
import { MemoryLookupManyStore } from "./MemoryLookupManyStore";

type Reference = ComponentFramework.EntityReference;

/** The records of one entity a memory lookup-many column picks from. */
export interface IMemoryLookupManySource {
    records: IRawRecord[];
    metadata: IMemoryProviderEntityMetadata;
    columns: IColumn[];
}

export interface IMemoryLookupManyModuleParameters extends Omit<ILookupManyParameters, 'createStore'> {
    /** The sources by entity name, matched against each column's `entityName`. */
    sources: { [entityName: string]: IMemoryLookupManySource };
    /** The tasks' references, by task id and column name. */
    values: { [taskId: string]: { [columnName: string]: Reference[] } };
}

/** Lookup-many columns over records held in memory, starting over on every mount. */
export const createMemoryLookupManyModule = (parameters: IMemoryLookupManyModuleParameters): ILookupManyModule => {
    const { sources, values, ...moduleParameters } = parameters;
    return createLookupManyModule({ ...moduleParameters, createStore: () => new MemoryLookupManyStore({ sources, values }) });
};
