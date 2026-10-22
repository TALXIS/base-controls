import type { ColDef, SuppressKeyboardEventParams } from "ag-grid-community";
import type { IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { ILookupManyLabels, LOOKUP_MANY_LABELS } from "./labels";
import { LookupManyCell } from "./components/adapters/lookup-many-cell";
import { LookupManyCellEditor } from "./components/adapters/lookup-many-cell-editor";

/** How a lookup-many column draws its records. */
export type LookupManyAppearance =
    | { type: 'plain' }
    | { type: 'colorful'; /** The record field holding each pill's colour; `color` when left out. */ colorPropertyName?: string }
    | { type: 'people'; /** The record field holding each person's picture; `imageurl` when left out. */ imageUrlPropertyName?: string };

/** One lookup-many column, as the module's `columns` maps it. */
export interface ILookupManyColumn {
    /** The entity the column's records are of. */
    entityName: string;
    /** Plain when left out. */
    appearance?: LookupManyAppearance;
}

/** The cell a lookup-many option provider is created for. */
export interface ILookupManyOptionsParameters<TColumn extends ILookupManyColumn = ILookupManyColumn> {
    record: IRecord;
    column: IColumn;
    /** What the module's `columns` maps the column to. */
    settings: TColumn;
    taskDatasetControl: ITaskDatasetControlRuntime;
}

export interface ILookupManyParameters<TColumn extends ILookupManyColumn = ILookupManyColumn> {
    /** The lookup-many columns by name. */
    columns: { [columnName: string]: TColumn };
    /** A provider over the records the column can take, searched as the user types; `undefined` leaves the cell read-only. */
    onCreateOptionsProvider: (parameters: ILookupManyOptionsParameters<TColumn>) => IDataProvider | undefined;
    /** Overrides for the module's strings. */
    labels?: Partial<ILookupManyLabels>;
}

/** The `lookupMany` module: the columns it maps, and the records each offers. */
export interface ILookupMany {
    getColumn(columnName: string): ILookupManyColumn | undefined;
    getLabels(): ILocalizationService<ILookupManyLabels>;
    /** A provider over the records the cell's column can take; `undefined` when it takes none. */
    createOptionsProvider(record: IRecord, column: IColumn): IDataProvider | undefined;
}

//the picker's own keys while it is open; Escape and Tab still close it
const PICKER_KEYS = new Set(['Enter', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

/** Columns holding several related records, drawn as pills and picked in a pop-out editor. */
export class LookupMany<TColumn extends ILookupManyColumn = ILookupManyColumn> implements ILookupMany {
    private _taskDatasetControl: ITaskDatasetControlRuntime;
    private _parameters: ILookupManyParameters<TColumn>;
    private _labels: ILocalizationService<ILookupManyLabels>;

    constructor(taskDatasetControl: ITaskDatasetControlRuntime, parameters: ILookupManyParameters<TColumn>) {
        this._taskDatasetControl = taskDatasetControl;
        this._parameters = parameters;
        this._labels = new LocalizationService<ILookupManyLabels>({ ...LOOKUP_MANY_LABELS, ...parameters.labels });
        taskDatasetControl.registerGridModule({ onRegister: grid => this._onGridRegistered(grid) });
    }

    public getColumn(columnName: string): TColumn | undefined {
        return this._parameters.columns[columnName];
    }

    public getLabels(): ILocalizationService<ILookupManyLabels> {
        return this._labels;
    }

    public createOptionsProvider(record: IRecord, column: IColumn): IDataProvider | undefined {
        const settings = this.getColumn(column.name);
        return settings && this._parameters.onCreateOptionsProvider({ record, column, settings, taskDatasetControl: this._taskDatasetControl });
    }

    private _onGridRegistered(grid: IGrid<ITaskGridServiceMap>): void {
        //after the editing module, whose editor this replaces
        grid.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
    }

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        for (const colDef of columnDefs) {
            if (!this.getColumn(colDef.colId!)) {
                continue;
            }
            colDef.cellRenderer = LookupManyCell;
            colDef.cellEditor = LookupManyCellEditor;
            colDef.cellEditorPopup = true;
            colDef.cellEditorPopupPosition = 'over';
            colDef.sortable = false;
            colDef.suppressKeyboardEvent = this._suppressKeyboardEvent;
        }
    };

    private _suppressKeyboardEvent = (params: SuppressKeyboardEventParams<IRecord>): boolean => {
        return params.editing && PICKER_KEYS.has(params.event.key);
    };
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Columns holding several related records. */
        lookupMany: ILookupMany;
    }
}
