import { createContext, useContext } from "react";
import { IGridColumnHeader } from "../../../services/column-header";

export const GridColumnHeaderContext = createContext<IGridColumnHeader | undefined>(undefined);
GridColumnHeaderContext.displayName = 'GridColumnHeader';

/** A new symbol each time `ColumnHeaderRoot` is asked to draw the header again, and nothing more. */
export const GridColumnHeaderRevisionContext = createContext<symbol>(Symbol('columnHeaderRevision'));
GridColumnHeaderRevisionContext.displayName = 'GridColumnHeaderRevision';

/** The header this component is drawing. */
export const useGridColumnHeader = (): IGridColumnHeader => {
    const header = useContext(GridColumnHeaderContext);
    useContext(GridColumnHeaderRevisionContext);
    if (!header) {
        throw new Error('This has to be drawn inside Grid.ColumnHeader.Root, which is what creates the header it belongs to.');
    }
    return header;
};
