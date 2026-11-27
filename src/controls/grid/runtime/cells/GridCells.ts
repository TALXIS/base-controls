import { ICommandBarItemProps } from "@fluentui/react";
import { ThemeBuilder } from "@theme";
import { CellFocusedEvent } from "ag-grid-community";
import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry, IEventSubscriber, IHookPoint } from "@core";
import { IParameters } from "@pcf/interfaces";
import { IGridServiceRegistryInternal } from "..";
import { GridCell, IGridCell, IGridCellParameters } from "./GridCell";
import { getRowNode } from "../rows/getRowNode";
import { listenToGridApi } from "../grid/listenToGridApi";

/** What a cell's row is in the grid: a record, a group heading, or the total under the rows. */
export type GridCellRow = 'record' | 'group' | 'total';

/** Which cell a hook is running for. */
export interface IGridCellHookParameters {
    record: IRecord;
    columnName: string;
    row: GridCellRow;
    /** What the cell shows: the record's value, a group's value or an aggregate; undefined where the row shows none. */
    readonly value: unknown;
    /** That value as the cell's column formats it; undefined where the row shows none. */
    readonly formattedValue: string | undefined;
}

export interface IGridControlHookParameters extends IGridCellHookParameters {
    takesInput: boolean;
}

/** Where a cell's row puts the value it shows. */
export interface IGridCellRowResult {
    row: GridCellRow;
    /** The column the value is read from; undefined where the row shows nothing in this column. */
    valueColumnName?: string;
}

/** A hook over what a cell's row is and which column its value comes from; fed by the modules that add rows. */
export type GridCellRowHook = (result: IGridCellRowResult, parameters: { record: IRecord; columnName: string }) => void;

/** What a cell is drawn or edited with. */
export interface IGridCellControl {
    /** The PCF; the grid's own value renderer unless something names another. */
    name: string;
    /** What the control is handed, by parameter name. */
    parameters: IParameters;
}

/** A hook over the control a cell is drawn or edited with, and what it is handed. */
export type GridControlHook = (result: { control: IGridCellControl }, parameters: IGridControlHookParameters) => void;

/** A hook over the theme a cell is drawn in. */
export type GridCellThemeHook = (builder: ThemeBuilder, parameters: IGridCellHookParameters) => void;

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
export type GridCellCommandsHook = (result: IGridCellCommands, parameters: IGridCellHookParameters) => void;

/** A hook over whether a cell is waiting. */
export type GridCellLoadingHook = (result: IGridCellLoading, parameters: IGridCellHookParameters) => void;

export interface IGridCellsEvents {
    /** Fires when the focus moves to another cell, or out of the rows. */
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
}

/** The cell a hook is applied for, before the grid adds its row and value. */
interface IGridCellAddress {
    record: IRecord;
    columnName: string;
}

export interface IGridCellsRenderParameters {
    /** Draws only the cells in these columns. */
    columnNames?: string[];
}

export interface IGridCellsParameters {
    services: IGridServiceRegistryInternal;
}

export interface IGridCellsHooks {
    /** What draws or edits a cell, and its parameters. */
    readonly control: IHookPoint<GridControlHook>;
    /** The theme a cell is drawn in. */
    readonly theme: IHookPoint<GridCellThemeHook>;
    /** Whether a cell is waiting. */
    readonly loading: IHookPoint<GridCellLoadingHook>;
    /** The commands a cell offers. */
    readonly commands: IHookPoint<GridCellCommandsHook>;
    /** What each cell's row is and where its value comes from; for modules that add rows of their own. */
    readonly row: IHookPoint<GridCellRowHook>;
}

/** Every cell the grid has on screen. */
export interface IGridCells {
    readonly events: IEventSubscriber<IGridCellsEvents>;
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
    /** A cell of this grid. */
    createCell(parameters: Omit<IGridCellParameters, 'services'>): IGridCell;
    /** Registers a cell as rendered. */
    addCell(cell: IGridCell): void;
    /** Removes a cell from the registry once it is gone. */
    removeCell(cell: IGridCell): void;
    /** Run by the `GridControl` of the cell in question. */
    applyControlHooks(result: { control: IGridCellControl }, cell: IGridCellAddress & { takesInput: boolean }): void;
    /** Run by the `GridCellTheme` of the cell in question. */
    applyCellThemeHooks(builder: ThemeBuilder, cell: IGridCellAddress): void;
    /** Run by the cell in question. */
    applyCellLoadingHooks(result: IGridCellLoading, cell: IGridCellAddress): void;
    /** Run by the cell in question. */
    applyCellCommandsHooks(result: IGridCellCommands, cell: IGridCellAddress): void;
}

export class GridCells implements IGridCellsInternal {
    private _services: IGridServiceRegistryInternal;
    private _renderedCells = new Map<string, IGridCell>();
    public readonly hooks = {
        control: new HookRegistry<GridControlHook>(),
        theme: new HookRegistry<GridCellThemeHook>(),
        loading: new HookRegistry<GridCellLoadingHook>(),
        commands: new HookRegistry<GridCellCommandsHook>(),
        row: new HookRegistry<GridCellRowHook>(),
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

    public applyControlHooks(result: { control: IGridCellControl }, cell: IGridCellAddress & { takesInput: boolean }): void {
        this.hooks.control.apply(result, Object.assign(this._getHookParameters(cell), { takesInput: cell.takesInput }));
    }

    public applyCellThemeHooks(builder: ThemeBuilder, cell: IGridCellAddress): void {
        this.hooks.theme.apply(builder, this._getHookParameters(cell));
    }

    public applyCellLoadingHooks(result: IGridCellLoading, cell: IGridCellAddress): void {
        this.hooks.loading.apply(result, this._getHookParameters(cell));
    }

    public applyCellCommandsHooks(result: IGridCellCommands, cell: IGridCellAddress): void {
        this.hooks.commands.apply(result, this._getHookParameters(cell));
    }

    //the values are read only by the hooks that ask for them
    private _getHookParameters({ record, columnName }: IGridCellAddress): IGridCellHookParameters {
        const result: IGridCellRowResult = { row: 'record', valueColumnName: columnName };
        this.hooks.row.apply(result, { record, columnName });
        const { valueColumnName } = result;
        return {
            record,
            columnName,
            row: result.row,
            get value() {
                return valueColumnName ? record.getValue(valueColumnName) : undefined;
            },
            get formattedValue() {
                return valueColumnName ? record.getFormattedValue(valueColumnName) ?? undefined : undefined;
            },
        };
    }

    private _onCellFocused = (event: CellFocusedEvent<IRecord>): void => {
        const record = getRowNode(event.api, event.rowIndex, event.rowPinned)?.data;
        const columnName = typeof event.column === 'string' ? event.column : event.column?.getColId();
        this.events.dispatchEvent('onFocusedCellChanged', record, record ? columnName : undefined);
    };

}
