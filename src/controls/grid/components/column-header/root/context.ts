import { createContext, useContext } from "react";
import { GridColumnHeader, IGridColumnHeader } from "../../../services/column-header";

export const GridColumnHeaderContext = createContext<IGridColumnHeader | undefined>(undefined);
GridColumnHeaderContext.displayName = 'GridColumnHeader';

/** The header this component is drawing. */
export const useGridColumnHeader = (): IGridColumnHeader => {
    const header = useContext(GridColumnHeaderContext);
    if (!header) {
        throw new Error('This has to be drawn inside Grid.ColumnHeader.Root, which is what creates the header it belongs to.');
    }
    return header;
};
