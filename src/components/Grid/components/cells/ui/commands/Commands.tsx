import { useMemo, useRef } from "react";
import { CommandBar, concatStyleSets, IContextualMenuItem, IContextualMenuProps, ICommandBar, ICommandBarProps, ITheme } from "@fluentui/react";
import { useResizeObserver } from "@legacy";
import { getClassNames, IAlignment } from "@utils";
import { getCellCommandsStyles } from "./styles";

export interface ICellCommandsProps extends ICommandBarProps {
    /** Where the buttons sit in the width the bar takes. */
    alignment?: IAlignment;
    /** What the overflow menu is drawn in. */
    surfaceTheme?: ITheme;
}

/** The commands a cell offers, drawn to fit the row it is in. */
export const Commands = (props: ICellCommandsProps) => {
    const { alignment = 'left', className, surfaceTheme, overflowButtonProps, items, overflowItems, ...commandBarProps } = props;
    const styles = useMemo(() => getCellCommandsStyles(alignment), [alignment]);
    const themedItems = useMemo(() => getThemedItems(items, surfaceTheme), [items, surfaceTheme]);
    const themedOverflowItems = useMemo(() => overflowItems && getThemedItems(overflowItems, surfaceTheme), [overflowItems, surfaceTheme]);
    const commandBarRef = useRef<ICommandBar>(null);
    const observe = useResizeObserver(() => commandBarRef.current?.remeasure());

    if (items.length === 0 && !overflowItems?.length) {
        return null;
    }

    return <div ref={element => element && observe(element)} className={getClassNames([styles.commandsRoot, className])}>
        <CommandBar
            {...commandBarProps}
            items={themedItems}
            overflowItems={themedOverflowItems}
            //what the bar puts in its overflow menu is merged into these, so the theme survives
            overflowButtonProps={{ ...overflowButtonProps, menuProps: getThemedMenu({ items: [], ...overflowButtonProps?.menuProps }, surfaceTheme) }}
            componentRef={commandBarRef}
            className={styles.commandBar}
            styles={concatStyleSets(styles.commandBarStyles, props.styles)} />
    </div>;
};

/** The items, with every menu one of them opens drawn in the given theme. */
const getThemedItems = <TItem extends IContextualMenuItem>(items: TItem[], theme?: ITheme): TItem[] => {
    if (!theme) {
        return items;
    }
    return items.map(item => item.subMenuProps
        ? { ...item, subMenuProps: { ...getThemedMenu(item.subMenuProps, theme), items: getThemedItems(item.subMenuProps.items, theme) } as IContextualMenuProps }
        : item);
};

/** A menu drawn in the given theme, surface and all. */
const getThemedMenu = <TMenu extends Partial<IContextualMenuProps>>(menu: TMenu | undefined, theme?: ITheme): TMenu => {
    return {
        ...menu,
        theme: theme,
        calloutProps: { ...menu?.calloutProps, theme: theme },
    } as TMenu;
};
