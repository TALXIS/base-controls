import { useTheme } from "@theme";
import { useMemo } from "react";

import { IDatasetControlUiQuickFindCompactButtonComponents, DatasetControlUiQuickFindCompactButtonComponents } from "./components";
import { getDatasetControlUiQuickFindCompactButtonStyles } from "./styles";

/** Props for the button the quick find draws while it is compact. */
export interface IDatasetControlUiQuickFindCompactButtonProps {
    /** The button's tooltip and accessible name. */
    text: string;
    /** Whether the field holds a query, which the button marks with a dot. */
    hasValue?: boolean;
    /** Disables the button. */
    disabled?: boolean;
    /** Expands the search field. */
    onClick: () => void;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiQuickFindCompactButtonComponents>;
}

/** A search icon button that stands in for the quick find while it is compact. */
export const DatasetControlUiQuickFindCompactButton = (props: IDatasetControlUiQuickFindCompactButtonProps) => {
    const components = { ...DatasetControlUiQuickFindCompactButtonComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getDatasetControlUiQuickFindCompactButtonStyles(theme), [theme]);
    return components.onRenderButton({
        className: props.hasValue ? styles.hasValue : undefined,
        iconProps: { iconName: 'Search' },
        title: props.text,
        ariaLabel: props.text,
        disabled: props.disabled,
        onClick: props.onClick,
    });
};
