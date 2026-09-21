import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { Control } from "../control/Control";
import { FieldValidation } from "../field-validation/FieldValidation";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../theme/CellTheme";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";
import { IGridCellComponents } from "./components";

export interface IGridCellRendererProps extends ICellRendererParams {
    /** What the cell's theme is worked out from, where the grid's own - striped by row - is not it. */
    theme?: ITheme;
    components?: IGridCellComponents;
}

/** A cell of the grid: what it draws, what it says about it, and what it offers to do. */
export const CellRenderer = (props: IGridCellRendererProps) => {
    const components = props.components ?? {};
    const content = <CellContainer components={components.container}>
        <CellLoading components={components.loading}>
            <FieldValidation components={components.validation}>
                <Control components={components.control} />
                <CellCommands components={components.commands} />
            </FieldValidation>
        </CellLoading>
    </CellContainer>;

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            {props.colDef?.autoHeight
                ? <RowResizeGrip components={components.rowResizeGrip}>{content}</RowResizeGrip>
                : content}
        </CellTheme>
    </CellRoot>;
};
