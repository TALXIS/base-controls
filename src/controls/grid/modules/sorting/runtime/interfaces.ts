import type { IServiceLocator } from "@core";
import type { IGridServiceLocator } from "../../../runtime";
import type { IGridSortingComponents } from "../components";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridSortingServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceLocator;
    /** The parts of what this module draws, as the caller replaced them. */
    components: IGridSortingComponents;
}

/** Where this module's own parts find each other. */
export type IGridSortingServiceLocator = IServiceLocator<IGridSortingServiceMap>;
