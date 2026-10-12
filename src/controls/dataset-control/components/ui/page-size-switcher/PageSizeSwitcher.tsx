import { useMemo } from "react";
import { ContextualMenuItemType, useTheme } from "@fluentui/react";
import { useSurfaceMenuProps } from "@ui";
import { IPageSizeSwitcherUiComponents, PageSizeSwitcherUiComponents } from "./components";
import { getPageSizeSwitcherUiStyles } from "./styles";

export interface IPageSizeSwitcherUiProps {
    /** Which records the page shows, e.g. "1 - 25 of 120". */
    text: string;
    pageSize: number;
    pageSizes: number[];
    /** The menu's header. */
    title: string;
    disabled?: boolean;
    onPageSizeChange: (pageSize: number) => void;
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
