import { createContext, useContext } from "react";
import { GridField, IGridField } from "../../../services/fields";
import { GridCellRevisionContext } from "../root/context";

export const GridFieldContext = createContext<IGridField | undefined>(undefined);
GridFieldContext.displayName = 'GridField';

/** The field this component is bound to, or `undefined` where nothing bound one. */
export const useGridField = (): IGridField | undefined => {
    //what a field answers is the record's, and the record changes under whatever is drawing it
    useContext(GridCellRevisionContext);
    return useContext(GridFieldContext);
};

