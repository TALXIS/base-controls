import type { IServiceLocator } from "@utils";
import type { IGridServiceLocator } from "../../../services";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridRowSelectionServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceLocator;
}

/** Where this module's own parts find each other. */
export type IGridRowSelectionServiceLocator = IServiceLocator<IGridRowSelectionServiceMap>;
