import { IDataProvider, MemoryDataProvider } from "@talxis/client-libraries";
import type { MemoryTable } from "@core/state";
import type { ILookupManyOptionsParameters, ILookupManyStore } from "../LookupMany";
import { simulateBackend, SIMULATED_LOAD_DELAY_MS } from "../../../runtime/data-sources/memory/simulateBackend";
import type { IMemoryLookupManySource, IMemoryLookupManyValues } from "./createMemoryLookupManyModule";

type Reference = ComponentFramework.EntityReference;

export interface IMemoryLookupManyStoreParameters {
    sources: { [entityName: string]: IMemoryLookupManySource };
    values: MemoryTable<IMemoryLookupManyValues>;
}

export class MemoryLookupManyStore implements ILookupManyStore {
    private _sources: { [entityName: string]: IMemoryLookupManySource };
    private _values: MemoryTable<IMemoryLookupManyValues>;

    constructor(parameters: IMemoryLookupManyStoreParameters) {
        this._sources = parameters.sources;
        this._values = parameters.values;
    }

    public async loadValues(taskIds: string[]): Promise<Map<string, { [columnName: string]: Reference[] }>> {
        await simulateBackend(SIMULATED_LOAD_DELAY_MS);
        const loadedTaskIds = new Set(taskIds);
        return new Map(this._values.getRows(row => loadedTaskIds.has(row.taskId)).map(row => [row.taskId, row.values]));
    }

    public async saveValue(taskId: string, columnName: string, value: Reference[]): Promise<void> {
        await simulateBackend();
        const row = this._values.getRow(taskId);
        if (row) {
            this._values.update(taskId, { values: { ...row.values, [columnName]: value } });
        }
        else {
            this._values.insert([{ taskId, values: { [columnName]: value } }]);
        }
    }

    public createOptionsProvider(parameters: ILookupManyOptionsParameters): IDataProvider | undefined {
        const source = this._sources[parameters.settings.entityName];
        if (!source) {
            return undefined;
        }
        const provider = new MemoryDataProvider({ dataSource: source.records.getRows(), metadata: source.metadata });
        provider.setColumns(source.columns);
        return provider;
    }
}
