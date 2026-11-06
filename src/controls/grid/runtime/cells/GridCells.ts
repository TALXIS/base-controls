import { ICommandBarItemProps } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { CellFocusedEvent } from "ag-grid-community";
import { EventEmitter, ICustomColumnControl, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry, IEventSubscriber, IHookPoint } from "@core";
import { IParameters } from "@pcf/interfaces";
import { IGridServiceRegistryInternal } from "..";
import { GridCell, IGridCell, IGridCellParameters } from "./GridCell";
import { getRowNode } from "../rows/getRowNode";
import { listenToGridApi } from "../grid/listenToGridApi";

/** Which cell a hook is running for. */
export interface IGridCellHookParameters {
    record: IRecord;
    columnName: string;
    takesInput: boolean;
}

/** A hook over which control draws a cell. */
export type GridControlHook = (result: { control: Required<ICustomColumnControl> }, parameters: IGridCellHookParameters) => void;

/** A hook over the parameters the control drawing a cell is handed. */
export type GridControlParametersHook = (result: IParameters, parameters: IGridCellHookParameters) => void;

/** A hook over the theme a cell is drawn in. */
export type GridCellThemeHook = (builder: ThemeBuilder, parameters: { record: IRecord; columnName: string }) => void;

/** What a cell is waiting on, as the hooks leave it. */
export interface IGridCellLoading {
    /** Whether the cell is waiting on something. */
    isLoading: boolean;
}

/** What a cell offers to do, as the hooks leave it. */
export interface IGridCellCommands {
    /** What the command bar draws. */
    items: ICommandBarItemProps[];
    /** The ones that live in the overflow menu however much room the cell has. */
    overflowItems: ICommandBarItemProps[];
}

/** A hook over the commands a cell offers. */
export type GridCellCommandsHook = (result: IGridCellCommands, parameters: { record: IRecord; columnName: string }) => void;

/** A hook over whether a cell is waiting. */
export type GridCellLoadingHook = (result: IGridCellLoading, parameters: { record: IRecord; columnName: string }) => void;

export interface IGridCellsEvents {
    /** Fires when the focus moves to another cell, or out of the rows. */
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
}

export interface IGridCellsRenderParameters {
    /** Draws only the cells in these columns. */
    columnNames?: string[];
}

export interface IGridCellsParameters {
    services: IGridServiceRegistryInternal;
}

export interface IGridCellsHooks {
    /** What draws a cell. */
    readonly control: IHookPoint<GridControlHook>;
    /** The parameters the control drawing a cell is handed. */
    readonly controlParameters: IHookPoint<GridControlParametersHook>;
    /** The theme a cell is drawn in. */
    readonly theme: IHookPoint<GridCellThemeHook>;
    /** Whether a cell is waiting. */
    readonly loading: IHookPoint<GridCellLoadingHook>;
    /** The commands a cell offers. */
    readonly commands: IHookPoint<GridCellCommandsHook>;
}

/** Every cell the grid has on screen. */
export interface IGridCells {
    /** Draws every cell on screen again, for a change their records do not carry. */
    render(parameters?: IGridCellsRenderParameters): void;
    /** Every cell on screen. */
    getCells(): IGridCell[];
    /** The cell drawing this field, where one is rendered. */
    getCell(record: IRecord, columnName: string): IGridCell | undefined;
    readonly hooks: IGridCellsHooks;
}

/** What the grid's own parts read of it. */
export interface IGridCellsInternal extends IGridCells {
    readonly events: IEventSubscriber<IGridCellsEvents>;
    /** A cell of this grid. */
    createCell(parameters: Omit<IGridCellParameters, 'services'>): IGridCell;
    /** Registers a cell as rendered. */
    addCell(cell: IGridCell): void;
    /** Removes a cell from the registry once it is gone. */
    removeCell(cell: IGridCell): void;
    /** Run by the `GridControl` of the cell in question. */
    applyControlHooks(result: {
        control: Required<ICustomColumnControl>;
    }, parameters: IGridCellHookParameters): void;
    applyControlParametersHooks(result: IParameters, parameters: IGridCellHookParameters): void;
    /** Run by the `GridCellTheme` of the cell in question. */
    applyCellThemeHooks(builder: ThemeBuilder, parameters: {
        record: IRecord;
        columnName: string;
    }): void;
    /** Run by the cell in question. */
    applyCellLoadingHooks(result: IGridCellLoading, parameters: {
        record: IRecord;
        columnName: string;
    }): void;
    /** Run by the cell in question. */
    applyCellCommandsHooks(result: IGridCellCommands, parameters: {
        record: IRecord;
        columnName: string;
    }): void;
}

export class GridCells implements IGridCellsInternal {
    private _services: IGridServiceRegistryInternal;
    private _renderedCells = new Map<string, IGridCell>();
    public readonly hooks = {
        control: new HookRegistry<GridControlHook>(),
        controlParameters: new HookRegistry<GridControlParametersHook>(),
        theme: new HookRegistry<GridCellThemeHook>(),
        loading: new HookRegistry<GridCellLoadingHook>(),
        commands: new HookRegistry<GridCellCommandsHook>(),
    };
    public readonly events: IEventEmitter<IGridCellsEvents> = new EventEmitter<IGridCellsEvents>();

    constructor(parameters: IGridCellsParameters) {
        this._services = parameters.services;
        this._services.observe('gridApi', gridApi => listenToGridApi(gridApi, { cellFocused: this._onCellFocused }));
    }

    public createCell(parameters: Omit<IGridCellParameters, 'services'>): IGridCell {
        return new GridCell({ ...parameters, services: this._services });
    }

    public addCell(cell: IGridCell): void {
        this._renderedCells.set(cell.getId(), cell);
    }

    public removeCell(cell: IGridCell): void {
        this._renderedCells.delete(cell.getId());
    }

    public render(parameters?: IGridCellsRenderParameters): void {
        const columnNames = parameters?.columnNames && new Set(parameters.columnNames);
        this._renderedCells.forEach(cell => {
            if (!columnNames || columnNames.has(cell.getColumnName())) {
                cell.render();
            }
        });
    }

    public getCells(): IGridCell[] {
        return [...this._renderedCells.values()];
    }

    public getCell(record: IRecord, columnName: string): IGridCell | undefined {
        return this.getCells().find(cell => cell.getRecord().getRecordId() === record.getRecordId() && cell.getColumnName() === columnName);
    }

    public applyControlHooks(result: { control: Required<ICustomColumnControl> }, parameters: IGridCellHookParameters): void {
        this.hooks.control.apply(result, parameters);
    }

    public applyControlParametersHooks(result: IParameters, parameters: IGridCellHookParameters): void {
        this.hooks.controlParameters.apply(result, parameters);
    }

    public applyCellThemeHooks(builder: ThemeBuilder, parameters: { record: IRecord; columnName: string }): void {
        this.hooks.theme.apply(builder, parameters);
    }

    public applyCellLoadingHooks(result: IGridCellLoading, parameters: { record: IRecord; columnName: string }): void {
        this.hooks.loading.apply(result, parameters);
    }

    public applyCellCommandsHooks(result: IGridCellCommands, parameters: { record: IRecord; columnName: string }): void {
        this.hooks.commands.apply(result, parameters);
    }

    private _onCellFocused = (event: CellFocusedEvent<IRecord>): void => {
        const record = getRowNode(event.api, event.rowIndex, event.rowPinned)?.data;
        const columnName = typeof event.column === 'string' ? event.column : event.column?.getColId();
        this.events.dispatchEvent('onFocusedCellChanged', record, record ? columnName : undefined);
    };

}
