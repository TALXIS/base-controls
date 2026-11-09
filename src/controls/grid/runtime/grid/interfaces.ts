import type { IEventSubscriber, IRuntime, IHookPoint } from "@core";
import type { ILabels, ILabelSet, Labels } from "@labels";
import type { IGridModuleLocator, IGridOpenRecordParameters } from "../../interfaces";
import type { IGridServiceRegistry, IGridServiceMap } from "../interfaces";
import type { GridAgGridInitialOptionsHook, GridAgGridOptionsHook, GridOpenRecordHook } from "./GridRuntime";

/** What the grid raises while it shows data; its mount's events are on `lifecycle`. */
export interface IGridEvents {
    /** Fires once new data is in the grid. */
    onDataLoaded: () => void;
}

export interface IGridHooks {
    /** The options AG Grid reads only once, when it is created. */
    readonly agGridInitialOptions: IHookPoint<GridAgGridInitialOptionsHook>;
    /** Options re-applied whenever a value's reference changes. */
    readonly agGridOptions: IHookPoint<GridAgGridOptionsHook>;
    /** How a record is opened; the provider opens it when no hook does. */
    readonly openRecord: IHookPoint<GridOpenRecordHook>;
}

/** The running grid: what `onSetup` and `onLoad` hand you, and what a module's `onLoad` gets. */
export interface IGrid<TServices extends IGridServiceMap = IGridServiceMap> extends IRuntime {
    /** Subscribe to the grid's events. */
    readonly events: IEventSubscriber<IGridEvents>;
    /** Every part of the grid, by key. */
    readonly services: IGridServiceRegistry<TServices>;
    /** The modules the grid was given, by name. */
    readonly modules: IGridModuleLocator;
    readonly hooks: IGridHooks;
    /** The strings of one set, as the grid's labelsService resolves them. */
    getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T>;
    /** Runs the option hooks again and hands AG Grid the ones that changed. */
    refreshAgGridOptions(): void;
    /** Opens a record as the grid does, through `hooks.openRecord` and then the provider. */
    openRecord(parameters: IGridOpenRecordParameters): void;
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlPartMap {
        /** The Grid in the body, while one is drawn. */
        grid: IGrid;
    }
}
