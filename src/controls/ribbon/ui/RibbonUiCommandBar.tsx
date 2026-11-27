import { useMemo } from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { getClassNames } from "@core";
import { IRibbonUiCommandBarComponents, RibbonUiCommandBarComponents } from "./components";
import { getRibbonUiCommandBarStyles } from "./styles";

export interface IRibbonUiCommandBarProps {
    /** An item's `iconProps.imageProps` is drawn at the size of a Fluent icon. */
    items: ICommandBarItemProps[];
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    className?: string;
    components?: Partial<IRibbonUiCommandBarComponents>;
}

/** The commands as a command bar, fitted to the width it is given. */
export const RibbonUiCommandBar = (props: IRibbonUiCommandBarProps) => {
    const components = { ...RibbonUiCommandBarComponents, ...props.components };
    const styles = useMemo(() => getRibbonUiCommandBarStyles(), []);
    //a class, not a ribbon selector: menus render outside the ribbon
    const sizeImageIcons = (items: ICommandBarItemProps[]): ICommandBarItemProps[] => items.map(item => ({
        ...item,
        iconProps: item.iconProps?.imageProps ? { ...item.iconProps, className: getClassNames([styles.imageIcon, item.iconProps.className]) } : item.iconProps,
        subMenuProps: item.subMenuProps && { ...item.subMenuProps, items: sizeImageIcons(item.subMenuProps.items) },
    }));
    return components.onRender({
        items: sizeImageIcons(props.items),
        className: getClassNames([styles.ribbon, props.className]),
        align: props.align,
    });
};
