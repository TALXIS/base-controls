import { useMemo } from "react";
import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { useAppTheme } from "@theme";
import { useSurfaceMenuProps } from "@ui";
import { getClassNames } from "@core";
import { IDatasetControlUiViewSwitcherComponents, DatasetControlUiViewSwitcherComponents } from "./components";
import { getDatasetControlUiViewSwitcherStyles } from "./styles";

/** Props for the view switcher, as plain UI. */
export interface IDatasetControlUiViewSwitcherProps {
    /** The current view's name. */
    text: string;
    /** The menu's items: the views, under their group headers. */
    items: IContextualMenuItem[];
    /** The item drawn as the current one. */
    selectedKey?: string;
    /** Called as the menu opens. */
    onMenuClick?: () => void;
    disabled?: boolean;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiViewSwitcherComponents>;
}

/** A button named after the current view, opening the list of views. */
export const DatasetControlUiViewSwitcher = (props: IDatasetControlUiViewSwitcherProps) => {
    const components = { ...DatasetControlUiViewSwitcherComponents, ...props.components };
    const appTheme = useAppTheme();
    const styles = useMemo(() => getDatasetControlUiViewSwitcherStyles(appTheme), [appTheme]);
    const items = props.items.map(item => item.key === props.selectedKey ? { ...item, className: getClassNames([item.className, styles.selectedItem]) } : item);
    const menuProps = useSurfaceMenuProps({ items: getGroupSections(items), className: styles.menu });

    return components.onRender({
        text: props.text,
        title: props.text,
        menuProps,
        onMenuClick: props.onMenuClick,
        disabled: props.disabled,
        styles: {
            root: styles.viewSwitcher,
            textContainer: styles.textContainer,
            label: styles.label,
            menuIcon: styles.menuIcon,
            menuIconExpanded: styles.menuIconExpanded,
        },
    });
};

const isBoundary = (item: IContextualMenuItem) => item.itemType === ContextualMenuItemType.Header || item.itemType === ContextualMenuItemType.Divider;

//the items under each header go in a section of their own, which scrolls
const getGroupSections = (items: IContextualMenuItem[]): IContextualMenuItem[] => {
    const result: IContextualMenuItem[] = [];
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        result.push(item);
        if (item.itemType !== ContextualMenuItemType.Header) {
            continue;
        }
        const end = items.findIndex((next, nextIndex) => nextIndex > index && isBoundary(next));
        const groupItems = items.slice(index + 1, end === -1 ? items.length : end);
        if (groupItems.length > 0) {
            result.push({ key: `${item.key}-section`, itemType: ContextualMenuItemType.Section, sectionProps: { key: `${item.key}-section`, items: groupItems } });
            index += groupItems.length;
        }
    }
    return result;
};
