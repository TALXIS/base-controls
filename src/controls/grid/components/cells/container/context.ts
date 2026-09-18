import { createContext, useContext } from "react";

const CellContainerContext = createContext<boolean>(false);
CellContainerContext.displayName = 'GridCellContainer';

export const CellContainerProvider = CellContainerContext.Provider;

/** Whether this is drawn inside a cell's container. */
export const useIsInsideCellContainer = (): boolean => {
    return useContext(CellContainerContext);
};
