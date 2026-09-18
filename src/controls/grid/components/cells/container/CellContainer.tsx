import { CellUi } from "../ui";
import { useGridCell } from "../root/context";
import { CellContainerProvider } from "./context";

export interface IGridCellContainerProps {
    children?: React.ReactNode;
}

/** The element a cell's content is drawn in, and the surface it is drawn on. */
export const CellContainer = (props: IGridCellContainerProps) => {
    //asked for rather than used: it throws outside a cell root
    useGridCell();

    //what is inside a cell and what wraps one are not interchangeable
    return <CellContainerProvider value={true}>
        <CellUi.Container>{props.children}</CellUi.Container>
    </CellContainerProvider>;
};
