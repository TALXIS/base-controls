import { ColumnMovedEvent, ColumnResizedEvent, GridApi } from "@ag-grid-community/core";
import { IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";

export interface IGridColumnLayoutParameters {
    services: IGridServiceLocator;
}

/** What the user did to the columns, written back to the provider. */
export class GridColumnLayout {
    private _services: IGridServiceLocator;

    constructor(parameters: IGridColumnLayoutParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
    }

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        gridApi.addEventListener('columnResized', this._onColumnResized);
        gridApi.addEventListener('columnMoved', this._onColumnMoved);
    }

    private _onColumnResized = (event: ColumnResizedEvent<IRecord>): void => {
        //`finished` is the last event of a drag: without it this writes once per pointer move
        if (!event.finished || event.source !== 'uiColumnResized' || !event.column) {
            return;
        }
        const resizedColumnName = event.column.getColId();
        const width = event.column.getActualWidth();
        this._writeColumns(column => column.name === resizedColumnName
            ? { ...column, visualSizeFactor: width }
            : column);
    };

    private _onColumnMoved = (event: ColumnMovedEvent<IRecord>): void => {
        if (!event.finished || event.source !== 'uiColumnMoved') {
            return;
        }
        const orderByColumnName = new Map(
            (event.api.getState().columnOrder?.orderedColIds ?? []).map((colId, order) => [colId, order]));
        this._writeColumns(column => orderByColumnName.has(column.name)
            ? { ...column, order: orderByColumnName.get(column.name)! }
            : column);
        //a grouped column carries its level with it
        if (this._provider.getColumnsMap()[event.column?.getColId()!]?.grouping?.isGrouped) {
            this._provider.refresh();
        }
    };

    private _writeColumns(update: (column: IColumn) => IColumn): void {
        this._provider.setColumns(this._provider.getColumns().map(update));
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
