import { LocalizationService, ServiceLocator } from "@utils";
import { IGridModule } from "../interfaces";
import { GRID_AGGREGATION_LABELS, IGridAggregationLabels } from "./labels";
import { GridAggregationComponents, IGridAggregationComponents } from "./moduleComponents";
import { GridAggregation } from "./GridAggregation";
import { IGridAggregationServiceMap } from "./services";

export interface IAggregationModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridAggregationLabels>;
    /** Whether a column's menu offers the totals. */
    allowUserAggregation?: boolean;
    /** The parts of this module to render differently. */
    components?: Partial<IGridAggregationComponents>;
}

/**
 * Builds the module that shows totals in a row pinned under the rest.
 *
 * @example
 */
export const createAggregationModule = (options?: IAggregationModuleOptions): IGridModule => ({
    onRegister: gridServices => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridAggregationServiceMap>();
        //built once, then registered: a resolver runs on every lookup
        const labels = new LocalizationService<IGridAggregationLabels>({ ...GRID_AGGREGATION_LABELS, ...options?.labels });
        const components = { ...GridAggregationComponents, ...options?.components };
        services.register('gridServices', () => gridServices);
        services.register('labels', () => labels);
        services.register('components', () => components);
        const aggregation = new GridAggregation({ services, allowUserAggregation: options?.allowUserAggregation });
        gridServices.register('aggregation', () => aggregation);
    },
});
