import { ICellRendererParams } from "@ag-grid-community/core";
import { CellCommands } from "../commands/CellCommands";
import { CellContainer } from "../container/CellContainer";
import { CellLoading } from "../loading/CellLoading";
import { CellRoot } from "../root/CellRoot";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";

export interface IGridCellRendererProps extends ICellRendererParams {
    children?: React.ReactNode;
}

/**
 * A cell of the grid holding something other than a record's value: a checkbox, what a save came to,
 * whatever a consumer draws.
 *
 * Everything a cell has - its theme, the custom formatting, the loading state, the row-resize grip, its
 * commands - around content that is the caller's. `Grid.FieldCellRenderer` is this with the record's own
 * value in it.
 */
export const CellRenderer = (props: IGridCellRendererProps) => {
    return <CellRoot {...props}>
        <RowResizeGrip>
            <CellContainer>
                <CellLoading>
                    {props.children}
                    <CellCommands />
                </CellLoading>
            </CellContainer>
        </RowResizeGrip>
    </CellRoot>;
};
