import { ICellRendererParams } from "@ag-grid-community/core";
import { CellContainer } from "../container/CellContainer";
import { Control } from "../control/Control";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";
import { IGridCellEditorComponents } from "./components";

export interface IGridCellEditorProps extends ICellRendererParams {
    components?: IGridCellEditorComponents;
}

/** A cell of the grid while it is being edited, with nothing in it to share the row with the input. */
export const CellEditor = (props: IGridCellEditorProps) => {
    const components = props.components ?? {};

    return <CellRoot {...props} isEditor>
        <RowResizeGrip components={components.rowResizeGrip}>
            <CellContainer>
                <CellLoading components={components.loading}>
                    <Control components={components.control} />
                </CellLoading>
            </CellContainer>
        </RowResizeGrip>
    </CellRoot>;
};
