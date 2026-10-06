import { createContext } from "react";
import { IGridControl } from "../../../services/cells";

export const GridControlContext = createContext<IGridControl | undefined>(undefined);
GridControlContext.displayName = 'GridControl';

