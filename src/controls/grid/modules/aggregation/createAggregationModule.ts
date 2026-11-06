import { PinnedRowModule } from "ag-grid-community";
import { ServiceRegistry } from "@core";
import { IGridModule } from "../../interfaces";
import { IGridAggregationComponents } from "./components";
import { GridAggregation } from "./GridAggregation";
import { IGridAggregationServiceMap } from "./runtime";

export interface IAggregationModuleParameters {
    /** Whether a column's menu offers the totals. */
    enableUserAggregation?: boolean;
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridAggregationComponents;
}

export interface IAggregationModule extends IGridModule<'aggregation'> { }

/** Builds the module that shows totals in a row pinned under the rest. */
export const createAggregationModule = (parameters?: IAggregationModuleParameters): IAggregationModule => ({
    name: 'aggregation',
    agGridModules: [PinnedRowModule],
    onLoad: ({ services: gridServices }) => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceRegistry<IGridAggregationServiceMap>();
        services.provide('gridServices', gridServices);
        services.provide('components', parameters?.components ?? {});
        return new GridAggregation({ services, enableUserAggregation: parameters?.enableUserAggregation });
    },
    onDestroy: aggregation => aggregation.destroy(),
});
