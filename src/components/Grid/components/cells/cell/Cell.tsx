import { ICellRendererParams } from "@ag-grid-community/core";
import { CellCommands } from "../commands/CellCommands";
import { CellRoot } from "../root/CellRoot";

export interface IGridCellProps extends ICellRendererParams {
    children?: React.ReactNode;
}

/**
 * A cell of the grid that holds something other than a record's value: a checkbox, what a save came to,
 * whatever a consumer draws.
 *
 * Everything a cell has - its theme, the custom formatting, the loading state, the row-resize grip, its
 * commands - around content that is the caller's rather than a field's.
 */
export const Cell = (props: IGridCellProps) => {
    return <CellRoot {...props}>
        {props.children}
        <CellCommands />
    </CellRoot>;
};
