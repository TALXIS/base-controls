import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { CellControl } from "../control/CellControl";
import { CellValidation } from "../field-validation/CellValidation";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../theme/CellTheme";
import { CellResizeGrip } from "../row-resize-grip/CellResizeGrip";
import { ICellRendererComponents } from "./components";

export interface ICellRendererProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: ICellRendererComponents;
}

/** A cell of the grid: what it draws, what it says about it, and what it offers to do. */
export const CellRenderer = (props: ICellRendererProps) => {
    const components = props.components ?? {};
    const content = <CellContainer components={components.container}>
        <CellLoading components={components.loading}>
            <CellValidation components={components.validation}>
                <CellControl components={components.control} />
                <CellCommands components={components.commands} />
            </CellValidation>
        </CellLoading>
    </CellContainer>;

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            {props.colDef?.autoHeight
                ? <CellResizeGrip components={components.rowResizeGrip}>{content}</CellResizeGrip>
                : content}
        </CellTheme>
    </CellRoot>;
};
