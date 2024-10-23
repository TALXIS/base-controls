import equal from "fast-deep-equal/es6";
import { cloneDeep } from "lodash";
import numeral from "numeral";
import { ColumnValidation } from "../../../../validation/model/ColumnValidation";
import { DataType } from "../../../enums/DataType";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";
import { IColumn, IRecord, Numeral } from "@talxis/client-libraries";

export interface IUpdatedRecord extends Omit<IRecord, 'save'> {
    columns: Map<string, IColumn>,
    isValid: (columnName: string) => boolean,
    getOriginalValue: (columnName: string) => any;
    getOriginalFormattedValue: (columnName: string) => any;
    getOriginalFormattedPrimaryNameValue: () => any;
    save: () => Promise<boolean>,
    clear: () => void;
}

export class RecordUpdateService extends GridDependency {
    private _updatedRecords: Map<string, IUpdatedRecord> = new Map();
    private _internalRecordMap: Map<string, IRecord> = new Map();

    constructor(grid: Grid) {
        super(grid);
        const updatedRecordsFromState: IUpdatedRecord[] | undefined = this._grid.state?.['__updatedRecords'];
        //@ts-ignore - getRecordId could be undefined if it comes from serialized state
        if(updatedRecordsFromState && updatedRecordsFromState?.length > 0 && updatedRecordsFromState[0].getRecordId) {
            this._updatedRecords = new Map(updatedRecordsFromState.map(x => {
                const originalClear = x.clear;
                const originalSetValue = x.setValue;
                const originalSave = x.save;
                x.clear = () => {
                    this._updatedRecords.delete(x.getRecordId());
                    originalClear();
                    this._pcfContext.factory.requestRender();
                }
                x.save = async () => {
                    const result = await originalSave();
                    if(result) {
                        this._updatedRecords.delete(x.getRecordId());
                    }
                    [...x.columns.values()].map(col =>  {
                        this._internalRecordMap.get(x.getRecordId())?.setValue(col.name, x.getValue(col.name));
                    })
                    return result;
                }
                x.setValue = (columnName: string, value: any) => {
                    originalSetValue(columnName, value);
                    this._pcfContext.factory.requestRender();
                }
                return [x.getRecordId(), x]
            }))
        }
    }

    public get updatedRecords() {
        if (this._isReadOnlyChangeEditor() && this._updatedRecords.size === 0) {
            const record = this._grid.records[0];
            for (const column of this._grid.columns) {
                this.record(record.getRecordId()).setValue(column.name, record.getValue(column.name), true);
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
            setValue: (columnName: string, value: any, doNotPropagateToDatasetRecord?: boolean) => {
                if(!doNotPropagateToDatasetRecord && this._isEqual(columnName, this._internalRecordMap.get(recordId)!.getValue(columnName), value)) {
                    return;
                }
                const updatedRecord = this._updatedRecords.get(recordId);
                if (!updatedRecord) {
                    const deepCopiedRecord = cloneDeep(this._internalRecordMap.get(recordId)!);
                    this._updatedRecords.set(recordId, {
                        columns: new Map([[columnName, this._getColumnByName(columnName)]]),
                        getRecordId: () => recordId,
                        getValue: (columnName: string) => this._internalRecordMap.get(recordId)?.getValue(columnName)!,
                        getFormattedValue: (columnName: string) => this._internalRecordMap.get(recordId)?.getFormattedValue(columnName)!,
                        getNamedReference: () => deepCopiedRecord.getNamedReference(),
                        getOriginalValue: (columnName: string) => deepCopiedRecord.getValue(columnName),
                        getOriginalFormattedValue: (columnName: string) => deepCopiedRecord.getFormattedValue(columnName),
                        getOriginalFormattedPrimaryNameValue: () => {
                            let primaryColumn = this._dataset.columns.find(x => x.isPrimary);
                            if(!primaryColumn) {
                                primaryColumn = this._dataset.columns[0];
                            }
                            let value = deepCopiedRecord.getFormattedValue(primaryColumn.name);
                            if(!value) {
                                value = this._grid.labels["no-name"]();
                            }
                            return value;
                        },
                        setValue: (columnName: string, value: any) => {
                            this._internalRecordMap.get(recordId)?.setValue(columnName, value);
                            this._pcfContext.factory.requestRender()
                        },
                        isValid: (columnName: string) => {
                            const column = this._grid.columns.find(x => x.name === columnName);
                            if(!column) {
                                return true;
                            }
                            const [result, message] = new ColumnValidation(this._grid, column).validate(this._internalRecordMap.get(recordId)?.getValue(columnName)!)
                            return result;
                        },
                        clear: () => {
                            const updatedRecord = this._updatedRecords.get(recordId);
                            const columns = [...updatedRecord!.columns.values()];
                            this._updatedRecords.delete(recordId);
                            for(const column of columns) {
                                this._internalRecordMap.get(recordId)?.setValue(column.name, deepCopiedRecord.getValue(column.name));
                            }
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
                    } as any)
                }
                else {
                    updatedRecord.columns.set(columnName, this._getColumnByName(columnName))
                }
                if (!doNotPropagateToDatasetRecord) {
                    const updatedRecord = this._updatedRecords.get(recordId);
                    updatedRecord?.setValue(columnName, value);
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
        this._pcfContext.factory.requestRender();
    }

    public onDependenciesUpdated(): void {
        for (const [recordId, record] of Object.entries(this._grid.dataset.records)) {
            this._internalRecordMap.set(recordId, record);
        }
    }
    private _getColumnByName(columnName: string) {
        return this._grid.columns.find(x => x.name === columnName)!;
    }
    private _isReadOnlyChangeEditor() {
        return this._grid.props.parameters.ChangeEditorMode?.raw === 'read';
    }
    private _isEqual(columnName: string, oldValue: any, newValue: any) {
        const column = this._grid.columns.find(x => x.name === columnName);
        //skip in special case for currency
        //PCF has no info about the currency, which sometimes make it to ouput change
        if(column?.dataType === DataType.CURRENCY) {
            Numeral.currency(this._grid.pcfContext.userSettings.numberFormattingInfo);
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