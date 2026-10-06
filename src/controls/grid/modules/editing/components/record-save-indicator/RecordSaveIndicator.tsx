import { useGridService } from "@controls/grid/useGridService";
import { useGridCell } from "../../../../components/cells/root/context";
import { useRecordSaveStatus } from "./useRecordSaveStatus";
import { IRecordSaveUiComponents, RecordSaveUi } from "./ui";

export interface IRecordSaveIndicatorProps {
    /** What is drawn while there is no save to report. */
    children?: React.ReactNode;
    components?: IRecordSaveUiComponents;
}

/** What happened to the cell's record the last time the grid saved it. */
export const RecordSaveIndicator = (props: IRecordSaveIndicatorProps) => {
    const record = useGridCell().getRecord();
    const status = useRecordSaveStatus(record);
    const labels = useGridService('labels');
    const gridApi = useGridService('gridApi');
    const components = props.components ?? {};
    const saveResult = status.saveResult;

    if (status.isSaving) {
        return <RecordSaveUi.Indicator state='saving' components={components.indicator} />;
    }
    if (!saveResult) {
        return <>{props.children}</>;
    }
    //the name the header shows, which the caller's colDefs may have changed
    const getFieldName = (fieldName: string) => gridApi?.getColumn(fieldName)?.getColDef().headerName ?? fieldName;
    return <RecordSaveUi.Indicator
        state={saveResult.success ? 'succeeded' : 'failed'}
        components={components.indicator}
        errorCallout={{
            title: labels.getLocalizedString('recordSaveErrorTitle'),
            dismissText: labels.getLocalizedString('recordSaveErrorDismiss'),
            errors: (saveResult.errors ?? []).map(error => ({
                fieldName: error.fieldName ? getFieldName(error.fieldName) : undefined,
                message: error.message,
            })),
            onClear: status.clearSaveResult,
            components: components.errorCallout,
        }} />;
};
