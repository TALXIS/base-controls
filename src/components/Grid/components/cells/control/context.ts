import { createContext, useContext } from "react";
import { GridFieldControl } from "../../../services/cells";

export const GridFieldControlContext = createContext<GridFieldControl | undefined>(undefined);
GridFieldControlContext.displayName = 'GridFieldControl';

/** What draws this cell's value, throwing where nothing is drawing one. */
export const useGridFieldControl = (): GridFieldControl => {
    const control = useContext(GridFieldControlContext);
    if (!control) {
        throw new Error('This has to be drawn inside Grid.FieldControl, which is what creates the control it draws with.');
    }
    return control;
};
