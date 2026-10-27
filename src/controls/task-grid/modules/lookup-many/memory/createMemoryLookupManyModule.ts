import { IColumn, IDataProvider, IMemoryProviderEntityMetadata, IRawRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { createLookupManyModule, ILookupManyModule } from "../createLookupManyModule";
import type { ILookupManyOptionsParameters, ILookupManyParameters, ILookupManyStore } from "../LookupMany";
import { simulateBackend } from "../../../data-sources/memory/simulateBackend";

type Reference = ComponentFramework.EntityReference;

/** The records of one entity a memory lookup-many column picks from. */
export interface IMemoryLookupManySource {
    records: IRawRecord[];
    metadata: IMemoryProviderEntityMetadata;
    columns: IColumn[];
}

export interface IMemoryLookupManyModuleParameters extends Omit<ILookupManyParameters, 'onCreateStore'> {
    /** The sources by entity name, matched against each column's `entityName`. */
    sources: { [entityName: string]: IMemoryLookupManySource };
    /** The tasks' references, by task id and column name. */
    values: { [taskId: string]: { [columnName: string]: Reference[] } };
}

class MemoryLookupManyStore implements ILookupManyStore {
    private _sources: { [entityName: string]: IMemoryLookupManySource };
    private _values: { [taskId: string]: { [columnName: string]: Reference[] } };

    constructor(parameters: Pick<IMemoryLookupManyModuleParameters, 'sources' | 'values'>) {
        this._sources = parameters.sources;
        this._values = structuredClone(parameters.values);
    }

    public async onLoadValues(taskIds: string[]): Promise<Map<string, { [columnName: string]: Reference[] }>> {
        await simulateBackend(3000);
        return new Map(taskIds.filter(taskId => this._values[taskId]).map(taskId => [taskId, structuredClone(this._values[taskId])]));
    }

    public async onSaveValue(taskId: string, columnName: string, value: Reference[]): Promise<void> {
        await simulateBackend();
        this._values[taskId] = { ...this._values[taskId], [columnName]: value };
    }

    public onCreateOptionsProvider(parameters: ILookupManyOptionsParameters): IDataProvider | undefined {
        const source = this._sources[parameters.settings.entityName];
        if (!source) {
            return undefined;
        }
        //the provider writes into the records it is given
        const provider = new MemoryDataProvider({ dataSource: structuredClone(source.records), metadata: source.metadata });
        provider.setColumns(source.columns);
        return provider;
    }
}

/** Lookup-many columns over records held in memory, starting over on every mount like the memory tasks. */
export const createMemoryLookupManyModule = (parameters: IMemoryLookupManyModuleParameters): ILookupManyModule => {
    const { sources, values, ...moduleParameters } = parameters;
    return createLookupManyModule({ ...moduleParameters, onCreateStore: () => new MemoryLookupManyStore({ sources, values }) });
};
