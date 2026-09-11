import { useGridCell } from "../../cell-host/context";
import { CommandsComponents, ICommandsComponents } from "./components";

export interface ICommandsAdapterProps {
    components?: Partial<ICommandsComponents>;
}

/**
 * A cell's commands, as the command bar wants them.
 *
 * Reads the cell it is drawn in, so it has to be inside a `CellHost`.
 */
export const Commands = (props: ICommandsAdapterProps) => {
    const cell = useGridCell();
    const items = cell.getCommands();
    const components = { ...CommandsComponents, ...props.components };

    return components.onRenderCommands({
        items: items,
        alignment: cell.getColDef().propBag?.alignment,
    });
};
