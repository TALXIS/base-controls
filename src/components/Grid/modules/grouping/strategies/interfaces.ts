import type { ColDef, GridApi } from "@ag-grid-community/core";
import type { IRecord } from "@talxis/client-libraries";
import type { IGridRowModelType } from "../../row-model/interfaces";
import type { IGridGroupingServiceLocator } from "../services";

/**
 * The part of grouping that the row model decides.
 *
 * Everything else about grouping is the same on both — the expansion state, the chevron, the column menu,
 * the header adornments — and stays on `GridGrouping`. What differs is where a group's children come from,
 * and that is not two spellings of one call: the server-side model asks for a level at a time through a
 * datasource, the client-side model needs every level in one array.
 */
export interface IGroupingStrategy {
    /** Options only this row model needs. Applied when there is a grid to apply them to. */
    applyGridOptions: (gridApi: GridApi<IRecord>) => void;
    /**
     * What a column the rows are grouped by needs beyond being moved to the front and pinned, which
     * `GridGrouping` does for both.
     */
    applyGroupedColumnDefinition: (colDef: ColDef<IRecord>) => void;
    /**
     * The rows to hand the client-side model, or `undefined` where a datasource answers instead.
     */
    getRows: () => IRecord[] | undefined;
}

export interface IGroupingStrategyParameters {
    /** The grouping module's own locator, which is how the provider and the grid are reached. */
    services: IGridGroupingServiceLocator;
}

/**
 * A strategy as a caller hands it over: {@link createServerSideGroupingStrategy} or
 * {@link createClientSideGroupingStrategy}.
 *
 * A factory rather than an instance, because a strategy is built with the module's own locator and in a
 * particular order — and because a module object handed to two grids must not carry one grid's state.
 */
export interface IGroupingStrategyModule {
    /** The row model this strategy groups on. Checked against the grid's when the grid is assembled. */
    rowModel: IGridRowModelType;
    /** Builds it, once there is a locator to build it with. */
    create: (parameters: IGroupingStrategyParameters) => IGroupingStrategy;
}
