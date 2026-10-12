import { ColDef } from "ag-grid-community";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridRuntime } from "@controls/grid";
import { ILookupManyDataProviderParameters } from "@controls/task-grid/interfaces";
import { ITaskTreeServiceMap, TASK_TREE_PRIORITY } from "@controls/task-grid/module";
import { ITaskGridFeature } from "../interfaces";
import { LookupManyCell } from "./lookup-many-cell";
import { LookupManyEditor } from "./lookup-many-editor";

/** Options for {@link createLookupManyModule}. */
export interface ILookupManyModuleOptions {
    /**
     * Returns the candidate records for a lookup-many cell — the picker's options. Called once per cell,
     * since the query may depend on the row. Return `undefined` for a column you do not serve and the
     * grid throws when that column renders.
     */
    createDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
}

const registerColumnDefinitions = (runtime: IGridRuntime<ITaskTreeServiceMap>): void => {
    runtime.services.get('columns').registerColumnDefinitions((columnDefs: ColDef<IRecord>[]) => {
        const columnsMap = runtime.services.get('provider').getColumnsMap();
        for (const colDef of columnDefs.filter(colDef => columnsMap[colDef.colId!]?.metadata?.LookupMany)) {
            colDef.cellRenderer = LookupManyCell;
            colDef.cellEditor = LookupManyEditor;
            //the picker grows with what is picked, and the row only grows once the edit ends
            colDef.cellEditorPopup = true;
            colDef.autoHeight = true;
            //Enter picks the highlighted record
            colDef.suppressKeyboardEvent = params => params.editing && params.event.key === 'Enter';
        }
    }, TASK_TREE_PRIORITY + 1);
};

/**
 * Builds the lookup-many module: you supply the candidate-record source, this brings the picker.
 *
 * Pass it as `features.lookupMany`. Which columns render as lookup-many is driven by
 * `metadata.LookupMany` on the column itself.
 *
 * @example
 * ```ts
 * features={{
 *     lookupMany: createLookupManyModule({
 *         createDataProvider: ({ column, services }) => MemoryLookupManyDataProviderFactory.create({
 *             source: SOURCES[column.name],
 *             services,
 *         }),
 *     }),
 * }}
 * ```
 */
export const createLookupManyModule = (options: ILookupManyModuleOptions): ITaskGridFeature => ({
    onInitialize: services => {
        services.register('lookupManyModule', () => ({ createDataProvider: options.createDataProvider }));
    },
    onRegister: registerColumnDefinitions,
});
