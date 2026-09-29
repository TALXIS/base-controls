import { createContext, useContext } from "react";
import { IGridField } from "../../../services/fields";
import { GridCellRevisionContext } from "../root/context";

export const GridFieldContext = createContext<IGridField | undefined>(undefined);
GridFieldContext.displayName = 'GridField';

/** The field this component is bound to, or `undefined` where nothing bound one. */
export const useGridField = (): IGridField | undefined => {
    //a field's answers change with the record
    useContext(GridCellRevisionContext);
    return useContext(GridFieldContext);
};

