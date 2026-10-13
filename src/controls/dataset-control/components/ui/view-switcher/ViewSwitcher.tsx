import { useMemo } from "react";
import { IContextualMenuItem, useTheme } from "@fluentui/react";
import { useSurfaceMenuProps } from "@ui";
import { getClassNames } from "@utils";
import { IViewSwitcherUiComponents, ViewSwitcherUiComponents } from "./components";
import { getViewSwitcherUiStyles } from "./styles";

/** Props for the view switcher, as plain UI. */
export interface IViewSwitcherUiProps {
    /** The current view's name. */
    text: string;
    /** The menu's items: the views, under their group headers. */
    items: IContextualMenuItem[];
    /** The item drawn as the current one. */
    selectedKey?: string;
    /** Replacements for its slots. */
    components?: Partial<IViewSwitcherUiComponents>;
}

/** A button named after the current view, opening the list of views. */
export const ViewSwitcher = (props: IViewSwitcherUiProps) => {
    const components = { ...ViewSwitcherUiComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getViewSwitcherUiStyles(theme), [theme]);
    const items = props.items.map(item => item.key === props.selectedKey ? { ...item, className: getClassNames([item.className, styles.selectedItem]) } : item);
    const menuProps = useSurfaceMenuProps({ items });

    return components.onRenderButton({
        text: props.text,
        menuProps,
        styles: {
            root: styles.viewSwitcher,
            label: styles.label,
            menuIcon: styles.menuIcon,
            menuIconExpanded: styles.menuIconExpanded,
        },
    });
};
