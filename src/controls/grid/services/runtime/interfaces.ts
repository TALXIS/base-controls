import type { IEventSubscriber, ILabels, ILabelSet, Labels } from "@utils";
import type { IGridEventHandlers, IGridModuleLocator, IGridOpenRecordParams } from "../../interfaces";
import type { IGridServiceLocator, IGridServiceMap } from "../interfaces";
import type { GridAgGridInitialOptionsHook, GridAgGridOptionsHook } from "./GridRuntime";

/** What the grid raises as it loads and goes. */
export interface IGridEvents extends Pick<IGridEventHandlers, 'onDataLoaded'> {
    /** The grid is tearing down. */
    onDestroyed: () => void;
}

/** The running grid: what `onReady` and `onDestroyed` hand you, and what a module's `onLoad` gets. */
export interface IGrid<TServices extends IGridServiceMap = IGridServiceMap> {
    /** Subscribe to the grid's events. */
    readonly events: IEventSubscriber<IGridEvents>;
    /** Every part of the grid, by key. */
    readonly services: IGridServiceLocator<TServices>;
    /** The modules the grid was given, by name. */
    readonly modules: IGridModuleLocator;
    /**
     * Registers a hook over the options AG Grid reads only once, when it is created.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerAgGridInitialOptions(hook: GridAgGridInitialOptionsHook, priority?: number): () => void;
    /**
     * Registers a hook over options re-applied whenever a value's reference changes.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerAgGridOptions(hook: GridAgGridOptionsHook, priority?: number): () => void;
    /** The strings of one set, as the grid's localization resolves them. */
    getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T>;
    /** Runs the option hooks again and hands AG Grid the ones that changed. */
    refreshAgGridOptions(): void;
    /** Opens a record as the grid does, through `onOpenRecord` when the grid has one. */
    openRecord(params: IGridOpenRecordParams): void;
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlPartMap {
        /** The Grid in the body, while one is drawn. */
        grid: IGrid;
    }
}
