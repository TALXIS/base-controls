import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule } from "../../interfaces";
import { GRID_SORTING_LABELS, IGridSortingLabels } from "./labels";
import { IGridSortingComponents } from "./moduleComponents";
import { GridSorting } from "./GridSorting";
import { IGridSortingServiceMap } from "./services";

export interface ISortingModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridSortingLabels>;
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridSortingComponents;
}

export interface ISortingModule extends IGridModule<'sorting'> { }

/** Builds the module that lets the grid be sorted. */
export const createSortingModule = (options?: ISortingModuleOptions): ISortingModule => ({
    name: 'sorting',
    onLoad: ({ services: gridServices }) => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridSortingServiceMap>();
        //built once, then registered: a resolver runs on every lookup
        const labels = new LocalizationService<IGridSortingLabels>({ ...GRID_SORTING_LABELS, ...options?.labels });
        services.register('gridServices', () => gridServices);
        services.register('labels', () => labels);
        services.register('components', () => options?.components ?? {});
        return new GridSorting({ services });
    },
});
