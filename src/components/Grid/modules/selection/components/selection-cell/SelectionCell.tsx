import { useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { Checkbox, useTheme } from "@fluentui/react";
import { CellHost } from "@components/Grid/components/cell-host";
import { useGridService } from "@components/Grid/useGridService";
import { RecordSaveIndicator, useRecordSaveStatus } from "@components/Grid/components/record-save-indicator";
import { getSelectionCellStyles } from "./styles";

/**
 * The checkbox a row is selected by, or what the row has to report about its last save — there is only room
 * in this column for one of them.
 */
export const SelectionCell = (props: ICellRendererParams<IRecord>) => {
    //pinned rows have no record, and `cellRendererSelector` renders nothing there
    const record = props.data!;
    const selection = useGridService('selection')!;
    const saveStatus = useRecordSaveStatus(record);
    const recordSelectionState = selection.getRecordSelectionState(props.node);
    const isRecordSelectionDisabled = selection.isRecordSelectionDisabled(record);
    const styles = useMemo(() => getSelectionCellStyles(), []);

    //the label would otherwise activate the checkbox it wraps, and that second click toggles the record
    //straight back off. Keeping the click from also selecting the row is `GridSelection`'s capture
    //listener, which a React handler cannot do - it runs after AG Grid's own
    const onCheckBoxClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isRecordSelectionDisabled) {
            record.getDataProvider().toggleSelectedRecordId(record.getRecordId(), { clearExisting: selection.getMode() === 'single' });
        }
    };

    return <CellHost {...props}>
        {saveStatus.hasAnythingToReport && <RecordSaveIndicator record={record} status={saveStatus} />}
        {!saveStatus.hasAnythingToReport && <div
            onClick={onCheckBoxClick}
            className={styles.checkBoxContainer}>
            <Checkbox
                checked={recordSelectionState === 'checked'}
                disabled={isRecordSelectionDisabled}
                indeterminate={recordSelectionState === 'indeterminate'}
                styles={{
                    checkbox: styles.checkBox
                }} />
        </div>}
    </CellHost>;
};
