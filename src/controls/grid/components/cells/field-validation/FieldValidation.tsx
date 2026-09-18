import { useGridField } from "../field/context";
import { useGridService } from "../../../useGridService";
import { FieldValidationComponents, IGridFieldValidationComponents } from "./components";

export interface IGridFieldValidationProps {
    components?: Partial<IGridFieldValidationComponents>;
}

/** What a cell says about a value its record refuses. */
export const FieldValidation = (props: IGridFieldValidationProps) => {
    const field = useGridField();
    const components = { ...FieldValidationComponents, ...props.components };

    const { error, errorMessage } = field?.isValid() ?? { error: false, errorMessage: '' };
    if (!error) {
        return null;
    }
    return components.onRenderFieldError({ message: errorMessage });
};
