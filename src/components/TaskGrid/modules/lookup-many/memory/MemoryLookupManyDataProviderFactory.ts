import { IDataProvider, MemoryDataProvider } from "@talxis/client-libraries";
import { IMemoryEntitySource } from "@components/TaskGrid/descriptors/memory/interfaces";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Parameters for {@link MemoryLookupManyDataProviderFactory.create}. */
export interface IMemoryLookupManyFactoryParams {
    /** The candidate records, their columns and their metadata. */
    source: IMemoryEntitySource;
    /** Where the rest of the grid is reached. Handed to `createDataProvider` with the cell. */
    services: ITaskGridServiceLocator;
}

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
 *     createDataProvider: ({ column, services }) => MemoryLookupManyDataProviderFactory.create({
 *         source: SOURCES[column.name],
 *         services,
 *     }),
 *     services,
 * })
 * ```
 */
export class MemoryLookupManyDataProviderFactory {
    /**
     * @returns A provider over a copy of `params.source.records`, so deleting inside the picker cannot
     * mutate the array you keep.
     */
    public static create(params: IMemoryLookupManyFactoryParams): IDataProvider {
        const { source } = params;
        const provider = new MemoryDataProvider({
            //a copy: MemoryDataProvider swaps its internal array on delete
            dataSource: [...source.records],
            metadata: source.metadata,
        });
        provider.setColumns(source.columns);
        return provider;
    }
}
