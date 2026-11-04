import { createContext } from "react";
import { IGridControl } from "../../../runtime/cells";

export const GridControlContext = createContext<IGridControl | undefined>(undefined);
GridControlContext.displayName = 'GridControl';

