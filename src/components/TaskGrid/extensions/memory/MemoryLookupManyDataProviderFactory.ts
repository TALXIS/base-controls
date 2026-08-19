import { IDataProvider, MemoryDataProvider } from "@talxis/client-libraries";
import { IMemoryEntitySource } from "./interfaces";

/**
 * Builds the picker provider behind one lookup-many column, from records you already hold — the
 * in-memory counterpart to `FetchXmlDataProviderFactory`.
 *
 * Return one from a descriptor's `onCreateLookupManyDataProvider`, picking the source by column:
 *
 * ```ts
 * const SOURCES = { assignedto: PEOPLE_SOURCE, tags: TAGS_SOURCE }
 *
 * onCreateLookupManyDataProvider: ({ column }) => MemoryLookupManyDataProviderFactory.create(SOURCES[column.name]),
 * ```
 */
export class MemoryLookupManyDataProviderFactory {
    /**
     * @param source The candidate records, their columns and their metadata.
     * @returns A provider over a copy of `source.records`, so deleting inside the picker cannot mutate
     * the array you keep.
     */
    public static create(source: IMemoryEntitySource): IDataProvider {
        const provider = new MemoryDataProvider({
            //a copy of the array holding the same records: MemoryDataProvider swaps its internal
            //array on delete, so it must not be handed the one the consumer persists
            dataSource: [...source.records],
            metadata: source.metadata,
        });
        provider.setColumns(source.columns);
        return provider;
    }
}
