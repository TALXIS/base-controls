import { IDataProvider, MemoryDataProvider } from "@talxis/client-libraries";
import type { ILookupManyOptionsParameters, ILookupManyStore } from "../LookupMany";
import { simulateBackend, SIMULATED_LOAD_DELAY_MS } from "../../../runtime/data-sources/memory/simulateBackend";
import type { IMemoryLookupManyModuleParameters, IMemoryLookupManySource } from "./createMemoryLookupManyModule";

type Reference = ComponentFramework.EntityReference;

export class MemoryLookupManyStore implements ILookupManyStore {
    private _sources: { [entityName: string]: IMemoryLookupManySource };
    private _values: { [taskId: string]: { [columnName: string]: Reference[] } };

    constructor(parameters: Pick<IMemoryLookupManyModuleParameters, 'sources' | 'values'>) {
        this._sources = parameters.sources;
        this._values = structuredClone(parameters.values);
    }

    public async loadValues(taskIds: string[]): Promise<Map<string, { [columnName: string]: Reference[] }>> {
        await simulateBackend(SIMULATED_LOAD_DELAY_MS);
        return new Map(taskIds.filter(taskId => this._values[taskId]).map(taskId => [taskId, structuredClone(this._values[taskId])]));
    }

    public async saveValue(taskId: string, columnName: string, value: Reference[]): Promise<void> {
        await simulateBackend();
        this._values[taskId] = { ...this._values[taskId], [columnName]: value };
    }

    public createOptionsProvider(parameters: ILookupManyOptionsParameters): IDataProvider | undefined {
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
