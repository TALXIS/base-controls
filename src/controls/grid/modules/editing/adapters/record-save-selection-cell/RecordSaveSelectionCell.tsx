import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellRoot } from "../../../../adapters/cells/root/CellRoot";
import { CellTheme } from "../../../../adapters/cells/theme/CellTheme";
import { CellContainer } from "../../../../adapters/cells/container/CellContainer";
import { CellEmptyRenderer } from "../../../../adapters/cells/empty-cell-renderer/CellEmptyRenderer";
import { SelectionCheckbox } from "../../../row-selection/adapters/selection-checkbox/SelectionCheckbox";
import type { IRowSelectionUiCheckboxComponents } from "../../../row-selection/ui";
import { RecordSaveIndicator } from "../record-save-indicator/RecordSaveIndicator";
import type { IRecordSaveUiComponents } from "../record-save-indicator/ui";

/** The replaceable pieces of a row's checkbox cell that also reports its save. */
export interface IRecordSaveSelectionCellComponents extends IRecordSaveUiComponents {
    checkbox?: Partial<IRowSelectionUiCheckboxComponents>;
}

export interface IRecordSaveSelectionCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: IRecordSaveSelectionCellComponents;
}

/** The row's checkbox, or the status of its last save. */
export const RecordSaveSelectionCell = (props: IRecordSaveSelectionCellProps) => {
    const components = props.components ?? {};

    if (props.node.rowPinned) {
        return <CellEmptyRenderer {...props} />;
    }
    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={components.container}>
                <RecordSaveIndicator components={components}>
                    <SelectionCheckbox components={components.checkbox} />
                </RecordSaveIndicator>
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
