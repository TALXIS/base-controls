import { createElement } from "react";
import { IContextualMenuItem } from "@fluentui/react";
import { ITheme, ThemeContext } from "@theme";

const themeItems = (items: IContextualMenuItem[], theme: ITheme, isInMenu: boolean): IContextualMenuItem[] => {
    return items.map(item => {
        const themedItem = { ...item };
        const onRender = themedItem.onRender;
        //custom content otherwise takes the theme of where the menu was opened
        if (isInMenu && onRender) {
            themedItem.onRender = (renderedItem, dismissMenu) => createElement(ThemeContext, { theme }, onRender(renderedItem, dismissMenu));
        }
        if (themedItem.subMenuProps) {
            themedItem.subMenuProps = {
                ...themedItem.subMenuProps,
                theme: theme,
                calloutProps: {
                    ...themedItem.subMenuProps.calloutProps,
                    theme: theme
                },
                items: themeItems(themedItem.subMenuProps.items, theme, true)
            };
        }
        return themedItem;
    });
};

/**
 * The items, with every submenu and callout under them drawn in this theme rather than the parent's.
 * @param isInMenu Whether the items themselves are drawn in a menu, unlike a command bar's own.
 */
export const getThemedContextualItems = (items: IContextualMenuItem[], theme: ITheme, isInMenu = true): IContextualMenuItem[] => themeItems(items, theme, isInMenu);
