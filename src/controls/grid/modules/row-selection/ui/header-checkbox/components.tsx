import { Checkbox, ICheckboxProps } from "@fluentui/react";

/** The replaceable pieces of the checkbox that selects every row. */
export interface IRowSelectionUiHeaderCheckboxComponents {
    /** What the checkbox is drawn in, drawn even while the checkbox is not. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderCheckbox: (props: ICheckboxProps) => JSX.Element | null;
}

/** The defaults for {@link IRowSelectionUiHeaderCheckboxComponents}. */
export const RowSelectionUiHeaderCheckboxComponents: IRowSelectionUiHeaderCheckboxComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderCheckbox: props => <Checkbox {...props} />,
};
