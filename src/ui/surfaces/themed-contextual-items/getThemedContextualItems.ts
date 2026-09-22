import { IContextualMenuItem } from "@fluentui/react";
import { ITheme } from "@theme";

/** The items, with every submenu and callout under them drawn in this theme rather than the parent's. */
export const getThemedContextualItems = (items: IContextualMenuItem[], theme: ITheme): IContextualMenuItem[] => {
    return items.map(item => {
        const themedItem = { ...item };
        if (themedItem.subMenuProps) {
            themedItem.subMenuProps = {
                ...themedItem.subMenuProps,
                theme: theme,
                calloutProps: {
                    ...themedItem.subMenuProps.calloutProps,
                    theme: theme
                },
                items: getThemedContextualItems(themedItem.subMenuProps.items, theme)
            };
        }
        return themedItem;
    });
};
