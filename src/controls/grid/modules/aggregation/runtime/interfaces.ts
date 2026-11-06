import type { IServiceRegistry } from "@core";
import type { IGridServiceRegistry } from "../../../runtime";
import type { IGridAggregationComponents } from "../components";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridAggregationServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceRegistry;
    /** The parts of what this module draws, as the caller replaced them. */
    components: IGridAggregationComponents;
}

/** Where this module's own parts find each other. */
export type IGridAggregationServiceRegistry = IServiceRegistry<IGridAggregationServiceMap>;
