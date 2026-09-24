import { CellDoubleClickedEvent, ColDef, EditableCallbackParams, SuppressHeaderKeyboardEventParams, SuppressKeyboardEventParams, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import { DataProvider, DataTypes, IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import deepEqual from 'fast-deep-equal/es6';
import { HookRegistry } from "@utils";
import { CellFieldEditor } from "../../components/cells/field-cell-editor/CellFieldEditor";
import { CellFieldRenderer } from "../../components/cells/field-cell-renderer/CellFieldRenderer";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { GridField, IGridField } from "../fields";
import { ColumnHeaderRenderer } from "../../components/column-header/ColumnHeaderRenderer";
import { RecordSaveIndicatorCell } from "../../components/record-save-indicator";
import { IGridColumnSettings } from "./colDef";
import { IGridServiceLocator } from "../../services";
import { CellRenderer } from "@controls/grid/components/cells/cell-renderer/CellRenderer";
import { CellEditor } from "@controls/grid/components/cells/cell-editor/CellEditor";
import { CellEmptyRenderer } from "@controls/grid/components/cells/empty-cell-renderer/CellEmptyRenderer";


/** What a column is worth when it does not say. */
const DEFAULT_COLUMN_WIDTH = 200;

/** The key the save column takes. */
export const RECORD_SAVE_COLUMN_KEY = 'recordSaveStatus';

/** A hook over the column definitions the grid is about to be given. */
export type GridColumnDefinitionsHook = (columnDefs: ColDef<IRecord>[]) => void;

export interface IGridColumnsParameters {
    services: IGridServiceLocator;
}

/** The columns the grid gives AG Grid. */
export interface IGridColumns {
    /**
     * Registers a hook over the column definitions.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    registerColumnDefinitionsHook(hook: GridColumnDefinitionsHook, priority?: number): () => void;
    /** The definitions the grid is to be given, after every module has had its say. */
    getColumnDefinitions(): ColDef<IRecord>[];
}

export class GridColumns implements IGridColumns {
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridColumnDefinitionsHook>();

    constructor(parameters: IGridColumnsParameters) {
        this._services = parameters.services;
    }

    public registerColumnDefinitionsHook(hook: GridColumnDefinitionsHook, priority?: number): () => void {
        return this._hooks.register(hook, priority);
    }

    public getColumnDefinitions(): ColDef<IRecord>[] {
        const columnDefs = this._provider.getColumns().filter(column => !column.isHidden).map(column => this._getColumnDefinition(column));
        const recordSaveColumn = this._getRecordSaveColumnDefinition();
        if (recordSaveColumn) {
            columnDefs.unshift(recordSaveColumn);
        }
        const own = new Set(columnDefs);
        this._hooks.apply(columnDefs);
        columnDefs.filter(columnDef => !own.has(columnDef)).forEach(columnDef => this._applyGridBehaviour(columnDef));
        return columnDefs;
    }

    /** What a column a hook added takes from the grid, where it did not say otherwise. */
    private _applyGridBehaviour(columnDef: ColDef<IRecord>): void {
        columnDef.headerComponent ??= ColumnHeaderRenderer;
        columnDef.cellRenderer ??= CellEmptyRenderer;
        columnDef.suppressKeyboardEvent ??= (params: SuppressKeyboardEventParams<IRecord>) => this._isKeyTheControlsOwn(params);
        columnDef.suppressHeaderKeyboardEvent ??= (params: SuppressHeaderKeyboardEventParams<IRecord>) => this._isKeyTheHeadersOwn(params);
        columnDef.editable ??= !!columnDef.cellEditor && ((params: EditableCallbackParams<IRecord>) => this._isEditorAvailable(params.data, params.colDef));
    }

    /** The column a row reports its save in, where one is wanted. */
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
            //a pinned row has no save of its own to report
            cellRendererSelector: params => ({ component: params.node.rowPinned ? CellEmptyRenderer : RecordSaveIndicatorCell }),
        };
    }

    /** Whether the values in this column may be changed at all. */
    private _isColumnEditable(column: IColumn): boolean {
        return this._settings.isEditingEnabled() && !!column.metadata?.IsValidForUpdate;
    }

    /** Whether a value is demanded before the record may be saved. */
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
            settings: this._getColumnSettings(column),
            editable: this._getEditorAvailability(column),
            suppressKeyboardEvent: (params: SuppressKeyboardEventParams<IRecord>) => this._isKeyTheControlsOwn(params),
            suppressHeaderKeyboardEvent: (params: SuppressHeaderKeyboardEventParams<IRecord>) => this._isKeyTheHeadersOwn(params),
            equals: (valueA: any, valueB: any) => deepEqual(valueA ?? null, valueB ?? null),
            headerComponent: ColumnHeaderRenderer,
            cellRenderer: CellFieldRenderer,
            cellEditor: CellFieldEditor,
            valueGetter: (params: ValueGetterParams<IRecord>) => this._getValue(params.data, column.name),
            valueFormatter: (params: ValueFormatterParams<IRecord>) => this._getFormattedValue(params.data, column.name),
            onCellDoubleClicked: (event: CellDoubleClickedEvent<IRecord>) => this._onCellDoubleClick(event),
        };
    }

    /** What AG Grid asks before opening an editor. */
    private _getEditorAvailability(column: IColumn): ColDef<IRecord>['editable'] {
        if (!this._hasEditor(column)) {
            return false;
        }
        return (params) => this._isEditorAvailable(params.data, params.colDef);
    }

    /** Whether an editor may be opened over this cell. */
    private _isEditorAvailable(record: IRecord | undefined, colDef: ColDef<IRecord>): boolean {
        return !!record && this._cells.createCell({ record: record, colDef: colDef }).isEditable();
    }

    /** What the grid's cells and header read about this column. */
    private _getColumnSettings(column: IColumn): IGridColumnSettings {
        return {
            alignment: column.alignment,
            oneClickEdit: !!column.oneClickEdit,
            isEditable: this._isColumnEditable(column),
            isRequired: this._isColumnRequired(column),
        };
    }

    /** Whether a key press on a header belongs to the header rather than to AG Grid. */
    private _isKeyTheHeadersOwn(params: SuppressHeaderKeyboardEventParams<IRecord>): boolean {
        //AG Grid sorts on Enter, where the header answers it the way it answers a click
        return params.event.key === 'Enter';
    }

    /** Whether a key press belongs to the control it was pressed in. */
    private _isKeyTheControlsOwn(params: SuppressKeyboardEventParams<IRecord>): boolean {
        const target = params.event.target as HTMLElement | null;
        const key = params.event.key;
        //what a button answers with: the browser makes a click of it
        if (target?.matches('button, [role="switch"], [role="checkbox"], [role="radio"]')) {
            return key === 'Enter' || key === ' ';
        }
        //an input with an editor around it is a case AG Grid already knows to keep out of
        if (params.editing) {
            return false;
        }
        if (!target?.matches('input, textarea, [contenteditable="true"]')) {
            return false;
        }
        if (params.event.ctrlKey || params.event.metaKey) {
            return ['a', 'c', 'v', 'x'].includes(key.toLowerCase());
        }
        //space included: it selects the row everywhere else
        return [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Backspace', 'Delete'].includes(key);
    }

    /** What AG Grid compares to decide whether a cell needs redrawing. */
    private _getValue(record: IRecord | undefined, columnName: string): any {
        return record ? this._getField(record, columnName).getValue() : null;
    }

    /** What a cell shows when it is not rendering a control of its own. */
    private _getFormattedValue(record: IRecord | undefined, columnName: string): string {
        return record ? this._getField(record, columnName).getFormattedValue() ?? '' : '';
    }

    /** Navigation on a double click. */
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
    private _getField(record: IRecord, columnName: string): IGridField {
        return new GridField({ record: record, columnName: columnName });
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
