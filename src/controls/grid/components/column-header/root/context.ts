import { createContext, useContext } from "react";
import { GridColumnHeader } from "../../../services/column-header";

export const GridColumnHeaderContext = createContext<GridColumnHeader | undefined>(undefined);
GridColumnHeaderContext.displayName = 'GridColumnHeader';

/** The header this component is drawing. */
export const useGridColumnHeader = (): GridColumnHeader => {
    const header = useContext(GridColumnHeaderContext);
    if (!header) {
        throw new Error('This has to be drawn inside Grid.ColumnHeaderRoot, which is what creates the header it belongs to.');
    }
    return header;
};
