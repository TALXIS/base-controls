import { GridApi } from "ag-grid-community";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import type { IGridAgGridOptions } from "../runtime";

/** How long a load may take before it is worth telling anyone about. */
const LOADING_OVERLAY_DELAY = 150;

/** Which overlay the grid is showing, if any. */
type GridOverlay = 'none' | 'loading' | 'noRows';

/** The provided overlay each state asks AG Grid for, drawn with the grid's own overlay components. */
const ACTIVE_OVERLAYS: { [overlay in GridOverlay]: string | undefined } = {
    none: undefined,
    loading: 'agLoadingOverlay',
    noRows: 'agNoRowsOverlay',
};

export interface IGridOverlaysParameters {
    services: IGridServiceLocator;
}

/** The spinner and the empty state. */
export class GridOverlays {
    private _services: IGridServiceLocator;
    private _visibleOverlay: GridOverlay = 'none';
    /** Pending request to show the loading overlay, until {@link LOADING_OVERLAY_DELAY} is up. */
    private _loadingOverlayTimeout: NodeJS.Timeout | undefined;

    constructor(parameters: IGridOverlaysParameters) {
        this._services = parameters.services;
        //AG Grid's own overlays would answer to its state, not the provider's
        this._services.get('grid').registerAgGridInitialOptions(result => result.options.suppressOverlays = ['loading', 'noRows', 'noMatchingRows']);
        this._services.get('grid').registerAgGridOptions(this._onAgGridOptions);
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
        this._services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    /** Listens to the two things an overlay is decided from. */
    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        this._provider.addEventListener('onLoading', this._onLoading);
        gridApi.addEventListener('modelUpdated', () => this._reconcile());
        gridApi.addEventListener('gridPreDestroyed', () => this._clearPendingLoading());
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.activeOverlay = ACTIVE_OVERLAYS[this._visibleOverlay];
    };

    private _onLoading = (): void => this._reconcile();

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onLoading', this._onLoading);
        this._clearPendingLoading();
    };

    /** Shows whichever overlay the current state calls for. */
    private _reconcile(): void {
        if (this._provider.isLoading()) {
            this._showLoadingAfterDelay();
            return;
        }
        //a load that finished within the delay never shows
        this._clearPendingLoading();
        //the grid's row count includes server side transactions
        this._setOverlay(this._gridApi.getDisplayedRowCount() === 0 ? 'noRows' : 'none');
    }

    private _showLoadingAfterDelay(): void {
        //the overlay is already up, or already on its way
        if (this._visibleOverlay === 'loading' || this._loadingOverlayTimeout) {
            return;
        }
        this._loadingOverlayTimeout = setTimeout(() => {
            this._loadingOverlayTimeout = undefined;
            this._setOverlay('loading');
        }, LOADING_OVERLAY_DELAY);
    }

    private _clearPendingLoading(): void {
        clearTimeout(this._loadingOverlayTimeout);
        this._loadingOverlayTimeout = undefined;
    }

    /** The single way any overlay is shown or hidden. */
    private _setOverlay(overlay: GridOverlay): void {
        if (this._visibleOverlay === overlay) {
            return;
        }
        this._visibleOverlay = overlay;
        this._services.get('grid').refreshAgGridOptions();
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridApi');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
