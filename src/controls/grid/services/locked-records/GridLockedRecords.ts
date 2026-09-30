import { ColDef, GridApi, RowClassParams, RowClassRules } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../services";
import { RECORD_SAVE_COLUMN_KEY } from "../columns";
import { CellEmptyRenderer } from "../../components/cells/empty-cell-renderer/CellEmptyRenderer";
import { RecordLockIndicatorCell } from "../../components/record-lock-indicator/RecordLockIndicatorCell";

export const RECORD_LOCK_COLUMN_KEY = 'recordLock';

/** The class on the row of a record locked as a whole. */
export const LOCKED_RECORD_ROW_CLASS = 'talxis__baseControl__GridRow--locked';

export interface IGridLockedRecordsParameters {
    services: IGridServiceLocator;
}

/** What marks records locked as a whole: a muted row, and a lock column shown only while there is one. */
export class GridLockedRecords {
    private _services: IGridServiceLocator;
    //by record, so the hooks run once per record rather than on every pass
    private _isLockedByRecord = new WeakMap<IRecord, boolean>();
    private _isVisible = false;
    //one object, so the options are not handed to AG Grid again on every refresh
    private _rowClassRules: RowClassRules<IRecord> = { [LOCKED_RECORD_ROW_CLASS]: params => this._isLockedRow(params) };

    constructor(parameters: IGridLockedRecordsParameters) {
        this._services = parameters.services;
        //a grid that cannot be edited locks no record
        if (!this._services.get('settings').isEditingEnabled()) {
            return;
        }
        this._services.get('columns').registerColumnDefinitionsHook(this._onColumnDefinitions);
        this._services.get('grid').registerAgGridOptions(result => result.options.rowClassRules = this._rowClassRules);
        this._services.whenAvailable('gridApi', gridApi => this._onGridApiAvailable(gridApi));
        this._services.get('grid').events.addEventListener('onDestroyed', this._onDestroyed);
    }

    private _onGridApiAvailable(gridApi: GridApi<IRecord>): void {
        gridApi.addEventListener('modelUpdated', () => this._syncVisibility());
        this._provider.addEventListener('onRecordColumnValueChanged', this._onRecordChanged);
    }

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        this._provider.removeEventListener('onRecordColumnValueChanged', this._onRecordChanged);
    };

    //after the save column, and behind the checkbox row selection puts first
    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const index = columnDefs.findIndex(colDef => colDef.colId === RECORD_SAVE_COLUMN_KEY) + 1;
        columnDefs.splice(index, 0, this._getColumnDefinition());
    };

    private _onRecordChanged = (record: IRecord): void => {
        const wasLocked = this._isLockedByRecord.get(record);
        this._isLockedByRecord.delete(record);
        const isLocked = this._isLocked(record);
        if (isLocked !== wasLocked) {
            this._refreshRowClass(record);
        }
        if (isLocked) {
            this._setVisible(true);
        }
        else if (this._isVisible) {
            this._syncVisibility();
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
        return !params.node.rowPinned && !!params.data && this._isLocked(params.data);
    }

    //the only pass over the rows, and it reads the cache
    private _syncVisibility(): void {
        let hasLockedRecord = false;
        this._gridApi.forEachNode(node => {
            if (!hasLockedRecord && node.data && this._isLocked(node.data)) {
                hasLockedRecord = true;
            }
        });
        this._setVisible(hasLockedRecord);
    }

    private _isLocked(record: IRecord): boolean {
        let isLocked = this._isLockedByRecord.get(record);
        if (isLocked === undefined) {
            isLocked = this._services.get('editability').get({ record }).lockedBy === 'record';
            this._isLockedByRecord.set(record, isLocked);
        }
        return isLocked;
    }

    private _setVisible(isVisible: boolean): void {
        if (this._isVisible === isVisible) {
            return;
        }
        this._isVisible = isVisible;
        this._gridApi.setColumnsVisible([RECORD_LOCK_COLUMN_KEY], isVisible);
    }

    private _getColumnDefinition(): ColDef<IRecord> {
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
            cellRendererSelector: params => ({ component: params.node.rowPinned ? CellEmptyRenderer : RecordLockIndicatorCell }),
        };
    }

    private get _gridApi(): GridApi<IRecord> {
        return this._services.get('gridApi');
    }

    private get _provider() {
        return this._services.get('provider');
    }
}
