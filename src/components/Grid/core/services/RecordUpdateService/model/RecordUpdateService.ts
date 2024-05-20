import equal from "fast-deep-equal/es6";
import { cloneDeep } from "lodash";
import numeral from "numeral";
import { NumeralPCF } from "../../../../../../utils/NumeralPCF";
import { IEntityColumn, IEntityRecord } from "../../../../interfaces";
import { ColumnValidation } from "../../../../validation/model/ColumnValidation";
import { DataType } from "../../../enums/DataType";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";

export interface IUpdatedRecord extends IEntityRecord {
    columns: Map<string, IEntityColumn>,
    isValid: (columnKey: string) => boolean,
    getOriginalValue: (columnKey: string) => any;
    getOriginalFormattedValue: (columnKey: string) => any;
    getOriginalFormattedPrimaryNameValue: () => any;
    clear: () => void;
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

    public get hasInvalidRecords() {
        return [...this._updatedRecords.values()].find(x => {
            for(const column of x.columns.values()) {
                if(!x.isValid(column.name)) {
                    return true;
                }
            }
            return false;
        }) ? true : false;
    }

    public record(recordId: string) {
        return {
            get: () => this._updatedRecords.get(recordId),
            setValue: (columnKey: string, value: any, doNotPropagateToDatasetRecord?: boolean) => {
                if(!doNotPropagateToDatasetRecord && this._isEqual(columnKey, this._internalRecordMap.get(recordId)!.getValue(columnKey), value)) {
                    return;
                }
                const updatedRecord = this._updatedRecords.get(recordId);
                if (!updatedRecord) {
                    const deepCopiedRecord = cloneDeep(this._internalRecordMap.get(recordId)!);
                    this._updatedRecords.set(recordId, {
                        columns: new Map([[columnKey, this._getEntityColumnByKey(columnKey)]]),
                        getRecordId: () => recordId,
                        getValue: (columnKey: string) => this._internalRecordMap.get(recordId)?.getValue(columnKey)!,
                        getFormattedValue: (columnKey: string) => this._internalRecordMap.get(recordId)?.getFormattedValue(columnKey)!,
                        getNamedReference: () => deepCopiedRecord.getNamedReference(),
                        getOriginalValue: (columnKey: string) => deepCopiedRecord.getValue(columnKey),
                        getOriginalFormattedValue: (columnKey: string) => deepCopiedRecord.getFormattedValue(columnKey),
                        getOriginalFormattedPrimaryNameValue: () => deepCopiedRecord.getFormattedValue(this._dataset.columns.find(x => x.isPrimary)!.name),
                        setValue: (columnKey: string, value: any) => {
                            const updatedRecord = this._updatedRecords.get(recordId);
                            let originalValue = updatedRecord?.getOriginalValue(columnKey);
                            //if the new change is equal to the original record state, clear the internal dirty state
                            if(originalValue == value || equal(value, originalValue)) {
                                updatedRecord?.columns.delete(columnKey);
                                if(updatedRecord?.columns.size === 0) {
                                    this._updatedRecords.delete(recordId);
                                }
                            }
                            this._internalRecordMap.get(recordId)?.setValue(columnKey, value);
                        },
                        isValid: (columnKey: string) => {
                            const column = this._grid.columns.find(x => x.key === columnKey);
                            if(!column) {
                                return true;
                            }
                            const [result, message] = new ColumnValidation(column).validate(this._internalRecordMap.get(recordId)?.getValue(columnKey)!)
                            return result;
                        },
                        clear: () => {
                            this._updatedRecords.delete(recordId);
                            this._internalRecordMap.get(recordId)?.setValue(columnKey, deepCopiedRecord.getValue(columnKey));
                        },
                        save: async () => {
                            try {
                                await this._internalRecordMap.get(recordId)?.save();
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
                    updatedRecord.columns.set(columnKey, this._getEntityColumnByKey(columnKey))
                }
                if (!doNotPropagateToDatasetRecord) {
                    const updatedRecord = this._updatedRecords.get(recordId);
                    if(this._isEqual(columnKey, updatedRecord?.getOriginalValue(columnKey)!, value)) {
                        updatedRecord?.columns.delete(columnKey);
                        if(updatedRecord?.columns.size === 0) {
                            this._updatedRecords.delete(recordId);
                        }
                    }
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
    private _isEqual(columnKey: string, oldValue: any, newValue: any) {
        const column = this._grid.columns.find(x => x.key === columnKey);
        //skip in special case for currency
        //PCF has no info about the currency, which sometimes make it to ouput change
        if(column?.dataType === DataType.CURRENCY) {
            NumeralPCF.currency(this._grid.pcfContext.userSettings.numberFormattingInfo);
            newValue = numeral(newValue).value();
            if(newValue === oldValue) {
                return true
            }

        }
        if(oldValue == newValue) {
            return true;
        }
        return equal(oldValue, newValue);
    }
}