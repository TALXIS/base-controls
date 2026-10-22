import * as React from 'react';
import { CommandBar as CommandBarBase, composeComponentAs, concatStyleSetsWithProps, ICommandBarItemProps, ICommandBarProps as ICommandBarPropsBase, ICommandBarStyleProps } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";
import { useCompact } from "@utils/layout";
import { getThemedContextualItems } from "../surfaces";
import { useSurfaceMenuProps } from "../surfaces";
import { getCommandBarStyles } from "./styles";
import { ObservedResizeGroup } from "./ObservedResizeGroup";

const toIconOnly = (item: ICommandBarItemProps): ICommandBarItemProps => ({
    ...item,
    iconOnly: true,
    //Fluent already shows an icon-only button's text in a tooltip, so a native `title` would add one
    title: undefined,
    ariaLabel: item.ariaLabel ?? item.text,
    //Fluent caches measured widths by `cacheKey`, so icon-only widths need a key of their own
    cacheKey: `${item.cacheKey ?? item.key}-icon`,
});

export interface ICommandBarProps extends ICommandBarPropsBase {
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
}

/** A command bar whose menus and tooltips are drawn in the application's theme rather than in the bar's, fitted to its own box; inside a compact provider, such as `WrapCompactProvider`, its buttons show only their icons. */
export const CommandBar = (props: ICommandBarProps) => {
    const { items, farItems, overflowItems, overflowButtonProps, styles, resizeGroupAs, align = 'start', ...commandBarProps } = props;
    const theme = useSurfaceTheme();
    const isCompact = useCompact();
    const compacted = (bar?: ICommandBarItemProps[]) => isCompact ? bar?.map(item => item.iconProps && item.iconOnly === undefined ? toIconOnly(item) : item) : bar;
    const barStyles = React.useMemo(() => getCommandBarStyles(align), [align]);
    const themed = React.useCallback(
        (bar?: ICommandBarItemProps[], isInMenu = false) => bar && (getThemedContextualItems(bar, theme, isInMenu) as ICommandBarItemProps[]).map(item => ({
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

    if (!items?.length && !farItems?.length && !overflowItems?.length) {
        return <></>;
    }
    return <CommandBarBase
        {...commandBarProps}
        styles={(styleProps: ICommandBarStyleProps) => concatStyleSetsWithProps(styleProps, { root: barStyles.root, primarySet: barStyles.primarySet }, styles)}
        items={themed(compacted(items)) ?? []}
        farItems={themed(compacted(farItems))}
        overflowItems={themed(overflowItems, true)}
        overflowButtonProps={{ ...overflowButtonProps, menuProps: overflowMenuProps }}
        resizeGroupAs={resizeGroupAs ? composeComponentAs(resizeGroupAs, ObservedResizeGroup) : ObservedResizeGroup} />;
};
