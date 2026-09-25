import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { GRID_FILTERING_LABELS, IGridFilteringLabels } from "./labels";
import { GridFiltering } from "./GridFiltering";
import { IGridFilteringServiceMap } from "./services";
import { GridFilteringComponents, IGridFilteringComponents } from "./moduleComponents";

/**
 * Builds the module that lets the grid be filtered.
 *
 * @example
 */
export interface IFilteringModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridFilteringLabels>;
    /** The parts of filtering to render differently. */
    components?: Partial<IGridFilteringComponents>;
}

export const createFilteringModule = (options?: IFilteringModuleOptions): IGridModule => ({
    onRegister: ({ services: gridServices }) => {
        const services = new ServiceLocator<IGridFilteringServiceMap>();
        const labels = new LocalizationService<IGridFilteringLabels>({ ...GRID_FILTERING_LABELS, ...options?.labels });
        const components = { ...GridFilteringComponents, ...options?.components };
        services.register('gridServices', () => gridServices);
        services.register('labels', () => labels);
        services.register('components', () => components);
        const filtering = new GridFiltering({ services });
        gridServices.register('filtering', () => filtering);
    },
});
