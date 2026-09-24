import { CellFocusedEvent, GridApi } from "@ag-grid-community/core";
import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import type { IGridCell } from "../cells";

export interface IGridEditedCell {
    recordId: string;
    columnName: string;
}

export interface IGridEditingEvents {
    onEditedCellChanged: (previous: IGridEditedCell | undefined, next: IGridEditedCell | undefined) => void;
}

export interface IGridEditingParameters {
    services: IGridServiceLocator;
}

//Enter navigates rather than opening an editor here, and space selects the row
const isEditStartKey = (event: KeyboardEvent): boolean => {
    if (event.key === 'F2') {
        return true;
    }
    return event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;
};

/** Which cell the user is editing, and the keys that start and end it. */
export interface IGridEditing {
    readonly events: IEventEmitter<IGridEditingEvents>;
    /** Whether the user stepped into the control a cell draws in place. */
    isEditing(record: IRecord, columnName: string): boolean;
    /** The user stepped into what this cell draws. */
    start(cell: IGridCell): void;
    /**
     * The edit is over: what was opened over the cell closes and the highlight comes back.
     */
    finish(cell: IGridCell): void;
}

export class GridEditing implements IGridEditing {
    private _services: IGridServiceLocator;
    //by record and column, not by cell
    private _editedCell?: IGridEditedCell;
    public readonly events: IEventEmitter<IGridEditingEvents> = new EventEmitter<IGridEditingEvents>();

    constructor(parameters: IGridEditingParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('keyboard', keyboard => keyboard.onKeyDown(event => this._onKeyDown(event)));
        this._services.whenAvailable('gridApi', gridApi => {
            gridApi.addEventListener('cellFocused', (event: CellFocusedEvent<IRecord>) => this._onCellFocused(event));
        });
    }

    public isEditing(record: IRecord, columnName: string): boolean {
        return this._editedCell?.recordId === record.getRecordId() && this._editedCell?.columnName === columnName;
    }

    public start(cell: IGridCell): void {
        this._setEditedCell({ recordId: cell.getRecord().getRecordId(), columnName: cell.getColumnName() });
    }

    public finish(cell: IGridCell): void {
        const gridApi = this._services.find('gridApi');
        if (!gridApi) {
            return;
        }
        if (this._isEditorOpen(gridApi, cell)) {
            gridApi.stopEditing();
        }
        this._setEditedCell(undefined);
        this._returnFocus(gridApi, cell);
    }

    private _onKeyDown(event: KeyboardEvent): void {
        const editedCell = this._getEditedCell();
        if (editedCell) {
            if (event.key === 'Escape') {
                this.finish(editedCell);
            }
            return;
        }
        if (!isEditStartKey(event)) {
            return;
        }
        if (!(event.target as HTMLElement | null)?.matches('.ag-cell')) {
            return;
        }
        const cell = this._getFocusedCell();
        if (!cell?.hasOneClickEdit()) {
            return;
        }
        //AG Grid answers F2 by asking for an editor the column does not open
        event.preventDefault();
        event.stopPropagation();
        this.start(cell);
    }

    private _onCellFocused(event: CellFocusedEvent<IRecord>): void {
        if (!this._editedCell) {
            return;
        }
        const columnName = typeof event.column === 'string' ? event.column : event.column?.getColId();
        const record = event.rowIndex !== null ? event.api.getDisplayedRowAtIndex(event.rowIndex)?.data : undefined;
        if (record && columnName && this.isEditing(record, columnName)) {
            return;
        }
        this._setEditedCell(undefined);
    }

    private _setEditedCell(editedCell: IGridEditedCell | undefined): void {
        const previous = this._editedCell;
        this._editedCell = editedCell;
        this.events.dispatchEvent('onEditedCellChanged', previous, editedCell);
    }

    private _getEditedCell(): IGridCell | undefined {
        return this._cells.getCells().find(cell => this._editedCell?.recordId === cell.getRecord().getRecordId()
            && this._editedCell?.columnName === cell.getColumnName());
    }

    private _getFocusedCell(): IGridCell | undefined {
        const gridApi = this._services.find('gridApi');
        const focusedCell = gridApi?.getFocusedCell();
        if (!gridApi || !focusedCell) {
            return undefined;
        }
        const record = gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex)?.data;
        return record ? this._cells.getCell(record, focusedCell.column.getColId()) : undefined;
    }

    private _isEditorOpen(gridApi: GridApi<IRecord>, cell: IGridCell): boolean {
        return gridApi.getEditingCells().some(editing => editing.rowIndex === cell.getNode()?.rowIndex
            && editing.column.getColId() === cell.getColumnName());
    }

    //deferred: focus set while an editor is still being torn down goes back to the document with
    private _returnFocus(gridApi: GridApi<IRecord>, cell: IGridCell): void {
        const rowIndex = cell.getNode()?.rowIndex;
        if (rowIndex === null || rowIndex === undefined) {
            return;
        }
        const targetIndex = Math.max(Math.min(rowIndex + this._getRowsMoved(gridApi), gridApi.getDisplayedRowCount() - 1), 0);
        setTimeout(() => {
            gridApi.ensureIndexVisible(targetIndex);
            gridApi.setFocusedCell(targetIndex, cell.getColumnName());
            //a range does not follow the focus, and the one left behind reads as a second highlight
            if (gridApi.getGridOption('enableRangeSelection')) {
                gridApi.clearRangeSelection();
                gridApi.addCellRange({ rowStartIndex: targetIndex, rowEndIndex: targetIndex, columns: [cell.getColumnName()] });
            }
        });
    }

    private _getRowsMoved(gridApi: GridApi<IRecord>): number {
        const keyPress = this._services.get('keyboard').getKeyBeingPressed();
        if (keyPress?.key !== 'Enter' || !gridApi.getGridOption('enterNavigatesVerticallyAfterEdit')) {
            return 0;
        }
        return keyPress.shiftKey ? -1 : 1;
    }

    private get _cells() {
        return this._services.get('cells');
    }
}
