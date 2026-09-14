import { createContext, useContext } from "react";

const CellContainerContext = createContext<boolean>(false);
CellContainerContext.displayName = 'GridCellContainer';

export const CellContainerProvider = CellContainerContext.Provider;

/**
 * Whether this is drawn inside a cell's container.
 *
 * What a piece of a cell asks to know it is in the right place: the content of a cell goes inside the
 * container, and whatever wraps the cell - the row-resize grip - goes around it.
 */
export const useIsInsideCellContainer = (): boolean => {
    return useContext(CellContainerContext);
};
