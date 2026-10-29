import { ServiceLocator } from "@utils";
import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import { IGridModule } from "../../interfaces";
import { IGridGroupingComponents } from "./moduleComponents";
import { GridGrouping } from "./GridGrouping";
import { IGridGroupingServiceMap } from "./services";

export interface IGroupingModuleOptions {
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

export interface IGroupingModule extends IGridModule<'grouping'> { }

/** Builds the module that groups the rows by a column. */
export const createGroupingModule = (options: IGroupingModuleOptions = {}): IGroupingModule => ({
    name: 'grouping',
    agGridModules: [RowGroupingModule, TreeDataModule],
    onLoad: ({ services: gridServices }) => {
        const services = new ServiceLocator<IGridGroupingServiceMap>();
        services.register('gridServices', () => gridServices);
        services.register('components', () => options.components ?? {});
        return new GridGrouping({ services, settings: options });
    },
    onDestroy: grouping => grouping.destroy(),
});
