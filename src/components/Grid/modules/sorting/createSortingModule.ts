import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { GRID_SORTING_LABELS, IGridSortingLabels } from "./labels";
import { GridSortingComponents, IGridSortingComponents } from "./moduleComponents";
import { GridSorting } from "./GridSorting";
import { IGridSortingServiceMap } from "./services";

/**
 * Builds the module that lets the grid be sorted.
 *
 * Registering it is what enables sorting: a grid without it offers no sort in any column menu and puts no
 * sort on its definitions.
 *
 * @example
 * ```tsx
 * <Grid modules={{ rowModel: createServerSideRowModelModule(), sorting: createSortingModule() }} />
 * ```
 */
export interface ISortingModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridSortingLabels>;
    /** The parts of this module to render differently. */
    components?: Partial<IGridSortingComponents>;
}

export const createSortingModule = (options?: ISortingModuleOptions): IGridModule => ({
    onRegister: gridServices => {
        //the module's own locator: what it registers here is what everything inside it reaches, with the
        //grid's own locator as the one key that crosses over
        const services = new ServiceLocator<IGridSortingServiceMap>();
        services.register('gridServices', () => gridServices);
        //built once, then registered: a resolver runs on every lookup, and what it hands out has to be
        //the same object each time - the components most of all, since AG Grid rebuilds a cell whose
        //renderer identity changed
        const labels = new LocalizationService<IGridSortingLabels>({ ...GRID_SORTING_LABELS, ...options?.labels });
        const components = { ...GridSortingComponents, ...options?.components };
        services.register('labels', () => labels);
        services.register('components', () => components);
        const sorting = new GridSorting({ services });
        gridServices.register('sorting', () => sorting);
        //core no longer knows to set these
        gridServices.get('columns').registerColumnDefinitionsHook(columnDefs => sorting.applyColumnDefinitions(columnDefs));
        gridServices.get('columnHeader').registerColumnMenuSectionHook((sections, column) => sorting.applyMenuSection(sections, column), 0);
        gridServices.get('columnHeader').registerColumnHeaderAdornmentsHook((adornments, column) => sorting.applyColumnHeaderAdornments(adornments, column), 0);
    },
});
