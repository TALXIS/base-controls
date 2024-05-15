import { cloneDeep } from "lodash";
import { IEntityColumn, IEntityRecord } from "../../../../interfaces";
import { GridDependency } from "../../../model/GridDependency";

export interface IUpdatedRecord extends IEntityRecord {
    columns: Set<IEntityColumn>,
    getOriginalValue: (columnKey: string) => any;
    getOriginalFormattedValue: (columnKey: string) => any;
    getOriginalFormattedPrimaryNameValue: () => any;
    clear: () => void,
}

export class RecordUpdateService extends GridDependency {
    private _updatedRecords: Map<string, IUpdatedRecord> = new Map();
    private _internalRecordMap: Map<string, IEntityRecord> = new Map();

    public get updatedRecords() {
        if (this._isReadOnlyChangeEditor() && this._updatedRecords.size === 0) {
            const record = this._grid.records[0];
            for (const column of this._grid.columns) {
                this.record(record.getRecordId()).setValue(column.key, record.getValue(column.key), true);
            }
        }
        return [...this._updatedRecords.values()];
    }

    public get isDirty() {
        return this._updatedRecords.size > 0;
    }

    public record(recordId: string) {
        return {
            get: () => this._updatedRecords.get(recordId),
            setValue: (columnKey: string, value: any, doNotPropagateToDatasetRecord?: boolean) => {
                const updatedRecord = this._updatedRecords.get(recordId);
                if (!updatedRecord) {
                    const deepCopiedRecord = cloneDeep(this._internalRecordMap.get(recordId)!);
                    this._updatedRecords.set(recordId, {
                        columns: new Set([this._getEntityColumnByKey(columnKey)]),
                        getRecordId: () => recordId,
                        getValue: (columnKey: string) => this._internalRecordMap.get(recordId)?.getValue(columnKey)!,
                        getFormattedValue: (columnKey: string) => this._internalRecordMap.get(recordId)?.getFormattedValue(columnKey)!,
                        getNamedReference: () => deepCopiedRecord.getNamedReference(),
                        getOriginalValue: (columnKey: string) => deepCopiedRecord.getValue(columnKey),
                        getOriginalFormattedValue: (columnKey: string) => deepCopiedRecord.getFormattedValue(columnKey),
                        getOriginalFormattedPrimaryNameValue: () => deepCopiedRecord.getFormattedValue(this._dataset.columns.find(x => x.isPrimary)!.name),
                        setValue: (columnKey: string, value: any) => {
                            this._internalRecordMap.get(recordId)?.setValue(columnKey, value);
                        },
                        clear: () => {
                            this._updatedRecords.delete(recordId);
                            this._internalRecordMap.get(recordId)?.setValue(columnKey, deepCopiedRecord.getValue(columnKey));
                        },
                        save: async () => {
                            try {
                                await this._internalRecordMap.get(recordId)?.save();
                                //TODO: add refreshCallBack instead of whole grid refresh
                                this._updatedRecords.delete(recordId);
                            }
                            catch (err) {
                                this._grid.pcfContext.navigation.openErrorDialog({
                                    message: 'An error occurred during saving. Some of you changes might now have been saved.',
                                    //@ts-ignore
                                    details: err.message
                                })
                                return false;
                            }
                            return true;
                        }
                    })
                }
                else {
                    updatedRecord.columns.add(this._getEntityColumnByKey(columnKey))
                }
                if (!doNotPropagateToDatasetRecord) {
                    this._internalRecordMap.get(recordId)?.setValue(columnKey, value);
                }
            }
        }
    }

    public async saveAll(): Promise<boolean> {
        const savePromises: Promise<boolean>[] = [];
        for (const record of this._updatedRecords.values()) {
            savePromises.push(record.save());
        }
        const result = await Promise.all(savePromises);
        return !result.find(x => x === false)
    }
    public async clearAll() {
        for (const record of this._updatedRecords.values()) {
            record.clear();
        }
    }

    public onDependenciesUpdated(): void {
        for (const [recordId, record] of Object.entries(this._grid.dataset.records)) {
            this._internalRecordMap.set(recordId, record);
        }
    }
    private _getEntityColumnByKey(columnKey: string) {
        const gridColumn = this._grid.columns.find(x => x.key === columnKey)!;
        return this._dataset.columns.find(x => {
            if (!gridColumn.entityAliasName) {
                return x.name === gridColumn.attributeName;
            }
            return x.name === gridColumn.attributeName && x.alias === gridColumn.entityAliasName;
        })!;
    }
    private _isReadOnlyChangeEditor() {
        return this._grid.props.parameters.ChangeEditorMode?.raw === 'read';
    }
}