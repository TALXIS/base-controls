import { ILookupManyDataProviderParameters } from "@components/TaskGrid/interfaces";
import { IDataProvider } from "@talxis/client-libraries";
import { ILookupManyModule } from "../interfaces";
import { LookupManyCellRenderer } from "./cell-renderer";

export interface ILookupManyModuleOptions {
    /**
     * Returns the candidate records for a lookup-many cell — the picker's options. Called once per
     * lookup-many cell, since the query may depend on the row. Return `undefined` for a column you do
     * not serve and the grid throws when that column renders.
     */
    createDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
}

/**
 * Registers the candidate-record source for lookup-many (multi-value picker) columns.
 *
 * Return it from the descriptor's `onGetModules` to enable it. Which columns *render* as lookup-many is
 * driven by `metadata.LookupMany` on the column itself; this only supplies what feeds them.
 *
 * ```ts
 * onGetModules: () => ({
 *     lookupMany: createLookupManyModule({
 *         createDataProvider: ({ column }) => MemoryLookupManyDataProviderFactory.create(SOURCES[column.name]),
 *     }),
 * })
 * ```
 */
export const createLookupManyModule = (options: ILookupManyModuleOptions): ILookupManyModule => ({
    createDataProvider: options.createDataProvider,
    //the only place the cell renderer (and the picker variants it chooses between) is named: a consumer
    //never imports or knows about them
    components: { CellRenderer: LookupManyCellRenderer },
});
