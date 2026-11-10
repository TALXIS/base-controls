export interface IMemoryTableParameters<TRow> {
    /** The column every row is found by. */
    idKey: keyof TRow & string;
    rows?: TRow[];
}

/** One table of plain rows, kept by whoever creates it and read by the memory stores it is given. */
export class MemoryTable<TRow extends object> {
    private _idKey: keyof TRow & string;
    private _rows: Map<string, TRow>;

    constructor(parameters: IMemoryTableParameters<TRow>) {
        this._idKey = parameters.idKey;
        this._rows = new Map((parameters.rows ?? []).map(row => [this._getId(row), structuredClone(row)]));
    }

    public getRow(id: string): TRow | undefined {
        const row = this._rows.get(id);
        return row && structuredClone(row);
    }

    /** Every row, or the ones `predicate` keeps, as plain data. */
    public getRows(predicate?: (row: TRow) => boolean): TRow[] {
        const rows = [...this._rows.values()];
        return (predicate ? rows.filter(predicate) : rows).map(row => structuredClone(row));
    }

    public insert(rows: TRow[]): void {
        rows.forEach(row => this._rows.set(this._getId(row), structuredClone(row)));
    }

    /** Merges `values` into the row; does nothing when there is no row with this id. */
    public update(id: string, values: Partial<TRow>): void {
        const row = this._rows.get(id);
        if (!row) {
            return;
        }
        this._rows.set(id, { ...row, ...structuredClone(values), [this._idKey]: row[this._idKey] });
    }

    public delete(ids: string[]): void {
        ids.forEach(id => this._rows.delete(id));
    }

    private _getId(row: TRow): string {
        return String(row[this._idKey]);
    }
}
