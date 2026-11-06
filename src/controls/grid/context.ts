import { createContext, useContext } from "react";
import { IGridServiceRegistryInternal } from "./runtime";
import { IGridComponents } from "./components";

export const GridServicesContext = createContext<IGridServiceRegistryInternal>(undefined as unknown as IGridServiceRegistryInternal);
GridServicesContext.displayName = 'GridServices';

export const GridComponentsContext = createContext<IGridComponents>({});
GridComponentsContext.displayName = 'GridComponents';

export const useGridComponents = () => useContext(GridComponentsContext);
