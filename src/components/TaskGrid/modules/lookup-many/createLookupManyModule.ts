import { ILookupManyDataProviderParameters } from "@components/TaskGrid/interfaces";
import { IDataProvider } from "@talxis/client-libraries";
import { ILookupManyModule } from "../interfaces";
import { LookupManyCellRenderer } from "./cell-renderer";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Options for {@link createLookupManyModule}. */
export interface ILookupManyModuleOptions {
    /**
     * Returns the candidate records for a lookup-many cell — the picker's options. Called once per cell,
     * since the query may depend on the row. Return `undefined` for a column you do not serve and the
     * grid throws when that column renders.
     */
    createDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
    /** The locator the builder was handed, so the module can pass it to `createDataProvider`. */
    services: ITaskGridServiceLocator;
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
 *     onGetLookupManyModule: ({ services }) => createLookupManyModule({
 *         createDataProvider: ({ column, services }) => MemoryLookupManyDataProviderFactory.create({
 *             source: SOURCES[column.name],
 *             services,
 *         }),
 *         services,
 *     }),
 * }
 * ```
 */
export const createLookupManyModule = (options: ILookupManyModuleOptions): ILookupManyModule => ({
    createDataProvider: options.createDataProvider,
    services: options.services,
    components: { CellRenderer: LookupManyCellRenderer },
});
