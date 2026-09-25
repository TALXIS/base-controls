import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { GRID_SORTING_LABELS, IGridSortingLabels } from "./labels";
import { GridSortingComponents, IGridSortingComponents } from "./moduleComponents";
import { GridSorting } from "./GridSorting";
import { IGridSortingServiceMap } from "./services";

/**
 * Builds the module that lets the grid be sorted.
 *
 * @example
 */
export interface ISortingModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridSortingLabels>;
    /** The parts of this module to render differently. */
    components?: Partial<IGridSortingComponents>;
}

export const createSortingModule = (options?: ISortingModuleOptions): IGridModule => ({
    onRegister: ({ services: gridServices }) => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridSortingServiceMap>();
        //built once, then registered: a resolver runs on every lookup
        const labels = new LocalizationService<IGridSortingLabels>({ ...GRID_SORTING_LABELS, ...options?.labels });
        const components = { ...GridSortingComponents, ...options?.components };
        services.register('gridServices', () => gridServices);
        services.register('labels', () => labels);
        services.register('components', () => components);
        const sorting = new GridSorting({ services });
        gridServices.register('sorting', () => sorting);
    },
});
