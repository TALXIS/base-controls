import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "../events";

export interface IMemoryTableParameters<TRow> {
    /** The column every row is found by. */
    idKey: keyof TRow & string;
    rows?: TRow[];
}

export interface IMemoryTableEvents {
    /** Fires when a row is inserted, updated or deleted, or the rows are loaded. */
    onChanged: () => void;
}

/** One table of plain rows, kept by whoever creates it and read by the memory stores it is given. */
export class MemoryTable<TRow extends object> {
    private _idKey: keyof TRow & string;
    private _rows = new Map<string, TRow>();
    private _events = new EventEmitter<IMemoryTableEvents>();

    constructor(parameters: IMemoryTableParameters<TRow>) {
        this._idKey = parameters.idKey;
        this._setRows(parameters.rows ?? []);
    }

    public get events(): IEventSubscriber<IMemoryTableEvents> {
        return this._events;
    }

    public getRow(id: string): TRow | undefined {
        const row = this._rows.get(id);
        return row && structuredClone(row);
    }

    public filter(predicate: (row: TRow) => boolean): TRow[] {
        return [...this._rows.values()].filter(row => predicate(row)).map(row => structuredClone(row));
    }

    public insert(rows: TRow[]): void {
        rows.forEach(row => this._rows.set(this._getId(row), structuredClone(row)));
        this._events.dispatchEvent('onChanged');
    }

    /** Merges `values` into the row; does nothing when there is no row with this id. */
    public update(id: string, values: Partial<TRow>): void {
        const row = this._rows.get(id);
        if (!row) {
            return;
        }
        this._rows.set(id, { ...row, ...structuredClone(values), [this._idKey]: row[this._idKey] });
        this._events.dispatchEvent('onChanged');
    }

    public delete(ids: string[]): void {
        ids.forEach(id => this._rows.delete(id));
        this._events.dispatchEvent('onChanged');
    }

    /** Every row as plain data, to keep or to `load` again. */
    public dump(): TRow[] {
        return this.filter(() => true);
    }

    /** Replaces every row. */
    public load(rows: TRow[]): void {
        this._setRows(rows);
        this._events.dispatchEvent('onChanged');
    }

    private _setRows(rows: TRow[]): void {
        this._rows = new Map(rows.map(row => [this._getId(row), structuredClone(row)]));
    }

    private _getId(row: TRow): string {
        return String(row[this._idKey]);
    }
}
