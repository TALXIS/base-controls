import { IGridModule } from "../../interfaces";
import { AgGridStyleIsolation } from "./AgGridStyleIsolation";

/** Builds the module that keeps other grids' AG Grid styles, such as the Power Apps grid's, off this one. */
export const createAgGridStyleIsolationModule = (): IGridModule => ({
    onRegister: grid => grid.events.addEventListener('onDestroyed', AgGridStyleIsolation.start()),
});
