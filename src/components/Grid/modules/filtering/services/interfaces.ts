import type { ILocalizationService, IServiceLocator } from "@utils";
import type { IGridServiceLocator } from "../../../services";
import type { IGridFilteringLabels } from "../labels";
import type { IGridFilteringComponents } from "../moduleComponents";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridFilteringServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceLocator;
    /** The strings this module renders. */
    labels: ILocalizationService<IGridFilteringLabels>;
    /** The parts this module renders. */
    components: IGridFilteringComponents;
}

/** Where this module's own parts find each other. */
export type IGridFilteringServiceLocator = IServiceLocator<IGridFilteringServiceMap>;
