import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellControl } from "../../../../components/cells/control/CellControl";
import { CellColumnControl } from "../../../../components/cells/column-control/CellColumnControl";
import { CellLoading } from "../../../../components/cells/loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellResizeGrip } from "../../../../components/cells/resize-grip/CellResizeGrip";
import { hasResizeGrip } from "../../../../components/cells/resize-grip/hasResizeGrip";
import { ICellEditorComponents } from "./components";

export interface ICellEditorProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: ICellEditorComponents;
}

/** A cell of the grid while it is being edited, holding only the input. */
export const CellEditor = (props: ICellEditorProps) => {
    const components = props.components ?? {};
    const content = <CellContainer components={components.container}>
        <CellLoading components={components.loading}>
            <CellControl components={components.control}>
                <CellColumnControl components={components.columnControl} />
            </CellControl>
        </CellLoading>
    </CellContainer>;

    return <CellRoot {...props} isEditor>
        <CellTheme theme={props.theme}>
            {hasResizeGrip(props.colDef)
                ? <CellResizeGrip components={components.resizeGrip}>{content}</CellResizeGrip>
                : content}
        </CellTheme>
    </CellRoot>;
};
