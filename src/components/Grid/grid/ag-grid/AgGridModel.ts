import { GridApi, ModuleRegistry } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { FullRowLoading } from "@components/Grid/loading/full-row/FullRowLoading";
import { IGridServiceLocator } from "@components/Grid/services";
//both row models are registered because a grid picks one per instance: paging a dataset needs the
//server-side one, a set already held in memory the client-side one
ModuleRegistry.registerModules([RowGroupingModule, ServerSideRowModelModule, ClientSideRowModelModule, ClipboardModule,]);

export interface IAgGridModelParameters {
    services: IGridServiceLocator;
}

/**
 * The wiring between the grid and AG Grid.
 *
 * What is left here is only what needs an api and belongs to no one feature: the options every grid is set
 * up with, the handshake with whichever row model it was given, and pushing columns and rows when the
 * provider says there are new ones. Sizing, order, overlays, expansion and the total row each live with
 * whatever owns them.
 */
export class AgGridModel {
    private _services: IGridServiceLocator;

    constructor({ services }: IAgGridModelParameters) {
        this._services = services;
        //built with the grid rather than with its api, so nothing that renders can find this missing: the
        //first thing the api-side setup does is push columns, and AG Grid renders their headers from that
        this._services.whenAvailable('gridApi', () => this._onGridApiAvailable());
    }

    /**
     * Everything that needs a grid to talk to, in the order it needs doing.
     *
     * The listeners first, so nothing the options below set off is missed; then the grid's own options;
     * then the columns. A load that finished before any of this existed is simply the state it reads at
     * the end, which is why there is no catching up to do.
     */
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
        this._provider.addEventListener('onNewDataLoaded', () => this._onNewDataLoaded());
        this._provider.addEventListener('onRenderRequested', () => this._gridApi.refreshCells());
    }

    private _setGridOptions(): void {
        this._gridApi.setGridOption('loadingCellRenderer', FullRowLoading);
        this._gridApi.setGridOption('suppressDragLeaveHidesColumns', true);
        this._gridApi.setGridOption('animateRows', false);
        this._gridApi.setGridOption('groupDisplayType', 'custom');
    }

    private _onNewDataLoaded(): void {
        this._services.get('rowModel').refresh(this._gridApi);
        this._setCurrentColumns();
        this._scrollToTop();
    }

    private _setCurrentColumns(): void {
        this._gridApi.setGridOption('columnDefs', this._services.get('columns').getColumnDefinitions());
    }

    /**
     * Back to the first row, because a load is a different list: a new page, a new sort, a new view.
     *
     * Nothing to scroll to while a load is still in flight or came back empty — and it reports itself again
     * when it lands, which is when there is somewhere to go.
     */
    private _scrollToTop(): void {
        if (this._provider.isLoading() || this._provider.getSortedRecordIds().length === 0) {
            return;
        }
        this._gridApi.ensureIndexVisible(0, 'top');
    }

    /**
     * `get`, and not optional: this class is only ever constructed once the api is registered, so an
     * absent one is a bug in the factory rather than a state to tolerate.
     */
    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridApi');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
