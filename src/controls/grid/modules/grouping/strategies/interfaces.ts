import type { ColDef, GridApi } from "@ag-grid-community/core";
import type { IRecord } from "@talxis/client-libraries";
import type { IGridRowModelType } from "../../row-model/interfaces";
import type { IGridGroupingServiceLocator } from "../services";

/** The part of grouping that the row model decides. */
export interface IGroupingStrategy {
    /** Options only this row model needs. */
    applyGridOptions: (gridApi: GridApi<IRecord>) => void;
    /** What a column the rows are grouped by needs beyond being moved to the front and pinned. */
    applyGroupedColumnDefinition: (colDef: ColDef<IRecord>) => void;
    /** The rows to hand the client-side model, or `undefined`. */
    getRows: () => IRecord[] | undefined;
}

export interface IGroupingStrategyParameters {
    /** The grouping module's own locator. */
    services: IGridGroupingServiceLocator;
}

/**
 * A factory rather than an instance: a strategy is built with the module's own locator.
 */
export interface IGroupingStrategyModule {
    rowModel: IGridRowModelType;
    /** Builds it, once there is a locator to build it with. */
    create: (parameters: IGroupingStrategyParameters) => IGroupingStrategy;
}
