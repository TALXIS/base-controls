import { useMemo } from "react";
import { useCompact } from "@utils";
import { EditColumnsButtonUiComponents, IEditColumnsButtonUiComponents } from "./components";
import { getEditColumnsButtonUiStyles } from "./styles";

/** Props for the button that opens the column editor. */
export interface IEditColumnsButtonUiProps {
    /** The button's text. */
    text: string;
    /** Opens the editor. */
    onClick: () => void;
    disabled?: boolean;
    /** Replacements for its slots. */
    components?: Partial<IEditColumnsButtonUiComponents>;
}

/** The button that opens the column editor; only its icon, with the text as a tooltip, while compact. */
export const EditColumnsButton = (props: IEditColumnsButtonUiProps) => {
    const components = { ...EditColumnsButtonUiComponents, ...props.components };
    const styles = useMemo(() => getEditColumnsButtonUiStyles(), []);
    const isCompact = useCompact();
    //always wrapped, so the button is not remounted when it turns compact
    return components.onRenderTooltip({
        content: isCompact ? props.text : undefined,
        setAriaDescribedBy: false,
        hostClassName: styles.tooltipHost,
        children: components.onRenderButton({
            className: styles.editColumnsButton,
            text: isCompact ? undefined : props.text,
            ariaLabel: props.text,
            iconProps: { iconName: 'ColumnOptions' },
            onClick: props.onClick,
            disabled: props.disabled,
        }),
    });
};
