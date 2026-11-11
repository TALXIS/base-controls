import { Checkbox, ICheckboxProps } from "@fluentui/react";

/** The replaceable pieces of a row's checkbox. */
export interface IRowSelectionUiCheckboxComponents {
    /** What the checkbox is drawn in, and what takes the click. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderCheckbox: (props: ICheckboxProps) => JSX.Element | null;
}

/** The defaults for {@link IRowSelectionUiCheckboxComponents}. */
export const RowSelectionUiCheckboxComponents: IRowSelectionUiCheckboxComponents = {
    onRender: props => <div {...props} />,
    onRenderCheckbox: props => <Checkbox {...props} />,
};
