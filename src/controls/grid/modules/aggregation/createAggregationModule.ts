import { PinnedRowModule } from "ag-grid-community";
import { ServiceLocator } from "@utils";
import { IGridModule } from "../../interfaces";
import { IGridAggregationComponents } from "./moduleComponents";
import { GridAggregation } from "./GridAggregation";
import { IGridAggregationServiceMap } from "./services";

export interface IAggregationModuleOptions {
    /** Whether a column's menu offers the totals. */
    allowUserAggregation?: boolean;
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridAggregationComponents;
}

export interface IAggregationModule extends IGridModule<'aggregation'> { }

/** Builds the module that shows totals in a row pinned under the rest. */
export const createAggregationModule = (options?: IAggregationModuleOptions): IAggregationModule => ({
    name: 'aggregation',
    agGridModules: [PinnedRowModule],
    onLoad: ({ services: gridServices }) => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridAggregationServiceMap>();
        services.register('gridServices', () => gridServices);
        services.register('components', () => options?.components ?? {});
        return new GridAggregation({ services, allowUserAggregation: options?.allowUserAggregation });
    },
    onDestroy: aggregation => aggregation.destroy(),
});
