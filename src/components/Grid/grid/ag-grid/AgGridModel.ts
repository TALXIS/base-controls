import { CellClickedEvent, CellDoubleClickedEvent, ColDef, ColumnMovedEvent, ColumnResizedEvent, GridApi, IRowNode, IsFullWidthRowParams, IsServerSideGroupOpenByDefaultParams, ModuleRegistry, SelectionChangedEvent, SuppressKeyboardEventParams, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import debounce from 'debounce';
import { GridModel, IGridColumn } from "../GridModel";
import { Client, DataProvider, EventEmitter, IAddControlNotificationOptions, IColumn, IColumnInfo, IControlParameters, ICustomColumnComponent, ICustomColumnControl, ICustomColumnFormatting, IDataProvider, IRecord, Operators } from "@talxis/client-libraries";
import { NestedControl } from "@components/NestedControlRenderer/NestedControl";
import { Cell } from "@components/Grid/cells/cell/Cell";
import { ColumnHeader } from "@components/Grid/column-headers/column-header/ColumnHeader";
import { CHECKBOX_COLUMN_KEY } from "@components/Grid/constants";
import { Comparator } from "../ValueComparator";
import { ServerSideDatasource } from "./ServerSideDatasource";
import { RecordSelectionCheckBox } from "@components/Grid/column-headers/record-selection-checkbox/RecordSelectionCheckbox";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { ServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";
import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { FullRowLoading } from "@components/Grid/loading/full-row/FullRowLoading";
import { FullWidthCellRendererError } from "@components/Grid/errors/FullWidthCellRendererError/FullWidthCellRendererError";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { SelectionCell } from "@components/Grid/cells/selection-cell/SelectionCell";
ModuleRegistry.registerModules([RowGroupingModule, ServerSideRowModelModule, ClipboardModule,]);

//stateless, and `equals` runs per cell per value read
const COMPARATOR = new Comparator();

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
    private _totalRowSubscribed: boolean = false;
    private _dataSource: ServerSideDatasource;
    private _gridApi: GridApi | undefined;
    private _hasUserResizedColumns: boolean = false;
    private _getContainer: () => HTMLDivElement;
    private _debouncedColumnResized: debounce.DebouncedFunction<(e: ColumnResizedEvent<IRecord>) => void>;
    private _debouncedSetSelectedNodes: debounce.DebouncedFunction<(ids: string[]) => void>;
    private _expandedRowGroupIds: string[] = [];
    private _chromeHeight: number | undefined;
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
        this._localHarnessDebugSetup();
        const licenseKey = this._grid.getLicenseKey();
        if (licenseKey) {
            LicenseManager.setLicenseKey(licenseKey);
        }
    }

    public getColumns(gridColumns: IGridColumn[]): ColDef[] {
        if (this._grid.getDataset().grouping.getGroupBys().length > 0 && !this._grid.isGroupedColumnsPinnedEnabled()) {
            this._sortColumns(gridColumns);
        }
        const agColumns: ColDef[] = [];
        for (const column of gridColumns) {
            if (column.isHidden) {
                continue;
            }
            const agColumn: ColDef = {
                colId: column.name,
                field: column.name,
                headerName: column.displayName,
                width: column.visualSizeFactor,
                sortable: !column.disableSorting,
                lockPinned: true,
                resizable: column.isResizable,
                autoHeaderHeight: true,
                autoHeight: this._isColumnAutoHeightEnabled(column),
                suppressMovable: column.isDraggable === false ? true : false,
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
                equals: (valueA: ICellValues, valueB: ICellValues) => COMPARATOR.isEqual(valueA, valueB),
                headerComponent: ColumnHeader,
                cellRenderer: Cell,
                cellEditor: Cell,
                valueGetter: (p: ValueGetterParams<IRecord>) => this._valueGetter(p, column),
                valueFormatter: (p: ValueFormatterParams<IRecord>) => this._valueFormatter(p),
                suppressKeyboardEvent: (p) => this._suppressKeyboardEvent(p, column),
                onCellDoubleClicked: (e: CellDoubleClickedEvent<IRecord>) => this._onCellDoubleClick(e),
            }
            agColumns.push(agColumn);
        }
        if (this._grid.getSelectionType() !== 'none' || this._grid.isEditingEnabled()) {
            agColumns.unshift(this._createCheckBoxColumn())
        }
        return agColumns;
    }

    public executeWithGridApi(callback: (gridApi: GridApi) => void) {
        if (!this._gridApi || this._gridApi.isDestroyed()) {
            return;
        }
        return callback(this._gridApi);
    }

    public init(gridApi: GridApi) {
        this._gridApi = gridApi;
        this._registerEventListeners();
        this._setGridOptions();
        this._setCurrentColumns();
        if (!this._grid.getDataset().loading) {
            //we need to call this here since the events already fired before the grid api was ready
            this._onNewDataLoaded();
            this._setTotalRow();
        }
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

    public toggleGroup(node: IRowNode<IRecord>) {
        node.setExpanded(!node.expanded);
        //clears the expanded rows in memory so it does not interfere with the next group expansion
        this._expandedRowGroupIds = [];
        this._hasUserExpandedRowGroups = true;
    }

    public getRecordSelectionState(node: IRowNode<IRecord>): 'checked' | 'unchecked' | 'indeterminate' {
        const record = node.data!;
        const dataProvider = record.getDataProvider();
        const childDataProvider = dataProvider.getGroupedRecordDataProvider(record.getRecordId());
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
        //AG Grid asks a cell for its values *before* the control reports a new one, so everything it
        //cached - the value and the validation result derived from it - describes the value that has just
        //been replaced. Recompute the row now that the record holds the new one, otherwise the cell keeps
        //showing state for the old value: a validation error stayed invisible until the next edit.
        this.executeWithGridApi(gridApi => {
            const node = gridApi.getRowNode(record.getRecordId());
            //no node means the row is not rendered, and it reads current values whenever it is
            if (node) {
                gridApi.refreshCells({ rowNodes: [node] });
            }
        });
        if(this.getGrid().isAutoSaveEnabled()) {
            record.save();
        }
        const { ShouldUnmountWhenOutputChanges } = parameters;
        if (ShouldUnmountWhenOutputChanges?.raw) {
            this.executeWithGridApi(gridApi => gridApi.stopEditing());
        }
    }

    private _localHarnessDebugSetup() {
        if (this._grid.getParameters().IsLocalHarnessDebugMode?.raw === 'true') {
            window.addEventListener('visibilitychange', () => {
                this._saveState();
            })
        }
    }

    private _createCheckBoxColumn(): ColDef {
        return {
            colId: DataProvider.CONST.CHECKBOX_COLUMN_KEY,
            field: DataProvider.CONST.CHECKBOX_COLUMN_KEY,
            headerName: '',
            width: 40,
            lockPinned: true,
            resizable: false,
            pinned: 'left',
            headerComponent: RecordSelectionCheckBox,
            cellRenderer: SelectionCell,
            suppressSizeToFit: true,
            suppressMovable: true,
            valueGetter: () => null,
            valueFormatter: () => '',
            cellRendererParams: (p: any) => {
                return {
                    record: p.data
                }
            }
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

    private _setCurrentColumns() {
        const gridColumns = this._grid.getGridColumns();
        this.executeWithGridApi(gridApi => gridApi.setGridOption('columnDefs', this.getColumns(gridColumns)));
        this._autoSizeColumns();
    }

    private _isColumnAutoHeightEnabled(column: IGridColumn): boolean {
        return !!column.autoHeight
    }

    private _onCellDoubleClick(e: CellDoubleClickedEvent<IRecord>) {
        const column = this._dataset.getDataProvider().getColumnsMap()[e.colDef.colId!]!
        switch (true) {
            case !this._grid.isNavigationEnabled():
            //do not navigate on editable columns
            case this._grid.isColumnEditable(column.name, e.data):
            //do not navigate on aggregated/grouped rows
            case e.data?.getSummarizationType() !== 'none':
            //do not allow double click navigation for editable grids (it creates confusion between double clicking read only columns to navigate and double clicking editable columns to edit)
            case this._grid.isEditingEnabled():
            //do not navigate on checkbox column
            case column.name === DataProvider.CONST.CHECKBOX_COLUMN_KEY: {
                break;
            }
            default: {
                const record = e.data!;
                record.getDataProvider().openDatasetItem(record.getNamedReference());
            }
        }
    }

    private _saveState() {
        this.executeWithGridApi(gridApi => {
            const { rowSelection, columnOrder, ...gridState } = gridApi.getState();
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
        });
    }

    private _isColumnPinned(column: IGridColumn) {
        switch (true) {
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

    private _scrollToTop() {
        this.executeWithGridApi(gridApi => gridApi.ensureIndexVisible(0, 'top'));
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
        this._dataset.addEventListener('onRenderRequested', () => this.executeWithGridApi(gridApi => gridApi.refreshCells()));
        this._dataset.addEventListener('onFirstDataLoaded', () => this._setTotalRow());
        this._grid.addTotalRowCreatedListener(() => this._setTotalRow());
        this.executeWithGridApi(gridApi => {
            gridApi.addEventListener('gridSizeChanged', () => this._autoSizeColumns());
            gridApi.addEventListener('firstDataRendered', () => this._autoSizeColumns());
            gridApi.addEventListener('selectionChanged', (e: SelectionChangedEvent) => this._onSelectionChanged(e));
            gridApi.addEventListener('columnResized', (e: any) => this._debouncedColumnResized(e));
            gridApi.addEventListener('modelUpdated', () => {
                if (this._grid.getDataset().loading) {
                    this._setLoadingOverlay(true);
                }
                this._setGridHeight();
                //the only place the overlay is decided: every way rows come and go ends up here, the
                //provider loading them as much as a control removing one through a server side
                //transaction - and the latter the provider never hears about
                this._setNoRowsOverlay();
            });
            //`modelUpdated` does not fire for pinned rows, so without this the height would stay stale
            //when a total row or a floating row appears or goes away
            gridApi.addEventListener('pinnedRowDataChanged', () => this._setGridHeight());
            gridApi.addEventListener('columnMoved', (e: ColumnMovedEvent<IRecord>) => this._onColumnMoved(e));
            gridApi.addEventListener('firstDataRendered', () => this._handleSelectionFromState());
            gridApi.addEventListener('gridPreDestroyed', () => this._onDestroyed());
        });
    }

    //idempotent: the total row provider only comes into existence once the dataset carries an
    //aggregation, which can happen long after the grid mounted. Grids that never aggregate leave the
    //pinned rows alone entirely - other features own that row (see CheckListGridCustomizer)
    private _setTotalRow() {
        const totalRow = this._grid.ensureTotalRow();
        if (!totalRow) {
            return;
        }
        if (!this._totalRowSubscribed) {
            this._totalRowSubscribed = true;
            const totalRowDataProvider = totalRow.getDataProvider();
            totalRowDataProvider.addEventListener('onLoading', () => this._setPinnedRowData());
            totalRowDataProvider.addEventListener('onError', () => this._setPinnedRowData());
        }
        this._setPinnedRowData();
    }

    private _setGridOptions() {
        this.executeWithGridApi(gridApi => {
            gridApi.setGridOption('serverSideDatasource', this._dataSource);
            gridApi.setGridOption('isServerSideGroupOpenByDefault', (params) => this._syncExpandedRowGroups(params));
            gridApi.setGridOption('loadingCellRenderer', FullRowLoading)
            gridApi.setGridOption('suppressDragLeaveHidesColumns', true);
            gridApi.setGridOption('isFullWidthRow', (params) => this._isFullWidthRow(params));
            gridApi.setGridOption('fullWidthCellRenderer', FullWidthCellRendererError);
            gridApi.setGridOption('fullWidthCellRendererParams', (params: IsFullWidthRowParams<IRecord>) => this._getFullWidthCellRendererParams(params))
            gridApi.setGridOption('suppressCopyRowsToClipboard', true);
            gridApi.setGridOption('animateRows', false);
            gridApi.setGridOption('groupDisplayType', 'custom');
        });
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
        const localIntervals: NodeJS.Timeout[] = [];
        const resolvedProviderSet = new Set<IDataProvider>();
        for (const id of selectedRecordIds) {
            const interval = setInterval(() => {
                const record = this._grid.getDataset().getDataProvider().getRecordsMap()[id];
                if (record) {
                    clearInterval(interval);
                    const provider = record.getDataProvider();
                    if (!resolvedProviderSet.has(provider)) {
                        const recordIdsToSelect = selectedRecordIds.filter(id => provider.getRecordsMap()[id])
                        provider.setSelectedRecordIds(recordIdsToSelect);
                        resolvedProviderSet.add(provider);
                    }
                    if (!isScrolledToMiddle) {
                        const middleSelectedRecordId = selectedRecordIds[Math.floor(selectedRecordIds.length / 2)]
                        this.executeWithGridApi(gridApi => {
                            const node = gridApi.getRowNode(middleSelectedRecordId);
                            if (node) {
                                isScrolledToMiddle = true;
                                gridApi.ensureNodeVisible(node!, 'middle');
                            }
                        });
                    }
                }
            }, 100);
            localIntervals.push(interval);
            this._intervals.push(interval);
        }
        //abandon the selection after 5 seconds
        //this could be done better by detecting if we are done loading all providers
        setTimeout(() => {
            localIntervals.forEach(interval => clearInterval(interval));
        }, 5000);
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
            return params.rowNode.level <= this._grid.getDefaultExpandedGroupLevel();
        }
        else return false;
    }

    private _onColumnMoved(e: ColumnMovedEvent<IRecord>) {
        const movedColumn = this._grid.getDataset().getDataProvider().getColumnsMap()[e.column?.getColId()!];
        if (!e.finished || e.source !== 'uiColumnMoved') {
            return;
        }
        let order = 0;
        const newColumnsMap = new Map<string, IColumn>(this._grid.getDataset().columns.map(col => [col.name, col]));
        for (const colId of e.api.getState().columnOrder?.orderedColIds!) {
            if (newColumnsMap.has(colId)) {
                newColumnsMap.set(colId, { ...newColumnsMap.get(colId)!, order: order++ });
            }
        }
        this._dataset.setColumns([...newColumnsMap.values()]);
        if (movedColumn?.grouping?.isGrouped) {
            this._dataset.refresh();
        }
    }

    private _onNewDataLoaded() {
        this._refreshServerSideModel();
        this._setCurrentColumns();
        this._scrollToTop();
        //a view change can bring in aggregated columns, which is what creates the total row
        this._setTotalRow();
    }

    private _refreshServerSideModel() {
        this.executeWithGridApi(gridApi => {
            this._expandedRowGroupIds = gridApi.getState()?.rowGroupExpansion?.expandedRowGroupIds ?? [];
            gridApi.refreshServerSide({
                purge: true
            })
        });
    }

    /**
     * The height the rows themselves need — every row up to {@link IGridModel.getMaxVisibleRows}, beyond
     * which the grid scrolls instead of growing.
     *
     * Counts the displayed rows rather than the rendered ones: rendering is virtualized, so the rendered
     * count depends on the height being calculated here and would feed back into itself.
     */
    private _getRowsHeight(): number {
        const defaultRowHeight = this._grid.getDefaultRowHeight();
        let rowsHeight = 0;
        this.executeWithGridApi(gridApi => {
            const visibleRowCount = Math.min(gridApi.getDisplayedRowCount(), this._grid.getMaxVisibleRows());
            for (let i = 0; i < visibleRowCount; i++) {
                //measured per row, since a row with a wrapping cell can be taller than the default
                rowsHeight += gridApi.getDisplayedRowAtIndex(i)?.rowHeight ?? defaultRowHeight;
            }
        });
        //with no rows there would be nowhere to draw the "no records" overlay
        return Math.max(rowsHeight, defaultRowHeight);
    }

    /**
     * Everything the grid takes up that is not the scrollable row area: the header, any pinned rows, the
     * group drop zone, and the borders of the boxes in between.
     *
     * Found by walking from the rows (`.ag-body`) up to the grid root and measuring what sits alongside
     * the way up, so chrome this method has never heard of is counted too. Every part of the sum is
     * content-sized, which is what makes it safe to measure a grid whose height this method set: nothing
     * here depends on that height, so the result cannot feed back into itself.
     */
    private _getChromeHeight(): number {
        const wrapper = this._getContainer()?.querySelector<HTMLElement>('.ag-root-wrapper');
        const body = wrapper?.querySelector<HTMLElement>('.ag-body');
        if (!wrapper || !body) {
            //nothing laid out yet, or the grid is hidden: the last measurement beats guessing
            return this._chromeHeight ?? 0;
        }
        let chromeHeight = 0;
        let element: HTMLElement = body;
        while (element !== wrapper) {
            const parent: HTMLElement = element.parentElement!;
            for (const sibling of Array.from(parent.children) as HTMLElement[]) {
                //the overlay, the sticky rows and the invisible scrollbars are out of the flow, so they
                //are drawn over the grid rather than taking any height of their own
                if (sibling === element || this._isOutOfFlow(sibling)) {
                    continue;
                }
                chromeHeight += sibling.offsetHeight;
            }
            chromeHeight += element.offsetHeight - element.clientHeight;
            element = parent;
        }
        this._chromeHeight = chromeHeight + wrapper.offsetHeight - wrapper.clientHeight;
        return this._chromeHeight;
    }

    private _isOutOfFlow(element: HTMLElement): boolean {
        switch (getComputedStyle(element).position) {
            case 'absolute':
            case 'fixed': {
                return true;
            }
        }
        return false;
    }

    private _calculateGridHeight(): string {
        const height = this._grid.getParameters().Height?.raw;
        //an explicit height always wins
        if (height) {
            return height;
        }
        return `${this._getRowsHeight() + this._getChromeHeight()}px`;
    }
    private _setGridHeight() {
        setTimeout(() => {
            const container = this._getContainer();
            if (container) {
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
        this.executeWithGridApi(gridApi => {
            gridApi.sizeColumnsToFit({
                columnLimits: this._grid.getDataset().columns.map(col => {
                    return {
                        key: col.name,
                        minWidth: col.visualSizeFactor
                    }
                })
            });
        });
    }

    private _updateColumnVisualSizeFactor(e: ColumnResizedEvent<IRecord>) {
        const resizedColumnKey = e.column?.getColId();
        if (!resizedColumnKey) {
            return;
        }
        const columns = this._grid.getDataset().columns; const newColumns = columns.map(col => {
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
        let selectedNodes: IRowNode<IRecord>[] = [];
        this.executeWithGridApi(gridApi => {
            selectedNodes = gridApi.getSelectedNodes();
        });
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
        this.executeWithGridApi(gridApi => {
            gridApi.setServerSideSelectionState({
                selectAll: false,
                toggledNodes: this._grid.getDataset().getDataProvider().getSelectedRecordIds({ includeGroupRecordIds: true })
            })
            gridApi.refreshCells({
                columns: [CHECKBOX_COLUMN_KEY],
                force: true
            })
        });
    }

    private _areChildProvidersLoading(): boolean {
        const childProviders = this._dataset.getDataProvider().getGroupedRecordDataProviders(true).filter(x => x.getParentRecordId());
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

        //resolved once: the control asks for its bindings while constructing its properties and again in
        //getParameters(), and each call rebuilt the whole binding graph for the same record and column
        const bindings = this._grid.getBindings(record, column, customControl);
        const control = new NestedControl({
            onGetBindings: () => bindings,
            parentPcfContext: this._grid.getPcfContext(),
        });
        const parameters = columnInfo.ui.getControlParameters({
            ...this._grid.getFieldBindingParameters(record, column, editing),
            ...control.getParameters(),
        });
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
            editable: column.isEditable && columnInfo.security.editable,
            editing: editing,
            parameters: parameters,
            saving: record.isSaving(),
            columnAlignment: column.alignment,
            customComponent: columnInfo.ui.getCustomControlComponent()
        } as ICellValues;
    }

    private _setPinnedRowData() {
        const totalRecord = this._grid.getTotalRow()?.getTotalRowRecord() ?? null;
        this.executeWithGridApi(gridApi => gridApi.setGridOption('pinnedBottomRowData', totalRecord ? [totalRecord] : []));
    }

    private _setLoadingOverlay(isLoading: boolean) {
        if (!isLoading) {
            return this.executeWithGridApi(gridApi => gridApi.hideOverlay());
        }
        this.executeWithGridApi(gridApi => gridApi.showLoadingOverlay());
    }

    private _setNoRowsOverlay() {
        setTimeout(() => {
            if (this._grid.getDataset().loading) {
                return;
            }
            this.executeWithGridApi(gridApi => {
                gridApi.hideOverlay();
                //asked of the grid rather than the provider, so rows added or removed through a server
                //side transaction count too. Pinned rows are not displayed rows, so a control's own
                //floating row does not pass for a record here
                if (gridApi.getDisplayedRowCount() === 0) {
                    gridApi.showNoRowsOverlay();
                }
            });
        }, 0);
    }

    private _isCellEditorEnabled(columnName: string, record: IRecord): boolean {

        const column = this._grid.getGridColumnByName(columnName);        // check column eligibility for cell editor
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