import { GridApi } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { FullRowLoading } from "@controls/grid/components/loading/full-row/FullRowLoading";
import { IGridServiceLocator } from "@controls/grid/services";

export interface IAgGridModelParameters {
    services: IGridServiceLocator;
}

/** The wiring between the grid and AG Grid. */
export class AgGridModel {
    private _services: IGridServiceLocator;

    constructor({ services }: IAgGridModelParameters) {
        this._services = services;
        //built with the grid rather than with its api
        this._services.whenAvailable('gridApi', () => this._onGridApiAvailable());
    }

    /** Everything that needs a grid to talk to, in the order it needs doing. */
    private _onGridApiAvailable(): void {
        this._registerEventListeners();
        this._setGridOptions();
        //after the grid's own, so the row model has the last word on anything it also sets
        this._services.get('rowModel').applyGridOptions(this._gridApi);
        this._setCurrentColumns();
        if (!this._provider.isLoading()) {
            this._onNewDataLoaded();
        }
    }

    private _registerEventListeners(): void {
        this._provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this._provider.addEventListener('onRenderRequested', this._onRenderRequested);
        this._gridApi.addEventListener('gridPreDestroyed', this._onGridPreDestroyed);
    }

    //the provider outlives the grid
    private _onGridPreDestroyed = (): void => {
        this._provider.removeEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this._provider.removeEventListener('onRenderRequested', this._onRenderRequested);
    };

    private _onRenderRequested = (): void => this._gridApi.refreshCells();

    private _setGridOptions(): void {
        this._gridApi.setGridOption('loadingCellRenderer', FullRowLoading);
        this._gridApi.setGridOption('suppressDragLeaveHidesColumns', true);
        this._gridApi.setGridOption('animateRows', false);
        this._gridApi.setGridOption('groupDisplayType', 'custom');
        this._gridApi.setGridOption('enterNavigatesVertically', true);
        this._gridApi.setGridOption('enterNavigatesVerticallyAfterEdit', true);
    }

    private _onNewDataLoaded = (): void => {
        this._services.get('rowModel').refresh(this._gridApi);
        this._setCurrentColumns();
        this._scrollToTop();
    };

    private _setCurrentColumns(): void {
        this._gridApi.setGridOption('columnDefs', this._services.get('columns').getColumnDefinitions());
    }

    /** Back to the first row, because a load is a different list */
    private _scrollToTop(): void {
        if (this._provider.isLoading() || this._provider.getSortedRecordIds().length === 0) {
            return;
        }
        this._gridApi.ensureIndexVisible(0, 'top');
    }

    /** `get`, and not optional: this class is only ever constructed once the api is registered. */
    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridApi');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
