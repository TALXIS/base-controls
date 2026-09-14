import { useGridCell } from "../root/context";
import { CellCommandsComponents, IGridCellCommandsComponents } from "./components";

export interface IGridCellCommandsProps {
    components?: Partial<IGridCellCommandsComponents>;
}

/**
 * A cell's commands, as the command bar wants them.
 *
 * Reads the cell it is drawn in, so it has to be inside a `CellRoot`.
 */
export const CellCommands = (props: IGridCellCommandsProps) => {
    const cell = useGridCell();
    const items = cell.getCommands();
    const components = { ...CellCommandsComponents, ...props.components };

    return components.onRenderCommands({
        items: items,
        alignment: cell.getColDef().propBag?.alignment,
    });
};
