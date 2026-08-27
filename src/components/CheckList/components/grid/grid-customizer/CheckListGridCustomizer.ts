import { ColDef as ColDefBase, GridApi as GridApiBase } from "@ag-grid-community/core";
import { DatasetConstants, IRecord } from "@talxis/client-libraries";

/** AG Grid's `ColDef`, bound to the grid's record type. */
type ColDef = ColDefBase<IRecord>;
/** AG Grid's `GridApi`, bound to the grid's record type. */
type GridApi = GridApiBase<IRecord>;

/** What {@link CheckListGridCustomizer} is built from. */
export interface ICheckListGridCustomizerParameters {
    gridApi: GridApi;
}

/**
 * Where the checklist configures its own AG Grid instance. Internal: there is no strategy, no module and
 * no prop behind this — it is not a seam for consumers, it is how the checklist implements itself.
 *
 * Built in the grid's `onGridReady`, before the grid pushes its first columns.
 *
 * Adds no listeners to the data provider, and should not: the checklist never remounts and leaves the
 * provider alive on unmount (`DestroyDatasetOnUnmount` is false, the caller owns it), so a listener
 * registered here would outlive the grid and pile up across mounts. The patched `gridApi` is safe
 * because it dies with the AG Grid instance.
 */
export class CheckListGridCustomizer {
    private _gridApi: GridApi;

    constructor(parameters: ICheckListGridCustomizerParameters) {
        this._gridApi = parameters.gridApi;
        this._patchGridApi();
    }

    /**
     * Intercepts `setGridOption` so the customization below survives every data load. The grid pushes
     * `columnDefs` from its own init *and* from every new page, so computing the definitions once here
     * would be overwritten by the next refresh. Patching the setter instead means each push goes through
     * {@link _getColumnDefinitions} on its way in.
     */
    private _patchGridApi() {
        const originalSetGridOption = this._gridApi.setGridOption.bind(this._gridApi);
        this._gridApi.setGridOption = (key: any, value: any): void => {
            switch (key) {
                case 'columnDefs': {
                    originalSetGridOption(key, this._getColumnDefinitions(value));
                    break;
                }
                default: {
                    originalSetGridOption(key, value);
                }
            }
        }
    }

    /** The checklist's own column configuration. Runs on every push of `columnDefs`. */
    private _getColumnDefinitions(columnDefs: ColDef[]): ColDef[] {
        for (const colDef of columnDefs) {
            const columnName = (colDef.colId ?? colDef.field) as string;
            switch (columnName) {
                case DatasetConstants.CHECKBOX_COLUMN_KEY: {
                    //the tick column leads the list and stays there - it is not one of the data columns
                    colDef.lockPosition = true;
                    break;
                }
            }
        }
        return columnDefs;
    }
}
