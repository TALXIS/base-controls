import { useMemo, useState } from "react";
import { getClassNames } from "@core";
import { useTheme } from "@theme";
import { ChecklistUiCompletionCheckboxComponents, IChecklistUiCompletionCheckboxComponents } from "./components";
import { CHECK_HOST_CLASS, getChecklistUiCompletionCheckboxStyles } from "./styles";

export interface IChecklistUiCompletionCheckboxProps {
    isChecked: boolean;
    /** Its accessible name and tooltip. */
    label: string;
    onToggle: () => void;
    disabled?: boolean;
    components?: Partial<IChecklistUiCompletionCheckboxComponents>;
}

/** The round check an item is ticked off with, as Fluent draws a selection check. */
export const ChecklistUiCompletionCheckbox = (props: IChecklistUiCompletionCheckboxProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getChecklistUiCompletionCheckboxStyles(theme), [theme]);
    const components = { ...ChecklistUiCompletionCheckboxComponents, ...props.components };
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
        disabled: props.disabled,
        className: getClassNames([styles.root, CHECK_HOST_CLASS]),
        onClick,
        children: components.onRenderCheck({ checked: props.isChecked, className: props.isChecked && isPopping ? styles.popped : undefined }),
    });
};
