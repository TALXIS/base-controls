import { CellFocusedEvent, GridApi } from "ag-grid-community";
import { IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { IParameters } from "@interfaces";
import { StackRank } from "@utils/stack-rank";
import { IGridAgGridOptions, IGridRuntime } from "../../grid/services/runtime";
import { IGridCellHookParameters } from "../../grid/services/cells";
import { IGridEditedCell } from "../../grid/modules/editing";
import { GRID_MODULE_PRIORITY } from "../../grid/modules/priorities";
import { IGridCheckList } from "./GridCheckList";

export interface ICheckListNewItemRowParameters {
    runtime: IGridRuntime;
    checkList: IGridCheckList;
}

/** A row pinned below the list; naming an item in it appends that item and readies the row for the next. */
export class CheckListNewItemRow {
    private _runtime: IGridRuntime;
    private _checkList: IGridCheckList;
    //its own provider, so typing into the row saves nothing until the item is committed
    private _draftProvider?: MemoryDataProvider;
    //the grid reads a last value out of a replaced draft while its editor is taken down
    private _retiredDraftProviders: MemoryDataProvider[] = [];
    private _draft?: IRecord;
    //one array per draft and per upstream rows: a new array has AG Grid rebuild the row and close its editor
    private _pinnedRows?: IRecord[];
    private _pinnedDraft?: IRecord;
    private _upstreamPinnedRows?: IRecord[];

    constructor(parameters: ICheckListNewItemRowParameters) {
        this._runtime = parameters.runtime;
        this._checkList = parameters.checkList;
        //after the totals row, so the new-item row sits between the items and the totals
        this._runtime.registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.aggregation + 1);
        this._runtime.services.get('cells').registerControlParameters(this._onControlParameters);
        this._runtime.services.get('editing').events.addEventListener('onEditedCellChanged', this._onEditedCellChanged);
        this._runtime.events.addEventListener('onDestroyed', this._onDestroyed);
        this._runtime.services.whenAvailable('gridApi', this._onGridApiAvailable);
    }

    private _onGridApiAvailable = (gridApi: GridApi<IRecord>): void => {
        gridApi.addEventListener('cellFocused', this._onCellFocused);
        this._resetDraft();
    };

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        const upstreamPinnedRows = result.options.pinnedBottomRowData;
        if (!this._pinnedRows || upstreamPinnedRows !== this._upstreamPinnedRows || this._draft !== this._pinnedDraft) {
            this._upstreamPinnedRows = upstreamPinnedRows;
            this._pinnedDraft = this._draft;
            this._pinnedRows = [...(this._draft ? [this._draft] : []), ...(upstreamPinnedRows ?? [])];
        }
        result.options.pinnedBottomRowData = this._pinnedRows;
    };

    private _onControlParameters = (result: IParameters, params: IGridCellHookParameters): void => {
        if (params.record === this._draft && params.columnName === this._checkList.getFieldMapping().name) {
            result.Placeholder = { raw: this._checkList.getLabels().getLocalizedString('newItemPlaceholder') };
        }
    };

    //the row exists only to be typed into, so focusing a cell opens its editor
    private _onCellFocused = (event: CellFocusedEvent<IRecord>): void => {
        if (event.rowPinned !== 'bottom' || event.rowIndex === null || event.rowIndex === undefined || event.api.getPinnedBottomRow(event.rowIndex)?.data !== this._draft) {
            return;
        }
        const colKey = typeof event.column === 'string' ? event.column : event.column?.getColId();
        if (!colKey) {
            return;
        }
        //startEditingCell focuses the cell in turn
        const isEditing = event.api.getEditingCells().some(cell => cell.rowPinned === 'bottom' && cell.colId === colKey);
        if (!isEditing) {
            event.api.startEditingCell({ rowIndex: event.rowIndex, rowPinned: 'bottom', colKey: colKey });
        }
    };

    private _onEditedCellChanged = (previous: IGridEditedCell | undefined): void => {
        const draft = this._draft;
        if (!draft || previous?.recordId !== draft.getRecordId()) {
            return;
        }
        const name = draft.getValue(this._checkList.getFieldMapping().name);
        if (name !== null && name !== undefined && name !== '') {
            this._commitDraft(draft);
        }
    };

    private _commitDraft(draft: IRecord): void {
        const gridApi = this._runtime.services.get('gridApi');
        const stackRankColumn = this._checkList.getFieldMapping().stackRank;
        const rowCount = gridApi.getDisplayedRowCount();
        const lastRecord = rowCount > 0 ? gridApi.getDisplayedRowAtIndex(rowCount - 1)?.data : undefined;
        const record = this._runtime.services.get('provider').newRecord({ rawData: draft.toRawData() });
        this._resetDraft();
        gridApi.applyTransaction({ add: [record], addIndex: rowCount });
        gridApi.ensureIndexVisible(rowCount);
        //the pinned row is rebuilt from the new draft before its cell can be edited
        setTimeout(() => this._startEditingDraft(gridApi));
        this._runtime.services.get('fields').get(record, stackRankColumn).setValue(StackRank.between(lastRecord?.getValue(stackRankColumn), undefined));
    }

    private _startEditingDraft(gridApi: GridApi<IRecord>): void {
        gridApi.startEditingCell({ rowIndex: 0, rowPinned: 'bottom', colKey: this._checkList.getFieldMapping().name });
    }

    private _resetDraft(): void {
        const provider = this._runtime.services.get('provider');
        if (this._draftProvider) {
            this._retiredDraftProviders.push(this._draftProvider);
        }
        this._draftProvider = new MemoryDataProvider({ dataSource: [], metadata: provider.getMetadata() });
        //nobody has typed into the row yet, so it is not drawn as an item missing a required value
        this._draftProvider.setColumns(provider.getColumns().map(column => ({
            ...column,
            metadata: { ...column.metadata, RequiredLevel: 0 },
        })));
        this._draft = this._draftProvider.newRecord();
        this._runtime.refreshAgGridOptions();
    }

    private _onDestroyed = (): void => {
        this._retiredDraftProviders.forEach(provider => provider.destroy());
        this._retiredDraftProviders = [];
        this._draftProvider?.destroy();
    };
}
