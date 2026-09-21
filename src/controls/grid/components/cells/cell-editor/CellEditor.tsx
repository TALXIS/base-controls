import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { CellContainer } from "../container/CellContainer";
import { Control } from "../control/Control";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../theme/CellTheme";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";
import { IGridCellEditorComponents } from "./components";

export interface IGridCellEditorProps extends ICellRendererParams {
    /** What the cell's theme is worked out from, where the grid's own - striped by row - is not it. */
    theme?: ITheme;
    components?: IGridCellEditorComponents;
}

/** A cell of the grid while it is being edited, with nothing in it to share the row with the input. */
export const CellEditor = (props: IGridCellEditorProps) => {
    const components = props.components ?? {};
    const content = <CellContainer components={components.container}>
        <CellLoading components={components.loading}>
            <Control components={components.control} />
        </CellLoading>
    </CellContainer>;

    return <CellRoot {...props} isEditor>
        <CellTheme theme={props.theme}>
            {props.colDef?.autoHeight
                ? <RowResizeGrip components={components.rowResizeGrip}>{content}</RowResizeGrip>
                : content}
        </CellTheme>
    </CellRoot>;
};
