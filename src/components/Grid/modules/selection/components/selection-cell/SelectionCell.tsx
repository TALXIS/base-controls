import { useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { Checkbox } from "@fluentui/react";
import { useGridService } from "@components/Grid/grid/useGridService";
import { RecordSaveIndicator } from "@components/Grid/cells/record-save-indicator";
import { getSelectionCellStyles } from "./styles";

interface ISelectionCellProps extends ICellRendererParams {
    record: IRecord;
}

/**
 * The checkbox a row is selected by.
 *
 * Wrapped in {@link RecordSaveIndicator}, which takes the space over while the row has a save to report and
 * hands it back when it does not — the row saying what happened to it matters more than selecting it, and
 * there is only room in this column for one of the two.
 */
export const SelectionCell = (props: ISelectionCellProps) => {
    const { record } = props;
    const selection = useGridService('selection')!;
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

    return <RecordSaveIndicator record={record}>
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
    </RecordSaveIndicator>
}
