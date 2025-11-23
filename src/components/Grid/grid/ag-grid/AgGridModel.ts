import { CellClickedEvent, CellDoubleClickedEvent, ColDef, ColumnMovedEvent, ColumnResizedEvent, GridApi, IRowNode, IsFullWidthRowParams, IsServerSideGroupOpenByDefaultParams, ModuleRegistry, SelectionChangedEvent, SuppressKeyboardEventParams, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import debounce from 'debounce';
import { GridModel, IGridColumn } from "../GridModel";
import { Client, DataProvider, EventEmitter, IAddControlNotificationOptions, IColumn, IColumnInfo, IControlParameters, ICustomColumnComponent, ICustomColumnControl, ICustomColumnFormatting, IDataProvider, IRecord, Operators } from "@talxis/client-libraries";
import { NestedControl } from "../../../NestedControlRenderer/NestedControl";
import { Cell } from "../../cells/cell/Cell";
import { ColumnHeader } from "../../column-headers/column-header/ColumnHeader";
import { CHECKBOX_COLUMN_KEY } from "../../constants";
import { Comparator } from "../ValueComparator";
import { ServerSideDatasource } from "./ServerSideDatasource";
import { RecordSelectionCheckBox } from "../../column-headers/record-selection-checkbox/RecordSelectionCheckbox";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { FullRowLoading } from "../../loading/full-row/FullRowLoading";
import { FullWidthCellRendererError } from "../../errors/FullWidthCellRendererError/FullWidthCellRendererError";
import { LicenseManager } from "@ag-grid-enterprise/core";
ModuleRegistry.registerModules([RowGroupingModule, ServerSideRowModelModule, ClipboardModule,]);

interface IAgGridTestDependencies {
    grid: GridModel;
    getContainer: () => HTMLDivElement;
}

export interface IAgGridModelEvents {
    onRefresh: () => void;
}


export interface ICellValues {
    notifications: IAddControlNotificationOptions[];
    customFormatting: Required<ICustomColumnFormatting>;
    customControl: Required<ICustomColumnControl>;
    customComponent: ICustomColumnComponent;
    loading: boolean;
    value: any;
    aggregatedValue: any;
    error: boolean;
    height: number;
    errorMessage: string;
    parameters: IControlParameters;
    columnAlignment: Required<IColumn['alignment']>;
    editing: boolean;
    editable: boolean;
    disabled: boolean;
    saving: boolean;
}

export class AgGridModel extends EventEmitter<IAgGridModelEvents> {
    private _grid: GridModel;
    private _dataSource: ServerSideDatasource;
    private _gridApi: GridApi | undefined;
    private _hasUserResizedColumns: boolean = false;
    private _getContainer: () => HTMLDivElement;
    private _debouncedColumnResized: debounce.DebouncedFunction<(e: ColumnResizedEvent<IRecord>) => void>;
    private _debouncedRefresh: debounce.DebouncedFunction<() => void>;
    private _debouncedSetSelectedNodes: debounce.DebouncedFunction<(ids: string[]) => void>;
    private _expandedRowGroupIds: string[] = [];
    private _hasUserExpandedRowGroups: boolean = false;
    private _isLoadingNestedProviders: boolean = false;
    private _idsToAddToExpandGroupState = new Set<string>();
    private _intervals: NodeJS.Timeout[] = [];

    constructor({ grid, getContainer }: IAgGridTestDependencies) {
        super();
        this._grid = grid;
        this._getContainer = getContainer;
        this._dataSource = new ServerSideDatasource(this);
        this._debouncedColumnResized = debounce((e: ColumnResizedEvent<IRecord>) => this._onColumnResized(e));
        this._debouncedSetSelectedNodes = debounce((ids) => this._setSelectedNodes(ids), 0);
        this._debouncedRefresh = debounce(() => this._refresh(), 0);
        this._dataset.addEventListener('onInitialDataLoaded', () => {
            const totalRowDataProvider = this._grid.getTotalRow().getDataProvider();
            totalRowDataProvider.addEventListener('onLoading', () => this._setPinnedRowData());
            totalRowDataProvider.addEventListener('onError', () => this._setPinnedRowData());
        })
        const licenseKey = this._grid.getLicenseKey();
        if (licenseKey) {
            LicenseManager.setLicenseKey(licenseKey);
        }
    }

    public getColumns(gridColumns: IGridColumn[]): ColDef[] {
        if (this._grid.getDataset().grouping.getGroupBys().length > 0 && !this._grid.isGroupedColumnsPinnedEnabled()) {
            this._sortColumns(gridColumns);
        }
        const agColumns = gridColumns.map(column => {
            const isCheckboxColumn = column.name === CHECKBOX_COLUMN_KEY;
            const agColumn: ColDef = {
                colId: column.name,
                field: column.name,
                headerName: column.displayName,
                hide: this._isColumnHidden(column),
                width: this._getColumnWidth(column),
                sortable: !column.disableSorting,
                lockPinned: true,
                resizable: column.isResizable,
                autoHeaderHeight: true,
                autoHeight: this._isColumnAutoHeightEnabled(column),
                suppressMovable: column.isDraggable === false ? true : false,
                suppressSizeToFit: isCheckboxColumn,
                lockPosition: this._getLockPosition(column),
                pinned: this._isColumnPinned(column),
                headerComponentParams: {
                    baseColumn: column
                },
                rowGroup: column.grouping?.isGrouped,
                cellRendererParams: (p: any) => {
                    return {
                        ...this._getCellParameters(p.data, column),
                        isCellEditor: false
                    }
                },
                cellEditorParams: (p: any) => {
                    return {
                        ...this._getCellParameters(p.data, column),
                        isCellEditor: true
                    }
                },
                editable: (p) => this._isCellEditorEnabled(column.name, p.data),
                equals: (valueA: ICellValues, valueB: ICellValues) => new Comparator().isEqual(valueA, valueB),
                headerComponent: ColumnHeader,
                cellRenderer: Cell,
                cellEditor: Cell,
                valueGetter: (p: ValueGetterParams<IRecord>) => this._valueGetter(p, column),
                valueFormatter: (p: ValueFormatterParams<IRecord>) => this._valueFormatter(p),
                suppressKeyboardEvent: (p) => this._suppressKeyboardEvent(p, column),
                onCellDoubleClicked: (e: CellDoubleClickedEvent<IRecord>) => this._onCellDoubleClick(e),
            }
            if (agColumn.field === CHECKBOX_COLUMN_KEY) {
                agColumn.headerComponent = RecordSelectionCheckBox;
            }
            return agColumn;
        })
        return agColumns;
    }

    public getGridApi() {
        if (!this._gridApi) {
            throw new Error("Grid API is not available");
        }
        return this._gridApi;
    }

    public init(gridApi: GridApi) {
        this._gridApi = gridApi;
        if (this._grid.getDataset().loading) {
            this._setLoadingOverlay(true);
        }
        this._registerEventListeners();
        this._setGridOptions();
    }

    public getGrid(): GridModel {
        return this._grid;
    }

    public getSelectionType(): 'single' | 'multiple' | undefined {
        switch (this._grid.getSelectionType()) {
            case 'none': {
                return undefined;
            }
            case 'single': {
                return 'single';
            }
            case 'multiple': {
                return 'multiple';
            }
        }
    }
    public refresh() {
        this._debouncedRefresh();
    }

    public toggleGroup(node: IRowNode<IRecord>) {
        node.setExpanded(!node.expanded);
        //clears the expanded rows in memory so it does not interfere with the next group expansion
        this._expandedRowGroupIds = [];
        this._hasUserExpandedRowGroups = true;
    }

    public getRecordSelectionState(node: IRowNode<IRecord>): 'checked' | 'unchecked' | 'indeterminate' {
        const record = node.data!;
        const dataProvider = record.getDataProvider();
        const childDataProvider = dataProvider.getChildDataProvider(record.getRecordId());
        let result: 'checked' | 'unchecked' | 'indeterminate';
        if (childDataProvider) {
            if (node.isSelected()) {
                result = 'checked';
            }
            else {
                if (childDataProvider.getSelectedRecordIds().length === 0) {
                    result = 'unchecked';
                }
                else {
                    result = 'indeterminate';
                }
            }
        }
        else {
            result = node.isSelected() ? 'checked' : 'unchecked';
        }
        if (record.getSummarizationType() === 'grouping') {
            if (result === 'unchecked') {
                this._idsToAddToExpandGroupState.delete(record.getRecordId());
            }
            else {
                this._idsToAddToExpandGroupState.add(record.getRecordId());
            }
        }
        return result;
    }

    public onNotifyOutputChanged(record: IRecord, columnName: string, value: any, parameters: any) {
        record.setValue(columnName, value);
        const { ShouldStopEditWhenOutputChanges } = parameters;
        if (ShouldStopEditWhenOutputChanges?.raw) {
            this.getGridApi().stopEditing();
        }
    }

    private _sortColumns(columns: IGridColumn[]): IGridColumn[] {
        return columns.sort((a, b) => {
            // If both columns have the same grouping status, maintain original order (return 0)
            if ((a.grouping?.isGrouped || false) === (b.grouping?.isGrouped || false)) {
                return 0;
            }
            // If a is grouped, it should come first
            if (a.grouping?.isGrouped) {
                return -1;
            }
            // If b is grouped, it should come first
            if (b.grouping?.isGrouped) {
                return 1;
            }
            // Default case, should never reach here given the first condition
            return 0;
        });
    }

    private _onDestroyed() {
        this._intervals.forEach(interval => clearInterval(interval));
        this._saveState();
    }

    private _refresh() {
        if (this._grid.getDataset().loading) {
            return;
        }
        const { haveColumnsOrderBeenUpdated, columns } = this._grid.refreshGridColumns();
        if (haveColumnsOrderBeenUpdated) {
            this.getGridApi().setGridOption('columnDefs', this.getColumns(columns));
            this._autoSizeColumns();
        }
        else {
            this.getGridApi().refreshCells();
        }
        this.dispatchEvent('onRefresh');
    }

    private _isColumnAutoHeightEnabled(column: IGridColumn): boolean {
        return !!column.autoHeight
    }

    private _onCellDoubleClick(e: CellDoubleClickedEvent<IRecord>) {
        const column = this._dataset.getDataProvider().getColumnsMap()[e.colDef.colId!]!
        switch (true) {
            //do not navigate if the column is not editable or if the grid is not in navigation mode
            case !this._grid.isNavigationEnabled():
            case this._grid.isColumnEditable(column.name, e.data):
            case e.data?.getSummarizationType() !== 'none':
            case column.name === DataProvider.CONST.CHECKBOX_COLUMN_KEY: {
                return;
            }
            default: {
                const record = e.data!;
                record.getDataProvider().openDatasetItem(record.getNamedReference());
            }
        }
    }

    private _saveState() {
        const { rowSelection, columnOrder, ...gridState } = this.getGridApi().getState();
        const selectedGroupIds = this._grid.getDataset().getSelectedRecordIds({ includeGroupRecordIds: true }).filter(id => id.startsWith(DataProvider.CONST.GROUP_PREFIX));
        const expandedRowGroupIds = new Set<string>([...selectedGroupIds, ...this._idsToAddToExpandGroupState.values()]);
        if (expandedRowGroupIds.size > 0) {
            gridState.rowGroupExpansion = {
                expandedRowGroupIds: [...expandedRowGroupIds.values()]
            }
        }
        const state = this.getGrid().getState() || {};
        state.AgGridState = gridState;
        this.getGrid().getPcfContext().mode.setControlState(state);
    }

    private _isColumnPinned(column: IGridColumn) {
        switch (true) {
            case column.name === DataProvider.CONST.CHECKBOX_COLUMN_KEY:
            case column.grouping?.isGrouped && this._grid.isGroupedColumnsPinnedEnabled(): {
                return true;
            }
            default: {
                return false;
            }
        }
    }

    private _getCellParameters(record: IRecord, column: IGridColumn) {
        return {
            baseColumn: column,
            record: record
        }
    }

    private _isColumnHidden(column: IGridColumn): boolean {
        if (column.name !== DataProvider.CONST.CHECKBOX_COLUMN_KEY) {
            return !!column.isHidden;
        }
        //we need the checkbox column space for the loading spinner for saving
        if (this._grid.isEditingEnabled()) {
            return false;
        }
        if (this._grid.getSelectionType() === 'none') {
            return true;
        }
        return false;
    }

    private _getColumnWidth(column: IGridColumn): number | undefined {
        if (column.name === CHECKBOX_COLUMN_KEY) {
            return 45; // Default width for checkbox column
        }
        return column.visualSizeFactor;
    }

    private _scrollToTop() {
        this.getGridApi().ensureIndexVisible(0, 'top');
    }

    private _getLockPosition(column: IGridColumn) {
        if (column.name === CHECKBOX_COLUMN_KEY) {
            return 'left';
        }
        return undefined;
    }

    private _canExpandRowGroupsByDefault(): boolean {
        if (this._hasUserExpandedRowGroups) {
            return false;
        }
        else {
            return true;
        }
    }

    private _suppressKeyboardEvent(params: SuppressKeyboardEventParams<IRecord, any>, column: IGridColumn): boolean {
        if (column.oneClickEdit) {
            return true;
        }
        return false;
    }

    private _registerEventListeners() {
        this._dataset.addEventListener('onLoading', (isLoading: boolean) => this._setLoadingOverlay(this._dataset.loading));
        this._dataset.addEventListener('onRecordsSelected', (ids: string[]) => this._debouncedSetSelectedNodes(ids));
        this._dataset.addEventListener('onNewDataLoaded', () => this._onNewDataLoaded());
        this._dataset.addEventListener('onRenderRequested', () => this.refresh());
        this.getGridApi().addEventListener('gridSizeChanged', () => this._autoSizeColumns());
        this.getGridApi().addEventListener('firstDataRendered', () => this._autoSizeColumns());
        this.getGridApi().addEventListener('selectionChanged', (e: SelectionChangedEvent) => this._onSelectionChanged(e));
        this.getGridApi().addEventListener('columnResized', (e: any) => this._debouncedColumnResized(e));
        this.getGridApi().addEventListener('modelUpdated', () => this._setGridHeight());
        this.getGridApi().addEventListener('columnMoved', (e: ColumnMovedEvent<IRecord>) => this._onColumnMoved(e));
        this.getGridApi().addEventListener('firstDataRendered', () => this._handleSelectionFromState());
        this.getGridApi().addEventListener('gridPreDestroyed', () => this._onDestroyed());
    }

    private _setGridOptions() {
        this.getGridApi().setGridOption('serverSideDatasource', this._dataSource);
        this.getGridApi().setGridOption('isServerSideGroupOpenByDefault', (params) => this._syncExpandedRowGroups(params));
        this.getGridApi().setGridOption('loadingCellRenderer', FullRowLoading)
        this.getGridApi().setGridOption('suppressDragLeaveHidesColumns', true);
        this.getGridApi().setGridOption('isFullWidthRow', (params) => this._isFullWidthRow(params));
        this.getGridApi().setGridOption('fullWidthCellRenderer', FullWidthCellRendererError);
        this.getGridApi().setGridOption('fullWidthCellRendererParams', (params: IsFullWidthRowParams<IRecord>) => this._getFullWidthCellRendererParams(params))
        this.getGridApi().setGridOption('suppressCopyRowsToClipboard', true);
        this.getGridApi().setGridOption('animateRows', false);
        this.getGridApi().setGridOption('groupDisplayType', 'custom');
    }

    private _isFullWidthRow(params: IsFullWidthRowParams<IRecord>): boolean {
        const provider = params.rowNode.data?.getDataProvider();
        switch (true) {
            case provider?.getSummarizationType() === 'aggregation' && provider.isError(): {
                return true;
            }
            default: {
                return false;
            }
        }
    }

    //this should only be triggered when we load the grid with some item pre-selected from state
    //e.g. navigating to a record and coming back to the grid
    private _handleSelectionFromState() {
        const selectedRecordIds = this._grid.getDataset().getSelectedRecordIds();
        this._grid.getDataset().clearSelectedRecordIds();
        let isScrolledToMiddle = false;
        for (const id of selectedRecordIds) {
            const interval = setInterval(() => {
                const record = this._grid.getDataset().getDataProvider().getRecordsMap()[id];
                if (record) {
                    clearInterval(interval);
                    record.getDataProvider().setSelectedRecordIds([...record.getDataProvider().getSelectedRecordIds(), id]);
                    if (!isScrolledToMiddle) {
                        const middleSelectedRecordId = selectedRecordIds[Math.floor(selectedRecordIds.length / 2)]
                        const node = this.getGridApi().getRowNode(middleSelectedRecordId);
                        if (node) {
                            isScrolledToMiddle = true;
                            this.getGridApi().ensureNodeVisible(node!, 'middle');
                        }
                    }
                }
            }, 0);
            this._intervals.push(interval);
        }
    }

    private _getFullWidthCellRendererParams(params: IsFullWidthRowParams<IRecord>) {
        //@ts-ignore - typings seem to be incorrect
        const provider = params.node.data?.getDataProvider()
        return {
            errorMessage: provider?.getErrorMessage()
        }
    }

    private _syncExpandedRowGroups(params: IsServerSideGroupOpenByDefaultParams): boolean {
        if (this._expandedRowGroupIds.includes(params.rowNode.id!)) {
            return true
        }
        else if (this._canExpandRowGroupsByDefault()) {
            if (params.rowNode.level <= this._grid.getDefaultExpandedGroupLevel()) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    private _onColumnMoved(e: ColumnMovedEvent<IRecord>) {
        const movedColumn = this._grid.getDataset().getDataProvider().getColumnsMap()[e.column?.getColId()!];
        if (!e.finished || e.source !== 'uiColumnMoved') {
            return;
        }
        let order = 0;
        this._dataset.setColumns(e.api.getState().columnOrder?.orderedColIds!.map(col => {
            const column = this._grid.getDataset().getDataProvider().getColumnsMap()[col]!;
            return {
                ...column,
                order: order++
            }
        }))
        if (movedColumn?.grouping?.isGrouped) {
            this._dataset.refresh();
        }
    }

    private _onNewDataLoaded() {
        this._refreshServerSideModel();
        this.refresh();
        this._setNoRowsOverlay();
        this._scrollToTop();
    }

    private _refreshServerSideModel() {
        this._expandedRowGroupIds = this.getGridApi().getState().rowGroupExpansion?.expandedRowGroupIds ?? [];
        this.getGridApi().refreshServerSide({
            purge: true
        })
    }

    private _calculateGridHeight(): string {
        const defaultRowHeight = this._grid.getDefaultRowHeight();
        let offset = 35;
        if (this._dataset.grouping.getGroupBys().length > 0) {
            offset += 30;
        }
        if (this._grid.getParameters().Height?.raw) {
            return this._grid.getParameters().Height!.raw!;
        }
        else {
            const totalRowHeight = this.getGridApi().getRenderedNodes().reduce((acc, node) => acc + (node.rowHeight ?? defaultRowHeight), 0);
            const numberOfRecords = this.getGridApi().getRenderedNodes().length;
            if (numberOfRecords <= 15) {
                const headerHeight = this._getContainer().querySelector('.ag-header-row')?.clientHeight ?? 0;
                return `${totalRowHeight + headerHeight + offset}px`;
            }
            else {
                return `${defaultRowHeight * 17 + offset}px`;
            }
        }
    }
    private _setGridHeight() {
        setTimeout(() => {
            const container = this._getContainer();
            if(container) {
                container.style.height = this._calculateGridHeight();
            }
        }, 100);
    }

    private _onColumnResized(e: ColumnResizedEvent<IRecord>) {
        if (e.source === 'uiColumnResized') {
            this._hasUserResizedColumns = true;
            this._updateColumnVisualSizeFactor(e);
        }
    }

    private _autoSizeColumns() {
        if (this._hasUserResizedColumns) {
            return;
        }
        this.getGridApi().sizeColumnsToFit({
            columnLimits: this._grid.getGridColumns().map(col => {
                return {
                    key: col.name,
                    minWidth: col.visualSizeFactor
                }
            })
        });
    }

    private _updateColumnVisualSizeFactor(e: ColumnResizedEvent<IRecord>) {
        const resizedColumnKey = e.column?.getColId();
        if (!resizedColumnKey) {
            return;
        }
        const columns = this._grid.getGridColumns();
        const newColumns = columns.map(col => {
            if (col.name === resizedColumnKey) {
                return {
                    ...col,
                    visualSizeFactor: e.column?.getActualWidth()!
                }
            }
            return col;
        })
        this._grid.getDataset().setColumns(newColumns);
    }

    private _onSelectionChanged(e: SelectionChangedEvent<IRecord>) {
        switch (true) {
            case e.source === 'api':
            case e.source === 'apiSelectAll': {
                return;
            }
        }
        const selectedNodes: IRowNode<IRecord>[] = this.getGridApi().getSelectedNodes();
        //if we click a grouped record, do not propagate the selection to children
        const providerSelectedRecordIdsMap = new Map<IDataProvider, string[]>();
        selectedNodes.map(node => {
            const record = node.data!;
            const provider = record.getDataProvider();
            if (!providerSelectedRecordIdsMap.has(provider)) {
                providerSelectedRecordIdsMap.set(provider, []);
            }
            providerSelectedRecordIdsMap.get(provider)!.push(record.getRecordId());
        })
        providerSelectedRecordIdsMap.forEach((ids, provider) => {
            provider.setSelectedRecordIds(ids);
        });
    }

    private async _setSelectedNodes(ids: string[]) {
        //interval to prevent infinite loading
        const checkLoadingNestedProviders = setInterval(() => {
            if (this._isLoadingNestedProviders && !this._areChildProvidersLoading()) {
                this._isLoadingNestedProviders = false;
                this._dataset.getDataProvider().setLoading(false);
                clearInterval(checkLoadingNestedProviders);
            }
        }, 500);
        this._intervals.push(checkLoadingNestedProviders);
        if (!this._isLoadingNestedProviders && this._areChildProvidersLoading()) {
            this._isLoadingNestedProviders = true;
            this._dataset.getDataProvider().setLoading(true);
        }
        else if (this._isLoadingNestedProviders && !this._areChildProvidersLoading()) {
            this._isLoadingNestedProviders = false;
            this._dataset.getDataProvider().setLoading(false);
            clearInterval(checkLoadingNestedProviders);
        }
        this.getGridApi().setServerSideSelectionState({
            selectAll: false,
            toggledNodes: this._grid.getDataset().getDataProvider().getSelectedRecordIds({ includeGroupRecordIds: true })
        })
        this.getGridApi().refreshCells({
            columns: [CHECKBOX_COLUMN_KEY],
            force: true
        })
    }

    private _areChildProvidersLoading(): boolean {
        const childProviders = this._dataset.getDataProvider().getChildDataProviders(true).filter(x => x.getParentRecordId());
        return childProviders.some(provider => provider.isLoading());
    }

    private _valueFormatter(p: ValueFormatterParams<IRecord>): string {
        const formattedValue = this._grid.getRecordFormattedValue(p.data!, p.colDef.colId!);
        return formattedValue.value ?? formattedValue.aggregatedValue;
    }

    private _valueGetter(p: ValueGetterParams<IRecord>, column: IGridColumn) {
        const record = p.data!;
        let editing: boolean = false;
        const columnInfo = record.getColumnInfo(column.name) as IColumnInfo;
        //i hate this, there is no other way to get the information if we are in edit mode or not
        if (Error().stack!.includes('startEditing')) {
            editing = true;
        }
        const customControl = this._grid.getControl(column, record, editing || !!column.oneClickEdit);

        const control = new NestedControl({
            onGetBindings: () => this._grid.getBindings(record, column, customControl),
            parentPcfContext: this._grid.getPcfContext(),
        });
        const parameters = columnInfo.ui.getControlParameters({
            ...control.getParameters(),
            ...this._grid.getFieldBindingParameters(record, column, editing),
        })
        if (column.oneClickEdit && record.getSummarizationType() === 'none') {
            editing = true;
        }
        const value = this._grid.getRecordValue(record, column);
        return {
            notifications: columnInfo.ui.getNotifications(),
            value: value.value,
            customFormatting: this._grid.getFieldFormatting(record, column.name),
            customControl: customControl,
            error: columnInfo.error,
            aggregatedValue: value.aggregatedValue,
            loading: columnInfo.ui.isLoading(),
            errorMessage: columnInfo.errorMessage,
            editable: columnInfo.security.editable,
            editing: editing,
            parameters: parameters,
            saving: record.isSaving(),
            columnAlignment: column.alignment,
            customComponent: columnInfo.ui.getCustomControlComponent()
        } as ICellValues;
    }

    private _setPinnedRowData() {
        const totalRecord = this._grid.getTotalRow().getTotalRowRecord();
        this.getGridApi().setGridOption('pinnedBottomRowData', totalRecord ? [totalRecord] : []);
    }

    private _setLoadingOverlay(isLoading: boolean) {
        if (!isLoading) {
            return this.getGridApi().hideOverlay();
        }
        this.getGridApi().showLoadingOverlay();
    }

    private _setNoRowsOverlay() {
        setTimeout(() => {
            if (this._grid.getDataset().loading) {
                return;
            }
            this.getGridApi().hideOverlay();
            if (this._grid.getDataset().getDataProvider().getRecords().length === 0) {
                this.getGridApi().showNoRowsOverlay();
            }
        }, 0);
    }

    private _isCellEditorEnabled(columnName: string, record: IRecord): boolean {
        const column = this._grid.getGridColumnByName(columnName);
        // check column eligibility for cell editor
        switch (true) {
            //never allow cell editor for oneClickEdit - everything is handled by cell renderer in this case
            case column.oneClickEdit:
            //never allow cell editor for non-editable columns
            case !column.isEditable: {
                return false;
            }
        }
        return record.getColumnInfo(column.name).security.editable;
    }

    private get _dataset() {
        return this._grid.getDataset();
    }
}