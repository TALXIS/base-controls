import { createElement } from "react";
import { CellEditingStartedEvent, CellEditingStoppedEvent, CellEditRequestEvent, CellFocusedEvent, ColDef, EditableCallbackParams, GridApi, RowClassParams, RowClassRules } from "ag-grid-community";
import { DataProvider, DataTypes, EventEmitter, IColumn, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { IGridServiceLocator } from "../../services";
import type { IGridCell } from "../../services/cells";
import { IColumnHeaderAdornment, IGridColumnHeader } from "../../services/column-header";
import { CellUi } from "../../components/cells/ui";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { ITheme } from "@theme";
import { IGridStyles } from "../../services/runtime";
import { GridLocks, IGridLocks } from "./GridLocks";
import { getGridEditingStyles } from "./styles";
import { LOCKED_RECORD_ROW_CLASS, RECORD_LOCK_COLUMN_KEY, RECORD_SAVE_COLUMN_KEY } from "./constants";
import { RecordLockIndicatorCell } from "./components/record-lock-indicator/RecordLockIndicatorCell";
import { SELECTION_COLUMN_KEY } from "../row-selection/constants";
import { RecordSaveSelectionCell } from "./components/record-save-selection-cell/RecordSaveSelectionCell";
import { RecordSaveIndicatorCell } from "./components/record-save-indicator/RecordSaveIndicatorCell";
import { CellFieldEditor } from "./components/field-cell-editor/CellFieldEditor";
import { CellFieldRenderer } from "./components/field-cell-renderer/CellFieldRenderer";
import { getColumnContext } from "../../services/columns/colDef";

declare module "../../services/interfaces" {
    interface IGridModuleServiceMap {
        /** Which cell the user is editing, whether an edit saves itself, and what is locked. */
        editing: IGridEditing;
    }
}

export interface IGridEditedCell {
    recordId: string;
    columnName: string;
}

export interface IGridEditingEvents {
    onEditedCellChanged: (previous: IGridEditedCell | undefined, next: IGridEditedCell | undefined) => void;
}

export interface IGridEditingParameters {
    services: IGridServiceLocator;
    autoSave?: boolean;
    onEditedCellChanged?: IGridEditingEvents['onEditedCellChanged'];
}

/** Which cell the user is editing and the keys that start and end it. */
export interface IGridEditing {
    readonly events: IEventEmitter<IGridEditingEvents>;
    /** Whether a column, a record's row or a cell is locked. */
    readonly locks: IGridLocks;
    /** Whether the user is editing this cell, in place or in the editor AG Grid opened. */
    isEditing(record: IRecord, columnName: string): boolean;
    /** Whether the user is editing this cell, counting an editor from the moment it is drawn. */
    isBeingEdited(cell: IGridCell): boolean;
    /** Whether an editor may be opened over this cell. */
    isEditorAvailable(record: IRecord | undefined, colDef: ColDef<IRecord>): boolean;
    /** The user stepped into what this cell draws. */
    start(cell: IGridCell): void;
    /** Ends the edit and brings the highlight back. */
    finish(cell: IGridCell): void;
    /** Whether an edit saves its record straight away. */
    isAutoSaveEnabled(): boolean;
}

export class GridEditing implements IGridEditing {
    private _services: IGridServiceLocator;
    //by record and column, not by cell
    private _editedCell?: IGridEditedCell;
    private _recordsToSave = new Set<IRecord>();
    private _isAutoSaveEnabled: boolean;
    //by record, so the lock hooks run once per record rather than on every pass
    private _isLockedByRecord = new WeakMap<IRecord, boolean>();
    private _isRecordLockColumnVisible = false;
    //one object, so the options are not handed to AG Grid again on every refresh
    private _rowClassRules: RowClassRules<IRecord> = { [LOCKED_RECORD_ROW_CLASS]: params => this._isLockedRow(params) };
    public readonly events: IEventEmitter<IGridEditingEvents> = new EventEmitter<IGridEditingEvents>();
    public readonly locks: IGridLocks;

    constructor(parameters: IGridEditingParameters) {
        this._services = parameters.services;
        this._isAutoSaveEnabled = !!parameters.autoSave;
        this.locks = new GridLocks({ services: this._services });
        if (parameters.onEditedCellChanged) {
            this.events.addEventListener('onEditedCellChanged', parameters.onEditedCellChanged);
        }
        this._registerHooks();
        this._services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
        this._services.whenAvailable('keyboard', keyboard => keyboard.onKeyDown(event => this._onKeyDown(event)));
        this._services.whenAvailable('gridApi', gridApi => {
            gridApi.addEventListener('cellFocused', (event: CellFocusedEvent<IRecord>) => this._onCellFocused(event));
            //an editor AG Grid opens is an edit too
            gridApi.addEventListener('cellEditingStarted', this._onCellEditingStarted);
            gridApi.addEventListener('cellEditingStopped', this._onCellEditingStopped);
            gridApi.addEventListener('cellEditRequest', this._onCellEditRequest);
            gridApi.addEventListener('modelUpdated', () => this._syncRecordLockColumnVisibility());
            this._provider.addEventListener('onRecordColumnValueChanged', this._onRecordColumnValueChanged);
        });
    }

    public isAutoSaveEnabled(): boolean {
        return this._isAutoSaveEnabled;
    }

    public isBeingEdited(cell: IGridCell): boolean {
        //an editor was opened because the user asked to type here
        if (cell.takesInput() && !this._isOneClickEdit(cell.getColDef())) {
            return true;
        }
        return this.isEditing(cell.getRecord(), cell.getColumnName());
    }

    public isEditorAvailable(record: IRecord | undefined, colDef: ColDef<IRecord>): boolean {
        //a one-click column takes input where its cell stands
        if (this._isOneClickEdit(colDef)) {
            return false;
        }
        return !!record && !this.locks.get({ record: record, columnName: colDef.colId }).isLocked;
    }

    public isEditing(record: IRecord, columnName: string): boolean {
        return this._editedCell?.recordId === record.getRecordId() && this._editedCell?.columnName === columnName;
    }

    public start(cell: IGridCell): void {
        this._setEditedCell({ recordId: cell.getRecord().getRecordId(), columnName: cell.getColumnName() });
    }

    public finish(cell: IGridCell): void {
        const gridApi = this._services.find('gridApi');
        if (!gridApi) {
            return;
        }
        if (this._isEditorOpen(gridApi, cell)) {
            gridApi.stopEditing();
        }
        this._setEditedCell(undefined);
        this._returnFocus(gridApi, cell);
    }

    private _registerHooks(): void {
        const columns = this._services.get('columns');
        columns.registerColumnDefinitions(this._onColumnDefinitions, GRID_MODULE_PRIORITY.editing);
        //after row selection has added its checkbox column
        columns.registerColumnDefinitions(this._onSelectionColumnDefinitions, GRID_MODULE_PRIORITY.rowSelection + 1);
        columns.headers.registerColumnHeaderAdornments(this._onColumnHeaderAdornments, GRID_MODULE_PRIORITY.editing);
        this._services.get('grid').registerAgGridOptions(result => {
            //AG Grid hands its own writes, such as a paste, over as `cellEditRequest`
            result.options.readOnlyEdit = true;
            result.options.rowClassRules = this._rowClassRules;
        }, GRID_MODULE_PRIORITY.editing);
        this._services.get('grid').registerStyles(this._onStyles, GRID_MODULE_PRIORITY.editing);
    }

    private _onStyles = (result: IGridStyles, theme: ITheme): void => {
        result.styles.push(getGridEditingStyles(theme));
    };

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onRecordColumnValueChanged', this._onRecordColumnValueChanged);
    };

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const columns = this._services.get('provider').getColumnsMap();
        for (const colDef of columnDefs) {
            const column = columns[colDef.colId!];
            if (!column) {
                continue;
            }
            colDef.cellRenderer = CellFieldRenderer;
            colDef.cellEditor = CellFieldEditor;
            colDef.editable = this._hasEditor(column) && ((params: EditableCallbackParams<IRecord>) => this.isEditorAvailable(params.data, params.colDef));
            colDef.context = { ...colDef.context, isLocked: colDef.context?.isLocked ?? !column.metadata?.IsValidForUpdate };
            if (this._isColumnRequired(column)) {
                colDef.context = { ...colDef.context, isRequired: true };
            }
        }
        columnDefs.unshift(this._getRecordSaveColumnDefinition(), this._getRecordLockColumnDefinition());
    };

    //the checkbox column reports the save in place of the save column
    private _onSelectionColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const selectionColDef = columnDefs.find(colDef => colDef.colId === SELECTION_COLUMN_KEY);
        if (!selectionColDef) {
            return;
        }
        selectionColDef.cellRenderer = RecordSaveSelectionCell;
        const recordSaveColumnIndex = columnDefs.findIndex(colDef => colDef.colId === RECORD_SAVE_COLUMN_KEY);
        if (recordSaveColumnIndex !== -1) {
            columnDefs.splice(recordSaveColumnIndex, 1);
        }
    };

    /** The column a row reports its save in. */
    private _getRecordSaveColumnDefinition(): ColDef<IRecord> {
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
        };
    }

    /** The column a record locked as a whole shows its lock in, shown only while there is one. */
    private _getRecordLockColumnDefinition(): ColDef<IRecord> {
        return {
            colId: RECORD_LOCK_COLUMN_KEY,
            headerName: '',
            width: 40,
            lockPinned: true,
            lockPosition: 'left',
            resizable: false,
            sortable: false,
            pinned: 'left',
            suppressSizeToFit: true,
            suppressMovable: true,
            //later pushes of the definitions keep the visibility set here
            initialHide: true,
            valueGetter: () => null,
            valueFormatter: () => '',
            cellRenderer: RecordLockIndicatorCell,
        };
    }

    private _onRecordColumnValueChanged = (record: IRecord): void => {
        const wasLocked = this._isLockedByRecord.get(record);
        this._isLockedByRecord.delete(record);
        const isLocked = this._isRecordLocked(record);
        if (isLocked !== wasLocked) {
            this._refreshRowClass(record);
        }
        if (isLocked) {
            this._setRecordLockColumnVisible(true);
        }
        else if (this._isRecordLockColumnVisible) {
            this._syncRecordLockColumnVisibility();
        }
    };

    //AG Grid runs the class rules again on a row's data update, never on a cell refresh
    private _refreshRowClass(record: IRecord): void {
        const node = this._gridApi.getRowNode(record.getRecordId());
        if (node?.data) {
            node.updateData(node.data);
        }
    }

    //a pinned row stands for no record
    private _isLockedRow(params: RowClassParams<IRecord>): boolean {
        return !params.node.rowPinned && !!params.data && this._isRecordLocked(params.data);
    }

    //the only pass over the rows, and it reads the cache
    private _syncRecordLockColumnVisibility(): void {
        let hasLockedRecord = false;
        this._gridApi.forEachNode(node => {
            if (!hasLockedRecord && node.data && this._isRecordLocked(node.data)) {
                hasLockedRecord = true;
            }
        });
        this._setRecordLockColumnVisible(hasLockedRecord);
    }

    private _isRecordLocked(record: IRecord): boolean {
        let isLocked = this._isLockedByRecord.get(record);
        if (isLocked === undefined) {
            isLocked = this.locks.get({ record }).lockedBy === 'record';
            this._isLockedByRecord.set(record, isLocked);
        }
        return isLocked;
    }

    private _setRecordLockColumnVisible(isVisible: boolean): void {
        if (this._isRecordLockColumnVisible === isVisible) {
            return;
        }
        this._isRecordLockColumnVisible = isVisible;
        this._gridApi.setColumnsVisible([RECORD_LOCK_COLUMN_KEY], isVisible);
    }

    private _onColumnHeaderAdornments = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader): void => {
        if (this.locks.get({ columnName: header.getColDef().colId }).lockedBy !== 'column') {
            return;
        }
        adornments.push({
            key: 'lock',
            placement: 'suffix',
            onRender: () => createElement(CellUi.LockIcon, { message: this._services.get('labels').getLocalizedString('columnLocked') }),
        });
    };

    private _onKeyDown(event: KeyboardEvent): void {
        const editedCell = this._getEditedCell();
        if (editedCell) {
            if (event.key === 'Escape') {
                this.finish(editedCell);
            }
            return;
        }
        if (!this._isEditStartKey(event)) {
            return;
        }
        if (!(event.target as HTMLElement | null)?.matches('.ag-cell')) {
            return;
        }
        const cell = this._getFocusedCell();
        if (!cell || !this._isOneClickEdit(cell.getColDef())) {
            return;
        }
        //AG Grid answers F2 by asking for an editor the column does not open
        event.preventDefault();
        event.stopPropagation();
        this.start(cell);
    }

    //Enter and space are left to navigation and row selection
    private _isEditStartKey(event: KeyboardEvent): boolean {
        if (event.key === 'F2') {
            return true;
        }
        return event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;
    }

    private _hasEditor(column: IColumn): boolean {
        switch (true) {
            case column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME:
            case column.dataType === DataTypes.File:
            case column.dataType === DataTypes.Image: {
                return false;
            }
        }
        return true;
    }

    private _isOneClickEdit(colDef: ColDef<IRecord>): boolean {
        return !!getColumnContext(colDef).cell?.oneClickEdit;
    }

    private _isColumnRequired(column: IColumn): boolean {
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

    private _onCellFocused(event: CellFocusedEvent<IRecord>): void {
        if (!this._editedCell) {
            return;
        }
        const columnName = typeof event.column === 'string' ? event.column : event.column?.getColId();
        const record = event.rowIndex !== null ? event.api.getDisplayedRowAtIndex(event.rowIndex)?.data : undefined;
        if (record && columnName && this.isEditing(record, columnName)) {
            return;
        }
        this._setEditedCell(undefined);
    }

    private _onCellEditingStopped = (event: CellEditingStoppedEvent<IRecord>): void => {
        this._setEditedCell(undefined);
        //AG Grid does not measure an auto height row while its cell is edited
        if (event.colDef.autoHeight) {
            event.api.redrawRows({ rowNodes: [event.node] });
        }
    };

    private _onCellEditingStarted = (event: CellEditingStartedEvent<IRecord>): void => {
        if (event.data) {
            this._setEditedCell({ recordId: event.data.getRecordId(), columnName: event.column.getColId() });
        }
    };

    //what AG Grid writes itself: a paste, a cut, a fill or a cleared cell
    private _onCellEditRequest = (event: CellEditRequestEvent<IRecord>): void => {
        //an editor's value has already reached the record through its control
        if (event.source === 'edit' || !event.data) {
            return;
        }
        const columnName = event.column.getColId();
        const column = event.data.getDataProvider().getColumnsMap()[columnName];
        if (!column) {
            return;
        }
        const parser = this._services.get('pcfContext').formatting.parsing;
        const lookupReferences = column.dataType?.startsWith('Lookup.') ? this._getLookupReferences(columnName) : undefined;
        const result = parser.parse({ value: event.newValue, column, lookupReferences });
        if (!result.success) {
            return;
        }
        event.data.setValue(columnName, result.value);
        this._saveOnceWritten(event.data);
    };

    //while grouped, the records are held by the providers of their groups
    private _getLookupReferences(columnName: string): ComponentFramework.EntityReference[] {
        const provider = this._services.get('provider');
        return [provider, ...provider.getGroupedRecordDataProviders(true)].flatMap(source => source.getRecords()).flatMap(record => {
            const value = record.getValue(columnName);
            return Array.isArray(value) ? value : [];
        });
    }

    //one save per record once a paste or fill has written all its cells
    private _saveOnceWritten(record: IRecord): void {
        if (!this._isAutoSaveEnabled) {
            return;
        }
        if (this._recordsToSave.size === 0) {
            queueMicrotask(() => {
                const records = [...this._recordsToSave];
                this._recordsToSave.clear();
                records.forEach(record => record.save());
            });
        }
        this._recordsToSave.add(record);
    }

    private _setEditedCell(editedCell: IGridEditedCell | undefined): void {
        const previous = this._editedCell;
        if (editedCell?.recordId === previous?.recordId && editedCell?.columnName === previous?.columnName) {
            return;
        }
        this._editedCell = editedCell;
        this.events.dispatchEvent('onEditedCellChanged', previous, editedCell);
    }

    private _getEditedCell(): IGridCell | undefined {
        return this._cells.getCells().find(cell => this._editedCell?.recordId === cell.getRecord().getRecordId()
            && this._editedCell?.columnName === cell.getColumnName());
    }

    private _getFocusedCell(): IGridCell | undefined {
        const gridApi = this._services.find('gridApi');
        const focusedCell = gridApi?.getFocusedCell();
        if (!gridApi || !focusedCell) {
            return undefined;
        }
        const record = gridApi.getDisplayedRowAtIndex(focusedCell.rowIndex)?.data;
        return record ? this._cells.getCell(record, focusedCell.column.getColId()) : undefined;
    }

    private _isEditorOpen(gridApi: GridApi<IRecord>, cell: IGridCell): boolean {
        return gridApi.getEditingCells().some(editing => editing.rowIndex === cell.getNode()?.rowIndex
            && editing.colId === cell.getColumnName());
    }

    //deferred: focus set during an editor's teardown is lost to the document
    private _returnFocus(gridApi: GridApi<IRecord>, cell: IGridCell): void {
        const rowIndex = cell.getNode()?.rowIndex;
        if (rowIndex === null || rowIndex === undefined) {
            return;
        }
        const targetIndex = Math.max(Math.min(rowIndex + this._getRowsMoved(gridApi), gridApi.getDisplayedRowCount() - 1), 0);
        setTimeout(() => {
            gridApi.ensureIndexVisible(targetIndex);
            gridApi.setFocusedCell(targetIndex, cell.getColumnName());
            //a range does not follow the focus
            if (gridApi.getGridOption('cellSelection')) {
                gridApi.clearCellSelection();
                gridApi.addCellRange({ rowStartIndex: targetIndex, rowEndIndex: targetIndex, columns: [cell.getColumnName()] });
            }
        });
    }

    private _getRowsMoved(gridApi: GridApi<IRecord>): number {
        const keyPress = this._services.get('keyboard').getKeyBeingPressed();
        if (keyPress?.key !== 'Enter' || !gridApi.getGridOption('enterNavigatesVerticallyAfterEdit')) {
            return 0;
        }
        return keyPress.shiftKey ? -1 : 1;
    }

    private get _cells() {
        return this._services.get('cells');
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridApi');
    }

    private get _provider() {
        return this._services.get('provider');
    }
}
