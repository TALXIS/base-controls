import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";

export interface IGridRowsEvents {
    /** A row was given a height of its own. */
    onRowHeightChanged: (record: IRecord, height: number) => void;
}

export interface IGridRowsParameters {
    services: IGridServiceLocator;
}

/** What is true of a row rather than of one of its cells. */
export class GridRows extends EventEmitter<IGridRowsEvents> {
    private _services: IGridServiceLocator;
    private _heights: Record<string, number> = {};

    constructor(parameters: IGridRowsParameters) {
        super();
        this._services = parameters.services;
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
     * and the node is where AG Grid keeps the answer.
     */
    public getIndex(record: IRecord): number | undefined {
        return this._services.find('gridApi')?.getRowNode(record.getRecordId())?.rowIndex ?? undefined;
    }

    public setHeight(record: IRecord, height: number): void {
        this._heights[record.getRecordId()] = height;
        this.dispatchEvent('onRowHeightChanged', record, height);
    }

    private get _settings() {
        return this._services.get('settings');
    }
}
