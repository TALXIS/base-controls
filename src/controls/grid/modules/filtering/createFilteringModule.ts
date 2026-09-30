import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { GRID_FILTERING_LABELS, IGridFilteringLabels } from "./labels";
import { GridFiltering } from "./GridFiltering";
import { IGridFilteringServiceMap } from "./services";
import { IGridFilteringComponents } from "./moduleComponents";

export interface IFilteringModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridFilteringLabels>;
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridFilteringComponents;
}

/** Builds the module that lets the grid be filtered. */
export const createFilteringModule = (options?: IFilteringModuleOptions): IGridModule => ({
    onRegister: ({ services: gridServices }) => {
        const services = new ServiceLocator<IGridFilteringServiceMap>();
        const labels = new LocalizationService<IGridFilteringLabels>({ ...GRID_FILTERING_LABELS, ...options?.labels });
        services.register('gridServices', () => gridServices);
        services.register('labels', () => labels);
        services.register('components', () => options?.components ?? {});
        const filtering = new GridFiltering({ services });
        gridServices.register('filtering', () => filtering);
    },
});
