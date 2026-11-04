import type { IServiceRegistry } from "@core";
import type { IGridServiceLocator } from "../../../runtime";
import type { IGridFilteringComponents } from "../components";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridFilteringServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceLocator;
    /** The parts of what this module draws, as the caller replaced them. */
    components: IGridFilteringComponents;
}

/** Where this module's own parts find each other. */
export type IGridFilteringServiceLocator = IServiceRegistry<IGridFilteringServiceMap>;
