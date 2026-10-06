import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { useGridService } from "../../../../useGridService";
import { SelectionCheckbox } from "../selection-checkbox/SelectionCheckbox";

export interface ISelectionCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
}

/** The row's checkbox. */
export const SelectionCell = (props: ISelectionCellProps) => {
    const components = useGridService('rowSelection')!.components.cell ?? {};

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            <CellContainer components={components.container}>
                <SelectionCheckbox />
            </CellContainer>
        </CellTheme>
    </CellRoot>;
};
