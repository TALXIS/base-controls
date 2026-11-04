import { useMemo, useState } from "react";
import { getClassNames } from "@core";
import { useTheme } from "@theme";
import { CompletionCheckboxUiComponents, ICompletionCheckboxUiComponents } from "./components";
import { CHECK_HOST_CLASS_NAME, getCompletionCheckboxStyles } from "./styles";

export interface ICompletionCheckboxUiProps {
    isChecked: boolean;
    /** Its accessible name and tooltip. */
    label: string;
    onToggle: () => void;
    isDisabled?: boolean;
    components?: Partial<ICompletionCheckboxUiComponents>;
}

/** The round check an item is ticked off with, as Fluent draws a selection check. */
export const CompletionCheckboxUi = (props: ICompletionCheckboxUiProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getCompletionCheckboxStyles(theme), [theme]);
    const components = { ...CompletionCheckboxUiComponents, ...props.components };
    //only a tick the user just made pops, not one a redrawn row already had
    const [isPopping, setIsPopping] = useState(false);

    const onClick = () => {
        setIsPopping(!props.isChecked);
        props.onToggle();
    };

    return components.onRenderButton({
        type: 'button',
        role: 'checkbox',
        'aria-checked': props.isChecked,
        'aria-label': props.label,
        title: props.label,
        disabled: props.isDisabled,
        className: getClassNames([styles.root, CHECK_HOST_CLASS_NAME]),
        onClick,
        children: components.onRenderCheck({ checked: props.isChecked, className: props.isChecked && isPopping ? styles.popped : undefined }),
    });
};
