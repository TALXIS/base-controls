import { LocalizationService, ServiceLocator } from "@utils";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { IGridModule } from "../interfaces";
import { GRID_GROUPING_LABELS, IGridGroupingLabels } from "./labels";
import { GridGroupingComponents, IGridGroupingComponents } from "./moduleComponents";
import { GridGrouping } from "./GridGrouping";
import { IGridGroupingServiceMap } from "./services";
import { IGroupingStrategyModule } from "./strategies";

export interface IGroupingModuleOptions {
    /** Where a group's children come from. */
    strategy: IGroupingStrategyModule;
    /** Localized strings this module renders. */
    labels?: Partial<IGridGroupingLabels>;
    /** The parts of this module to render differently. */
    components?: Partial<IGridGroupingComponents>;
    /** Whether a column's menu offers grouping. */
    allowUserGrouping?: boolean;
    /** How the groups nest. */
    type?: 'nested' | 'flat';
    /** How many levels open themselves. */
    defaultExpandedLevel?: number;
    /** Whether a grouped column is pinned to the left. */
    pinGroupedColumns?: boolean;
}

/**
 * Builds the module that groups the rows by a column.
 *
 * @example
 */
export const createGroupingModule = (options: IGroupingModuleOptions): IGridModule => ({
    agGridModules: [RowGroupingModule],
    getInitialComponentProps: () => ({ groupDisplayType: 'custom' }),
    //the strategy names the row model it groups on
    requiresRowModel: options.strategy.rowModel,
    onRegister: gridServices => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridGroupingServiceMap>();
        services.register('gridServices', () => gridServices);
        //built once, then registered: a resolver runs on every lookup
        const labels = new LocalizationService<IGridGroupingLabels>({ ...GRID_GROUPING_LABELS, ...options.labels });
        const components = { ...GridGroupingComponents, ...options.components };
        services.register('labels', () => labels);
        services.register('components', () => components);
        const grouping = new GridGrouping({
            services,
            strategy: options.strategy,
            settings: {
                allowUserGrouping: options.allowUserGrouping ?? true,
                type: options.type ?? 'nested',
                defaultExpandedLevel: options.defaultExpandedLevel ?? -1,
                pinGroupedColumns: options.pinGroupedColumns ?? true,
            },
        });
        gridServices.register('grouping', () => grouping);
        gridServices.get('columns').registerColumnDefinitionsHook(columnDefs => grouping.applyColumnDefinitions(columnDefs));
        gridServices.get('columnHeaders').registerColumnMenuSectionHook((sections, params) => grouping.applyMenuSection(sections, params), 20);
        gridServices.get('columnHeaders').registerColumnHeaderAdornmentsHook((adornments, params) => grouping.applyColumnHeaderAdornments(adornments, params), 20);
    },
});
