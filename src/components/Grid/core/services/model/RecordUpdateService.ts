import { cloneDeep } from "lodash";
import { IEntityRecord } from "../../../interfaces";
import { IGridColumn } from "../../interfaces/IGridColumn";
import { GridDependency } from "../../model/GridDependency";

export interface IUpdatedRecord extends Omit<IEntityRecord, 'setValue'> {
    getOriginalValue: (columnName: string) => any;
    getOriginalFormattedValue: (columnName: string) => any;
    getOriginalFormattedPrimaryNameValue: (columnName: string) => any;
}

export interface IUpdatedRecordColumn {
    recordId: string;
    column: IGridColumn;
    originalValue: any;
    originalFormattedValue: any;
    originalFormattedPrimaryNameValue: string;
    getUpdatedFormattedValue: () => string;
}

export class RecordUpdateService extends GridDependency {
    private _updatedRecordColumns = new Map<string, IUpdatedRecordColumn>();
    private _internalRecordMap: Map<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> = new Map();

    public onDependenciesUpdated(): void {
        for(const [recordId, record] of Object.entries(this._grid.dataset.records)) {
            this._internalRecordMap.set(recordId, record);
        }
    }
    public updateRecordColumn(record: IEntityRecord, column: IGridColumn, value: any) {
        const key = `${record.getRecordId()}_${column.key}`;
        const existingRecord = this._updatedRecordColumns.get(key);
        if (!existingRecord) {
            this._updatedRecordColumns.set(key, {
                recordId: record.getRecordId(),
                getUpdatedFormattedValue: () => {
                    const _record = this._internalRecordMap.get(record.getRecordId());
                    return _record!.getFormattedValue(column.key)
                },
                column: column,
                //@ts-ignore - typescript
                originalFormattedValue: record.getFormattedValue(column.key),
                originalValue: record.getValue(column.key),
                originalFormattedPrimaryNameValue: record.getFormattedValue(this._grid.dataset.columns.find(x => x.isPrimary)!.name)
            })
        }
        this._grid.dataset.columns.find(x => x.isPrimary)
        record.setValue(column.key, value);
        this._triggerRefreshCallbacks();
    }
    public async saveRecords(): Promise<boolean> {
        const savePromises: Promise<void>[] = [];
        for (const record of this._updatedRecordColumns.values()) {
            //@ts-ignore - a
            savePromises.push(record.save());
        }
        try {
            await Promise.all(savePromises);
            this.clearUpdatedRecordColumns();
            return true;
        }
        catch (err) {
            this._grid.pcfContext.navigation.openErrorDialog({
                message: 'An error occurred during saving. Some of you changes might now have been saved.',
                //@ts-ignore
                details: err.message
            })
            return false;
        }
    }
    public getUpdatedRecordColumns(): IUpdatedRecordColumn[] {
        return [...this._updatedRecordColumns.values()]
    }
    public hasUpdatedRecordColumns() {
        if (this._updatedRecordColumns.size > 0) {
            return true;
        }
        return false;
    }
    public clearUpdatedRecordColumns() {
        this._updatedRecordColumns.clear();
        this._triggerRefreshCallbacks();
    }
}

export class Test extends GridDependency {
    private _updatedRecords: Map<string, IUpdatedRecord> = new Map();
    private _internalRecordMap: Map<string, IEntityRecord> = new Map();

    public updateRecord(column: IGridColumn, record: IEntityRecord, value: any) {
        const recordId = record.getRecordId();
        const updatedRecord = this._updatedRecords.get(recordId);
        if(!updatedRecord) {
            const deepCopiedRecord = cloneDeep(record);
            this._updatedRecords.set(recordId, {
                getRecordId: () => recordId,
                getValue: (columnName: string) => this._internalRecordMap.get(recordId)?.getValue(columnName)!,
                getFormattedValue: (columnName: string) => this._internalRecordMap.get(recordId)?.getFormattedValue(columnName)!,
                getNamedReference: () => deepCopiedRecord.getNamedReference(),
                getOriginalValue: (columnName: string) => deepCopiedRecord.getValue(columnName),
                getOriginalFormattedValue: (columnName: string) => deepCopiedRecord.getFormattedValue(columnName),
                getOriginalFormattedPrimaryNameValue: (columnName: string) => deepCopiedRecord.getFormattedValue(this._dataset.columns.find(x => x.isPrimary)!.name),
            })
        }
        record.setValue(column.key, value);
        this._triggerRefreshCallbacks();
    }

    public record(recordId: string) {
        return {
            update: (columnName: string, value: any) => {
                const updatedRecord = this._updatedRecords.get(recordId);
                if(!updatedRecord) {
                    const deepCopiedRecord = cloneDeep(this._dataset.records);
                    this._updatedRecords.set(recordId, {
                        getRecordId: () => recordId,
                        getValue: (columnName: string) => this._internalRecordMap.get(recordId)?.getValue(columnName)!,
                        getFormattedValue: (columnName: string) => this._internalRecordMap.get(recordId)?.getFormattedValue(columnName)!,
                        getNamedReference: () => deepCopiedRecord.getNamedReference(),
                        getOriginalValue: (columnName: string) => deepCopiedRecord.getValue(columnName),
                        getOriginalFormattedValue: (columnName: string) => deepCopiedRecord.getFormattedValue(columnName),
                        getOriginalFormattedPrimaryNameValue: (columnName: string) => deepCopiedRecord.getFormattedValue(this._dataset.columns.find(x => x.isPrimary)!.name),
                    })
                }
                record.setValue(column.key, value);
                this._triggerRefreshCallbacks();
            },
            save: async () => {
                try {
                    await this._internalRecordMap.get(recordId)?.save()
                }
                catch(err) {
                    this._grid.pcfContext.navigation.openErrorDialog({
                        message: 'An error occurred during saving. Some of you changes might now have been saved.',
                        //@ts-ignore
                        details: err.message
                    })
                    return false;
                }
            }
        }
    }

    public async saveRecord(recordId: string): Promise<> {
        try {

        }
        catch(err) {
            this._grid.pcfContext.navigation.openErrorDialog({
                message: 'An error occurred during saving. Some of you changes might now have been saved.',
                //@ts-ignore
                details: err.message
            })
            return false;
        }
    }

    public onDependenciesUpdated(): void {
        for(const [recordId, record] of Object.entries(this._grid.dataset.records)) {
            this._internalRecordMap.set(recordId, record);
        }
    }
}