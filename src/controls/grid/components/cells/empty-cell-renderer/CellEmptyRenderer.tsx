import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../theme/CellTheme";
import { CellResizeGrip } from "../resize-grip/CellResizeGrip";
import { hasResizeGrip } from "../resize-grip/hasResizeGrip";
import { ICellRendererParams } from "ag-grid-community";
import { ITheme } from "@theme";
import { ICellRendererComponents } from "../cell-renderer/components";

export interface ICellEmptyRendererProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: Pick<ICellRendererComponents, 'resizeGrip' | 'container' | 'loading' | 'commands'>;
}

/** A cell of the grid's own with no value in it: what a cell is without the field parts. */
export const CellEmptyRenderer = (props: ICellEmptyRendererProps) => {
    const components = props.components ?? {};
    const content = <CellContainer components={components.container}>
        <CellLoading components={components.loading}>
            <CellCommands components={components.commands} />
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
