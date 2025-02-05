import { createContext } from "react";
import { AgGrid } from "./model/AgGrid";

export const AgGridContext = createContext<AgGrid>(null as any);