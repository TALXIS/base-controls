import { CellFocusedEvent, CellMouseOutEvent, CellMouseOverEvent, GridApi, IRowNode, RowClickedEvent, RowHeightParams } from "@ag-grid-community/core";
import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";
import type { IGridLock } from "../locks";

export interface IGridRowsEvents {
    /** Fired when the rows the user is at change. */
    onHighlightedRowsChanged: () => void;
    /** Fired when a row with a record is clicked. */
    onRowClicked: (record: IRecord) => void;
}

export interface IGridRowHeight {
    /** In pixels, or `undefined` for the grid's own row height. */
    height?: number;
}

/** A hook over how tall a row is. */
export type GridRowHeightHook = (result: IGridRowHeight, params: { record: IRecord; node: IRowNode<IRecord> }) => void;

/** What the caller decides for each row, after the row-level hooks. */
export interface IGridRowSettings {
    /** Locks a record as a whole, after the record-level `registerLockHook` hooks. */
    onGetLock?: (result: IGridLock, params: { record: IRecord }) => void;
    /** How tall a row is, after `registerRowHeightHook`. */
    onGetHeight?: GridRowHeightHook;
}

export interface IGridRowsParameters {
    services: IGridServiceLocator;
}

/** What is true of a row as a whole. */
export interface IGridRows extends IEventEmitter<IGridRowsEvents> {
    /** Whether the row is hovered, focused or selected. */
    isHighlighted(record: IRecord): boolean;
    /**
     * Registers a hook over how tall a row is.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerRowHeightHook(hook: GridRowHeightHook, priority?: number): () => void;
}

export class GridRows extends EventEmitter<IGridRowsEvents> implements IGridRows {
    private _services: IGridServiceLocator;
    private _hoveredRecordId?: string;
    private _focusedRecordId?: string;
    private _selectedRecordIds = new Set<string>();
    private _rowHeightHooks = new HookRegistry<GridRowHeightHook>();

    constructor(parameters: IGridRowsParameters) {
        super();
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
        this._services.get('grid').registerAgGridOptions(result => result.options.getRowHeight = this._getRowHeight);
        this._services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    public isHighlighted(record: IRecord): boolean {
        const recordId = record.getRecordId();
        return recordId === this._hoveredRecordId || recordId === this._focusedRecordId || this._selectedRecordIds.has(recordId);
    }

    public registerRowHeightHook(hook: GridRowHeightHook, priority?: number): () => void {
        return this._rowHeightHooks.register(hook, priority);
    }

    private _getRowHeight = (params: RowHeightParams<IRecord>): number | undefined => {
        if (!params.data) {
            return undefined;
        }
        const result: IGridRowHeight = {};
        this._rowHeightHooks.apply(result, { record: params.data, node: params.node });
        this._services.get('settings').getRowSettings().onGetHeight?.(result, { record: params.data, node: params.node });
        return result.height;
    };

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        //a selection reaches the cells nowhere else
        this._services.get('provider').addEventListener('onRecordsSelected', this._onSelectionChanged);
        gridApi.addEventListener('cellMouseOver', (event: CellMouseOverEvent<IRecord>) => this._setHighlightedRow('hovered', event.data?.getRecordId()));
        //AG Grid reports the cell the pointer left
        gridApi.addEventListener('cellMouseOut', (event: CellMouseOutEvent<IRecord>) => {
            if (this._hoveredRecordId === event.data?.getRecordId()) {
                this._setHighlightedRow('hovered', undefined);
            }
        });
        gridApi.addEventListener('cellFocused', this._onCellFocused);
        gridApi.addEventListener('rowClicked', this._onRowClicked);
    }

    private _onCellFocused = (event: CellFocusedEvent<IRecord>): void => {
        const record = event.rowIndex != null ? event.api.getDisplayedRowAtIndex(event.rowIndex)?.data : undefined;
        this._setHighlightedRow('focused', record?.getRecordId());
    };

    private _onRowClicked = (event: RowClickedEvent<IRecord>): void => {
        if (event.data) {
            this.dispatchEvent('onRowClicked', event.data);
        }
    };

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._services.get('provider').removeEventListener('onRecordsSelected', this._onSelectionChanged);
    };

    private _onSelectionChanged = (): void => {
        this._selectedRecordIds = new Set(this._services.get('provider').getSelectedRecordIds({ includeGroupRecordIds: true }));
        this.dispatchEvent('onHighlightedRowsChanged');
    };

    private _setHighlightedRow(by: 'hovered' | 'focused', recordId: string | undefined): void {
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
        this.dispatchEvent('onHighlightedRowsChanged');
    }
}
