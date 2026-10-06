import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { CellControl } from "../control/CellControl";
import { CellFieldError } from "../field-error/CellFieldError";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../theme/CellTheme";
import { CellResizeGrip } from "../resize-grip/CellResizeGrip";
import { hasResizeGrip } from "../resize-grip/hasResizeGrip";
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
            <CellControl components={components.control} />
            <CellCommands components={components.commands} />
            <CellFieldError components={components.fieldError} />
        </CellLoading>
    </CellContainer>;

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            {hasResizeGrip(props.colDef)
                ? <CellResizeGrip components={components.resizeGrip}>{content}</CellResizeGrip>
                : content}
        </CellTheme>
    </CellRoot>;
};
