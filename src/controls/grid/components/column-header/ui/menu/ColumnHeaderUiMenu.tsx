import { useMemo } from "react";
import { IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";
import { ContextualMenu } from "@ui";
import { getColumnHeaderMenuStyles } from "./styles";

export interface IColumnHeaderUiMenuProps extends Omit<IContextualMenuProps, 'items'> {
    /** What the menu offers. Nothing to offer is nothing to draw. */
    items?: IContextualMenuItem[];
}

/** The menu a column header opens, and what keeps it open while the grid scrolls under it. */
export const ColumnHeaderUiMenu = (props: IColumnHeaderUiMenuProps) => {
    //the menu is drawn on the surface rather than in the header it was opened from
    const theme = useSurfaceTheme();
    const styles = useMemo(() => getColumnHeaderMenuStyles(theme), [theme]);

    if (!props.items?.length) {
        return null;
    }
    return <ContextualMenu
        {...props}
        items={props.items}
        calloutProps={{ preventDismissOnEvent: preventDismissOnEvent, className: styles.menu, ...props.calloutProps }} />;
};

const preventDismissOnEvent = (e: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | React.FocusEvent<Element, Element>) => {
    if (e.type !== 'scroll') {
        return false;
    }
    const target = e.target as HTMLElement;
    //check for vertical scroll
    if (target?.classList?.contains('ag-body-viewport') || target?.classList?.contains('ag-body-vertical-scroll-viewport')) {
        return true;
    }
    //ios outputs horizontal scroll if focused in callout btn.
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        return true;
    }
    return false;
}
