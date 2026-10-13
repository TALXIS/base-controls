import type { GridApi } from "ag-grid-community";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { IEventSubscriber, IServiceLocator } from "@utils";
import type { IGridEventHandlers, IGridOpenRecordParams } from "../../interfaces";
import type { IGridField } from "../fields";

/** What the grid raises as it loads and goes. */
export interface IGridEvents extends Pick<IGridEventHandlers, 'onDataLoaded'> {
    /** The grid is tearing down. */
    onDestroyed: () => void;
}

/** The modules the grid runs, each there only when the grid was given it; a module adds its own by augmenting this. */
export interface IGridModuleMap { }

/** Looks up the modules the grid runs. */
export type IGridModuleLocator = Pick<IServiceLocator<IGridModuleMap>, 'get' | 'find' | 'whenAvailable'>;

/** The grid as its consumer drives it. */
export interface IGrid {
    /** Subscribe to the grid's events. */
    readonly events: IEventSubscriber<IGridEvents>;
    /** The modules the grid runs, such as `sorting` or `rowSelection`. */
    readonly modules: IGridModuleLocator;
    /** The provider the grid shows. */
    getProvider(): IDataProvider;
    /** A record's field, whose `setValue` saves as a cell would. */
    getField(record: IRecord, columnName: string): IGridField;
    /** Opens a record as the grid does, through `onOpenRecord` when the grid has one. */
    openRecord(params: IGridOpenRecordParams): void;
    /** Draws the cells again, such as after something outside the grid changed how they look. */
    renderCells(): void;
    /** Draws the column headers again. */
    renderHeaders(): void;
    /** AG Grid's own api, once AG Grid is ready; a last resort. */
    getAgGridApi(): GridApi<IRecord> | undefined;
}
