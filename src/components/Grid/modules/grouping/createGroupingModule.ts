import { LocalizationService, ServiceLocator } from "@utils";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { IGridModule } from "../interfaces";
import { GRID_GROUPING_LABELS, IGridGroupingLabels } from "./labels";
import { GridGroupingComponents, IGridGroupingComponents } from "./moduleComponents";
import { GridGrouping } from "./GridGrouping";
import { IGridGroupingServiceMap } from "./services";
import { IGroupingStrategyModule } from "./strategies";

export interface IGroupingModuleOptions {
    /**
     * Where a group's children come from, which is the one part of grouping the row model decides:
     * {@link createServerSideGroupingStrategy} or {@link createClientSideGroupingStrategy}.
     *
     * Required, and has to be the one for the grid's own row model — a grid is refused rather than left
     * rendering group rows nothing ever fills.
     */
    strategy: IGroupingStrategyModule;
    /** Localized strings this module renders. */
    labels?: Partial<IGridGroupingLabels>;
    /** The parts of this module to render differently. */
    components?: Partial<IGridGroupingComponents>;
    /**
     * Whether a column's menu offers grouping. Defaults to `true`: registering the module is what says
     * the grid groups at all, and this is only about whether the user may change it.
     */
    allowUserGrouping?: boolean;
    /** How the groups nest. Defaults to `'nested'`. */
    type?: 'nested' | 'flat';
    /** How many levels open themselves. Defaults to `-1`, which is none. */
    defaultExpandedLevel?: number;
    /** Whether a grouped column is pinned to the left. Defaults to `true`. */
    pinGroupedColumns?: boolean;
}

/**
 * Builds the module that groups the rows by a column.
 *
 * Works on either row model, and the strategy is which one: the server-side model fetches a group's
 * children when it is opened, the client-side model is handed every level at once as a tree.
 *
 * @example
 * ```tsx
 * <Grid modules={{
 *     rowModel: createServerSideRowModelModule(),
 *     grouping: createGroupingModule({ strategy: createServerSideGroupingStrategy() }),
 * }} />
 * ```
 */
export const createGroupingModule = (options: IGroupingModuleOptions): IGridModule => ({
    agGridModules: [RowGroupingModule],
    getInitialComponentProps: () => ({ groupDisplayType: 'custom' }),
    //the strategy names the row model it groups on, so the mismatch is caught here rather than as a grid
    //that renders groups and never fills them
    requiresRowModel: options.strategy.rowModel,
    onRegister: gridServices => {
        //the module's own locator: what it registers here is what everything inside it reaches, with the
        //grid's own locator as the one key that crosses over
        const services = new ServiceLocator<IGridGroupingServiceMap>();
        services.register('gridServices', () => gridServices);
        //built once, then registered: a resolver runs on every lookup, and what it hands out has to be
        //the same object each time - the components most of all, since AG Grid rebuilds a cell whose
        //renderer identity changed
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
        gridServices.get('columnHeader').registerColumnMenuSectionHook((sections, column) => grouping.applyMenuSection(sections, column), 20);
        gridServices.get('columnHeader').registerColumnHeaderAdornmentsHook((adornments, column) => grouping.applyColumnHeaderAdornments(adornments, column), 20);
    },
});
