import { useMemo } from "react";
import { IContextualMenuProps, useTheme } from "@fluentui/react";
import { ContextualMenu } from "@ui";
import { getColumnHeaderMenuStyles } from "./styles";

export interface IColumnHeaderMenuProps extends IContextualMenuProps { }

/** The menu a column header opens, and what keeps it open while the grid scrolls under it. */
export const ColumnHeaderMenu = (props: IColumnHeaderMenuProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getColumnHeaderMenuStyles(theme), [theme]);

    return <ContextualMenu
        {...props}
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
