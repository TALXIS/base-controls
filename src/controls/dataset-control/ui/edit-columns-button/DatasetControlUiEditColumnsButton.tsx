import { useMemo } from "react";
import { useCompact } from "@ui";
import { DatasetControlUiEditColumnsButtonComponents, IDatasetControlUiEditColumnsButtonComponents } from "./components";
import { getDatasetControlUiEditColumnsButtonStyles } from "./styles";

/** Props for the button that opens the column editor. */
export interface IDatasetControlUiEditColumnsButtonProps {
    /** The button's text. */
    text: string;
    /** Opens the editor. */
    onClick: () => void;
    disabled?: boolean;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiEditColumnsButtonComponents>;
}

/** The button that opens the column editor; only its icon, with the text as a tooltip, while compact. */
export const DatasetControlUiEditColumnsButton = (props: IDatasetControlUiEditColumnsButtonProps) => {
    const components = { ...DatasetControlUiEditColumnsButtonComponents, ...props.components };
    const styles = useMemo(() => getDatasetControlUiEditColumnsButtonStyles(), []);
    const isCompact = useCompact();
    //always wrapped, so the button is not remounted when it turns compact
    return components.onRender({
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
