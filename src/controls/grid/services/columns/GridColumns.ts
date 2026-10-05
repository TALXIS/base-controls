import { CellDoubleClickedEvent, ColDef, EditableCallbackParams, SuppressHeaderKeyboardEventParams, SuppressKeyboardEventParams, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import { DataProvider, DataTypes, EventEmitter, IColumn, IDataProvider, IEventEmitter, IRecord } from "@talxis/client-libraries";
import deepEqual from 'fast-deep-equal/es6';
import { HookRegistry, IAlignment } from "@utils";
import { CellFieldEditor } from "../../components/cells/field-cell-editor/CellFieldEditor";
import { CellFieldRenderer } from "../../components/cells/field-cell-renderer/CellFieldRenderer";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { IGridField } from "../fields";
import { ColumnHeaderRenderer } from "../../components/column-header/ColumnHeaderRenderer";
import { RecordSaveIndicatorCell } from "../../components/record-save-indicator/RecordSaveIndicatorCell";
import { IGridColumnSettings } from "./colDef";
import { IGridServiceLocator } from "../../services";
import { GridColumnHeaders, IGridColumnHeaders } from "../column-header";
import { CellEmptyRenderer } from "@controls/grid/components/cells/empty-cell-renderer/CellEmptyRenderer";


/** What a column is worth when it does not say. */
export const DEFAULT_COLUMN_WIDTH = 200;

/** How narrow the user may drag a column. */
const MIN_COLUMN_WIDTH = 40;

/** The key the save column takes. */
export const RECORD_SAVE_COLUMN_KEY = 'recordSaveStatus';

/** A hook over the column definitions the grid is about to be given. */
export type GridColumnDefinitionsHook = (columnDefs: ColDef<IRecord>[]) => void;

export interface IGridColumnsParameters {
    services: IGridServiceLocator;
}

export interface IGridColumnsEvents {
    /** A record's cell was double-clicked, whether or not the record then opens. */
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
    /** The user resized or moved a column, and the provider holds the result. */
    onColumnsChanged: (columns: IColumn[]) => void;
}

/** The columns the grid gives AG Grid. */
export interface IGridColumns {
    readonly events: IEventEmitter<IGridColumnsEvents>;
    /** What a column header offers, assembled from what the modules registered. */
    readonly headers: IGridColumnHeaders;
    /**
     * Registers a hook over the column definitions.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerColumnDefinitionsHook(hook: GridColumnDefinitionsHook, priority?: number): () => void;
    /** The definitions the grid is to be given, after every module has had its say. */
    getColumnDefinitions(): ColDef<IRecord>[];
}

export class GridColumns implements IGridColumns {
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridColumnDefinitionsHook>();
    private _headers: IGridColumnHeaders;
    public readonly events: IEventEmitter<IGridColumnsEvents> = new EventEmitter<IGridColumnsEvents>();

    constructor(parameters: IGridColumnsParameters) {
        this._services = parameters.services;
        this._headers = new GridColumnHeaders({ services: parameters.services });
        //after every module's hook, so the caller sees the columns as the modules left them
        this._hooks.register(this._applyColDefs, Number.MAX_SAFE_INTEGER);
    }

    public get headers(): IGridColumnHeaders {
        return this._headers;
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

    /** The caller's `colDefs`: merged over the column with the same id, else added. */
    private _applyColDefs = (columnDefs: ColDef<IRecord>[]): void => {
        for (const [colId, override] of Object.entries(this._settings.getColDefs())) {
            const index = columnDefs.findIndex(columnDef => columnDef.colId === colId);
            const base: ColDef<IRecord> = index === -1 ? { colId } : columnDefs[index];
            const changes = typeof override === 'function' ? override(base) : override;
            const merged = { ...base, ...changes, colId, settings: this._mergeSettings(base.settings, changes.settings) };
            if (index === -1) {
                columnDefs.push(merged);
            }
            else {
                columnDefs[index] = merged;
            }
        }
    };

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

    /** Whether the values in this column are locked for good. */
    private _isColumnLocked(column: IColumn): boolean {
        return !column.metadata?.IsValidForUpdate;
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
            case column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME:
            case column.dataType === DataTypes.File:
            case column.dataType === DataTypes.Image: {
                return false;
            }
        }
        return true;
    }

    private _getAlignment(column: IColumn): IAlignment {
        switch (true) {
            case column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME:
            case column.dataType === DataTypes.WholeNone:
            case column.dataType === DataTypes.Decimal:
            case column.dataType === DataTypes.Currency: {
                return 'right';
            }
        }
        return 'left';
    }

    private _getColumnDefinition(column: IColumn): ColDef<IRecord> {
        return {
            colId: column.name,
            field: column.name as any,
            headerName: column.displayName,
            //the width and the flex are the column layout's
            initialWidth: column.visualSizeFactor ?? DEFAULT_COLUMN_WIDTH,
            minWidth: MIN_COLUMN_WIDTH,
            lockPinned: true,
            autoHeaderHeight: true,
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
        //a one-click column takes input where its cell stands
        if (colDef.settings?.cell?.oneClickEdit) {
            return false;
        }
        return !!record && !this._services.get('locks').get({ record: record, columnName: colDef.colId }).isLocked;
    }

    //merged a level deep so an entry can change one setting, or one callback, and keep the rest
    private _mergeSettings(base: IGridColumnSettings = {}, override: IGridColumnSettings = {}): IGridColumnSettings {
        return {
            ...base,
            ...override,
            cell: { ...base.cell, ...override.cell },
            header: { ...base.header, ...override.header },
        };
    }

    /** What the grid's cells and header read about this column. */
    private _getColumnSettings(column: IColumn): IGridColumnSettings {
        return {
            alignment: this._getAlignment(column),
            isLocked: this._isColumnLocked(column),
            isRequired: this._isColumnRequired(column),
            isPrimary: !!column.isPrimary,
            cell: { isRowResizable: this._isLongText(column) },
        };
    }

    /** Whether the column holds text that runs over more than one line. */
    private _isLongText(column: IColumn): boolean {
        return column.dataType === DataTypes.Multiple || column.dataType === DataTypes.SingleLineTextArea;
    }

    /** Whether a key press on a header belongs to the header. */
    private _isKeyTheHeadersOwn(params: SuppressHeaderKeyboardEventParams<IRecord>): boolean {
        //the header answers Enter the way it answers a click
        return params.event.key === 'Enter';
    }

    /** Whether a key press belongs to the control it was pressed in. */
    private _isKeyTheControlsOwn(params: SuppressKeyboardEventParams<IRecord>): boolean {
        const target = params.event.target as HTMLElement | null;
        const key = params.event.key;
        //the browser turns these keys on a button into a click
        if (target?.matches('button, [role="switch"], [role="checkbox"], [role="radio"]')) {
            return key === 'Enter' || key === ' ';
        }
        //AG Grid already leaves keys in an open editor alone
        if (params.editing) {
            return false;
        }
        if (!target?.matches('input, textarea, [contenteditable="true"]')) {
            return false;
        }
        if (params.event.ctrlKey || params.event.metaKey) {
            return ['a', 'c', 'v', 'x'].includes(key.toLowerCase());
        }
        //space selects the row everywhere else
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
        this.events.dispatchEvent('onCellDoubleClicked', record, columnName);
        if (this._settings.isNavigationEnabled() && !this._settings.isEditingEnabled()) {
            this._services.get('grid').openRecord({ record: record, reference: record.getNamedReference() });
        }
    }

    /** The field AG Grid is asking about, as something to ask. */
    private _getField(record: IRecord, columnName: string): IGridField {
        return this._services.get('fields').get(record, columnName);
    }


    private get _settings() {
        return this._services.get('settings');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
