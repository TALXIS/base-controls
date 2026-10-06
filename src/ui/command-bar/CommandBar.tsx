import * as React from 'react';
import { CommandBar as CommandBarBase, concatStyleSetsWithProps, ICommandBarItemProps, ICommandBarProps, ICommandBarStyleProps } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";
import { getThemedContextualItems } from "../surfaces";
import { useSurfaceMenuProps } from "../surfaces";

/** A command bar whose menus and tooltips are drawn in the application's theme rather than in the bar's. */
export const CommandBar = (props: ICommandBarProps) => {
    const { items, farItems, overflowItems, overflowButtonProps, styles, ...commandBarProps } = props;
    const theme = useSurfaceTheme();
    const themed = React.useCallback(
        (bar?: ICommandBarItemProps[]) => bar && (getThemedContextualItems(bar, theme) as ICommandBarItemProps[]).map(item => ({
            ...item,
            tooltipHostProps: {
                ...item.tooltipHostProps,
                tooltipProps: { theme: theme, ...item.tooltipHostProps?.tooltipProps },
                calloutProps: { theme: theme, ...item.tooltipHostProps?.calloutProps },
            },
        })),
        [theme]);
    //what the bar moves into its overflow menu is merged into these, so the theme survives the move
    const overflowMenuProps = useSurfaceMenuProps({ items: [], ...overflowButtonProps?.menuProps });

    return <CommandBarBase
        {...commandBarProps}
        styles={(styleProps: ICommandBarStyleProps) => concatStyleSetsWithProps(styleProps, { root: { paddingLeft: 0 } }, styles)}
        items={themed(items) ?? []}
        farItems={themed(farItems)}
        overflowItems={themed(overflowItems)}
        overflowButtonProps={{ ...overflowButtonProps, menuProps: overflowMenuProps }} />;
};
