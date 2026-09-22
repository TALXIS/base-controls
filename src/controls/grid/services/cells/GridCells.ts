import { ColDef, IRowNode } from "@ag-grid-community/core";
import { ICommandBarItemProps } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { ICustomColumnControl, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IParameters } from "@interfaces";
import { IGridServiceLocator } from "../../services";
import { GridCell, IGridCellParameters } from "./GridCell";

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

/** Whether a cell may be edited, as the hooks leave it. */
export interface IGridCellEditable {
    /** Whether what the cell holds may be changed. */
    isEditable: boolean;
}

/** What a cell is waiting on, as the hooks leave it. */
export interface IGridCellLoading {
    /** Whether the cell is waiting on something rather than able to draw. */
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

/** A hook over whether a cell may be edited. */
export type GridCellEditableHook = (result: IGridCellEditable, params: { record: IRecord; columnName: string }) => void;

export interface IGridCellsParameters {
    services: IGridServiceLocator;
}

/** Every cell the grid has on screen. */
export class GridCells {
    private _services: IGridServiceLocator;
    private _renderedCells = new Map<string, GridCell>();
    private _controlHooks = new HookRegistry<GridControlHook>();
    private _controlParametersHooks = new HookRegistry<GridControlParametersHook>();
    private _cellThemeHooks = new HookRegistry<GridCellThemeHook>();
    private _cellLoadingHooks = new HookRegistry<GridCellLoadingHook>();
    private _cellCommandsHooks = new HookRegistry<GridCellCommandsHook>();
    private _cellEditableHooks = new HookRegistry<GridCellEditableHook>();

    constructor(parameters: IGridCellsParameters) {
        this._services = parameters.services;
    }

    /** A cell of this grid. */
    public createCell(parameters: Omit<IGridCellParameters, 'services'>): GridCell {
        return new GridCell({ ...parameters, services: this._services });
    }

    /** Registers a cell as rendered. */
    public addCell(cell: GridCell): void {
        this._renderedCells.set(cell.getId(), cell);
    }

    /** The cell is gone: out of the registry, and destroyed. */
    public removeCell(cell: GridCell): void {
        this._renderedCells.delete(cell.getId());
        cell.destroy();
    }

    /** Every cell on screen. */
    public getCells(): GridCell[] {
        return [...this._renderedCells.values()];
    }

    /** The cell drawing this field, where one is rendered. */
    public getCell(record: IRecord, columnName: string): GridCell | undefined {
        return this.getCells().find(cell => cell.getRecord().getRecordId() === record.getRecordId() && cell.getColumnName() === columnName);
    }

    /**
     * Registers a hook over what draws a cell.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerControlHook(hook: GridControlHook, priority?: number): () => void {
        return this._controlHooks.register(hook, priority);
    }

    /**
     * Registers a hook over the parameters the control drawing a cell is handed.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerControlParametersHook(hook: GridControlParametersHook, priority?: number): () => void {
        return this._controlParametersHooks.register(hook, priority);
    }

    /**
     * Registers a hook over the theme a cell is drawn in.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerCellThemeHook(hook: GridCellThemeHook, priority?: number): () => void {
        return this._cellThemeHooks.register(hook, priority);
    }

    /**
     * Registers a hook over whether a cell is waiting.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerCellLoadingHook(hook: GridCellLoadingHook, priority?: number): () => void {
        return this._cellLoadingHooks.register(hook, priority);
    }

    /**
     * Registers a hook over the commands a cell offers.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerCellCommandsHook(hook: GridCellCommandsHook, priority?: number): () => void {
        return this._cellCommandsHooks.register(hook, priority);
    }

    /**
     * Registers a hook over whether a cell may be edited.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerCellEditableHook(hook: GridCellEditableHook, priority?: number): () => void {
        return this._cellEditableHooks.register(hook, priority);
    }

    /** Run by the `GridControl` of the cell in question. */
    public applyControlHooks(result: { control: Required<ICustomColumnControl> }, params: IGridCellHookParameters): void {
        this._controlHooks.apply(result, params);
    }

    public applyControlParametersHooks(result: IParameters, params: IGridCellHookParameters): void {
        this._controlParametersHooks.apply(result, params);
    }

    /** Run by the `GridCellTheme` of the cell in question. */
    public applyCellThemeHooks(theme: ThemeBuilder, params: { record: IRecord; columnName: string }): void {
        this._cellThemeHooks.apply(theme, params);
    }

    /** Run by the cell in question, which is the only caller. */
    public applyCellLoadingHooks(result: IGridCellLoading, params: { record: IRecord; columnName: string }): void {
        this._cellLoadingHooks.apply(result, params);
    }

    /** Run by the cell in question, which is the only caller. */
    public applyCellEditableHooks(result: IGridCellEditable, params: { record: IRecord; columnName: string }): void {
        this._cellEditableHooks.apply(result, params);
    }

    /** Run by the cell in question, which is the only caller. */
    public applyCellCommandsHooks(result: IGridCellCommands, params: { record: IRecord; columnName: string }): void {
        this._cellCommandsHooks.apply(result, params);
    }
}
