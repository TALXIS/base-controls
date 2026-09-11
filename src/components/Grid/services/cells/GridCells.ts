import { ITheme } from "@legacy";
import { ICustomColumnControl, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IParameters } from "@interfaces";
import { IGridServiceLocator } from "../../services";
import { GridCell } from "./GridCell";

/** What a cell draws, once every module has had its say. */
export interface IGridField {
    /** What the record holds for this column. */
    value: any;
    /** What it reads as. */
    formattedValue: string | null;
    /** Whether the value is still being fetched. */
    loading: boolean;
    /** Whether the row may be dragged taller from this cell. */
    isResizable: boolean;
}

/** Which cell a hook is running for. */
export interface IGridCellHookParameters {
    record: IRecord;
    columnName: string;
    /** Whether the control takes input rather than only drawing the value. */
    takesInput: boolean;
}

/**
 * A hook over what a cell draws.
 *
 * Handed the defaults and mutates them: what a cell shows, whether it is still waiting, whether the row may
 * be dragged taller from it. The grid knows nothing of why.
 */
export type GridFieldHook = (result: IGridField, params: IGridCellHookParameters) => void;

/**
 * A hook over which control draws a cell.
 *
 * Handed the control the column resolved to and replaces `result.control` to draw the cell with another.
 * A control other than `GridCellRenderer` is what makes a cell go through the nested-control registry.
 */
export type GridControlHook = (result: { control: Required<ICustomColumnControl> }, params: IGridCellHookParameters) => void;

/**
 * A hook over the parameters the control drawing a cell is handed.
 *
 * Mutates them, and reaches the control itself rather than the wrapper around it: the cell renderer's own
 * parameters on the native path, and the nested control's - not its `ControlName` and `Bindings` - on the
 * other.
 */
export type GridControlParametersHook = (result: IParameters, params: IGridCellHookParameters) => void;

/** The three colours a cell's theme is generated from. */
export interface IGridCellThemeColors {
    primary: string;
    background: string;
    text: string;
}

/** The theme a cell is drawn in, as the hooks leave it. */
export interface IGridCellThemeResult {
    /**
     * The colours the cell's theme is generated from. All three are always set, so a hook changes the one
     * it cares about and the rest stay as whatever decided them.
     */
    colors: IGridCellThemeColors;
    /**
     * A theme to draw the cell in instead of generating one, which wins over `colors`.
     *
     * Hand back the same instance for the same theme where you can: what a cell's theme reaches its
     * content through is cached on the theme object.
     */
    theme?: ITheme;
}

/**
 * A hook over the theme a cell is drawn in.
 *
 * Edit `result.colors` to recolour the cell, or set `result.theme` for one the three colours cannot
 * express. Runs per cell per render, so keep it cheap.
 */
export type GridCellThemeHook = (result: IGridCellThemeResult, params: { record: IRecord; columnName: string }) => void;

/** What a cell is waiting on, as the hooks leave it. */
export interface IGridCellLoading {
    /** Whether the cell is waiting on something rather than able to draw. */
    isLoading: boolean;
}

/**
 * A hook over whether a cell is waiting.
 *
 * Handed the answer so far and mutates it. Runs for every cell on every render, so answer from what is
 * already in hand rather than starting the fetch from inside it.
 */
export type GridCellLoadingHook = (result: IGridCellLoading, params: { record: IRecord; columnName: string }) => void;

export interface IGridCellsParameters {
    services: IGridServiceLocator;
}

/**
 * Every cell the grid has on screen, and what a module changes about all of them.
 *
 * What any single cell shows is its own `GridControl`'s, which runs the hooks registered here.
 */
export class GridCells {
    private _services: IGridServiceLocator;
    private _renderedCells = new Map<string, GridCell>();
    private _fieldHooks = new HookRegistry<GridFieldHook>();
    private _controlHooks = new HookRegistry<GridControlHook>();
    private _controlParametersHooks = new HookRegistry<GridControlParametersHook>();
    private _cellThemeHooks = new HookRegistry<GridCellThemeHook>();
    private _cellLoadingHooks = new HookRegistry<GridCellLoadingHook>();

    constructor(parameters: IGridCellsParameters) {
        this._services = parameters.services;
    }

    /** A cell of this grid. `CellHost` creates the ones that are rendered, and nothing else should. */
    public createCell(record: IRecord, columnName: string): GridCell {
        return new GridCell({ services: this._services, record: record, columnName: columnName });
    }

    /** Registers a cell as rendered. `CellHost` does this on mount, and nothing else should. */
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

    /**
     * The cell drawing this field.
     *
     * Built on the spot where none is rendered yet: AG Grid asks about a row before the cell that draws it
     * is mounted, and a caller asking for a cell wants an answer rather than an `undefined` to handle.
     */
    public getCell(record: IRecord, columnName: string): GridCell {
        const rendered = this.getCells().find(cell => cell.getRecord().getRecordId() === record.getRecordId() && cell.getColumnName() === columnName);
        return rendered ?? this.createCell(record, columnName);
    }

    /**
     * Registers a hook over what a cell draws. Runs per cell per render, so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerFieldHook(hook: GridFieldHook, priority?: number): void {
        this._fieldHooks.register(hook, priority);
    }

    /**
     * Registers a hook over what draws a cell. Runs per cell per render, so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerControlHook(hook: GridControlHook, priority?: number): void {
        this._controlHooks.register(hook, priority);
    }

    /**
     * Registers a hook over the parameters the control drawing a cell is handed. Runs per cell per render,
     * so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerControlParametersHook(hook: GridControlParametersHook, priority?: number): void {
        this._controlParametersHooks.register(hook, priority);
    }

    /**
     * Registers a hook over the theme a cell is drawn in. Runs per cell per render, so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerCellThemeHook(hook: GridCellThemeHook, priority?: number): void {
        this._cellThemeHooks.register(hook, priority);
    }

    /**
     * Registers a hook over whether a cell is waiting. Runs per cell per render, so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerCellLoadingHook(hook: GridCellLoadingHook, priority?: number): void {
        this._cellLoadingHooks.register(hook, priority);
    }

    /** Run by the `GridControl` of the cell in question, which is the only caller of these three. */
    public applyFieldHooks(result: IGridField, params: IGridCellHookParameters): void {
        this._fieldHooks.apply(result, params);
    }

    public applyControlHooks(result: { control: Required<ICustomColumnControl> }, params: IGridCellHookParameters): void {
        this._controlHooks.apply(result, params);
    }

    public applyControlParametersHooks(result: IParameters, params: IGridCellHookParameters): void {
        this._controlParametersHooks.apply(result, params);
    }

    /** Run by the `GridCellTheme` of the cell in question. */
    public applyCellThemeHooks(result: IGridCellThemeResult, params: { record: IRecord; columnName: string }): void {
        this._cellThemeHooks.apply(result, params);
    }

    /** Run by the cell in question, which is the only caller. */
    public applyCellLoadingHooks(result: IGridCellLoading, params: { record: IRecord; columnName: string }): void {
        this._cellLoadingHooks.apply(result, params);
    }
}
