import { Checkbox, ICheckboxProps } from "@fluentui/react";

/** The replaceable pieces of a row's checkbox. */
export interface IRowSelectionUiCheckboxComponents {
    /** What the checkbox is drawn in, and what takes the click. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    onRenderCheckbox: (props: ICheckboxProps) => JSX.Element;
}

/** The defaults for {@link IRowSelectionUiCheckboxComponents}. */
export const RowSelectionUiCheckboxComponents: IRowSelectionUiCheckboxComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderCheckbox: props => <Checkbox {...props} />,
};
