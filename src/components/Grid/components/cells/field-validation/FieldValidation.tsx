import { useRequiredGridField } from "../field/context";
import { useGridService } from "../../../useGridService";
import { FieldValidationComponents, IGridFieldValidationComponents } from "./components";

export interface IGridFieldValidationProps {
    components?: Partial<IGridFieldValidationComponents>;
}

/**
 * What a cell says about a value its record refuses, and what tells it to say it.
 *
 * Requires a field, and draws nothing while that field is valid. Answers on every render, which is what
 * `Grid.CellRoot` redrawing the cell on a change to its record is for: a new value, or the save that judged
 * it, is what changes the answer.
 */
export const FieldValidation = (props: IGridFieldValidationProps) => {
    const field = useRequiredGridField();
    const gridTheme = useGridService('theme');
    const components = { ...FieldValidationComponents, ...props.components };

    const { error, errorMessage } = field.isValid();
    if (!error) {
        return null;
    }
    return components.onRenderFieldError({ message: errorMessage, surfaceTheme: gridTheme });
};
