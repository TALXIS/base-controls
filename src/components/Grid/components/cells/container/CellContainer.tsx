import { CellUi } from "../ui";
import { useGridCell } from "../root/context";
import { CellContainerProvider } from "./context";

export interface IGridCellContainerProps {
    children?: React.ReactNode;
}

/**
 * The element a cell's content is drawn in, and the surface it is drawn on.
 *
 * Reads the cell it belongs to, so it has to be inside a `Grid.CellRoot`. What sits between the two is
 * whatever wraps the cell's content rather than being part of it - the row-resize grip is the one the
 * grid brings.
 */
export const CellContainer = (props: IGridCellContainerProps) => {
    //asked for rather than used: a container drawn outside a cell root is drawing a cell the grid knows
    //nothing about, and this is what says so
    useGridCell();

    //what is inside a cell and what wraps one are not interchangeable, and this is how the pieces tell
    return <CellContainerProvider value={true}>
        <CellUi.Container>{props.children}</CellUi.Container>
    </CellContainerProvider>;
};
