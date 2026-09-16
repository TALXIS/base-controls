import { ICellRendererParams } from "@ag-grid-community/core";
import { CellContainer } from "../container/CellContainer";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";

export interface IGridCellEditorProps extends ICellRendererParams {
    children?: React.ReactNode;
}

/** A cell of the grid while it is being edited, holding something other than a record's value. */
export const CellEditor = (props: IGridCellEditorProps) => {
    //an editor takes input by being one.
    return <CellRoot {...props} takesInput>
        <RowResizeGrip>
            <CellContainer>
                <CellLoading>{props.children}</CellLoading>
            </CellContainer>
        </RowResizeGrip>
    </CellRoot>;
};
