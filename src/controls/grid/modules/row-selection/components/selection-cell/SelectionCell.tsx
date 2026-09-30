import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { RecordSaveIndicator } from "../../../../components/record-save-indicator/RecordSaveIndicator";
import { useGridService } from "../../../../useGridService";
import { RowSelectionUi } from "../ui";

export interface ISelectionCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
}

/** The row's checkbox, or the status of its last save. */
export const SelectionCell = (props: ISelectionCellProps) => {
    //`cellRendererSelector` draws this only for rows with a record
    const record = props.data!;
    const selection = useGridService('rowSelection')!;
    const components = selection.components.cell ?? {};

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={components.container}>
                <RecordSaveIndicator components={components}>
                    <RowSelectionUi.Checkbox
                        state={selection.getRecordSelectionState(props.node)}
                        disabled={selection.isRecordSelectionDisabled(record)}
                        onToggle={() => selection.toggleRecord(record)}
                        components={components.checkbox} />
                </RecordSaveIndicator>
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
