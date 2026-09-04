import { CellDoubleClickedEvent, ColDef, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import { DataProvider, DataTypes, IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import { HookRegistry } from "@utils";
import { Cell } from "../../cells/cell/Cell";
import { ColumnHeader } from "../../column-headers/column-header/ColumnHeader";
import { RecordSaveIndicatorCell } from "../../cells/record-save-indicator";
import { suppressRendererInPinnedRows } from "./suppressRendererInPinnedRows";
import { Comparator } from "../ValueComparator";
import { ICellValues } from "../cells/interfaces";
import { IGridColumn } from "./interfaces";
import { IGridServiceLocator } from "../../services";

//stateless, and `equals` runs per cell per value read
const COMPARATOR = new Comparator();

/** What a column is worth when it does not say: a dataset column always carries one, an authored one may not. */
const DEFAULT_COLUMN_WIDTH = 200;

/** The key the save column takes. Its own: the dataset reserves none for a record's save state. */
const RECORD_SAVE_COLUMN_KEY = 'recordSaveStatus';

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
     * Whether a column takes input at all, and whether this record's copy of it does.
     *
     * Without a record this answers for the column alone; with one it also asks what that record's security
     * says. A column that carries no value of its own — the checkboxes, the inline ribbon — is never
     * editable, and neither is a file or an image, which have no editor.
     */
    public isColumnEditable(columnName: string, record?: IRecord): boolean {
        //a record's own provider where there is one: a group's children are a provider of their own, and
        //its copy of the column is what governs that row
        const provider = record?.getDataProvider() ?? this._provider;
        const column = provider.getColumnsMap()[columnName]!;
        switch (true) {
            case !this._settings.isEditingEnabled():
            case record?.isSaving():
            case column.oneClickEdit:
            case !!this._services.find('selection')?.isSelectionColumn(column.name):
            case column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME:
            case column.dataType === DataTypes.File:
            case column.dataType === DataTypes.Image: {
                return false;
            }
        }
        if (!record) {
            return true;
        }
        //undefined means the record says nothing about it, and the column already said yes
        return record.getColumnInfo(column.name)?.security.editable ?? true;
    }

    /**
     * The column a row reports its save in, where one is wanted.
     *
     * `undefined` on a grid that does not edit, because it has no saves to report — and on one with
     * selection, because the checkbox cell reports them in the space it already occupies.
     *
     * Pinned and unmovable, like the checkbox column it stands in for. It carries no value of its own,
     * which is why the getter and the formatter answer nothing.
     */
    private _getRecordSaveColumnDefinition(): ColDef<IRecord> | undefined {
        if (!this._settings.isEditingEnabled() || this._services.find('selection')) {
            return undefined;
        }
        return {
            colId: RECORD_SAVE_COLUMN_KEY,
            headerName: '',
            width: 40,
            lockPinned: true,
            //locked for the same reason as the checkbox column it stands in for: a module reordering the
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
        const cells = this._services.get('cells');
        return {
            colId: column.name,
            field: column.name as any,
            headerName: column.displayName,
            //flex rather than a width: AG Grid fills the grid itself, and drops a column's flex the moment
            //the user drags it - so that column keeps the width they chose while the rest go on filling.
            //`initialFlex`, so re-pushing these definitions on every load leaves a resized column alone
            initialFlex: column.visualSizeFactor ?? DEFAULT_COLUMN_WIDTH,
            minWidth: column.visualSizeFactor ?? DEFAULT_COLUMN_WIDTH,
            lockPinned: true,
            autoHeaderHeight: true,
            autoHeight: !!column.autoHeight,
            suppressMovable: column.isDraggable === false,
            headerComponentParams: {
                baseColumn: column
            },
            cellRendererParams: (params: any) => cells.getCellParameters(params.data, column, false),
            cellEditorParams: (params: any) => cells.getCellParameters(params.data, column, true),
            editable: (params) => cells.isCellEditorEnabled(column, params.data!),
            equals: (valueA: ICellValues, valueB: ICellValues) => COMPARATOR.isEqual(valueA, valueB),
            headerComponent: ColumnHeader,
            cellRenderer: Cell,
            cellEditor: Cell,
            valueGetter: (params: ValueGetterParams<IRecord>) => cells.getValues(params, column),
            valueFormatter: (params: ValueFormatterParams<IRecord>) => cells.getFormattedValue(params),
            suppressKeyboardEvent: () => cells.suppressKeyboardEvent(column),
            onCellDoubleClicked: (event: CellDoubleClickedEvent<IRecord>) => cells.onCellDoubleClick(event),
        };
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
