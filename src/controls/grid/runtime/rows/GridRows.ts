import { CellFocusedEvent, CellMouseOutEvent, CellMouseOverEvent, GridApi, IRowNode, RowClassParams, RowClassRules, RowClickedEvent, RowHeightParams } from "ag-grid-community";
import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry, IEventSubscriber, IHookPoint } from "@core";
import { IGridServiceRegistryInternal } from "..";
import { getRowNode } from "./getRowNode";
import { listenToGridApi } from "../grid/listenToGridApi";

export interface IGridRowsEvents {
    /** Fires when the rows the user is at change. */
    onHighlightedRowsChanged: () => void;
    /** Fires when a row with a record is clicked. */
    onRowClicked: (record: IRecord) => void;
}

export interface IGridRowHeight {
    /** In pixels, or `undefined` for the grid's own row height. */
    height?: number;
}

/** A hook over how tall a row is. */
export type GridRowHeightHook = (result: IGridRowHeight, parameters: { record: IRecord; node: IRowNode<IRecord> }) => void;

/** Whether a row with a record takes a class. */
export type GridRowClassRule = (parameters: { record: IRecord; node: IRowNode<IRecord> }) => boolean;

export interface IGridRowsParameters {
    services: IGridServiceRegistryInternal;
}

export interface IGridRowsHooks {
    /** How tall a row is. */
    readonly height: IHookPoint<GridRowHeightHook>;
}

/** What is true of a row as a whole. */
export interface IGridRows {
    readonly events: IEventSubscriber<IGridRowsEvents>;
    readonly hooks: IGridRowsHooks;
    /** Puts the class on every row with a record the rule holds for; pinned rows never take it. */
    addRowClass(className: string, rule: GridRowClassRule): () => void;
    /** Runs the class rules over the records' rows again. */
    refreshRowClasses(records: IRecord[]): void;
}

/** What the grid's own parts read of it. */
export interface IGridRowsInternal extends IGridRows {
    readonly events: IEventEmitter<IGridRowsEvents>;
    /** Whether the row is hovered, focused or selected. */
    isHighlighted(record: IRecord): boolean;
    /** Sets how tall the record's row is, over what the hooks decide. */
    setRowHeight(record: IRecord, height: number): void;
}

export class GridRows implements IGridRowsInternal {
    public readonly events = new EventEmitter<IGridRowsEvents>();
    private _services: IGridServiceRegistryInternal;
    private _hoveredRecordId?: string;
    private _focusedRecordId?: string;
    private _selectedRecordIds = new Set<string>();
    public readonly hooks = {
        height: new HookRegistry<GridRowHeightHook>(),
    };
    //a node's own height is lost once AG Grid asks `getRowHeight` again
    private _setHeights = new Map<string, number>();
    private _rowClassRuleMap = new Map<string, GridRowClassRule>();
    //one object, so the options are not handed to AG Grid again on every refresh
    private _rowClassRules: RowClassRules<IRecord> = {};

    constructor(parameters: IGridRowsParameters) {
        this._services = parameters.services;
        this._services.observe('gridApi', gridApi => this._onGridApiAvailable(gridApi));
        this._services.get('grid').hooks.agGridOptions.add(result => {
            result.options.getRowHeight = this._getRowHeight;
            result.options.rowClassRules = this._rowClassRules;
        });
    }

    public isHighlighted(record: IRecord): boolean {
        const recordId = record.getRecordId();
        return recordId === this._hoveredRecordId || recordId === this._focusedRecordId || this._selectedRecordIds.has(recordId);
    }

    public setRowHeight(record: IRecord, height: number): void {
        const recordId = record.getRecordId();
        this._setHeights.set(recordId, height);
        const gridApi = this._services.get('gridApi');
        gridApi.getRowNode(recordId)?.setRowHeight(height);
        gridApi.onRowHeightChanged();
    }

    public addRowClass(className: string, rule: GridRowClassRule): () => void {
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
        this.hooks.height.apply(result, { record: params.data, node: params.node });
        return this._setHeights.get(params.data.getRecordId()) ?? result.height;
    };

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): () => void {
        const stopGridApi = listenToGridApi(gridApi, {
            cellMouseOver: this._onCellMouseOver,
            cellMouseOut: this._onCellMouseOut,
            cellFocused: this._onCellFocused,
            rowClicked: this._onRowClicked,
        });
        //a selection reaches the cells nowhere else
        const stopProvider = this._services.get('provider').addEventListener('onRecordsSelected', this._onSelectionChanged);
        return () => {
            stopGridApi();
            stopProvider();
        };
    }

    private _onCellMouseOver = (event: CellMouseOverEvent<IRecord>): void => {
        this._setHighlightedRow('hovered', event.data?.getRecordId());
    };

    //AG Grid reports the cell the pointer left
    private _onCellMouseOut = (event: CellMouseOutEvent<IRecord>): void => {
        if (this._hoveredRecordId === event.data?.getRecordId()) {
            this._setHighlightedRow('hovered', undefined);
        }
    };

    private _onCellFocused = (event: CellFocusedEvent<IRecord>): void => {
        const record = getRowNode(event.api, event.rowIndex, event.rowPinned)?.data;
        this._setHighlightedRow('focused', record?.getRecordId());
    };

    private _onRowClicked = (event: RowClickedEvent<IRecord>): void => {
        if (event.data) {
            this.events.dispatchEvent('onRowClicked', event.data);
        }
    };

    private _onSelectionChanged = (): void => {
        this._selectedRecordIds = new Set(this._services.get('provider').getSelectedRecordIds({ includeGroupRecordIds: true }));
        this.events.dispatchEvent('onHighlightedRowsChanged');
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
        this.events.dispatchEvent('onHighlightedRowsChanged');
    }
}
