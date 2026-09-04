import { IRowNode, IsFullWidthRowParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { LocalizationService, ServiceLocator } from "@utils";
import { FullWidthCellRendererError } from "@components/Grid/errors/FullWidthCellRendererError/FullWidthCellRendererError";
import { IGridModule } from "../interfaces";
import { GRID_AGGREGATION_LABELS, IGridAggregationLabels } from "./labels";
import { GridAggregation } from "./GridAggregation";
import { IGridAggregationServiceMap } from "./services";

export interface IAggregationModuleOptions {
    /** Localized strings this module renders. */
    labels?: Partial<IGridAggregationLabels>;
    /**
     * Whether a column's menu offers the totals. Defaults to `true`: registering the module is what says
     * the grid does totals at all, and this is only about whether the user may change them.
     */
    allowUserAggregation?: boolean;
}

/**
 * Builds the module that shows totals in a row pinned under the rest.
 *
 * @example
 * ```tsx
 * <Grid modules={{ rowModel: createServerSideRowModelModule(), aggregation: createAggregationModule() }} />
 * ```
 */
export const createAggregationModule = (options?: IAggregationModuleOptions): IGridModule => ({
    //stated here rather than read off the instance below: a total whose own provider failed has no value to
    //put in a cell, so the row gives up its columns and carries the reason across the whole width instead
    getInitialComponentProps: () => ({
        isFullWidthRow: params => isAggregationErrorRow(params.rowNode),
        fullWidthCellRenderer: FullWidthCellRendererError,
        fullWidthCellRendererParams: (params: IsFullWidthRowParams<IRecord>) => ({
            errorMessage: params.rowNode.data?.getDataProvider().getErrorMessage(),
        }),
    }),
    onRegister: gridServices => {
        //the module's own locator: what it registers here is what everything inside it reaches, with the
        //grid's own locator as the one key that crosses over
        const services = new ServiceLocator<IGridAggregationServiceMap>();
        services.register('gridServices', () => gridServices);
        //built once, then registered: a resolver runs on every lookup, and what it hands out has to be
        //the same object each time
        const labels = new LocalizationService<IGridAggregationLabels>({ ...GRID_AGGREGATION_LABELS, ...options?.labels });
        services.register('labels', () => labels);
        const aggregation = new GridAggregation({ services, allowUserAggregation: options?.allowUserAggregation ?? true });
        gridServices.register('aggregation', () => aggregation);
        gridServices.get('columnHeader').registerColumnMenuSectionHook((sections, column) => aggregation.applyMenuSection(sections, column), 30);
        gridServices.get('columnHeader').registerColumnHeaderAdornmentsHook((adornments, column) => aggregation.applyColumnHeaderAdornments(adornments, column), 30);
    },
});

const isAggregationErrorRow = (rowNode: IRowNode<IRecord>): boolean => {
    const provider = rowNode.data?.getDataProvider();
    return provider?.getSummarizationType() === 'aggregation' && provider.isError();
};
