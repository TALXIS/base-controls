import { useContext } from "react"
import { GridModel } from "./GridModel";
import { GridContext } from "./GridContext";

export const useGridInstance = (): GridModel => {
    return useContext(GridContext);
}