import { useMemo } from "react";
import { IGridRowSelectionState } from "../../../GridRowSelection";
import { IRowSelectionUiHeaderCheckboxComponents, RowSelectionUiHeaderCheckboxComponents } from "./components";
import { getRowSelectionUiHeaderCheckboxStyles } from "./styles";

export interface IRowSelectionUiHeaderCheckboxProps {
    state: IGridRowSelectionState;
    isCheckboxVisible: boolean;
    onChange: (checked: boolean) => void;
    components?: Partial<IRowSelectionUiHeaderCheckboxComponents>;
}

/** The checkbox that selects every row, and clears them. */
export const RowSelectionUiHeaderCheckbox = (props: IRowSelectionUiHeaderCheckboxProps) => {
    const styles = useMemo(() => getRowSelectionUiHeaderCheckboxStyles(), []);
    const components = { ...RowSelectionUiHeaderCheckboxComponents, ...props.components };

    return components.onRenderContainer({
        className: styles.container,
        children: props.isCheckboxVisible && components.onRenderCheckbox({
            checked: props.state === 'checked',
            indeterminate: props.state === 'indeterminate',
            styles: { checkbox: styles.checkbox },
            onChange: (event, checked) => props.onChange(!!checked),
        }),
    });
};
