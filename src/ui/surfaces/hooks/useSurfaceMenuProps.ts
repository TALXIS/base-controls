import { useMemo } from "react";
import { IContextualMenuProps } from "@fluentui/react";
import { Theming, useSurfaceTheme } from "@theme";

/**
 * A menu someone else's button opens, drawn in the application's theme rather than in the button's.
 *
 * What {@link ContextualMenu} does, for the places where a menu is a prop rather than something rendered.
 */
export const useSurfaceMenuProps = <TMenu extends IContextualMenuProps | undefined>(menuProps: TMenu): TMenu => {
    const theme = useSurfaceTheme();

    return useMemo(() => {
        if (!menuProps) {
            return menuProps;
        }
        return {
            ...menuProps,
            theme: theme,
            items: Theming.GetThemedContextualItems(menuProps.items, theme),
            calloutProps: { theme: theme, ...menuProps.calloutProps }
        };
    }, [menuProps, theme]);
};
