import { createContext } from "react";
import { IGridServiceLocator } from "../services";

export const GridServicesContext = createContext<IGridServiceLocator>(undefined as unknown as IGridServiceLocator);
GridServicesContext.displayName = 'GridServices';
