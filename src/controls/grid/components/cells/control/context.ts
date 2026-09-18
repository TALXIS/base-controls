import { createContext, useContext } from "react";
import { GridControl } from "../../../services/cells";

export const GridControlContext = createContext<GridControl | undefined>(undefined);
GridControlContext.displayName = 'GridControl';

/** What draws this cell's value, throwing where nothing is drawing one. */
export const useGridControl = (): GridControl => {
    const control = useContext(GridControlContext);
    if (!control) {
        throw new Error('This has to be drawn inside Grid.Control, which is what creates the control it draws with.');
    }
    return control;
};
