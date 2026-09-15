import { createContext, useContext } from "react";
import { GridCell } from "../../../services/cells";

export const GridCellContext = createContext<GridCell | undefined>(undefined);
GridCellContext.displayName = 'GridCell';

/**
 * A new symbol each time `CellRoot` hears the record change, and nothing more.
 *
 * A cell's pieces are the children a caller composed, so a render of the root leaves their elements as
 * they were and React draws none of them again. Reading this is what puts a piece on the list instead -
 * which is why every hook that reaches a cell or its field reads it, and why nothing reads the value.
 */
export const GridCellRevisionContext = createContext<symbol>(Symbol('cellRevision'));
GridCellRevisionContext.displayName = 'GridCellRevision';

/**
 * The cell this component is drawing.
 *
 * Throws outside a `CellRoot`, which is the point: a cell the grid does not know about is one no module
 * can reach, so everything that draws a cell renders inside one.
 */
export const useGridCell = (): GridCell => {
    const cell = useContext(GridCellContext);
    useContext(GridCellRevisionContext);
    if (!cell) {
        throw new Error('This has to be drawn inside Grid.CellRoot, which is what creates the cell it belongs to.');
    }
    return cell;
};
