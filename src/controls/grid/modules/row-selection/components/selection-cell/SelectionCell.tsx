import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellRoot } from "@controls/grid/components/cells/root/CellRoot";
import { CellTheme } from "@controls/grid/components/cells/theme/CellTheme";
import { CellContainer } from "@controls/grid/components/cells/container/CellContainer";
import { RecordSaveIndicator } from "@controls/grid/components/record-save-indicator";
import { useGridService } from "@controls/grid/useGridService";
import { RowSelectionUi } from "../ui";
import { ISelectionCellComponents } from "./components";

export interface ISelectionCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: ISelectionCellComponents;
}

/** The row's checkbox, or the status of its last save. */
export const SelectionCell = (props: ISelectionCellProps) => {
    //`cellRendererSelector` draws this only for rows with a record
    const record = props.data!;
    const selection = useGridService('rowSelection')!;
    const components = props.components ?? {};

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
