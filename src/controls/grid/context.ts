import { createContext, useContext } from "react";
import { IGridServiceLocator } from "./services";
import { IGridComponents } from "./components/components";

export const GridServicesContext = createContext<IGridServiceLocator>(undefined as unknown as IGridServiceLocator);
GridServicesContext.displayName = 'GridServices';

export const GridComponentsContext = createContext<IGridComponents>({});
GridComponentsContext.displayName = 'GridComponents';

export const useGridComponents = () => useContext(GridComponentsContext);
