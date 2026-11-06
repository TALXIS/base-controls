import { createContext, useContext } from "react";
import { IGridServiceLocatorInternal } from "./runtime";
import { IGridComponents } from "./components";

export const GridServicesContext = createContext<IGridServiceLocatorInternal>(undefined as unknown as IGridServiceLocatorInternal);
GridServicesContext.displayName = 'GridServices';

export const GridComponentsContext = createContext<IGridComponents>({});
GridComponentsContext.displayName = 'GridComponents';

export const useGridComponents = () => useContext(GridComponentsContext);
