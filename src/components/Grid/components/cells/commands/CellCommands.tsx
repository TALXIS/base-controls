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

/**
 * A cell's commands, as the command bar wants them.
 *
 * Reads the cell it is drawn in, so it has to be inside a `CellRoot`. Drawn only for a row the user is at
 * - under the pointer, holding the focused cell, or selected - because a command bar is the most expensive
 * thing a cell draws, and a grid is mostly rows nobody is using.
 */
export const CellCommands = (props: IGridCellCommandsProps) => {
    const cell = useGridCell();
    const rows = useGridService('rows');
    const gridTheme = useGridService('theme');
    const components = { ...CellCommandsComponents, ...props.components };
    const rerender = useRerender();
    const isActive = rows.isActive(cell.getRecord());
    //what this cell last drew from, so that rows the change did not concern are left alone: every cell on
    //screen hears every change, and with a selection made that is most of them
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
        alignment: cell.getColDef().propBag?.column?.alignment,
        surfaceTheme: gridTheme,
    });
};
