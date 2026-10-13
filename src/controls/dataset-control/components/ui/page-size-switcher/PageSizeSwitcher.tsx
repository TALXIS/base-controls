import { useMemo } from "react";
import { ContextualMenuItemType, useTheme } from "@fluentui/react";
import { useSurfaceMenuProps } from "@ui";
import { IPageSizeSwitcherUiComponents, PageSizeSwitcherUiComponents } from "./components";
import { getPageSizeSwitcherUiStyles } from "./styles";

/** Props for the page size switcher, as plain UI. */
export interface IPageSizeSwitcherUiProps {
    /** Which records the page shows, e.g. "1 - 25 of 120". */
    text: string;
    /** The size drawn as the current one. */
    pageSize: number;
    /** The sizes the menu offers. */
    pageSizes: number[];
    /** The menu's header. */
    title: string;
    /** Disables the button. */
    disabled?: boolean;
    /** Called with the size the user picked. */
    onPageSizeChange: (pageSize: number) => void;
    /** Replacements for its slots. */
    components?: Partial<IPageSizeSwitcherUiComponents>;
}

/** The record range of the page, opening a menu of page sizes. */
export const PageSizeSwitcher = (props: IPageSizeSwitcherUiProps) => {
    const components = { ...PageSizeSwitcherUiComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getPageSizeSwitcherUiStyles(theme), [theme]);
    const menuProps = useSurfaceMenuProps({
        items: [
            { key: 'header', itemType: ContextualMenuItemType.Header, text: props.title },
            { key: 'divider', itemType: ContextualMenuItemType.Divider },
            ...props.pageSizes.map(pageSize => ({
                key: `${pageSize}`,
                text: `${pageSize}`,
                className: styles.pageSize,
                checked: pageSize === props.pageSize,
                onClick: () => props.onPageSizeChange(pageSize),
            })),
        ],
    });
    return components.onRenderButton({ text: props.text, disabled: props.disabled, menuProps, styles: { root: styles.datasetControlPageSizeSwitcher } });
};
