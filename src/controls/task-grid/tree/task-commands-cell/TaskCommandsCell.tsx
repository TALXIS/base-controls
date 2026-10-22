import { useMemo } from "react";
import type { ICommandBarItemProps, ICommandBarProps } from "@fluentui/react";
import { Grid, ICellEmptyRendererProps } from "@controls/grid";
import { CellUiCommandsComponents } from "@controls/grid/components/cells/ui/commands/components";
import { getClassNames } from "@utils";
import { getTaskCommandsCellStyles } from "./styles";

/** Props for {@link TaskCommandsCell}. */
export interface ITaskCommandsCellProps extends ICellEmptyRendererProps { }

//the first command stays on the cell, the rest go into its menu
const toSingleCommand = (props: ICommandBarProps): ICommandBarProps => {
    const [first, ...rest] = props.items;
    const others = [...rest, ...props.overflowItems ?? []];
    if (!first || others.length === 0) {
        return props;
    }
    const menu: ICommandBarItemProps = {
        ...first,
        onClick: undefined,
        //the cell only has room for the icon
        onRenderMenuIcon: () => null,
        subMenuProps: { items: [{ key: first.key, text: first.text ?? first.title, iconProps: first.iconProps, onClick: first.onClick, subMenuProps: first.subMenuProps }, ...others] },
    };
    return { ...props, items: [menu], overflowItems: [] };
};

/** The cell of a task's row commands: the first one, spanning the cell, and the others in its menu. */
export const TaskCommandsCell = (props: ITaskCommandsCellProps) => {
    const styles = useMemo(() => getTaskCommandsCellStyles(), []);
    const commands = { ...CellUiCommandsComponents, ...props.components?.commands };
    return <Grid.Cell.EmptyRenderer {...props} components={{
        ...props.components,
        commands: {
            ...commands,
            onRenderContainer: containerProps => commands.onRenderContainer({ ...containerProps, className: getClassNames([containerProps.className, styles.commands]) }),
            onRenderCommandBar: commandBarProps => commands.onRenderCommandBar(toSingleCommand(commandBarProps)),
        },
    }} />;
};
