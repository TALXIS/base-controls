import { GridDependency } from "../model/GridDependency";
import { IFieldChange, IRecord } from '@talxis/client-libraries';

export interface IInternalRecordChange {
    record: IRecord,
    columns: IFieldChange[]
}

export class ChangeTracker extends GridDependency {
    private _internalChanges: Map<string, IInternalRecordChange> = new Map();

    public isDirty(): boolean {
        return this.getChanges().size > 0;
    }

    public clearChanges(recordId?: string, columnName?: string) {
        if (!recordId && !columnName) {
            [...this.getChanges().values()].map(x => {
                x.record.clearChanges()
            })
            this._internalChanges.clear();
        }
        else if (recordId && !columnName) {
            this.getChanges().get(recordId)?.record.clearChanges();
            this._internalChanges.delete(recordId);
        }
        else if (recordId && columnName) {
            const columns = this._internalChanges.get(recordId)?.columns.filter(x => x.columnName !== columnName) ?? [];
            this.getChanges().get(recordId)?.record.clearChanges(columnName);
            this._internalChanges.get(recordId)!.columns = columns;
        }
    }

    public setValue(columnName: string, value: any, record: IRecord) {
        //this creates change in data provider
        record.setValue(columnName, value)
        if (!this._internalChanges.get(record.getRecordId())) {
            this._internalChanges.set(record.getRecordId(), {
                record: record,
                columns: [record.getChanges(columnName).find(x => x.columnName === columnName)!]
            });
        }
        else {
            const columns = this._internalChanges.get(record.getRecordId())?.columns.filter(x => x.columnName !== columnName) ?? [];
            this._internalChanges.get(record.getRecordId())!.columns = [...columns, ...record.getChanges(columnName)]
        }
        this._grid.pcfContext.factory.requestRender();
    }

        /**
     * Whether a record is valid. If no record id is provided, it will check if all user manipulated records are valid. It only checks for user affected columns, eg. if there is invalid
     * column value that did not come from the user, but all other user manipulated values are valid, the method will return true.
     */
    public isValid(recordId?: string) {
        if (recordId) {
            return this._isValid(this.getChanges().get(recordId));
        }
        else {
            return [...this.getChanges().values()].every(change => this._isValid(change))
        }
    }

    /**
 * Returns dataset changes only for columns that the user himself changed.
 */
    public getChanges(): Map<string, IInternalRecordChange> {
        const result: Map<string, IInternalRecordChange> = new Map();
        [...this._internalChanges.entries()].map(([recordId, internalChange]) => {
            const change = this._dataset.getChanges()[recordId];
            if (!change) {
                return;
            }
            else {
                const changedColumns = change.columns.filter(x => internalChange.columns.find(y => y.columnName === x.columnName));
                //we have a change, make sure the changes affected columns the user interacted with
                if (changedColumns.length > 0) {
                    result.set(recordId, {
                        record: internalChange.record,
                        columns: [...changedColumns]
                    })
                }
            }
        })
        return result;
    }

    private _isValid(change?: IInternalRecordChange): boolean {
        if (!change) {
            return true;
        }
        return !change.columns.some(x => change.record.getColumnInfo(x.columnName).error)
    }
}