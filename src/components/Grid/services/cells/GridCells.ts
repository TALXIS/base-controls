import { ICustomColumnControl, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { IParameters } from "@interfaces";

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
export type GridFieldHook = (field: IGridField, params: IGridCellHookParameters) => void;

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
export type GridControlParametersHook = (parameters: IParameters, params: IGridCellHookParameters) => void;

/**
 * What a module changes about the cells of one grid.
 *
 * Only the hooks: what any single cell shows is `GridControl`'s, which is built for that cell and runs
 * what was registered here.
 */
export class GridCells {
    private _fieldHooks = new HookRegistry<GridFieldHook>();
    private _controlHooks = new HookRegistry<GridControlHook>();
    private _controlParametersHooks = new HookRegistry<GridControlParametersHook>();

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

    /** Run by the `GridControl` of the cell in question, which is the only caller of these three. */
    public applyFieldHooks(field: IGridField, params: IGridCellHookParameters): void {
        this._fieldHooks.apply(field, params);
    }

    public applyControlHooks(result: { control: Required<ICustomColumnControl> }, params: IGridCellHookParameters): void {
        this._controlHooks.apply(result, params);
    }

    public applyControlParametersHooks(parameters: IParameters, params: IGridCellHookParameters): void {
        this._controlParametersHooks.apply(parameters, params);
    }
}
