import { useContext } from "react"
import { AgGridModel } from "./AgGridModel";
import { AgGridContext } from "./AgGridContext";

export const useAgGridInstance = (): AgGridModel => {
    return useContext(AgGridContext);
}