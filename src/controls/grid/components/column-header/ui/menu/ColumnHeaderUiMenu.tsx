import { useMemo } from "react";
import { IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";
import { ColumnHeaderUiMenuComponents, IColumnHeaderUiMenuComponents } from "./components";
import { getColumnHeaderUiMenuStyles } from "./styles";

export interface IColumnHeaderUiMenuProps extends Omit<IContextualMenuProps, 'items'> {
    /** What the menu offers. Nothing to offer is nothing to draw. */
    items?: IContextualMenuItem[];
    components?: Partial<IColumnHeaderUiMenuComponents>;
}

/** The menu a column header opens, and what keeps it open while the grid scrolls under it. */
export const ColumnHeaderUiMenu = (props: IColumnHeaderUiMenuProps) => {
    //the menu is drawn on the surface, not in the header
    const theme = useSurfaceTheme();
    const { components: _, ...menuProps } = props;
    const components = { ...ColumnHeaderUiMenuComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderUiMenuStyles(theme), [theme]);

    if (!props.items?.length) {
        return null;
    }
    return components.onRenderContextualMenu({
        ...menuProps,
        items: props.items,
        calloutProps: { preventDismissOnEvent: preventDismissOnEvent, className: styles.menu, ...props.calloutProps },
    });
};

const preventDismissOnEvent = (e: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | React.FocusEvent<Element, Element>) => {
    if (e.type !== 'scroll') {
        return false;
    }
    const target = e.target as HTMLElement;
    //the grid's viewport scrolls the rows under the header, which stays put
    if (target?.classList?.contains('ag-grid-viewport') || target?.classList?.contains('ag-body-vertical-scroll-viewport')) {
        return true;
    }
    //ios outputs horizontal scroll if focused in callout btn.
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        return true;
    }
    return false;
}
