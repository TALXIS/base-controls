import { useGridCell } from "../root/context";
import { CellUi, ICellUiControlComponents } from "../ui";

export interface ICellControlProps {
    components?: Partial<ICellUiControlComponents>;
    children?: React.ReactNode;
}

/** The room a cell's value is drawn in, between the cell's edges and its commands, error and lock. */
export const CellControl = (props: ICellControlProps) => {
    const cell = useGridCell();

    return <CellUi.Control alignment={cell.getAlignment()} components={props.components}>{props.children}</CellUi.Control>;
};
