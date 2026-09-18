import { useRef } from "react";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IGridRowsEvents } from "../../../services/rows";
import { useGridService } from "../../../useGridService";
import { useGridCell } from "../root/context";
import { CellCommandsComponents, IGridCellCommandsComponents } from "./components";

export interface IGridCellCommandsProps {
    components?: Partial<IGridCellCommandsComponents>;
}

/** A cell's commands, as the command bar wants them. */
export const CellCommands = (props: IGridCellCommandsProps) => {
    const cell = useGridCell();
    const rows = useGridService('rows');
    const components = { ...CellCommandsComponents, ...props.components };
    const rerender = useRerender();
    const isActive = rows.isActive(cell.getRecord());
    //what this cell last drew from.
    const wasActive = useRef(isActive);
    wasActive.current = isActive;

    useEventEmitter<IGridRowsEvents>(rows, 'onActiveRowsChanged', () => {
        if (rows.isActive(cell.getRecord()) !== wasActive.current) {
            rerender();
        }
    });

    if (!isActive) {
        return null;
    }

    const { items, overflowItems } = cell.getCommands();

    return components.onRenderCommands({
        items: items,
        overflowItems: overflowItems,
        alignment: cell.getAlignment(),
    });
};
