import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { CellContainer } from "../container/CellContainer";
import { CellControl } from "../control/CellControl";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../theme/CellTheme";
import { CellResizeGrip } from "../row-resize-grip/CellResizeGrip";
import { ICellEditorComponents } from "./components";

export interface ICellEditorProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: ICellEditorComponents;
}

/** A cell of the grid while it is being edited, with nothing in it to share the row with the input. */
export const CellEditor = (props: ICellEditorProps) => {
    const components = props.components ?? {};
    const content = <CellContainer components={components.container}>
        <CellLoading components={components.loading}>
            <CellControl components={components.control} />
        </CellLoading>
    </CellContainer>;

    return <CellRoot {...props} isEditor>
        <CellTheme theme={props.theme}>
            {props.colDef?.autoHeight
                ? <CellResizeGrip components={components.rowResizeGrip}>{content}</CellResizeGrip>
                : content}
        </CellTheme>
    </CellRoot>;
};
