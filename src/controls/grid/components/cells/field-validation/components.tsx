import { CellUi, ICellUiFieldErrorProps } from "../ui";

/** The replaceable pieces of what a cell says about an invalid value. */
export interface ICellValidationComponents {
    /** What marks the cell and carries the reason. `CellUi.FieldError` is what draws it by default. */
    onRenderFieldError: (props: ICellUiFieldErrorProps) => JSX.Element;
}

/** The defaults for {@link ICellValidationComponents}. */
export const CellValidationComponents: ICellValidationComponents = {
    onRenderFieldError: props => <CellUi.FieldError {...props} />,
};
