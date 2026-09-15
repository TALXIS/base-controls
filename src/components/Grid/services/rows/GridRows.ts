import { CellFocusedEvent, CellMouseOutEvent, CellMouseOverEvent, GridApi } from "@ag-grid-community/core";
import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";

export interface IGridRowsEvents {
    /** A row was given a height of its own. */
    onRowHeightChanged: (record: IRecord, height: number) => void;
    /** Which rows the user is at changed: the pointer moved, focus moved, or a selection was made. */
    onActiveRowsChanged: () => void;
}

export interface IGridRowsParameters {
    services: IGridServiceLocator;
}

/** What is true of a row rather than of one of its cells. */
export class GridRows extends EventEmitter<IGridRowsEvents> {
    private _services: IGridServiceLocator;
    private _heights: Record<string, number> = {};
    private _hoveredRecordId?: string;
    private _focusedRecordId?: string;
    private _selectedRecordIds = new Set<string>();

    constructor(parameters: IGridRowsParameters) {
        super();
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
    }

    /**
     * Whether this is a row the user is at: the one under the pointer, the one holding the focused cell,
     * or one they have selected.
     *
     * What a cell draws only for a row being used - its commands - asks this, so that everything else on
     * screen is spared the cost of drawing it.
     */
    public isActive(record: IRecord): boolean {
        const recordId = record.getRecordId();
        return recordId === this._hoveredRecordId || recordId === this._focusedRecordId || this._selectedRecordIds.has(recordId);
    }

    /**
     * How tall this row is: what it was dragged to, or what a row is worth by default.
     *
     * A height on the row node does not survive: `checkAutoHeights` recomputes one from what its
     * auto-height cells measure and overwrites it. So the drag grows the cell's own content, and this is
     * what a cell re-created by scrolling reads to come back to the same size.
     */
    public getHeight(record: IRecord): number {
        return this._heights[record.getRecordId()] ?? this._settings.getDefaultRowHeight();
    }

    /**
     * Where this row sits, or `undefined` before AG Grid has placed it.
     *
     * Read from the row node rather than kept: the index is what sorting, filtering and grouping change,
     * and the node is where AG Grid keeps the answer. Finding that node by record id walks every row the
     * model holds, so anything handed a node of its own reads `node.rowIndex` instead of asking this.
     */
    public getIndex(record: IRecord): number | undefined {
        return this._services.find('gridApi')?.getRowNode(record.getRecordId())?.rowIndex ?? undefined;
    }

    public setHeight(record: IRecord, height: number): void {
        this._heights[record.getRecordId()] = height;
        this.dispatchEvent('onRowHeightChanged', record, height);
    }

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        //a selection reaches the cells nowhere else: the selection module redraws the checkboxes and
        //nothing besides, so what a selected row draws of its own is this to tell
        this._services.get('provider').addEventListener('onRecordsSelected', () => this._onSelectionChanged());
        gridApi.addEventListener('cellMouseOver', (event: CellMouseOverEvent<IRecord>) => this._setActiveRow('hovered', event.data?.getRecordId()));
        //AG Grid reports the cell the pointer left, which is this row only until the pointer is on another
        gridApi.addEventListener('cellMouseOut', (event: CellMouseOutEvent<IRecord>) => {
            if (this._hoveredRecordId === event.data?.getRecordId()) {
                this._setActiveRow('hovered', undefined);
            }
        });
        gridApi.addEventListener('cellFocused', (event: CellFocusedEvent<IRecord>) => {
            this._setActiveRow('focused', event.rowIndex != null ? gridApi.getDisplayedRowAtIndex(event.rowIndex)?.data?.getRecordId() : undefined);
        });
    }

    private _onSelectionChanged(): void {
        this._selectedRecordIds = new Set(this._services.get('provider').getSelectedRecordIds({ includeGroupRecordIds: true }));
        this.dispatchEvent('onActiveRowsChanged');
    }

    private _setActiveRow(by: 'hovered' | 'focused', recordId: string | undefined): void {
        if (by === 'hovered') {
            if (this._hoveredRecordId === recordId) {
                return;
            }
            this._hoveredRecordId = recordId;
        }
        else {
            if (this._focusedRecordId === recordId) {
                return;
            }
            this._focusedRecordId = recordId;
        }
        this.dispatchEvent('onActiveRowsChanged');
    }

    private get _settings() {
        return this._services.get('settings');
    }
}
