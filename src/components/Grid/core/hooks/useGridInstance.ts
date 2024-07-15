import { useContext } from "react"
import { GridContext } from "../../GridContext";
import { Grid } from "../model/Grid";

export const useGridInstance = (): Grid => {
    return useContext(GridContext).gridInstance;
}