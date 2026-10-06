import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule } from "../../interfaces";
import { GRID_AGGREGATION_LABELS, IGridAggregationLabels } from "./labels";
import { IGridAggregationComponents } from "./moduleComponents";
import { GridAggregation } from "./GridAggregation";
import { IGridAggregationServiceMap } from "./services";

export interface IAggregationModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridAggregationLabels>;
    /** Whether a column's menu offers the totals. */
    allowUserAggregation?: boolean;
    /** Overrides for the parts of what this module draws, by piece. */
    components?: IGridAggregationComponents;
}

/** Builds the module that shows totals in a row pinned under the rest. */
export const createAggregationModule = (options?: IAggregationModuleOptions): IGridModule => ({
    onRegister: ({ services: gridServices }) => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridAggregationServiceMap>();
        //built once, then registered: a resolver runs on every lookup
        const labels = new LocalizationService<IGridAggregationLabels>({ ...GRID_AGGREGATION_LABELS, ...options?.labels });
        services.register('gridServices', () => gridServices);
        services.register('labels', () => labels);
        services.register('components', () => options?.components ?? {});
        const aggregation = new GridAggregation({ services, allowUserAggregation: options?.allowUserAggregation });
        gridServices.register('aggregation', () => aggregation);
    },
});
