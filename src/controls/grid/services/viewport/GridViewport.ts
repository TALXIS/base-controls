import { GridApi, IRowNode } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../interfaces";
import { getRowNode } from "../rows/getRowNode";

const VIEWPORT_STATE_KEY = 'viewport';

interface IGridViewportState {
    /** The cell at the top-left of the viewport, by AG Grid's row id and column id. */
    scroll?: { rowId?: string; columnId?: string };
    focusedCell?: { rowId: string; columnId: string };
}

export interface IGridViewportParameters {
    services: IGridServiceLocator;
}

/** Where the user is scrolled and focused, kept in the grid's state. */
export class GridViewport {
    private _services: IGridServiceLocator;
    private _pending?: IGridViewportState;
    private _hasLoaded = false;

    constructor(parameters: IGridViewportParameters) {
        this._services = parameters.services;
        this._pending = this._services.get('state').get<IGridViewportState>(VIEWPORT_STATE_KEY);
        this._services.get('grid').events.addEventListener('onDataLoaded', this._onDataLoaded);
        this._services.whenAvailable('gridApi', this._onGridApiAvailable);
    }

    private _onGridApiAvailable = (gridApi: GridApi<IRecord>): void => {
        gridApi.addEventListener('bodyScrollEnd', this._onBodyScrollEnd);
        gridApi.addEventListener('cellFocused', this._onCellFocused);
        if (this._pending) {
            gridApi.addEventListener('gridSizeChanged', this._restore);
            //fired once rows are drawn; rows inside groups only exist once their groups have loaded
            gridApi.addEventListener('viewportChanged', this._restore);
        }
    };

    private _onDataLoaded = (): void => {
        //the first load starts at the top on its own
        if (this._hasLoaded) {
            this._scrollToTop();
        }
        this._hasLoaded = true;
    };

    private _scrollToTop(): void {
        const gridApi = this._services.find('gridApi');
        const provider = this._services.get('provider');
        if (!gridApi || provider.isLoading() || provider.getSortedRecordIds().length === 0) {
            return;
        }
        gridApi.ensureIndexVisible(0, 'top');
    }

    private _onBodyScrollEnd = (): void => {
        //AG Grid scrolls itself while it sizes the grid
        if (!this._isLaidOut()) {
            return;
        }
        //the user scrolling before the row arrives is the end of putting them back
        this._stopRestoring();
        this._save();
    };

    private _onCellFocused = (): void => {
        this._stopRestoring();
        this._save();
    };

    private _save(): void {
        const gridApi = this._services.find('gridApi');
        if (this._pending || !gridApi || gridApi.isDestroyed()) {
            return;
        }
        this._services.get('state').set<IGridViewportState>(VIEWPORT_STATE_KEY, {
            scroll: { rowId: this._getTopRow(gridApi)?.id, columnId: this._getLeftColumnId(gridApi) },
            focusedCell: this._getFocusedCell(gridApi),
        });
    }

    private _restore = (): void => {
        const gridApi = this._services.find('gridApi');
        if (!this._pending || !gridApi || !this._isLaidOut()) {
            return;
        }
        const { scroll, focusedCell } = this._pending;
        const rowNode = scroll?.rowId ? gridApi.getRowNode(scroll.rowId) : undefined;
        if (scroll?.rowId && !rowNode) {
            return;
        }
        this._stopRestoring();
        if (rowNode) {
            gridApi.ensureNodeVisible(rowNode, 'top');
        }
        if (scroll?.columnId && gridApi.getColumn(scroll.columnId)) {
            gridApi.ensureColumnVisible(scroll.columnId, 'start');
        }
        const focusedNode = focusedCell ? gridApi.getRowNode(focusedCell.rowId) : undefined;
        if (focusedCell && focusedNode?.rowIndex != null) {
            gridApi.setFocusedCell(focusedNode.rowIndex, focusedCell.columnId, focusedNode.rowPinned);
        }
    };

    private _stopRestoring(): void {
        this._pending = undefined;
        const gridApi = this._services.find('gridApi');
        gridApi?.removeEventListener('viewportChanged', this._restore);
        gridApi?.removeEventListener('gridSizeChanged', this._restore);
    }

    //AG Grid resets the horizontal scroll while its pinned columns fill the viewport
    private _isLaidOut(): boolean {
        const gridApi = this._services.find('gridApi');
        if (!gridApi || gridApi.getRenderedNodes().length === 0) {
            return false;
        }
        const { left, right } = gridApi.getHorizontalPixelRange();
        return right - left > 0;
    }

    private _getTopRow(gridApi: GridApi<IRecord>): IRowNode<IRecord> | undefined {
        const top = gridApi.getVerticalPixelRange().top;
        for (let index = gridApi.getFirstDisplayedRowIndex(); index <= gridApi.getLastDisplayedRowIndex(); index++) {
            const node = gridApi.getDisplayedRowAtIndex(index);
            if (node?.rowTop != null && node.rowTop + (node.rowHeight ?? 0) > top) {
                return node;
            }
        }
        return undefined;
    }

    private _getLeftColumnId(gridApi: GridApi<IRecord>): string | undefined {
        const left = gridApi.getHorizontalPixelRange().left;
        return gridApi.getAllDisplayedColumns()
            .find(column => !column.getPinned() && (column.getLeft() ?? 0) + column.getActualWidth() > left)
            ?.getColId();
    }

    private _getFocusedCell(gridApi: GridApi<IRecord>): IGridViewportState['focusedCell'] {
        const focusedCell = gridApi.getFocusedCell();
        const node = focusedCell ? getRowNode(gridApi, focusedCell.rowIndex, focusedCell.rowPinned ?? undefined) : undefined;
        return focusedCell && node?.id ? { rowId: node.id, columnId: focusedCell.column.getColId() } : undefined;
    }
}
