import type { ILocalizationService, IServiceLocator } from "@utils";
import type { IGridServiceLocator } from "../../../services";
import type { IGridGroupingLabels } from "../labels";
import type { IGridGroupingComponents } from "../moduleComponents";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridGroupingServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceLocator;
    /** The strings this module renders. */
    labels: ILocalizationService<IGridGroupingLabels>;
    /** The parts this module renders. */
    components: IGridGroupingComponents;
}

/** Where this module's own parts find each other. */
export type IGridGroupingServiceLocator = IServiceLocator<IGridGroupingServiceMap>;
