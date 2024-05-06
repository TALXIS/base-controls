import { cloneDeep } from "lodash";
import { IEntityRecord } from "../../../../interfaces";
import { GridDependency } from "../../../model/GridDependency";

export interface IUpdatedRecord extends Omit<IEntityRecord, 'setValue'> {
    getOriginalValue: (columnName: string) => any;
    getOriginalFormattedValue: (columnName: string) => any;
    getOriginalFormattedPrimaryNameValue: (columnName: string) => any;
}

export class RecordUpdateService extends GridDependency {
    private _updatedRecords: Map<string, IUpdatedRecord> = new Map();
    private _internalRecordMap: Map<string, IEntityRecord> = new Map();

    public get updatedRecords() {
        return [...this._updatedRecords.values()];
    }

    public record(recordId: string) {
        return {
            setValue: (columnName: string, value: any) => {
                const updatedRecord = this._updatedRecords.get(recordId);
                if(!updatedRecord) {
                    const deepCopiedRecord = cloneDeep(this._internalRecordMap.get(recordId)!);
                    this._updatedRecords.set(recordId, {
                        getRecordId: () => recordId,
                        getValue: (columnName: string) => this._internalRecordMap.get(recordId)?.getValue(columnName)!,
                        getFormattedValue: (columnName: string) => this._internalRecordMap.get(recordId)?.getFormattedValue(columnName)!,
                        getNamedReference: () => deepCopiedRecord.getNamedReference(),
                        getOriginalValue: (columnName: string) => deepCopiedRecord.getValue(columnName),
                        getOriginalFormattedValue: (columnName: string) => deepCopiedRecord.getFormattedValue(columnName),
                        getOriginalFormattedPrimaryNameValue: (columnName: string) => deepCopiedRecord.getFormattedValue(this._dataset.columns.find(x => x.isPrimary)!.name),
                        save: async () => {
                            try {
                                await this._internalRecordMap.get(recordId)?.save();
                                this._updatedRecords.delete(recordId);
                            }
                            catch(err) {
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
                this._internalRecordMap.get(recordId)?.setValue(columnName, value);
            }
        }
    }

    public onDependenciesUpdated(): void {
        for(const [recordId, record] of Object.entries(this._grid.dataset.records)) {
            this._internalRecordMap.set(recordId, record);
        }
    }
}