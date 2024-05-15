import { useGridInstance } from "../../../hooks/useGridInstance";
import { IUpdatedRecord } from "../model/RecordUpdateService";

interface IRecordUpdateServiceController {
    isDirty: boolean,
    updatedRecords: IUpdatedRecord[];
    saveAll: () => Promise<boolean>;
    clearAll: () => void,
    record(recordId: string): {
        get: () => IUpdatedRecord | undefined
        setValue: (columnName: string, value: any) => void
    }
}

export const useRecordUpdateServiceController = (): IRecordUpdateServiceController => {
    const grid = useGridInstance();
    const recordUpdateService = grid.recordUpdateService;
    
    return {
        isDirty: recordUpdateService.isDirty,
        updatedRecords: [...recordUpdateService.updatedRecords.values()],
        saveAll: () => recordUpdateService.saveAll(),
        clearAll: () => recordUpdateService.clearAll(),
        record: (recordId: string) => {
            const record = recordUpdateService.record(recordId);
            return {
                get: () => record.get(),
                setValue: (columnName: string, value: any) => {
                    record.setValue(columnName, value)
                }   
            }
        }
    }
}