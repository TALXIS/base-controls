import { ColDef, IRowNode } from "@ag-grid-community/core";
import { ICommandBarItemProps } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { ICustomColumnControl, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IParameters } from "@interfaces";
import { IGridServiceLocator } from "../../services";
import { GridCell, IGridCell, IGridCellParameters } from "./GridCell";
import { GridEditing, IGridEditing } from "../editing";

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
export interface IGridCells {
    /** Which cell the user is editing, and what the keyboard does about it. */
    readonly editing: IGridEditing;
    /** A cell of this grid. */
    createCell(parameters: Omit<IGridCellParameters, 'services'>): IGridCell;
    /** Registers a cell as rendered. */
    addCell(cell: IGridCell): void;
    /** The cell is gone: out of the registry, and destroyed. */
    removeCell(cell: IGridCell): void;
    /** Every cell on screen. */
    getCells(): IGridCell[];
    /** The cell drawing this field, where one is rendered. */
    getCell(record: IRecord, columnName: string): IGridCell | undefined;
    /**
     * Registers a hook over what draws a cell.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerControlHook(hook: GridControlHook, priority?: number): () => void;
    /**
     * Registers a hook over the parameters the control drawing a cell is handed.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerControlParametersHook(hook: GridControlParametersHook, priority?: number): () => void;
    /**
     * Registers a hook over the theme a cell is drawn in.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerCellThemeHook(hook: GridCellThemeHook, priority?: number): () => void;
    /**
     * Registers a hook over whether a cell is waiting.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerCellLoadingHook(hook: GridCellLoadingHook, priority?: number): () => void;
    /**
     * Registers a hook over the commands a cell offers.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerCellCommandsHook(hook: GridCellCommandsHook, priority?: number): () => void;
    /**
     * Registers a hook over whether a cell may be edited.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerCellEditableHook(hook: GridCellEditableHook, priority?: number): () => void;
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
    /** Run by the cell in question, which is the only caller. */
    applyCellLoadingHooks(result: IGridCellLoading, params: {
        record: IRecord;
        columnName: string;
    }): void;
    /** Run by the cell in question, which is the only caller. */
    applyCellEditableHooks(result: IGridCellEditable, params: {
        record: IRecord;
        columnName: string;
    }): void;
    /** Run by the cell in question, which is the only caller. */
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
    private _cellEditableHooks = new HookRegistry<GridCellEditableHook>();
    private _editing: IGridEditing;

    constructor(parameters: IGridCellsParameters) {
        this._services = parameters.services;
        this._editing = new GridEditing({ services: parameters.services });
        this._services.whenAvailable('gridApi', () => this._provider.addEventListener('onRenderRequested', this._onRenderRequested));
        this._services.get('grid').events.addEventListener('onDestroy', this._onDestroy);
    }

    public get editing(): IGridEditing {
        return this._editing;
    }

    public createCell(parameters: Omit<IGridCellParameters, 'services'>): IGridCell {
        return new GridCell({ ...parameters, services: this._services });
    }

    public addCell(cell: IGridCell): void {
        this._renderedCells.set(cell.getId(), cell);
    }

    public removeCell(cell: IGridCell): void {
        this._renderedCells.delete(cell.getId());
        cell.destroy();
    }

    public getCells(): IGridCell[] {
        return [...this._renderedCells.values()];
    }

    public getCell(record: IRecord, columnName: string): IGridCell | undefined {
        return this.getCells().find(cell => cell.getRecord().getRecordId() === record.getRecordId() && cell.getColumnName() === columnName);
    }

    public registerControlHook(hook: GridControlHook, priority?: number): () => void {
        return this._controlHooks.register(hook, priority);
    }

    public registerControlParametersHook(hook: GridControlParametersHook, priority?: number): () => void {
        return this._controlParametersHooks.register(hook, priority);
    }

    public registerCellThemeHook(hook: GridCellThemeHook, priority?: number): () => void {
        return this._cellThemeHooks.register(hook, priority);
    }

    public registerCellLoadingHook(hook: GridCellLoadingHook, priority?: number): () => void {
        return this._cellLoadingHooks.register(hook, priority);
    }

    public registerCellCommandsHook(hook: GridCellCommandsHook, priority?: number): () => void {
        return this._cellCommandsHooks.register(hook, priority);
    }

    public registerCellEditableHook(hook: GridCellEditableHook, priority?: number): () => void {
        return this._cellEditableHooks.register(hook, priority);
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

    public applyCellEditableHooks(result: IGridCellEditable, params: { record: IRecord; columnName: string }): void {
        this._cellEditableHooks.apply(result, params);
    }

    public applyCellCommandsHooks(result: IGridCellCommands, params: { record: IRecord; columnName: string }): void {
        this._cellCommandsHooks.apply(result, params);
    }

    private _onRenderRequested = (): void => this._services.get('gridApi').refreshCells();

    //the provider outlives the grid
    private _onDestroy = (): void => {
        this._provider.removeEventListener('onRenderRequested', this._onRenderRequested);
    };

    private get _provider() {
        return this._services.get('provider');
    }
}
