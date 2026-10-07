import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellEmptyRenderer } from "../../../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { SelectionCheckbox } from "../selection-checkbox/SelectionCheckbox";
import { ISelectionCellComponents } from "./components";

export interface ISelectionCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: ISelectionCellComponents;
}

/** The row's checkbox. */
export const SelectionCell = (props: ISelectionCellProps) => {
    const components = props.components ?? {};

    //a pinned row is no record to select
    if (props.node.rowPinned) {
        return <CellEmptyRenderer {...props} />;
    }
    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={components.container}>
                <SelectionCheckbox components={components.checkbox} />
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
