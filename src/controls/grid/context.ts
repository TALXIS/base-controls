import { createContext, useContext } from "react";
import { IGridInternalServiceLocator } from "./services";
import { IGridComponents } from "./components/components";

export const GridServicesContext = createContext<IGridInternalServiceLocator>(undefined as unknown as IGridInternalServiceLocator);
GridServicesContext.displayName = 'GridServices';

export const GridComponentsContext = createContext<IGridComponents>({});
GridComponentsContext.displayName = 'GridComponents';

export const useGridComponents = () => useContext(GridComponentsContext);
