import { ICellRendererParams } from "@ag-grid-community/core";
import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { Control } from "../control/Control";
import { FieldValidation } from "../field-validation/FieldValidation";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../theme/CellTheme";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";
import { IGridCellComponents } from "./components";
import { Theming } from "@theme";

export interface IGridCellRendererProps extends ICellRendererParams {
    components?: IGridCellComponents;
}

/** A cell of the grid: what it draws, what it says about it, and what it offers to do. */
export const CellRenderer = (props: IGridCellRendererProps) => {
    const components = props.components ?? {};

    return <CellRoot {...props}>
        <CellTheme>
            <RowResizeGrip components={components.rowResizeGrip}>
                <CellContainer>
                    <CellLoading components={components.loading}>
                        <FieldValidation components={components.validation} />
                        <Control components={components.control} />
                        <CellCommands components={components.commands} />
                    </CellLoading>
                </CellContainer>
            </RowResizeGrip>
        </CellTheme>
    </CellRoot>;
};
