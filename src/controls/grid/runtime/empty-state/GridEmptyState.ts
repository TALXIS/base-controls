import { GridApi } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceRegistryInternal } from "..";
import type { IGridAgGridOptions } from "../grid";
import { listenToGridApi } from "../grid/listenToGridApi";

export interface IGridEmptyStateParameters {
    services: IGridServiceRegistryInternal;
}

/** Shows AG Grid's no-rows overlay while the provider has loaded no rows. */
export class GridEmptyState {
    private _services: IGridServiceRegistryInternal;
    private _isShown = false;

    constructor(parameters: IGridEmptyStateParameters) {
        this._services = parameters.services;
        const grid = this._services.get('grid');
        //AG Grid's own overlays would answer to its state, not the provider's
        grid.hooks.agGridInitialOptions.add(result => result.options.suppressOverlays = ['loading', 'noRows', 'noMatchingRows']);
        grid.hooks.agGridOptions.add(this._onAgGridOptions);
        this._services.observe('gridApi', gridApi => this._onGridApiAvailable(gridApi));
    }

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): () => void {
        const stopGridApi = listenToGridApi(gridApi, { modelUpdated: this._refresh });
        const stopProvider = this._services.get('provider').addEventListener('onLoading', this._refresh);
        return () => {
            stopGridApi();
            stopProvider();
        };
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.activeOverlay = this._isShown ? 'agNoRowsOverlay' : undefined;
    };

    private _refresh = (): void => {
        //the grid's row count includes server side transactions
        const isShown = !this._services.get('provider').isLoading() && this._services.get('gridApi').getDisplayedRowCount() === 0;
        if (isShown !== this._isShown) {
            this._isShown = isShown;
            this._services.get('grid').refreshAgGridOptions();
        }
    };
}
