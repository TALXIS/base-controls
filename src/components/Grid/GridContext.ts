import { createContext } from "react";
import { IGridContext } from "./core/interfaces/IGridContext";

export const GridContext = createContext<IGridContext>(null as any);