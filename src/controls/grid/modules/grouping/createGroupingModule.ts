import { LocalizationService, ServiceLocator } from "@utils";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { IGridModule } from "../interfaces";
import { GRID_GROUPING_LABELS, IGridGroupingLabels } from "./labels";
import { GridGroupingComponents, IGridGroupingComponents } from "./moduleComponents";
import { GridGrouping } from "./GridGrouping";
import { IGridGroupingServiceMap } from "./services";

export interface IGroupingModuleOptions {
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
    /** How many groups one selection may load the records of before it is refused. */
    maxGroupLoadsPerSelection?: number;
}

/**
 * Builds the module that groups the rows by a column.
 *
 * @example
 */
export const createGroupingModule = (options: IGroupingModuleOptions = {}): IGridModule => ({
    agGridModules: [RowGroupingModule],
    getInitialComponentProps: () => ({ groupDisplayType: 'custom' }),
    onRegister: gridServices => {
        const services = new ServiceLocator<IGridGroupingServiceMap>();
        services.register('gridServices', () => gridServices);
        const labels = new LocalizationService<IGridGroupingLabels>({ ...GRID_GROUPING_LABELS, ...options.labels });
        const components = { ...GridGroupingComponents, ...options.components };
        services.register('labels', () => labels);
        services.register('components', () => components);
        const grouping = new GridGrouping({ services, settings: options });
        gridServices.register('grouping', () => grouping);
    },
});
