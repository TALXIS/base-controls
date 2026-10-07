import { ICommandBarItemProps } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { CellFocusedEvent } from "ag-grid-community";
import { EventEmitter, ICustomColumnControl, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IParameters } from "@interfaces";
import { IGridServiceLocator } from "../../services";
import { GridCell, IGridCell, IGridCellParameters } from "./GridCell";

/** Which cell a hook is running for. */
export interface IGridCellHookParameters {
    record: IRecord;
    columnName: string;
    takesInput: boolean;
}

/** A hook over which control draws a cell. */
export type GridControlHook = (result: { control: Required<ICustomColumnControl> }, params: IGridCellHookParameters) => void;

/** A hook over the parameters the control drawing a cell is handed. */
export type GridControlParametersHook = (result: IParameters, params: IGridCellHookParameters) => void;

/** A hook over the theme a cell is drawn in. */
export type GridCellThemeHook = (theme: ThemeBuilder, params: { record: IRecord; columnName: string }) => void;

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
export type GridCellCommandsHook = (result: IGridCellCommands, params: { record: IRecord; columnName: string }) => void;

/** A hook over whether a cell is waiting. */
export type GridCellLoadingHook = (result: IGridCellLoading, params: { record: IRecord; columnName: string }) => void;

export interface IGridCellsEvents {
    /** Fired when the focus moves to another cell, or out of the rows. */
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
}

export interface IGridCellsParameters {
    services: IGridServiceLocator;
}

/** Every cell the grid has on screen. */
export interface IGridCells {
    readonly events: IEventEmitter<IGridCellsEvents>;
    /** A cell of this grid. */
    createCell(parameters: Omit<IGridCellParameters, 'services'>): IGridCell;
    /** Registers a cell as rendered. */
    addCell(cell: IGridCell): void;
    /** Removes a cell from the registry once it is gone. */
    removeCell(cell: IGridCell): void;
    /** Draws every cell on screen again, for a change their records do not carry. */
    render(): void;
    /** Every cell on screen. */
    getCells(): IGridCell[];
    /** The cell drawing this field, where one is rendered. */
    getCell(record: IRecord, columnName: string): IGridCell | undefined;
    /**
     * Registers a hook over what draws a cell.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerControl(hook: GridControlHook, priority?: number): () => void;
    /**
     * Registers a hook over the parameters the control drawing a cell is handed.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerControlParameters(hook: GridControlParametersHook, priority?: number): () => void;
    /**
     * Registers a hook over the theme a cell is drawn in.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerCellTheme(hook: GridCellThemeHook, priority?: number): () => void;
    /**
     * Registers a hook over whether a cell is waiting.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerCellLoading(hook: GridCellLoadingHook, priority?: number): () => void;
    /**
     * Registers a hook over the commands a cell offers.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerCellCommands(hook: GridCellCommandsHook, priority?: number): () => void;
    /** Run by the `GridControl` of the cell in question. */
    applyControlHooks(result: {
        control: Required<ICustomColumnControl>;
    }, params: IGridCellHookParameters): void;
    applyControlParametersHooks(result: IParameters, params: IGridCellHookParameters): void;
    /** Run by the `GridCellTheme` of the cell in question. */
    applyCellThemeHooks(theme: ThemeBuilder, params: {
        record: IRecord;
        columnName: string;
    }): void;
    /** Run by the cell in question. */
    applyCellLoadingHooks(result: IGridCellLoading, params: {
        record: IRecord;
        columnName: string;
    }): void;
    /** Run by the cell in question. */
    applyCellCommandsHooks(result: IGridCellCommands, params: {
        record: IRecord;
        columnName: string;
    }): void;
}

export class GridCells implements IGridCells {
    private _services: IGridServiceLocator;
    private _renderedCells = new Map<string, IGridCell>();
    private _controlHooks = new HookRegistry<GridControlHook>();
    private _controlParametersHooks = new HookRegistry<GridControlParametersHook>();
    private _cellThemeHooks = new HookRegistry<GridCellThemeHook>();
    private _cellLoadingHooks = new HookRegistry<GridCellLoadingHook>();
    private _cellCommandsHooks = new HookRegistry<GridCellCommandsHook>();
    public readonly events: IEventEmitter<IGridCellsEvents> = new EventEmitter<IGridCellsEvents>();

    constructor(parameters: IGridCellsParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('gridApi', gridApi => {
            gridApi.addEventListener('cellFocused', this._onCellFocused);
        });
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

    public render(): void {
        this._renderedCells.forEach(cell => cell.render());
    }

    public getCells(): IGridCell[] {
        return [...this._renderedCells.values()];
    }

    public getCell(record: IRecord, columnName: string): IGridCell | undefined {
        return this.getCells().find(cell => cell.getRecord().getRecordId() === record.getRecordId() && cell.getColumnName() === columnName);
    }

    public registerControl(hook: GridControlHook, priority?: number): () => void {
        return this._controlHooks.register(hook, priority);
    }

    public registerControlParameters(hook: GridControlParametersHook, priority?: number): () => void {
        return this._controlParametersHooks.register(hook, priority);
    }

    public registerCellTheme(hook: GridCellThemeHook, priority?: number): () => void {
        return this._cellThemeHooks.register(hook, priority);
    }

    public registerCellLoading(hook: GridCellLoadingHook, priority?: number): () => void {
        return this._cellLoadingHooks.register(hook, priority);
    }

    public registerCellCommands(hook: GridCellCommandsHook, priority?: number): () => void {
        return this._cellCommandsHooks.register(hook, priority);
    }

    public applyControlHooks(result: { control: Required<ICustomColumnControl> }, params: IGridCellHookParameters): void {
        this._controlHooks.apply(result, params);
    }

    public applyControlParametersHooks(result: IParameters, params: IGridCellHookParameters): void {
        this._controlParametersHooks.apply(result, params);
    }

    public applyCellThemeHooks(theme: ThemeBuilder, params: { record: IRecord; columnName: string }): void {
        this._cellThemeHooks.apply(theme, params);
    }

    public applyCellLoadingHooks(result: IGridCellLoading, params: { record: IRecord; columnName: string }): void {
        this._cellLoadingHooks.apply(result, params);
    }

    public applyCellCommandsHooks(result: IGridCellCommands, params: { record: IRecord; columnName: string }): void {
        this._cellCommandsHooks.apply(result, params);
    }

    private _onCellFocused = (event: CellFocusedEvent<IRecord>): void => {
        const record = event.rowIndex != null ? event.api.getDisplayedRowAtIndex(event.rowIndex)?.data : undefined;
        const columnName = typeof event.column === 'string' ? event.column : event.column?.getColId();
        this.events.dispatchEvent('onFocusedCellChanged', record, record ? columnName : undefined);
    };

}
