import type { ILocalizationService, IServiceLocator } from "@utils";
import type { IGridServiceLocator } from "../../../services";
import type { IGridSortingLabels } from "../labels";
import type { IGridSortingComponents } from "../moduleComponents";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridSortingServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceLocator;
    /** The strings this module renders. */
    labels: ILocalizationService<IGridSortingLabels>;
    /** The parts this module renders. */
    components: IGridSortingComponents;
}

/** Where this module's own parts find each other. */
export type IGridSortingServiceLocator = IServiceLocator<IGridSortingServiceMap>;
