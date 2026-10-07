import { LocalizationService, ServiceLocator } from "@utils";
import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import { IGridModule } from "../../interfaces";
import { GRID_GROUPING_LABELS, IGridGroupingLabels } from "./labels";
import { IGridGroupingComponents } from "./moduleComponents";
import { GridGrouping } from "./GridGrouping";
import { IGridGroupingServiceMap } from "./services";

export interface IGroupingModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridGroupingLabels>;
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridGroupingComponents;
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

/** Builds the module that groups the rows by a column. */
export const createGroupingModule = (options: IGroupingModuleOptions = {}): IGridModule => ({
    agGridModules: [RowGroupingModule, TreeDataModule],
    onRegister: ({ services: gridServices }) => {
        const services = new ServiceLocator<IGridGroupingServiceMap>();
        const labels = new LocalizationService<IGridGroupingLabels>({ ...GRID_GROUPING_LABELS, ...options.labels });
        services.register('gridServices', () => gridServices);
        services.register('labels', () => labels);
        services.register('components', () => options.components ?? {});
        const grouping = new GridGrouping({ services, settings: options });
        gridServices.register('grouping', () => grouping);
    },
});
