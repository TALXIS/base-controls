import { ICellRendererParams } from "@ag-grid-community/core";
import { IGridCellRendererParams } from "../../interfaces";
import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { Control } from "../control/Control";
import { FieldValidation } from "../field-validation/FieldValidation";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";
import { IGridCellComponents } from "./components";

export interface IGridCellRendererProps extends ICellRendererParams, IGridCellRendererParams {
    components?: IGridCellComponents;
}

/** A cell of the grid: what it draws, what it says about it, and what it offers to do. */
export const CellRenderer = (props: IGridCellRendererProps) => {
    const components = props.components ?? {};

    return <CellRoot {...props}>
        <RowResizeGrip components={components.rowResizeGrip}>
            <CellContainer>
                <CellLoading components={components.loading}>
                    <FieldValidation components={components.validation} />
                    <Control components={components.control} />
                    <CellCommands components={components.commands} />
                </CellLoading>
            </CellContainer>
        </RowResizeGrip>
    </CellRoot>;
};
