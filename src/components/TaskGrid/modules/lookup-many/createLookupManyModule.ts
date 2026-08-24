import { ILookupManyDataProviderParameters } from "@components/TaskGrid/interfaces";
import { IDataProvider } from "@talxis/client-libraries";
import { ILookupManyModule } from "../interfaces";
import { LookupManyCellRenderer } from "./cell-renderer";

/** Options for {@link createLookupManyModule}. */
export interface ILookupManyModuleOptions {
    /**
     * Returns the candidate records for a lookup-many cell — the picker's options. Called once per cell,
     * since the query may depend on the row. Return `undefined` for a column you do not serve and the
     * grid throws when that column renders.
     */
    createDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
}

/**
 * Builds the lookup-many module: you supply the candidate-record source, this brings the picker.
 *
 * Assign it to a `modules` key — `modules.onGetLookupManyModule` on a shipped descriptor, or
 * `onGetModules` on a descriptor of your own. Which columns *render* as lookup-many is driven by
 * `metadata.LookupMany` on the column itself.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetLookupManyModule: () => createLookupManyModule({
 *         createDataProvider: ({ column }) => MemoryLookupManyDataProviderFactory.create(SOURCES[column.name]),
 *     }),
 * }
 * ```
 */
export const createLookupManyModule = (options: ILookupManyModuleOptions): ILookupManyModule => ({
    createDataProvider: options.createDataProvider,
    components: { CellRenderer: LookupManyCellRenderer },
});
