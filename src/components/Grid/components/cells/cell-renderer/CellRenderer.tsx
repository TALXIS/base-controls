import { ICellRendererParams } from "@ag-grid-community/core";
import { IGridCellRendererParams } from "../../interfaces";
import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";

export interface IGridCellRendererProps extends ICellRendererParams, IGridCellRendererParams {
    children?: React.ReactNode;
}

/** A cell of the grid holding something other than a record's value. */
export const CellRenderer = (props: IGridCellRendererProps) => {
    return <CellRoot {...props}>
        <RowResizeGrip>
            <CellContainer>
                <CellLoading>
                    {props.children}
                    <CellCommands />
                </CellLoading>
            </CellContainer>
        </RowResizeGrip>
    </CellRoot>;
};
