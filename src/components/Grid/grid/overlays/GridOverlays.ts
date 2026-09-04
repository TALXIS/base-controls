import { GridApi } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";

/**
 * How long a load may take before it is worth telling anyone about.
 *
 * An overlay that comes and goes inside a couple of frames reads as the grid flickering rather than as
 * something loading, and adding or moving a row against data already in memory is over that fast. Waiting
 * this long first means only a load slow enough to notice is ever announced.
 */
const LOADING_OVERLAY_DELAY = 150;

/** Which overlay the grid is showing, if any. */
type GridOverlay = 'none' | 'loading' | 'noRows';

export interface IGridOverlaysParameters {
    services: IGridServiceLocator;
}

/**
 * The spinner and the empty state.
 *
 * Which one is showing is a function of two things — whether the provider is loading, and how many rows the
 * grid is displaying — so there is one method that works it out and every trigger calls that. Nothing here
 * decides an overlay from a single event, which is what used to need a timer to read a row count that had
 * not settled.
 */
export class GridOverlays {
    private _services: IGridServiceLocator;
    private _visibleOverlay: GridOverlay = 'none';
    /** Pending request to show the loading overlay, until {@link LOADING_OVERLAY_DELAY} is up. */
    private _loadingOverlayTimeout: NodeJS.Timeout | undefined;

    constructor(parameters: IGridOverlaysParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
    }

    /**
     * The two things an overlay is decided from, and nothing else.
     *
     * Subscribed rather than asked once: there is no overlay to show before the grid has been given
     * anything, and `modelUpdated` is what says it has. That also catches rows a control adds or removes
     * through a server side transaction, which the provider never hears about.
     */
    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        this._provider.addEventListener('onLoading', () => this._reconcile());
        gridApi.addEventListener('modelUpdated', () => this._reconcile());
        gridApi.addEventListener('gridPreDestroyed', () => this._clearPendingLoading());
    }

    /**
     * Shows whichever overlay the current state calls for.
     *
     * Loading beats no-rows: a grid with no rows *yet* is loading, not empty, and letting the empty state
     * through would flash it on the way to the rows. A load that has just finished needs no wait for the
     * row count to settle — if the rows changed, `modelUpdated` follows and this runs again; if they did
     * not, the count is already right.
     */
    private _reconcile(): void {
        if (this._provider.isLoading()) {
            this._showLoadingAfterDelay();
            return;
        }
        //a load that finished before the delay was up is one nobody was ever told about
        this._clearPendingLoading();
        //asked of the grid rather than the provider, so a server side transaction counts too. Pinned rows
        //are not displayed rows, so a total row does not pass for a record here
        this._setOverlay(this._gridApi.getDisplayedRowCount() === 0 ? 'noRows' : 'none');
    }

    private _showLoadingAfterDelay(): void {
        //the overlay is already up, or already on its way: a load reports itself many times over, and
        //restarting the wait on each of them is how a slow load ends up never announcing itself
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

    /**
     * The single way any overlay is shown or hidden. Repeating the overlay the grid already has is not
     * harmless: AG Grid builds the overlay component asynchronously and ignores a show that arrives while
     * the previous one is still being built, so a hide/show pair landing in that window leaves the overlay
     * hidden with no way back.
     */
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
