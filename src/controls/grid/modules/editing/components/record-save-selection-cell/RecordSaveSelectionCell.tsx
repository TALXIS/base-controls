import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellEmptyRenderer } from "../../../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { SelectionCheckbox } from "../../../row-selection/components/selection-checkbox/SelectionCheckbox";
import type { IRowSelectionUiCheckboxComponents } from "../../../row-selection/components/ui";
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
