import { useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { Checkbox } from "@fluentui/react";
import { CellRenderer } from "@controls/grid/components/cells/cell-renderer/CellRenderer";
import { useGridService } from "@controls/grid/useGridService";
import { RecordSaveIndicator } from "@controls/grid/components/record-save-indicator";
import { getSelectionCellStyles } from "./styles";

/** The row's checkbox, or the status of its last save. */
export const SelectionCell = (props: ICellRendererParams<IRecord>) => {
    //`cellRendererSelector` draws this only for rows with a record
    const record = props.data!;
    const selection = useGridService('rowSelection')!;
    const recordSelectionState = selection.getRecordSelectionState(props.node);
    const isRecordSelectionDisabled = selection.isRecordSelectionDisabled(record);
    const styles = useMemo(() => getSelectionCellStyles(), []);

    //the label activates the checkbox it wraps, toggling the record back off
    const onCheckBoxClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isRecordSelectionDisabled) {
            selection.toggleRecord(record);
        }
    };

    const onRenderCheckBox = () => <RecordSaveIndicator>
        <div
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
    </RecordSaveIndicator>;

    return <CellRenderer {...props} components={{ control: { onRenderControl: onRenderCheckBox } }} />;
};
