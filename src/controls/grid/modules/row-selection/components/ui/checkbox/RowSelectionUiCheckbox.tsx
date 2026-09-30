import { useMemo } from "react";
import { IGridRowSelectionState } from "../../../GridRowSelection";
import { IRowSelectionUiCheckboxComponents, RowSelectionUiCheckboxComponents } from "./components";
import { getRowSelectionUiCheckboxStyles } from "./styles";

export interface IRowSelectionUiCheckboxProps {
    state: IGridRowSelectionState;
    disabled?: boolean;
    onToggle: () => void;
    components?: Partial<IRowSelectionUiCheckboxComponents>;
}

/** A row's checkbox. */
export const RowSelectionUiCheckbox = (props: IRowSelectionUiCheckboxProps) => {
    const styles = useMemo(() => getRowSelectionUiCheckboxStyles(), []);
    const components = { ...RowSelectionUiCheckboxComponents, ...props.components };

    //the label activates the checkbox it wraps, toggling the record back off
    const onClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!props.disabled) {
            props.onToggle();
        }
    };

    return components.onRenderContainer({
        className: styles.container,
        onClick: onClick,
        children: components.onRenderCheckbox({
            checked: props.state === 'checked',
            indeterminate: props.state === 'indeterminate',
            disabled: props.disabled,
            styles: { checkbox: styles.checkbox },
        }),
    });
};
