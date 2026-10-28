import { IGridModule } from "../../interfaces";
import { AgGridStyleIsolation } from "./AgGridStyleIsolation";

export interface IAgGridStyleIsolationModule extends IGridModule<'agGridStyleIsolation'> { }

declare module "../../interfaces" {
    interface IGridModuleMap {
        /** Keeps other grids' AG Grid styles off this one. */
        agGridStyleIsolation: AgGridStyleIsolation;
    }
}

/** Builds the module that keeps other grids' AG Grid styles, such as the Power Apps grid's, off this one. */
export const createAgGridStyleIsolationModule = (): IAgGridStyleIsolationModule => ({
    name: 'agGridStyleIsolation',
    onLoad: () => new AgGridStyleIsolation(),
    onDestroy: isolation => isolation.destroy(),
});
