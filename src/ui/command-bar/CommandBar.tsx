import * as React from 'react';
import { CommandBar as CommandBarBase, ICommandBarItemProps, ICommandBarProps } from "@fluentui/react";
import { Theming, useSurfaceTheme } from "@theme";
import { useSurfaceMenuProps } from "../surfaces";

/** A command bar whose menus are drawn in the application's theme rather than in the bar's. */
export const CommandBar = (props: ICommandBarProps) => {
    const { items, farItems, overflowItems, overflowButtonProps, ...commandBarProps } = props;
    const theme = useSurfaceTheme();
    const themed = React.useCallback(
        (bar?: ICommandBarItemProps[]) => bar && Theming.GetThemedContextualItems(bar, theme) as ICommandBarItemProps[],
        [theme]);
    //what the bar moves into its overflow menu is merged into these, so the theme survives the move
    const overflowMenuProps = useSurfaceMenuProps({ items: [], ...overflowButtonProps?.menuProps });

    return <CommandBarBase
        {...commandBarProps}
        items={themed(items) ?? []}
        farItems={themed(farItems)}
        overflowItems={themed(overflowItems)}
        overflowButtonProps={{ ...overflowButtonProps, menuProps: overflowMenuProps }} />;
};
