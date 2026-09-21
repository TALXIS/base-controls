import { useGridField } from "../field/context";
import { FieldValidationComponents, IGridFieldValidationComponents } from "./components";

export interface IGridFieldValidationProps {
    children?: React.ReactNode;
    components?: Partial<IGridFieldValidationComponents>;
}

/** What a cell says about a value its record refuses, around what draws that value. */
export const FieldValidation = (props: IGridFieldValidationProps) => {
    const field = useGridField();
    const components = { ...FieldValidationComponents, ...props.components };

    const { error, errorMessage } = field?.isValid() ?? { error: false, errorMessage: '' };
    return components.onRenderFieldError({ message: error ? errorMessage : undefined, children: props.children });
};
