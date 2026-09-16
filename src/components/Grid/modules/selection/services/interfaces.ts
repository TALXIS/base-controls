import type { IServiceLocator } from "@utils";
import type { IGridServiceLocator } from "../../../services";
import type { IGridSelectionComponents } from "../moduleComponents";

/** Everything this module hands around, keyed by name and typed by its contract. */
export interface IGridSelectionServiceMap {
    /** The grid's locator: the provider, the columns, the other modules. */
    gridServices: IGridServiceLocator;
    /** The parts this module renders. */
    components: IGridSelectionComponents;
}

/** Where this module's own parts find each other. */
export type IGridSelectionServiceLocator = IServiceLocator<IGridSelectionServiceMap>;
