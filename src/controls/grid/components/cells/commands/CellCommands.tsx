import { useRef } from "react";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridRowsEvents } from "../../../services/rows";
import { useGridService } from "../../../useGridService";
import { useGridCell } from "../root/context";
import { CellCommandsComponents, ICellCommandsComponents } from "./components";

export interface ICellCommandsProps {
    components?: Partial<ICellCommandsComponents>;
}

/** A cell's commands, as the command bar wants them. */
export const CellCommands = (props: ICellCommandsProps) => {
    const cell = useGridCell();
    const rows = useGridService('rows');
    const components = { ...CellCommandsComponents, ...props.components };
    const rerender = useRerender();
    const isHighlighted = rows.isHighlighted(cell.getRecord());
    //what this cell last drew from.
    const wasHighlighted = useRef(isHighlighted);
    wasHighlighted.current = isHighlighted;

    useEventEmitter<IGridRowsEvents>(rows, 'onHighlightedRowsChanged', () => {
        if (rows.isHighlighted(cell.getRecord()) !== wasHighlighted.current) {
            rerender();
        }
    });

    if (!isHighlighted) {
        return null;
    }

    const { items, overflowItems } = cell.getCommands();

    return components.onRenderCommands({
        items: items,
        overflowItems: overflowItems,
        alignment: cell.getAlignment(),
    });
};
