import { CellHost } from "./components/cell-host";
import { GridRoot } from "./Grid";

/** Everything a grid is rendered from. */
export interface IGridNamespace {
    /** The grid itself. */
    Root: typeof GridRoot;
    /** The cell every part of a grid is drawn inside. */
    Cell: typeof CellHost;
}

export const Grid: IGridNamespace = {
    Root: GridRoot,
    Cell: CellHost,
};
