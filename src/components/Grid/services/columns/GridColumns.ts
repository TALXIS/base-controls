import { CellDoubleClickedEvent, CellStyle, ColDef, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import { IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import deepEqual from 'fast-deep-equal/es6';
import { HookRegistry } from "@utils";
import { FieldControl } from "../../components/adapters";
import { GridControl } from "../cells";
import { IGridCellRendererParams } from "../../components/interfaces";
import { ColumnHeader } from "../../components/column-header/ColumnHeader";
import { RecordSaveIndicatorCell } from "../../components/record-save-indicator";
import { suppressRendererInPinnedRows } from "./suppressRendererInPinnedRows";
import { IGridColumn } from "./interfaces";
import { IGridServiceLocator } from "../../services";
import { Cell } from "@components/Grid/components/adapters/cell/Cell";


/** What a column is worth when it does not say: a dataset column always carries one, an authored one may not. */
const DEFAULT_COLUMN_WIDTH = 200;

/** The key the save column takes. Its own: the dataset reserves none for a record's save state. */
export const RECORD_SAVE_COLUMN_KEY = 'recordSaveStatus';

/**
 * A hook over the column definitions the grid is about to be given.
 *
 * Mutates rather than returning: these are the definitions on their way to AG Grid, and a hook that adds
 * or removes one writes to the array itself.
 */
export type GridColumnDefinitionsHook = (columnDefs: ColDef<IRecord>[]) => void;

export interface IGridColumnsParameters {
    services: IGridServiceLocator;
}

/**
 * The columns the grid gives AG Grid.
 *
 * What it builds is deliberately plain — a name, a width, what renders in it, whether it may be edited.
 * Sorting, filtering, grouping and the selection column are all modules, and each puts what it needs on
 * these through a hook.
 */
export class GridColumns {
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridColumnDefinitionsHook>();

    constructor(parameters: IGridColumnsParameters) {
        this._services = parameters.services;
    }

    /**
     * Registers a hook over the column definitions. Runs on every definitions pass.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     * Defaults to `0`, and hooks sharing a priority run in the order they were registered.
     */
    public registerColumnDefinitionsHook(hook: GridColumnDefinitionsHook, priority?: number): void {
        this._hooks.register(hook, priority);
    }

    /** The definitions the grid is to be given, after every module has had its say. */
    public getColumnDefinitions(): ColDef<IRecord>[] {
        const columnDefs = this.getGridColumns()
            .filter(column => !column.isHidden)
            .map(column => this._getColumnDefinition(column));
        const recordSaveColumn = this._getRecordSaveColumnDefinition();
        if (recordSaveColumn) {
            columnDefs.unshift(recordSaveColumn);
        }
        this._hooks.apply(columnDefs);
        return columnDefs;
    }

    /** Every column the provider carries, as the grid sees it. */
    public getGridColumns(): IGridColumn[] {
        return this._provider.getColumns().map(column => this.getGridColumn(column));
    }

    /**
     * A column as the grid sees it.
     *
     * Derived on demand rather than cached: the provider's columns are what it is derived from, and a copy
     * kept alongside them is one that can be stale or missing.
     */
    public getGridColumn(column: IColumn): IGridColumn {
        return {
            ...column,
            isEditable: this._isColumnEditable(column),
            isRequired: this._isColumnRequired(column),
        };
    }

    /**
     * The column a row reports its save in, where one is wanted.
     *
     * `undefined` on a grid that does not edit, because it has no saves to report. A grid with selection
     * has no need of it either, and the selection module takes it back out — the checkbox cell reports a
     * save in the space it already occupies.
     *
     * Pinned and unmovable, like the checkbox column that replaces it. It carries no value of its own,
     * which is why the getter and the formatter answer nothing.
     */
    private _getRecordSaveColumnDefinition(): ColDef<IRecord> | undefined {
        if (!this._settings.isEditingEnabled()) {
            return undefined;
        }
        return {
            colId: RECORD_SAVE_COLUMN_KEY,
            headerName: '',
            width: 40,
            lockPinned: true,
            //locked for the same reason as the checkbox column that replaces it: a module reordering the
            //definitions must not push it out of the leading position
            lockPosition: 'left',
            resizable: false,
            sortable: false,
            pinned: 'left',
            suppressSizeToFit: true,
            suppressMovable: true,
            valueGetter: () => null,
            valueFormatter: () => '',
            cellRenderer: RecordSaveIndicatorCell,
            cellRendererParams: (params: any) => ({ record: params.data }),
            cellRendererSelector: suppressRendererInPinnedRows,
        };
    }

    private _isColumnEditable(column: IColumn): boolean {
        if (!this._settings.isEditingEnabled()) {
            return false;
        }
        return !!column.metadata?.IsValidForUpdate;
    }

    private _isColumnRequired(column: IColumn): boolean {
        if (!this._settings.isEditingEnabled()) {
            return false;
        }
        switch (column.metadata?.RequiredLevel) {
            case 1:
            case 2: {
                return true;
            }
            default: {
                return false;
            }
        }
    }

    private _getColumnDefinition(column: IGridColumn): ColDef<IRecord> {
        return {
            colId: column.name,
            field: column.name as any,
            headerName: column.displayName,
            initialFlex: column.visualSizeFactor ?? DEFAULT_COLUMN_WIDTH,
            minWidth: column.visualSizeFactor ?? DEFAULT_COLUMN_WIDTH,
            lockPinned: true,
            autoHeaderHeight: true,
            autoHeight: !!column.autoHeight,
            suppressMovable: column.isDraggable === false,
            headerComponentParams: {
                baseColumn: column
            },
            cellStyle: (params) => this._getCellStyle(params.data, column.name),
            cellRendererParams: (params: any) => this._getCellRendererParameters(params.data, column),
            editable: (params) => this._isEditable(params.data, column.name),
            cellEditorParams: (params: any) => ({ ...this._getCellRendererParameters(params.data, column), editing: true }),
            equals: (valueA: any, valueB: any) => deepEqual(valueA ?? null, valueB ?? null),
            headerComponent: ColumnHeader,
            cellRenderer: Cell,
            cellEditor: FieldControl,
            valueGetter: (params: ValueGetterParams<IRecord>) => this._getValue(params.data, column.name),
            valueFormatter: (params: ValueFormatterParams<IRecord>) => this._getFormattedValue(params.data, column.name),
            onCellDoubleClicked: (event: CellDoubleClickedEvent<IRecord>) => this._onCellDoubleClick(event),
        };
    }

    /** Whether AG Grid may put this cell into edit mode. */
    private _isEditable(record: IRecord | undefined, columnName: string): boolean {
        return !!record && this._getControl(record, columnName).isEditable();
    }

    /** What AG Grid compares to decide whether a cell needs redrawing. */
    private _getValue(record: IRecord | undefined, columnName: string): any {
        return record ? this._getControl(record, columnName).getValue() : null;
    }

    /** What a cell shows when it is not rendering a control of its own. */
    private _getFormattedValue(record: IRecord | undefined, columnName: string): string {
        return record ? this._getControl(record, columnName).getFormattedValue() : '';
    }

    /**
     * Navigation on a double click.
     *
     * An editable grid never navigates: a double click there means "edit this" on some columns and "open
     * this" on others, and one gesture cannot mean both. Neither does a column whose cell is not a value
     * at all.
     */
    private _onCellDoubleClick(event: CellDoubleClickedEvent<IRecord>): void {
        const record = event.data;
        //a row with no record of its own stands for nothing to open
        if (!record) {
            return;
        }
        const columnName = event.colDef.colId!;
        switch (true) {
            case !this._settings.isNavigationEnabled():
            case this._settings.isEditingEnabled():
            case this._getControl(record, columnName).isEditable():
            case !!this._services.find('selection')?.isSelectionColumn(columnName): {
                return;
            }
        }
        record.getDataProvider().openDatasetItem(record.getNamedReference());
    }

    /** The cell AG Grid is asking about, as something to ask. */
    private _getControl(record: IRecord, columnName: string): GridControl {
        return new GridControl({ services: this._services, record: record, columnName: columnName });
    }

    /**
     * What AG Grid paints on the cell element.
     *
     * Given to AG Grid rather than painted inside the cell, so the background it draws for the range, the
     * value flash and the row's selection is not covered by one of the cell's own.
     */
    private _getCellStyle(record: IRecord | undefined, columnName: string): CellStyle | undefined {
        if (!record) {
            return undefined;
        }
        const backgroundColor = this._services.get('theming').getCellBackgroundColor(record, columnName);
        return backgroundColor ? { backgroundColor: backgroundColor } : undefined;
    }

    /** What a cell needs to draw a value: no control and no bindings, since nothing there reads them. */
    private _getCellRendererParameters(record: IRecord, column: IGridColumn): IGridCellRendererParams {
        //a one-click-edit column takes input without ever entering edit mode, so its renderer is an editor
        return { baseColumn: column, record: record, editing: !!column.oneClickEdit };
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
