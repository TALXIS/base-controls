import type { ICommandBarItemProps, ICommandBarProps } from "@fluentui/react";
import { ITaskGridUiCommandBarComponents, TaskGridUiCommandBarComponents } from "./components";

export interface ITaskGridUiCommandBarProps extends ICommandBarProps {
    components?: Partial<ITaskGridUiCommandBarComponents>;
}

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

/** The first command on the bar and the others in its menu. */
export const TaskGridUiCommandBar = (props: ITaskGridUiCommandBarProps) => {
    const { components: _, ...commandBarProps } = props;
    const components = { ...TaskGridUiCommandBarComponents, ...props.components };
    return components.onRenderCommandBar(toSingleCommand(commandBarProps));
};
