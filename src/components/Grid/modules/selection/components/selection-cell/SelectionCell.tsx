import { useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { Checkbox } from "@fluentui/react";
import { useGridService } from "@components/Grid/grid/useGridService";
import { RecordSaveIndicator, useRecordSaveStatus } from "@components/Grid/cells/record-save-indicator";
import { getSelectionCellStyles } from "./styles";

interface ISelectionCellProps extends ICellRendererParams {
    record: IRecord;
}

/**
 * The checkbox a row is selected by, or what the row has to report about its last save — there is only room
 * in this column for one of them.
 */
export const SelectionCell = (props: ISelectionCellProps) => {
    const { record } = props;
    const selection = useGridService('selection')!;
    const saveStatus = useRecordSaveStatus(record);
    const recordSelectionState = selection.getRecordSelectionState(props.node);
    const isRecordSelectionDisabled = selection.isRecordSelectionDisabled(record);
    const styles = useMemo(() => getSelectionCellStyles(), []);

    const onCheckBoxClick = (e: React.MouseEvent) => {
        //the row underneath would select itself as well, and the provider is what decides selection here
        e.stopPropagation();
        e.preventDefault();
        if (!isRecordSelectionDisabled) {
            record.getDataProvider().toggleSelectedRecordId(record.getRecordId(), { clearExisting: selection.getMode() === 'single' });
        }
    };

    if (saveStatus.hasAnythingToReport) {
        return <RecordSaveIndicator record={record} status={saveStatus} />;
    }
    return <div
        onClick={onCheckBoxClick}
        className={styles.checkBoxContainer}>
        <Checkbox
            checked={recordSelectionState === 'checked'}
            disabled={isRecordSelectionDisabled}
            indeterminate={recordSelectionState === 'indeterminate'}
            styles={{
                checkbox: styles.checkBox
            }} />
    </div>
};
