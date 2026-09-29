import { GridApi } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";

/** How long a load may take before it is worth telling anyone about. */
const LOADING_OVERLAY_DELAY = 150;

/** How long to wait before asking AG Grid again for an overlay it dropped. */
const OVERLAY_RETRY_DELAY = 50;

/** How many times an overlay AG Grid dropped is asked for again. */
const OVERLAY_RETRY_LIMIT = 20;

/** The class AG Grid puts on its overlay wrapper while each overlay is up. */
const OVERLAY_WRAPPER_CLASSES: { [overlay in Exclude<GridOverlay, 'none'>]: string } = {
    loading: 'ag-overlay-loading-wrapper',
    noRows: 'ag-overlay-no-rows-wrapper',
};

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
    private _overlayRetryTimeout: NodeJS.Timeout | undefined;

    constructor(parameters: IGridOverlaysParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
        this._services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    /** Listens to the two things an overlay is decided from. */
    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        this._provider.addEventListener('onLoading', this._onLoading);
        gridApi.addEventListener('modelUpdated', () => this._reconcile());
        gridApi.addEventListener('gridPreDestroyed', () => this._clearTimeouts());
    }

    private _onLoading = (): void => this._reconcile();

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onLoading', this._onLoading);
        this._clearTimeouts();
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

    private _clearTimeouts(): void {
        this._clearPendingLoading();
        clearTimeout(this._overlayRetryTimeout);
        this._overlayRetryTimeout = undefined;
    }

    /** The single way any overlay is shown or hidden. */
    private _setOverlay(overlay: GridOverlay): void {
        if (this._visibleOverlay === overlay) {
            return;
        }
        this._visibleOverlay = overlay;
        this._applyOverlay(0);
    }

    private _applyOverlay(attempt: number): void {
        clearTimeout(this._overlayRetryTimeout);
        this._overlayRetryTimeout = undefined;
        const overlay = this._visibleOverlay;
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
                return;
            }
        }
        //AG Grid drops a request that arrives while it is still creating the previous overlay
        if (!this._isOverlayShown(overlay) && attempt < OVERLAY_RETRY_LIMIT) {
            this._overlayRetryTimeout = setTimeout(() => this._applyOverlay(attempt + 1), OVERLAY_RETRY_DELAY);
        }
    }

    private _isOverlayShown(overlay: Exclude<GridOverlay, 'none'>): boolean {
        const wrapper = this._services.find('gridRoot')?.querySelector('.ag-overlay-wrapper');
        return !!wrapper?.classList.contains(OVERLAY_WRAPPER_CLASSES[overlay]);
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridApi');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
