import { useGridCell } from "../../cell-host/context";
import { CommandsComponents, ICommandsComponents } from "./components";

export interface ICommandsAdapterProps {
    components?: Partial<ICommandsComponents>;
}

/**
 * A cell's commands, as the command bar wants them.
 *
 * Reads the cell it is drawn in, so it has to be inside a `CellHost` - and draws nothing where that cell
 * offers no commands, rather than an empty bar.
 */
export const Commands = (props: ICommandsAdapterProps) => {
    const items = useGridCell().getCommands();
    const components = { ...CommandsComponents, ...props.components };

    if (items.length === 0) {
        return null;
    }
    return components.onRenderCommands({ items: items });
};
