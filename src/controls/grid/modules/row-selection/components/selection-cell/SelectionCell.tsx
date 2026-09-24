import { useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { Checkbox } from "@fluentui/react";
import { CellRenderer } from "@controls/grid/components/cells/cell-renderer/CellRenderer";
import { useGridService } from "@controls/grid/useGridService";
import { RecordSaveIndicator, useRecordSaveStatus } from "@controls/grid/components/record-save-indicator";
import { getSelectionCellStyles } from "./styles";

/** The checkbox a row is selected by, or what the row has to report about its last save. */
export const SelectionCell = (props: ICellRendererParams<IRecord>) => {
    //pinned rows have no record, and `cellRendererSelector` renders nothing there
    const record = props.data!;
    const selection = useGridService('rowSelection')!;
    const saveStatus = useRecordSaveStatus(record);
    const recordSelectionState = selection.getRecordSelectionState(props.node);
    const isRecordSelectionDisabled = selection.isRecordSelectionDisabled(record);
    const styles = useMemo(() => getSelectionCellStyles(), []);

    //the label activates the checkbox it wraps, toggling the record back off
    const onCheckBoxClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isRecordSelectionDisabled) {
            record.getDataProvider().toggleSelectedRecordId(record.getRecordId(), { clearExisting: selection.getMode() === 'single' });
        }
    };

    const onRenderCheckBox = () => {
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
        </div>;
    };

    return <CellRenderer {...props} components={{ control: { onRenderControl: onRenderCheckBox } }} />;
};
