import { createContext, useContext } from "react";
import { IGridInternalServiceLocator } from "./runtime";
import { IGridComponents } from "./components";

export const GridServicesContext = createContext<IGridInternalServiceLocator>(undefined as unknown as IGridInternalServiceLocator);
GridServicesContext.displayName = 'GridServices';

export const GridComponentsContext = createContext<IGridComponents>({});
GridComponentsContext.displayName = 'GridComponents';

export const useGridComponents = () => useContext(GridComponentsContext);
