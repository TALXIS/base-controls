import { useGridInstance } from "../../../hooks/useGridInstance";
import { IGridColumn } from "../../../interfaces/IGridColumn";
import { IUpdatedRecord } from "../model/RecordUpdateService";

interface IRecordUpdateServiceController {
    updatedRecords: IUpdatedRecord[];
    currentRecord: {
        setValue: (column: IGridColumn, value: any) => void;
    }
}

export const useRecordUpdateServiceController = (recordId: string): IRecordUpdateServiceController => {
    const grid = useGridInstance();
    const recordUpdateService = grid.recordUpdateService;

    return {
        updatedRecords: recordUpdateService.updatedRecords,
        currentRecord: {
            setValue: (column: IGridColumn, value: any) => recordUpdateService.record(recordId).setValue(column.key, value)
        }
    }
}