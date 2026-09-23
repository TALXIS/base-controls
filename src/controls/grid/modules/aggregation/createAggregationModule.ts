import { IRowNode, IsFullWidthRowParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { LocalizationService, ServiceLocator } from "@utils";
import { FullWidthCellRendererError } from "@controls/grid/components/errors/full-width-cell-renderer-error/FullWidthCellRendererError";
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
    //stated here rather than read off the instance below
    getInitialComponentProps: () => ({
        isFullWidthRow: params => isAggregationErrorRow(params.rowNode),
        fullWidthCellRenderer: FullWidthCellRendererError,
        fullWidthCellRendererParams: (params: IsFullWidthRowParams<IRecord>) => ({
            errorMessage: params.rowNode.data?.getDataProvider().getErrorMessage(),
        }),
    }),
    onRegister: gridServices => {
        //the module's own locator, with the grid's as the one key that crosses over
        const services = new ServiceLocator<IGridAggregationServiceMap>();
        services.register('gridServices', () => gridServices);
        //built once, then registered: a resolver runs on every lookup
        const labels = new LocalizationService<IGridAggregationLabels>({ ...GRID_AGGREGATION_LABELS, ...options?.labels });
        const components = { ...GridAggregationComponents, ...options?.components };
        services.register('labels', () => labels);
        services.register('components', () => components);
        const aggregation = new GridAggregation({ services, allowUserAggregation: options?.allowUserAggregation });
        gridServices.register('aggregation', () => aggregation);
    },
});

const isAggregationErrorRow = (rowNode: IRowNode<IRecord>): boolean => {
    const provider = rowNode.data?.getDataProvider();
    return provider?.getSummarizationType() === 'aggregation' && provider.isError();
};
