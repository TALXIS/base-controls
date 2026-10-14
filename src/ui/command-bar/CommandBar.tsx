import * as React from 'react';
import { CommandBar as CommandBarBase, composeComponentAs, concatStyleSetsWithProps, ICommandBarItemProps, ICommandBarProps as ICommandBarPropsBase, ICommandBarStyleProps } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";
import { getThemedContextualItems } from "../surfaces";
import { useSurfaceMenuProps } from "../surfaces";
import { getCommandBarStyles } from "./styles";
import { ObservedResizeGroup } from "./ObservedResizeGroup";

export interface ICommandBarProps extends ICommandBarPropsBase {
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
}

/** A command bar whose menus and tooltips are drawn in the application's theme rather than in the bar's, fitted to its own box. */
export const CommandBar = (props: ICommandBarProps) => {
    const { items, farItems, overflowItems, overflowButtonProps, styles, resizeGroupAs, align = 'start', ...commandBarProps } = props;
    const theme = useSurfaceTheme();
    const barStyles = React.useMemo(() => getCommandBarStyles(align), [align]);
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
        styles={(styleProps: ICommandBarStyleProps) => concatStyleSetsWithProps(styleProps, { root: barStyles.root, primarySet: barStyles.primarySet }, styles)}
        items={themed(items) ?? []}
        farItems={themed(farItems)}
        overflowItems={themed(overflowItems)}
        overflowButtonProps={{ ...overflowButtonProps, menuProps: overflowMenuProps }}
        resizeGroupAs={resizeGroupAs ? composeComponentAs(resizeGroupAs, ObservedResizeGroup) : ObservedResizeGroup} />;
};
