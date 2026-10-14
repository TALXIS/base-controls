import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { IQuickFindCompactButtonComponents, QuickFindCompactButtonComponents } from "./components";
import { getQuickFindCompactButtonStyles } from "./styles";

/** Props for the button the quick find draws while it is compact. */
export interface IQuickFindCompactButtonProps {
    /** The button's tooltip and accessible name. */
    text: string;
    /** Whether the field holds a query, which the button marks with a dot. */
    hasValue?: boolean;
    /** Disables the button. */
    disabled?: boolean;
    /** Expands the search field. */
    onClick: () => void;
    /** Replacements for its slots. */
    components?: Partial<IQuickFindCompactButtonComponents>;
}

/** A search icon button that stands in for the quick find while it is compact. */
export const QuickFindCompactButton = (props: IQuickFindCompactButtonProps) => {
    const components = { ...QuickFindCompactButtonComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getQuickFindCompactButtonStyles(theme), [theme]);
    return components.onRenderButton({
        className: props.hasValue ? styles.hasValue : undefined,
        iconProps: { iconName: 'Search' },
        title: props.text,
        ariaLabel: props.text,
        disabled: props.disabled,
        onClick: props.onClick,
    });
};
