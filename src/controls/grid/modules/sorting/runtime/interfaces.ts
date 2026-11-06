import type { IServiceRegistry } from "@core";
import type { IGridServiceRegistry } from "../../../runtime";
import type { IGridSortingComponents } from "../components";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridSortingServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceRegistry;
    /** The parts of what this module draws, as the caller replaced them. */
    components: IGridSortingComponents;
}

/** Where this module's own parts find each other. */
export type IGridSortingServiceRegistry = IServiceRegistry<IGridSortingServiceMap>;
