import { CellClickedEvent, CellDoubleClickedEvent, ColDef, ColumnMovedEvent, ColumnResizedEvent, GridApi, IRowNode, IsFullWidthRowParams, IsServerSideGroupOpenByDefaultParams, ModuleRegistry, SelectionChangedEvent, SuppressKeyboardEventParams, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import debounce from 'debounce';
import { GridModel, IGridColumn } from "../GridModel";
import { DataProvider, DataTypes, EventEmitter, IAddControlNotificationOptions, IColumn, IColumnInfo, IControlParameters, ICustomColumnComponent, ICustomColumnControl, ICustomColumnFormatting, IDataProvider, IRecord, Operators } from "@talxis/client-libraries";
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
import { MenuModule } from "@ag-grid-enterprise/menu";
import { FullRowLoading } from "../../loading/full-row/FullRowLoading";
import { FullWidthCellRendererError } from "../../errors/FullWidthCellRendererError/FullWidthCellRendererError";
ModuleRegistry.registerModules([RowGroupingModule, ServerSideRowModelModule, ClipboardModule, MenuModule]);

interface IAgGridTestDependencies {
    grid: GridModel;
    getContainer: () => HTMLDivElement;
}

interface IEvents {
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

export class AgGridModel extends EventEmitter<IEvents> {
    private _grid: GridModel;
    private _dataSource: ServerSideDatasource;
    private _gridApi: GridApi | undefined;
    private _hasUserResizedColumns: boolean = false;
    private _getContainer: () => HTMLDivElement;
    private _debouncedColumnResized: debounce.DebouncedFunction<(e: ColumnResizedEvent<IRecord>) => void>;
    private _debouncedRefresh: debounce.DebouncedFunction<() => void>;
    private _debouncedSetSelectedNodes: debounce.DebouncedFunction<() => void>;
    private _expandedRowGroupIds: string[] = [];
    private _hasUserExpandedRowGroups: boolean = false;

    constructor({ grid, getContainer }: IAgGridTestDependencies) {
        super();
        this._grid = grid;
        this._getContainer = getContainer;
        this._dataSource = new ServerSideDatasource(this);
        this._debouncedColumnResized = debounce((e: ColumnResizedEvent<IRecord>) => this._onColumnResized(e));
        this._debouncedSetSelectedNodes = debounce(() => this._setSelectedNodes(), 0);
        this._debouncedRefresh = debounce(() => this._refresh(), 0);
        this._dataset.addEventListener('onInitialDataLoaded', () => {
            this._grid.getAggregation().addEventListener('onStateUpdated', () => this._setPinnedRowData());
        })
    }

    public getColumns(gridColumns: IGridColumn[]): ColDef[] {
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
                onCellClicked: (e: CellClickedEvent<IRecord>) => this._onCellClick(e),
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
        if (dataProvider.getSummarizationType() === 'grouping') {
            if (node.isSelected()) {
                return 'checked';
            }
            else {
                const childDataProvider = dataProvider.getChildDataProvider({ parentRecordId: record.getRecordId() });
                if (childDataProvider.getSelectedRecordIds(true).length === 0) {
                    return 'unchecked';
                }
                else {
                    return 'indeterminate';
                }
            }
        }
        else {
            return node.isSelected() ? 'checked' : 'unchecked';
        }
    }

    public onNotifyOutputChanged(record: IRecord, columnName: string, value: any, parameters: any) {
        record.setValue(columnName, value);
        const { ShouldStopEditWhenOutputChanges } = parameters;
        if (ShouldStopEditWhenOutputChanges?.raw) {
            this.getGridApi().stopEditing();
        }
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

    private _onCellClick(e: CellClickedEvent<IRecord>) {
        //@ts-ignore
        e.data?.dispatchEvent('onFieldClicked', e.colDef.colId!);
    }

    private _onCellDoubleClick(e: CellDoubleClickedEvent<IRecord>) {
        const column = this._dataset.getDataProvider().getColumnsMap()[e.colDef.colId!]!
        switch (true) {
            //do not navigate if the column is not editable or if the grid is not in navigation mode
            case !this._grid.isNavigationEnabled():
            case this._grid.isColumnEditable(column.name, e.data):
            case column.name === DataProvider.CONST.CHECKBOX_COLUMN_KEY: {
                return;
            }
            default: {
                const record = e.data!;
                record.getDataProvider().openDatasetItem(record.getNamedReference());
            }
        }
    }

    private _isColumnPinned(column: IGridColumn): boolean {
        switch (true) {
            case column.name === CHECKBOX_COLUMN_KEY:
            case column.grouping?.isGrouped: {
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
        if(column.name === DataProvider.CONST.CHECKBOX_COLUMN_KEY) {
            switch(true) {
                case this._grid.getSelectionType() !== 'none': {
                    return false;
                }
                case this._grid.isAutoSaveEnabled(): {
                    return false;
                }
                default: {
                    return true;
                }
            }
        }
        return !!column.isHidden;
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
        this._dataset.addEventListener('onLoading', (isLoading: boolean) => this._setLoadingOverlay(isLoading));
        this._dataset.addEventListener('onRecordsSelected', () => this._debouncedSetSelectedNodes());
        this._dataset.addEventListener('onNewDataLoaded', () => this._onNewDataLoaded());
        this._dataset.addEventListener('onRenderRequested', () => this.refresh());
        this.getGridApi().addEventListener('gridSizeChanged', () => this._autoSizeColumns());
        this.getGridApi().addEventListener('firstDataRendered', () => this._autoSizeColumns());
        this.getGridApi().addEventListener('selectionChanged', (e: SelectionChangedEvent) => this._onSelectionChanged(e));
        this.getGridApi().addEventListener('columnResized', (e: any) => this._debouncedColumnResized(e));
        this.getGridApi().addEventListener('modelUpdated', () => this._setGridHeight());
        this.getGridApi().addEventListener('columnMoved', (e: ColumnMovedEvent<IRecord>) => this._onColumnMoved(e));
    }

    private _setGridOptions() {
        this.getGridApi().setGridOption('serverSideDatasource', this._dataSource);
        this.getGridApi().setGridOption('isServerSideGroupOpenByDefault', (params) => this._syncExpandedRowGroups(params));
        this.getGridApi().setGridOption('loadingCellRenderer', FullRowLoading)
        this.getGridApi().setGridOption('suppressDragLeaveHidesColumns', true);
        this.getGridApi().setGridOption('isFullWidthRow', (params) => this._isFullWidthRow(params));
        this.getGridApi().setGridOption('fullWidthCellRenderer', FullWidthCellRendererError);
        this.getGridApi().setGridOption('fullWidthCellRendererParams', (params: IsFullWidthRowParams<IRecord>) => this._getFullWidthCellRendererParams(params))
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
        let offset = 20;
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
            this._getContainer().style.height = this._calculateGridHeight();
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
        this._dataset.clearSelectedRecordIds();
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

    private async _setSelectedNodes() {
        await this._grid.loadGroups(this._dataset.getDataProvider().getSelectedRecordIds(true));
        const ids = this._dataset.getDataProvider().getSelectedRecordIds(true);
        
        this.getGridApi().setServerSideSelectionState({
            selectAll: false,
            toggledNodes: ids
        })
        this.getGridApi().refreshCells({
            columns: [CHECKBOX_COLUMN_KEY],
            force: true
        })
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
        this.getGridApi().setGridOption('pinnedBottomRowData', this._grid.getAggregation().getAggregationRecord())
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