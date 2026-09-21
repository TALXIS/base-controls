import { useGridField } from "../field/context";
import { CellValidationComponents, ICellValidationComponents } from "./components";

export interface ICellValidationProps {
    children?: React.ReactNode;
    components?: Partial<ICellValidationComponents>;
}

/** What a cell says about a value its record refuses, around what draws that value. */
export const CellValidation = (props: ICellValidationProps) => {
    const field = useGridField();
    const components = { ...CellValidationComponents, ...props.components };

    const { error, errorMessage } = field?.isValid() ?? { error: false, errorMessage: '' };
    return components.onRenderFieldError({ message: error ? errorMessage : undefined, children: props.children });
};
