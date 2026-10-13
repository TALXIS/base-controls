import { CellFocusedEvent, CellMouseOutEvent, CellMouseOverEvent, GridApi, IRowNode, RowClassParams, RowClassRules, RowClickedEvent, RowHeightParams } from "ag-grid-community";
import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IGridInternalServiceLocator } from "../../services";
import { getRowNode } from "./getRowNode";

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

/** Whether a row with a record takes a class. */
export type GridRowClassRule = (params: { record: IRecord; node: IRowNode<IRecord> }) => boolean;

/** What the caller decides for each row, after the row-level hooks. */
export interface IGridRowSettings {
    /** How tall a row is, after `registerRowHeight`. */
    onGetHeight?: GridRowHeightHook;
}

export interface IGridRowsParameters {
    services: IGridInternalServiceLocator;
}

/** What is true of a row as a whole. */
export interface IGridRows {
    /**
     * Registers a hook over how tall a row is.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerRowHeight(hook: GridRowHeightHook, priority?: number): () => void;
    /** Puts the class on every row with a record the rule holds for; pinned rows never take it. */
    registerRowClass(className: string, rule: GridRowClassRule): () => void;
    /** Runs the class rules over the records' rows again. */
    refreshRowClasses(records: IRecord[]): void;
}

/** What the grid's own parts read of it. */
export interface IGridRowsInternal extends IGridRows, IEventEmitter<IGridRowsEvents> {
    /** Whether the row is hovered, focused or selected. */
    isHighlighted(record: IRecord): boolean;
    /** Sets how tall the record's row is, over what the hooks decide. */
    setRowHeight(record: IRecord, height: number): void;
}

export class GridRows extends EventEmitter<IGridRowsEvents> implements IGridRowsInternal {
    private _services: IGridInternalServiceLocator;
    private _hoveredRecordId?: string;
    private _focusedRecordId?: string;
    private _selectedRecordIds = new Set<string>();
    private _rowHeightHooks = new HookRegistry<GridRowHeightHook>();
    //a node's own height is lost once AG Grid asks `getRowHeight` again
    private _setHeights = new Map<string, number>();
    private _rowClassRuleMap = new Map<string, GridRowClassRule>();
    //one object, so the options are not handed to AG Grid again on every refresh
    private _rowClassRules: RowClassRules<IRecord> = {};

    constructor(parameters: IGridRowsParameters) {
        super();
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
        this._services.get('grid').registerAgGridOptions(result => {
            result.options.getRowHeight = this._getRowHeight;
            result.options.rowClassRules = this._rowClassRules;
        });
        this._services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    public isHighlighted(record: IRecord): boolean {
        const recordId = record.getRecordId();
        return recordId === this._hoveredRecordId || recordId === this._focusedRecordId || this._selectedRecordIds.has(recordId);
    }

    public registerRowHeight(hook: GridRowHeightHook, priority?: number): () => void {
        return this._rowHeightHooks.register(hook, priority);
    }

    public setRowHeight(record: IRecord, height: number): void {
        const recordId = record.getRecordId();
        this._setHeights.set(recordId, height);
        const gridApi = this._services.get('gridApi');
        gridApi.getRowNode(recordId)?.setRowHeight(height);
        gridApi.onRowHeightChanged();
    }

    public registerRowClass(className: string, rule: GridRowClassRule): () => void {
        this._rowClassRuleMap.set(className, rule);
        this._onRowClassRulesChanged();
        return () => {
            if (this._rowClassRuleMap.get(className) === rule) {
                this._rowClassRuleMap.delete(className);
                this._onRowClassRulesChanged();
            }
        };
    }

    //AG Grid runs the class rules again on a row's data update, never on a cell refresh
    public refreshRowClasses(records: IRecord[]): void {
        const gridApi = this._services.find('gridApi');
        if (!gridApi) {
            return;
        }
        for (const record of records) {
            const node = gridApi.getRowNode(record.getRecordId());
            if (node?.data) {
                node.updateData(node.data);
            }
        }
    }

    private _onRowClassRulesChanged(): void {
        this._rowClassRules = {};
        for (const [className, rule] of this._rowClassRuleMap) {
            this._rowClassRules[className] = (params: RowClassParams<IRecord>) => !params.node.rowPinned && !!params.data && rule({ record: params.data, node: params.node });
        }
        this._services.get('grid').refreshAgGridOptions();
    }

    private _getRowHeight = (params: RowHeightParams<IRecord>): number | undefined => {
        if (!params.data) {
            return undefined;
        }
        const result: IGridRowHeight = {};
        this._rowHeightHooks.apply(result, { record: params.data, node: params.node });
        this._services.get('settings').getRowSettings().onGetHeight?.(result, { record: params.data, node: params.node });
        return this._setHeights.get(params.data.getRecordId()) ?? result.height;
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
        const record = getRowNode(event.api, event.rowIndex, event.rowPinned)?.data;
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
