import { createContext, useContext } from "react";
import { GridCell } from "../../services/cells";

export const GridCellContext = createContext<GridCell | undefined>(undefined);
GridCellContext.displayName = 'GridCell';

/**
 * The cell this component is drawing.
 *
 * Throws outside a `CellHost`, which is the point: a cell the grid does not know about is one no module
 * can reach, so everything that draws a cell renders through the host.
 */
export const useGridCell = (): GridCell => {
    const cell = useContext(GridCellContext);
    if (!cell) {
        throw new Error('This has to be rendered inside a CellHost, which is what creates the cell it belongs to.');
    }
    return cell;
};
