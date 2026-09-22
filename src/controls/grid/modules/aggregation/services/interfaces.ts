import type { ILocalizationService, IServiceLocator } from "@utils";
import type { IGridServiceLocator } from "../../../services";
import type { IGridAggregationLabels } from "../labels";
import type { IGridAggregationComponents } from "../moduleComponents";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridAggregationServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceLocator;
    /** The strings this module renders. */
    labels: ILocalizationService<IGridAggregationLabels>;
    /** The parts this module renders, merged with whatever the caller replaced. */
    components: IGridAggregationComponents;
}

/** Where this module's own parts find each other. */
export type IGridAggregationServiceLocator = IServiceLocator<IGridAggregationServiceMap>;
