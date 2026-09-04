import type { ILocalizationService, IServiceLocator } from "@utils";
import type { IGridServiceLocator } from "../../../services";
import type { IGridAggregationLabels } from "../labels";

/**
 * Everything this module hands around, keyed by name and typed by its contract.
 *
 * Nothing of the grid's belongs here — the grid's own locator is the one entry that crosses over, under
 * `gridServices`.
 */
export interface IGridAggregationServiceMap {
    /**
     * The grid's locator: the provider, the columns, the other modules. The seam between the two maps —
     * what this module holds and what the grid holds stay separate, and this is how you cross.
     */
    gridServices: IGridServiceLocator;
    /** The strings this module renders. */
    labels: ILocalizationService<IGridAggregationLabels>;
}

/** Where this module's own parts find each other. */
export type IGridAggregationServiceLocator = IServiceLocator<IGridAggregationServiceMap>;
