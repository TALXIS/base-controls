import { Cell } from "./components/cell-host/CellHost";
import { GridRoot } from "./Grid";

/** Everything a grid is rendered from. */
export interface IGridNamespace {
    /** The grid itself. */
    Root: typeof GridRoot;
    /** The cell every part of a grid is drawn inside, and its commands. */
    Cell: typeof Cell;
}

export const Grid: IGridNamespace = {
    Root: GridRoot,
    Cell: Cell,
};
