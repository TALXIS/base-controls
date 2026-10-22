import { IColumn, IMemoryProviderEntityMetadata, IRawRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { createLookupManyModule, ILookupManyModule } from "../createLookupManyModule";
import type { ILookupManyParameters } from "../LookupMany";

/** The records of one entity a memory lookup-many column picks from. */
export interface IMemoryLookupManySource {
    records: IRawRecord[];
    metadata: IMemoryProviderEntityMetadata;
    columns: IColumn[];
}

export interface IMemoryLookupManyModuleParameters extends Omit<ILookupManyParameters, 'onCreateOptionsProvider'> {
    /** The sources by entity name, matched against each column's `entityName`. */
    sources: { [entityName: string]: IMemoryLookupManySource };
}

/** Lookup-many columns over records held in memory; their values stay on the tasks. */
export const createMemoryLookupManyModule = (parameters: IMemoryLookupManyModuleParameters): ILookupManyModule => {
    const { sources, ...moduleParameters } = parameters;
    return createLookupManyModule({
        ...moduleParameters,
        onCreateOptionsProvider: ({ settings }) => {
            const source = sources[settings.entityName];
            if (!source) {
                return undefined;
            }
            //the provider writes into the records it is given
            const provider = new MemoryDataProvider({ dataSource: structuredClone(source.records), metadata: source.metadata });
            provider.setColumns(source.columns);
            return provider;
        },
    });
};
