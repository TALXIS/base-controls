import { Column, ColumnMovedEvent, ColumnResizedEvent, ColumnState, GridApi } from "@ag-grid-community/core";
import { IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import { DEFAULT_COLUMN_WIDTH } from "../columns/GridColumns";

export interface IGridColumnLayoutParameters {
    services: IGridServiceLocator;
}

/** How wide the columns are, and what the user did to them, written back to the provider. */
export class GridColumnLayout {
    private _services: IGridServiceLocator;
    /** What the widths were last laid out for, so a user's drag outlives a reload. */
    private _layoutKey?: string;

    constructor(parameters: IGridColumnLayoutParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
    }

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        gridApi.addEventListener('columnResized', this._onColumnResized);
        gridApi.addEventListener('columnMoved', this._onColumnMoved);
        gridApi.addEventListener('gridSizeChanged', () => this._applyLayout(gridApi));
        gridApi.addEventListener('displayedColumnsChanged', () => this._applyLayout(gridApi));
        this._applyLayout(gridApi);
    }

    /** Columns flex by their widths while they fit, and scroll at those widths once they don't. */
    private _applyLayout(gridApi: GridApi<IRecord>): void {
        const layout = this._getLayout(gridApi);
        if (!layout || layout.key === this._layoutKey) {
            return;
        }
        this._layoutKey = layout.key;
        gridApi.applyColumnState({ state: layout.state });
    }

    private _getLayout(gridApi: GridApi<IRecord>): { key: string; state: ColumnState[] } | undefined {
        //measured: AG Grid reports its first size before it hands over an api
        const gridWidth = this._services.find('gridRoot')?.clientWidth;
        if (!gridWidth) {
            return undefined;
        }
        const columnsMap = this._provider.getColumnsMap();
        const columns = gridApi.getAllDisplayedColumns();
        const dataColumns = columns.filter(column => !!columnsMap[column.getColId()]);
        const widths = new Map(dataColumns.map(column => [column, this._getBaseWidth(column, columnsMap[column.getColId()])]));
        const totalWidth = columns.reduce((total, column) => total + (widths.get(column) ?? column.getActualWidth()), 0);
        const isFilling = totalWidth <= gridWidth;
        return {
            key: `${isFilling}|${dataColumns.map(column => `${column.getColId()}:${widths.get(column)}`).join(',')}`,
            state: dataColumns.map(column => ({
                colId: column.getColId(),
                width: widths.get(column),
                //AG Grid flexes only what scrolls
                flex: isFilling && !column.getPinned() ? widths.get(column) : null,
            })),
        };
    }

    private _getBaseWidth(column: Column, providerColumn: IColumn): number {
        const colDef = column.getColDef();
        //what the user dragged to, else what the definition starts at
        return (providerColumn.visualSizeFactor ?? colDef.initialWidth ?? DEFAULT_COLUMN_WIDTH) + (colDef.settings?.widthOffset ?? 0);
    }

    private _onColumnResized = (event: ColumnResizedEvent<IRecord>): void => {
        //`finished` is the last event of a drag: without it this writes once per pointer move
        if (!event.finished || event.source !== 'uiColumnResized' || !event.column) {
            return;
        }
        const resizedColumnName = event.column.getColId();
        const width = event.column.getActualWidth() - (event.column.getColDef().settings?.widthOffset ?? 0);
        this._writeColumns(column => column.name === resizedColumnName
            ? { ...column, visualSizeFactor: width }
            : column);
        //what the user dragged is the layout now
        this._layoutKey = this._getLayout(event.api)?.key;
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
