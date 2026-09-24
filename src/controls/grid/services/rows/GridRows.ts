import { CellFocusedEvent, CellMouseOutEvent, CellMouseOverEvent, GridApi, IRowNode, RowHeightParams } from "@ag-grid-community/core";
import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IGridServiceLocator } from "../../services";

export interface IGridRowsEvents {
    /** Which rows the user is at changed */
    onActiveRowsChanged: () => void;
}

export interface IGridRowHeight {
    /** In pixels, or `undefined` for the grid's own row height. */
    height?: number;
}

/** A hook over how tall a row is. */
export type GridRowHeightHook = (result: IGridRowHeight, params: { record: IRecord; node: IRowNode<IRecord> }) => void;

export interface IGridRowsParameters {
    services: IGridServiceLocator;
}

/** What is true of a row rather than of one of its cells. */
export interface IGridRows extends IEventEmitter<IGridRowsEvents> {
    isActive(record: IRecord): boolean;
    getIndex(record: IRecord): number | undefined;
    /**
     * Registers a hook over how tall a row is.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
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
    }

    public isActive(record: IRecord): boolean {
        const recordId = record.getRecordId();
        return recordId === this._hoveredRecordId || recordId === this._focusedRecordId || this._selectedRecordIds.has(recordId);
    }

    public getIndex(record: IRecord): number | undefined {
        return this._services.find('gridApi')?.getRowNode(record.getRecordId())?.rowIndex ?? undefined;
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
        return result.height;
    };

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        //a selection reaches the cells nowhere else
        this._services.get('provider').addEventListener('onRecordsSelected', () => this._onSelectionChanged());
        gridApi.addEventListener('cellMouseOver', (event: CellMouseOverEvent<IRecord>) => this._setActiveRow('hovered', event.data?.getRecordId()));
        //AG Grid reports the cell the pointer left
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
}
