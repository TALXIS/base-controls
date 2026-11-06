import { useMemo } from "react";
import { ContextualMenuItemType } from "@fluentui/react";
import { useAppTheme } from "@theme";
import { useSurfaceMenuProps } from "@ui";
import { IDatasetControlUiPageSizeSwitcherComponents, DatasetControlUiPageSizeSwitcherComponents } from "./components";
import { getDatasetControlUiPageSizeSwitcherStyles } from "./styles";

/** Props for the page size switcher, as plain UI. */
export interface IDatasetControlUiPageSizeSwitcherProps {
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
    components?: Partial<IDatasetControlUiPageSizeSwitcherComponents>;
}

/** The record range of the page, opening a menu of page sizes. */
export const DatasetControlUiPageSizeSwitcher = (props: IDatasetControlUiPageSizeSwitcherProps) => {
    const components = { ...DatasetControlUiPageSizeSwitcherComponents, ...props.components };
    const appTheme = useAppTheme();
    const styles = useMemo(() => getDatasetControlUiPageSizeSwitcherStyles(appTheme), [appTheme]);
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
