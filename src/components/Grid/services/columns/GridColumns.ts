import { CellClassParams, CellDoubleClickedEvent, CellStyle, ColDef, SuppressKeyboardEventParams, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import { DataProvider, DataTypes, IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import deepEqual from 'fast-deep-equal/es6';
import { HookRegistry } from "@utils";
import { FieldCellEditor } from "../../components/cells/field-cell-editor/FieldCellEditor";
import { FieldCellRenderer } from "../../components/cells/field-cell-renderer/FieldCellRenderer";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { GridCellTheme } from "../cells";
import { GridField } from "../fields";
import { IGridCellRendererParams } from "../../components/interfaces";
import { ColumnHeader } from "../../components/column-header/ColumnHeader";
import { RecordSaveIndicatorCell } from "../../components/record-save-indicator";
import { suppressRendererInPinnedRows } from "./suppressRendererInPinnedRows";
import { IGridColumn } from "./colDef";
import { IGridServiceLocator } from "../../services";


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
    public registerColumnDefinitionsHook(hook: GridColumnDefinitionsHook, priority?: number): () => void {
        return this._hooks.register(hook, priority);
    }

    /** The definitions the grid is to be given, after every module has had its say. */
    public getColumnDefinitions(): ColDef<IRecord>[] {
        const columnDefs = this._provider.getColumns().filter(column => !column.isHidden).map(column => this._getColumnDefinition(column));
        const recordSaveColumn = this._getRecordSaveColumnDefinition();
        if (recordSaveColumn) {
            columnDefs.unshift(recordSaveColumn);
        }
        this._hooks.apply(columnDefs);
        return columnDefs;
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
            lockPosition: 'left',
            resizable: false,
            sortable: false,
            pinned: 'left',
            suppressSizeToFit: true,
            suppressMovable: true,
            valueGetter: () => null,
            valueFormatter: () => '',
            cellRenderer: RecordSaveIndicatorCell,
            cellRendererSelector: suppressRendererInPinnedRows,
        };
    }

    /**
     * Whether the values in this column may be changed at all.
     *
     * The column's half of the question - what a *record* allows is the cell's, through its hooks. A grid
     * that does not edit changes nothing anywhere.
     */
    private _isColumnEditable(column: IColumn): boolean {
        return this._settings.isEditingEnabled() && !!column.metadata?.IsValidForUpdate;
    }

    /**
    * Whether a value is demanded before the record may be saved.
    *
    * Asked of the column rather than of a field, which is all a header has - so a record's own
    * `requiredLevelExpression` is not in it. A grid that does not edit demands nothing of anyone.
    */
    private _isColumnRequired(column: IColumn): boolean {
        if (!this._settings.isEditingEnabled()) {
            return false;
        }
        switch (column.metadata?.RequiredLevel) {
            case RequiredLevelEnum.SystemRequired:
            case RequiredLevelEnum.ApplicationRequired: {
                return true;
            }
            default: {
                return false;
            }
        }
    }

    /**
     * Whether this column has an editor for AG Grid to open.
     *
     * The grid's own mechanics rather than anything about a value: a grid that does not edit, a
     * one-click-edit column whose control is already the cell, the inline ribbon, and the two data types
     * nothing here can edit inline. What a *value* allows is the cell's to answer.
     */
    private _hasEditor(column: IColumn): boolean {
        switch (true) {
            case !this._settings.isEditingEnabled():
            //TODO: this should be grid specific setting
            case !!column.oneClickEdit:
            case column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME:
            case column.dataType === DataTypes.File:
            case column.dataType === DataTypes.Image: {
                return false;
            }
        }
        return true;
    }

    private _getColumnDefinition(column: IColumn): ColDef<IRecord> {
        return {
            colId: column.name,
            field: column.name as any,
            headerName: column.displayName,
            //TODO: grid specific setting
            initialFlex: column.visualSizeFactor ?? DEFAULT_COLUMN_WIDTH,
            minWidth: column.visualSizeFactor ?? DEFAULT_COLUMN_WIDTH,
            lockPinned: true,
            autoHeaderHeight: true,
            //TODO: grid specific setting
            autoHeight: !!column.autoHeight,
            //TODO: grid specific setting
            suppressMovable: column.isDraggable === false,
            propBag: { column: this._getGridColumn(column) },
            cellStyle: (params: CellClassParams<IRecord>) => this._getCellStyle(params, column.name),
            cellRendererParams: this._getCellRendererParameters(column),
            editable: this._getEditorAvailability(column),
            cellEditorParams: this._getCellRendererParameters(column),
            suppressKeyboardEvent: (params: SuppressKeyboardEventParams<IRecord>) => this._isKeyTheInputsOwn(params),
            equals: (valueA: any, valueB: any) => deepEqual(valueA ?? null, valueB ?? null),
            headerComponent: ColumnHeader,
            cellRenderer: FieldCellRenderer,
            cellEditor: FieldCellEditor,
            valueGetter: (params: ValueGetterParams<IRecord>) => this._getValue(params.data, column.name),
            valueFormatter: (params: ValueFormatterParams<IRecord>) => this._getFormattedValue(params.data, column.name),
            onCellDoubleClicked: (event: CellDoubleClickedEvent<IRecord>) => this._onCellDoubleClick(event),
        };
    }

    /**
     * What the cell is painted in: the surface of the theme that cell is drawn in.
     *
     * Painted on the cell itself rather than on what is drawn inside it, because the cell is the element
     * that fills the row - a cell of a column that did not grow the row is taller than anything it holds.
     */
    private _getCellStyle(params: CellClassParams<IRecord>, columnName: string): CellStyle | undefined {
        const record = params.data;
        if (!record) {
            return undefined;
        }
        //its own rather than the rendered cell's: AG Grid asks for this while it builds the cell, which is
        //before the cell that would answer has been drawn and registered
        const theme = new GridCellTheme({ services: this._services, record: record, columnName: columnName, node: params.node }).getValue();
        return { backgroundColor: theme.semanticColors.bodyBackground, color: theme.semanticColors.bodyText };
    }

    /**
     * What AG Grid asks before opening an editor.
     *
     * A column with no editor to open says so plainly rather than through a callback, so that everything
     * reading the definition back - a consumer overriding it, a module deciding what to draw - finds an
     * answer rather than a function it cannot call.
     */
    private _getEditorAvailability(column: IColumn): ColDef<IRecord>['editable'] {
        if (!this._hasEditor(column)) {
            return false;
        }
        return (params) => this._isEditorAvailable(params.data, params.colDef);
    }

    /** Whether an editor may be opened over this cell, which is the cell's own answer. */
    private _isEditorAvailable(record: IRecord | undefined, colDef: ColDef<IRecord>): boolean {
        return !!record && this._cells.createCell(record, colDef).isEditable();
    }

    /** The column as everything downstream reads it: the dataset's, with the grid's own answers on it. */
    private _getGridColumn(column: IColumn): IGridColumn {
        return { ...column, isRequired: this._isColumnRequired(column), isEditable: this._isColumnEditable(column) };
    }

    /**
     * Whether a key press belongs to the input it was typed in rather than to the grid.
     *
     * A cell whose control takes input without an editor being opened - a one-click-edit column, or a
     * consumer's own cell - is focused inside an input AG Grid does not know about, so the gestures it
     * would read as grid commands are the caret's: selecting the text rather than every cell, copying the
     * value rather than the range, walking the characters rather than the columns. What moves between
     * cells - tab, enter, escape - stays the grid's.
     */
    private _isKeyTheInputsOwn(params: SuppressKeyboardEventParams<IRecord>): boolean {
        //an open editor is a case AG Grid already knows to keep out of
        if (params.editing) {
            return false;
        }
        const target = params.event.target as HTMLElement | null;
        if (!target?.matches('input, textarea, [contenteditable="true"]')) {
            return false;
        }
        const key = params.event.key;
        if (params.event.ctrlKey || params.event.metaKey) {
            return ['a', 'c', 'v', 'x'].includes(key.toLowerCase());
        }
        return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Backspace', 'Delete'].includes(key);
    }

    /** What AG Grid compares to decide whether a cell needs redrawing. */
    private _getValue(record: IRecord | undefined, columnName: string): any {
        return record ? this._getField(record, columnName).getValue() : null;
    }

    /** What a cell shows when it is not rendering a control of its own. */
    private _getFormattedValue(record: IRecord | undefined, columnName: string): string {
        return record ? this._getField(record, columnName).getFormattedValue() ?? '' : '';
    }

    /**
     * Navigation on a double click.
     *
     * An editable grid never navigates: a double click there means "edit this" on some columns and "open
     * this" on others, and one gesture cannot mean both.
     */
    private _onCellDoubleClick(event: CellDoubleClickedEvent<IRecord>): void {
        const record = event.data;
        //a row with no record of its own stands for nothing to open
        if (!record) {
            return;
        }
        const columnName = event.colDef.colId!;
        //the click landed on a rendered cell, so one is registered
        const cell = this._cells.getCell(record, columnName)!;
        switch (true) {
            case !this._settings.isNavigationEnabled():
            case this._settings.isEditingEnabled():
            case cell.isEditable(): {
                break;
            }
            default: {
                record.getDataProvider().openDatasetItem(record.getNamedReference());
            }
        }
    }

    /** The field AG Grid is asking about, as something to ask. */
    private _getField(record: IRecord, columnName: string): GridField {
        return new GridField({ record: record, columnName: columnName });
    }

    /** What a cell needs to draw a value beyond the record AG Grid hands it. */
    private _getCellRendererParameters(column: IColumn): IGridCellRendererParams {
        //a one-click-edit column takes input without ever entering edit mode, so its renderer is an editor
        return { editing: !!column.oneClickEdit };
    }

    private get _cells() {
        return this._services.get('cells');
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
