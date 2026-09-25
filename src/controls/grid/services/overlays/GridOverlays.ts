import { GridApi } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";

/** How long a load may take before it is worth telling anyone about. */
const LOADING_OVERLAY_DELAY = 150;

/** Which overlay the grid is showing, if any. */
type GridOverlay = 'none' | 'loading' | 'noRows';

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
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
        this._services.get('grid').events.addEventListener('onDestroy', this._onDestroy);
    }

    /** The two things an overlay is decided from, and nothing else. */
    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        this._provider.addEventListener('onLoading', this._onLoading);
        gridApi.addEventListener('modelUpdated', () => this._reconcile());
        gridApi.addEventListener('gridPreDestroyed', () => this._clearPendingLoading());
    }

    private _onLoading = (): void => this._reconcile();

    //the provider outlives the grid
    private _onDestroy = (): void => {
        this._provider.removeEventListener('onLoading', this._onLoading);
        this._clearPendingLoading();
    };

    /** Shows whichever overlay the current state calls for. */
    private _reconcile(): void {
        if (this._provider.isLoading()) {
            this._showLoadingAfterDelay();
            return;
        }
        //a load that finished before the delay was up is one nobody was ever told about
        this._clearPendingLoading();
        //asked of the grid rather than the provider, so a server side transaction counts too.
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
        switch (overlay) {
            case 'loading': {
                this._gridApi.showLoadingOverlay();
                break;
            }
            case 'noRows': {
                this._gridApi.showNoRowsOverlay();
                break;
            }
            default: {
                this._gridApi.hideOverlay();
            }
        }
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridApi');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
