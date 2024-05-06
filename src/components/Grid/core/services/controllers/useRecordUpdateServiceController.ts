import { IEntityRecord } from "../../../interfaces";
import { useGridInstance } from "../../hooks/useGridInstance";
import { IGridColumn } from "../../interfaces/IGridColumn";

interface IRecordUpdateServiceController {
    updatedRecords: IUpda[]
    record: {
        setValue: (column: IGridColumn, value: any) => void;
        save: () => void;
    },
    saveAllRecords: () => void;
}

export const useRecordUpdateServiceController = (record: IEntityRecord): IRecordUpdateServiceController => {
    const grid = useGridInstance();
    const recordUpdateService = grid.recordUpdateService;

    return {
        updatedRecords: () => recordUpdateService.getUpdatedRecordColumns()
    }
}

export const useRecordUpdateServiceController = (): [
    boolean,
    IUpdatedRecordColumn[],
    (record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord, column: IGridColumn, value: any) => void,
    () => Promise<boolean>
] => {
    const recordUpdateService = useContext(GridContext).recordUpdateService;
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [updatedRecords, setUpdatedRecords] = useState<IUpdatedRecordColumn[]>(recordUpdateService.getUpdatedRecordColumns());
    const id = useMemo(() => {return crypto.randomUUID()}, [])

    useEffect(() => {
        recordUpdateService.addRefreshCallback(id, refresh)
        return () => {
            recordUpdateService.removeRefreshCallback(id);
        }
    }, []);

    const refresh = () => {
        setIsDirty(recordUpdateService.hasUpdatedRecordColumns());
        setUpdatedRecords(recordUpdateService.getUpdatedRecordColumns());
    }

    const save = () => {
        return recordUpdateService.saveRecords();
    }

    const updateRecordColumn = (record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord, column: IGridColumn, value: any) => {
        recordUpdateService.updateRecordColumn(record, column, value)
    }

    return [isDirty, updatedRecords, updateRecordColumn, save];
}