import type { IColumn, IRecordSaveOperationResult } from '@talxis/client-libraries'
import type { ICustomColumnsStrategy } from '@talxis/base-controls'

/**
 * An in-memory `ICustomColumnsStrategy`, so the docs can demonstrate the `customColumns` module.
 *
 * Nothing in-memory ships with the package — the module exists precisely so a consumer can bring their
 * own — and this is the smallest thing that satisfies the contract: it holds the column definitions in an
 * array and adds one per *Create Custom Column*.
 *
 * Values are not its concern here. `onSaveValue` only runs on the Dataverse save path; a memory grid
 * stores a custom column's value on the task record like any other column, so the ordinary inline-edit
 * save already persists it.
 */
export class MemoryCustomColumnsStrategy implements ICustomColumnsStrategy {
    private _columns: IColumn[]
    private _nextIndex: number

    constructor(columns: IColumn[] = []) {
        this._columns = [...columns]
        this._nextIndex = this._columns.length + 1
    }

    public async onRefresh(): Promise<IColumn[]> {
        return this._columns
    }

    public onGetColumns(): IColumn[] {
        return this._columns
    }

    public async onCreateColumn(): Promise<string | null> {
        const name = `custom_${this._nextIndex}`
        this._columns = [...this._columns, {
            name,
            dataType: 'SingleLine.Text',
            displayName: `Custom ${this._nextIndex}`,
            visualSizeFactor: 160,
        }]
        this._nextIndex++
        return name
    }

    public async onUpdateColumn(columnName: string): Promise<string | null> {
        //a real strategy would open its own editor here; renaming in place is enough to show the command
        this._columns = this._columns.map(column => column.name === columnName
            ? { ...column, displayName: `${column.displayName} (edited)` }
            : column)
        return columnName
    }

    public async onDeleteColumn(columnName: string): Promise<string | null> {
        this._columns = this._columns.filter(column => column.name !== columnName)
        return columnName
    }

    public async onSaveValue(regardingRecordId: string, column: IColumn): Promise<IRecordSaveOperationResult> {
        return { recordId: regardingRecordId, success: true, fields: [column.name] }
    }
}
