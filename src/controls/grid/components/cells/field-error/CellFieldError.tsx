import { useGridField } from "../field/context";
import { useGridCell } from "../root/context";
import { CellValidationComponents, ICellValidationComponents } from "./components";

export interface ICellValidationProps {
    components?: Partial<ICellValidationComponents>;
}

/** What a cell says about a value its record refuses. */
export const CellValidation = (props: ICellValidationProps) => {
    const field = useGridField();
    const cell = useGridCell();
    const components = { ...CellValidationComponents, ...props.components };

    const { error, errorMessage } = field?.isValid() ?? { error: false, errorMessage: '' };
    return components.onRenderFieldError({ message: error ? errorMessage : undefined, alignment: cell.getAlignment() });
};
