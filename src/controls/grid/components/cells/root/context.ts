import { createContext, useContext } from "react";
import { IGridCell } from "../../../services/cells";

export const GridCellContext = createContext<IGridCell | undefined>(undefined);
GridCellContext.displayName = 'GridCell';

/** A new symbol each time `CellRoot` hears the record change, and nothing more. */
export const GridCellRevisionContext = createContext<symbol>(Symbol('cellRevision'));
GridCellRevisionContext.displayName = 'GridCellRevision';

/** The cell this component is drawing. */
export const useGridCell = (): IGridCell => {
    const cell = useContext(GridCellContext);
    useContext(GridCellRevisionContext);
    if (!cell) {
        throw new Error('This has to be drawn inside Grid.Cell.Root, which is what creates the cell it belongs to.');
    }
    return cell;
};
