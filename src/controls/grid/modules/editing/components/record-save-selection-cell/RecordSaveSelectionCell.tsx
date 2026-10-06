import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { useGridService } from "../../../../useGridService";
import { SelectionCheckbox } from "../../../row-selection/components/selection-checkbox/SelectionCheckbox";
import { RecordSaveIndicator } from "../record-save-indicator/RecordSaveIndicator";

export interface IRecordSaveSelectionCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
}

/** The row's checkbox, or the status of its last save. */
export const RecordSaveSelectionCell = (props: IRecordSaveSelectionCellProps) => {
    const container = useGridService('rowSelection')?.components.cell?.container;
    const components = useGridService('editing')?.components.recordSaveCell;

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={container}>
                <RecordSaveIndicator components={components}>
                    <SelectionCheckbox />
                </RecordSaveIndicator>
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
