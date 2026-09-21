import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { CellTheme } from "../theme/CellTheme";
import { CellResizeGrip } from "../row-resize-grip/CellResizeGrip";
import { ICellRendererProps } from "../cell-renderer/CellRenderer";

export interface ICellEmptyRendererProps extends ICellRendererProps { }

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
            {props.colDef?.autoHeight
                ? <CellResizeGrip components={components.rowResizeGrip}>{content}</CellResizeGrip>
                : content}
        </CellTheme>
    </CellRoot>;
};
