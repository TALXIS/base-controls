import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { GRID_FILTERING_LABELS, IGridFilteringLabels } from "./labels";
import { GridFiltering } from "./GridFiltering";
import { IGridFilteringServiceMap } from "./services";
import { GridFilteringComponents, IGridFilteringComponents } from "./moduleComponents";

/**
 * Builds the module that lets the grid be filtered.
 *
 * Registering it is what enables filtering: a grid without it offers no filter in any column menu, opens
 * no callout, and shows no filter state — including the icon a header would otherwise carry.
 *
 * @example
 * ```tsx
 * <Grid modules={{ rowModel: createServerSideRowModelModule(), filtering: createFilteringModule() }} />
 * ```
 */
export interface IFilteringModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridFilteringLabels>;
    /** The parts of filtering to render differently. */
    components?: Partial<IGridFilteringComponents>;
}

export const createFilteringModule = (options?: IFilteringModuleOptions): IGridModule => ({
    onRegister: gridServices => {
        const services = new ServiceLocator<IGridFilteringServiceMap>();
        services.register('gridServices', () => gridServices);
        const labels = new LocalizationService<IGridFilteringLabels>({ ...GRID_FILTERING_LABELS, ...options?.labels });
        const components = { ...GridFilteringComponents, ...options?.components };
        services.register('labels', () => labels);
        services.register('components', () => components);
        const filtering = new GridFiltering({ services });
        gridServices.register('filtering', () => filtering);
        gridServices.get('columns').registerColumnDefinitionsHook(columnDefs => filtering.applyColumnDefinitions(columnDefs));
        gridServices.get('columnHeader').registerColumnMenuSectionHook((sections, column) => filtering.applyMenuSection(sections, column), 10);
        gridServices.get('columnHeader').registerColumnHeaderAdornmentsHook((adornments, column) => filtering.applyColumnHeaderAdornments(adornments, column), 10);
    },
});
