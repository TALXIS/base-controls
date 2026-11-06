import { useRef } from "react";
import { useRerender } from "@core";
import { useEventEmitter } from "@core/hooks/useEventEmitter";
import { IGridRowsEvents } from "../../../runtime/rows";
import { useGridServiceInternal } from "../../../useGridService";
import { useGridCell } from "../root/context";
import { CellUi, ICellUiCommandsComponents } from "../../../ui/cells";

export interface ICellCommandsProps {
    components?: Partial<ICellUiCommandsComponents>;
}

/** A cell's commands, as the command bar wants them. */
export const CellCommands = (props: ICellCommandsProps) => {
    const cell = useGridCell();
    const rows = useGridServiceInternal('rows');
    const { rerender } = useRerender();
    const isHighlighted = rows.isHighlighted(cell.getRecord());
    //what this cell last drew from.
    const wasHighlighted = useRef(isHighlighted);
    wasHighlighted.current = isHighlighted;

    useEventEmitter<IGridRowsEvents>(rows.events, 'onHighlightedRowsChanged', () => {
        if (rows.isHighlighted(cell.getRecord()) !== wasHighlighted.current) {
            rerender();
        }
    });

    if (!isHighlighted) {
        return null;
    }

    const { items, overflowItems } = cell.getCommands();

    return <CellUi.Commands items={items} overflowItems={overflowItems} alignment={cell.getAlignment()} components={props.components} />;
};
