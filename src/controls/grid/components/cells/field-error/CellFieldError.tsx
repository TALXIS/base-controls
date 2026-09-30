import { CellUi, ICellUiFieldErrorComponents } from "../ui";
import { useGridField } from "../field/context";
import { useGridCell } from "../root/context";

export interface ICellFieldErrorProps {
    components?: Partial<ICellUiFieldErrorComponents>;
}

/** What a cell says about a value its record refuses. */
export const CellFieldError = (props: ICellFieldErrorProps) => {
    const field = useGridField();
    const cell = useGridCell();

    const { error, errorMessage } = field?.isValid() ?? { error: false, errorMessage: '' };
    return <CellUi.FieldError message={error ? errorMessage : undefined} alignment={cell.getAlignment()} components={props.components} />;
};
