import type { IServiceRegistry } from "@core";
import type { IGridServiceRegistry } from "../../../runtime";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridRowSelectionServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceRegistry;
}

/** Where this module's own parts find each other. */
export type IGridRowSelectionServiceRegistry = IServiceRegistry<IGridRowSelectionServiceMap>;
