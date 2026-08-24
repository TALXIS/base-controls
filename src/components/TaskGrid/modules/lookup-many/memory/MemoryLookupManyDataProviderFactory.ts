import { IDataProvider, MemoryDataProvider } from "@talxis/client-libraries";
import { IMemoryEntitySource } from "@components/TaskGrid/extensions/memory/interfaces";

/**
 * Builds the picker provider behind one lookup-many column, from records you already hold.
 *
 * Return one from a `lookupMany` module's `createDataProvider`, picking the source by column.
 *
 * @example
 * ```ts
 * const SOURCES = { assignedto: PEOPLE_SOURCE, tags: TAGS_SOURCE }
 *
 * lookupMany: createLookupManyModule({
 *     createDataProvider: ({ column }) => MemoryLookupManyDataProviderFactory.create(SOURCES[column.name]),
 * })
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
            //a copy: MemoryDataProvider swaps its internal array on delete
            dataSource: [...source.records],
            metadata: source.metadata,
        });
        provider.setColumns(source.columns);
        return provider;
    }
}
