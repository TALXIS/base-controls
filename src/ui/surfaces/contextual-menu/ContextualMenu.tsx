import * as React from 'react';
import { ContextualMenu as ContextualMenuBase, IContextualMenuProps } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";
import { getThemedContextualItems } from "../themed-contextual-items";

/** A menu drawn in the application's theme rather than in the one it was opened from, submenus and all. */
export const ContextualMenu = (props: IContextualMenuProps) => {
    const { items, calloutProps, ...menuProps } = props;
    const theme = useSurfaceTheme();
    const themedItems = React.useMemo(() => getThemedContextualItems(items, theme), [items, theme]);

    return <ContextualMenuBase
        theme={theme}
        {...menuProps}
        items={themedItems}
        calloutProps={{ theme: theme, ...calloutProps }} />;
};
