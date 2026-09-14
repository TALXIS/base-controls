import { CellUi, IFieldErrorProps } from "../ui";

/** The replaceable pieces of what a cell says about an invalid value. */
export interface IGridFieldValidationComponents {
    /** What marks the cell and carries the reason. Called only while the field is invalid. */
    onRenderFieldError: (props: IFieldErrorProps) => JSX.Element;
}

/** The defaults for {@link IGridFieldValidationComponents}. */
export const FieldValidationComponents: IGridFieldValidationComponents = {
    onRenderFieldError: props => <CellUi.FieldError {...props} />,
};
