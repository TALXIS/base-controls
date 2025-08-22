import { createContext } from "react";
import {AgGridModel} from "./AgGridModel";

export const AgGridContext = createContext<AgGridModel>(null as any);