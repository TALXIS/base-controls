import { ColDef, ColumnResizedEvent, EditableCallbackParams, GridApi, IRowNode, IsServerSideGroupOpenByDefaultParams, ModuleRegistry, SelectionChangedEvent, SuppressKeyboardEventParams, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import debounce from 'debounce';
import { GridModel, IGridColumn } from "../GridModel";
import { DataTypes, IAddControlNotificationOptions, IColumn, IColumnInfo, IControlParameters, ICustomColumnComponent, ICustomColumnControl, ICustomColumnFormatting, IDataProvider, IRecord, Operators } from "@talxis/client-libraries";
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
ModuleRegistry.registerModules([RowGroupingModule, ServerSideRowModelModule, ClipboardModule, MenuModule]);

interface IAgGridTestDependencies {
    grid: GridModel;
    getContainer: () => HTMLDivElement;
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
}

export class AgGridModel {
    private _grid: GridModel;
    private _dataSource: ServerSideDatasource;
    private _gridApi: GridApi | undefined;
    private _comparator: Comparator;
    private _hasUserResizedColumns: boolean = false;
    private _getContainer: () => HTMLDivElement;
    private _cellDataMap: Map<string, ICellValues> = new Map<string, ICellValues>();
    private _debouncedColumnResized: debounce.DebouncedFunction<(e: ColumnResizedEvent<IRecord>) => void>;
    private _debouncedSetSelectedNodes: debounce.DebouncedFunction<() => void>;
    private _expandedRowGroupIds: string[] = [];
    private _hasUserExpandedRowGroups: boolean = false;

    constructor({ grid, getContainer }: IAgGridTestDependencies) {
        this._grid = grid;
        this._getContainer = getContainer;
        this._dataSource = new ServerSideDatasource(this);
        this._comparator = new Comparator();
        //this._grid.getAggregation().addEventListener('onRequestRender', () => this._setPinnedRowData());
        this._debouncedColumnResized = debounce((e: ColumnResizedEvent<IRecord>) => this._onColumnResized(e));
        this._debouncedSetSelectedNodes = debounce(() => this._setSelectedNodes(), 0);
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
                resizable: column.isResizable,
                autoHeaderHeight: true,
                suppressMovable: column.isDraggable === false ? true : false,
                suppressSizeToFit: isCheckboxColumn,
                lockPosition: this._getLockPosition(column),
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
                editable: (p) => this._isColumnEditable(column, p),
                headerComponent: ColumnHeader,
                cellRenderer: Cell,
                cellEditor: Cell,
                valueGetter: (p: ValueGetterParams<IRecord>) => this._valueGetter(p, column),
                valueFormatter: (p: ValueFormatterParams<IRecord>) => this._valueFormatter(p),
                equals: (valueA, valueB) => {
                    return this._comparator.isEqual(this._cellDataMap.get(valueA), this._cellDataMap.get(valueB));
                },
                suppressKeyboardEvent: (p) => this._suppressKeyboardEvent(p, column)
            }
            if (column.dataType === DataTypes.Multiple) {
                agColumn.autoHeight = true;
            }
            if (agColumn.field === CHECKBOX_COLUMN_KEY) {
                agColumn.lockPosition = 'left';
                agColumn.headerComponent = RecordSelectionCheckBox;
            }
            return agColumn;
        })
        this._sortColumns(agColumns);
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
        this.getGridApi().setGridOption('serverSideDatasource', this._dataSource);
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
        if (this._grid.getDataset().loading) {
            return;
        }
        const { haveColumnsBeenUpdated, columns } = this._grid.getGridColumns();
        if (haveColumnsBeenUpdated) {
            this.getGridApi().setGridOption('columnDefs', this.getColumns(columns))
        }
        else {
            this.getGridApi().refreshCells();
        }
        this._autoSizeColumns();
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
                const childDataProvider = dataProvider.getChildDataProvider(record.getRecordId());
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

    private _getCellParameters(record: IRecord, column: IGridColumn) {
        const recordId = record.getRecordId();
        return {
            baseColumn: column,
            cellData: this._cellDataMap.get(`${recordId}_${column.name}`),
            record: record
        }
    }

    private _isColumnHidden(column: IGridColumn): boolean {
        if (column.name === CHECKBOX_COLUMN_KEY && this._grid.getSelectionType() !== 'none') {
            return false;
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
        if (column.grouping?.isGrouped) {
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

    private _sortColumns(columns: ColDef[]) {
        const columnsMap = this._grid.getDataset().getDataProvider().getColumnsMap();
        columns.sort((a, b) => {
            // Prioritize checkbox column
            if (a.field === CHECKBOX_COLUMN_KEY) return -1;
            if (b.field === CHECKBOX_COLUMN_KEY) return 1;

            // Compare grouped vs non-grouped columns
            const isAGrouped = a.rowGroup;
            const isBGrouped = b.rowGroup;

            // If both are grouped, sort by grouping order
            if (isAGrouped && isBGrouped) {
                const colA = columnsMap.get(a.field!)!;
                const colB = columnsMap.get(b.field!)!;
                const orderA = colA.grouping?.order ?? Number.MAX_SAFE_INTEGER;
                const orderB = colB.grouping?.order ?? Number.MAX_SAFE_INTEGER;
                return orderA - orderB;
            }
            // Maintain original order for non-grouped columns
            return 0;
        });
    }

    private _suppressKeyboardEvent(params: SuppressKeyboardEventParams<IRecord, any>, column: IGridColumn): boolean {
        if (column.oneClickEdit) {
            return true;
        }
        return false;
    }

    private _registerEventListeners() {
        this._dataset.addEventListener('onLoading', (isLoading: boolean) => this._setLoadingOverlay(isLoading));
        this._dataset.addEventListener('onRecordsSelected', () => this._debouncedSetSelectedNodes())
        this._dataset.addEventListener('onNewDataLoaded', () => this._onNewDataLoaded())
        this.getGridApi().addEventListener('gridSizeChanged', () => this._autoSizeColumns());
        this.getGridApi().addEventListener('firstDataRendered', () => this._autoSizeColumns());
        this.getGridApi().addEventListener('selectionChanged', (e: SelectionChangedEvent) => this._onSelectionChanged(e));
        this.getGridApi().addEventListener('columnResized', (e: any) => this._debouncedColumnResized(e));
        this.getGridApi().addEventListener('modelUpdated', () => this._setGridHeight());
        //this.getGridApi().addEventListener('modelUpdated', (params: any) => this._syncExpandedRowGroups());
        this.getGridApi().setGridOption('getRowHeight', (params) => this._grid.getDefaultRowHeight());
        this.getGridApi().setGridOption('isServerSideGroupOpenByDefault', (params) => this._syncExpandedRowGroups(params))
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

    private _onNewDataLoaded() {
        this._refreshServerSideModel();
        this._setNoRowsOverlay();
        this._scrollToTop();
    }

    private _refreshServerSideModel() {
        this._expandedRowGroupIds = this.getGridApi().getState().rowGroupExpansion?.expandedRowGroupIds ?? [];
        this.getGridApi().refreshServerSide({
            purge: true
        })
    }

    private _toggleSuppressRowClickSelection() {
        this.getGridApi().setGridOption('suppressRowClickSelection', this._dataset.grouping.getGroupBys().length > 0);
    }

    private _calculateGridHeight(): string {
        const defaultRowHeight = this._grid.getDefaultRowHeight();
        const offset = 20;
        if (this._grid.getParameters().Height?.raw) {
            return this._grid.getParameters().Height!.raw!;
        }
        else {
            const totalRowHeight = this.getGridApi().getRenderedNodes().reduce((acc, node) => acc + (node.rowHeight ?? defaultRowHeight), 0);
            const numberOfRecords = this._dataset.getDataProvider().getRecords().length;
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
        //this.refresh();
    }

    private _autoSizeColumns() {
        if (this._hasUserResizedColumns) {
            return;
        }
        this.getGridApi().sizeColumnsToFit({
            columnLimits: this._grid.getCachedGridColumns().map(col => {
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
        const columns = this._grid.getCachedGridColumns();
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
        //this.refresh();
        //this._grid.getPcfContext().factory.requestRender();
    }

    private _onSelectionChanged(e: SelectionChangedEvent<IRecord>) {
        switch (true) {
            case e.source === 'api':
            case e.source === 'apiSelectAll': {
                return;
            }
        }
        const selectedNodes: IRowNode<IRecord>[] = this.getGridApi().getSelectedNodes();
        this._dataset.clearSelectedRecordIds();
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
        let ids = this._dataset.getDataProvider().getSelectedRecordIds(true);
        let isLoading = false;
        await this._grid.loadGroups(ids, () => {
            if (!isLoading) {
                this._dataset.getDataProvider().setLoading(true);
                isLoading = true;
            }
        });
        if (isLoading) {
            this._dataset.getDataProvider().setLoading(false);
        }
        ids = this._dataset.getDataProvider().getSelectedRecordIds(true);
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
        return this._grid.getRecordFormattedValue(p.data!, p.colDef.colId!) ?? '';
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
        if (column.oneClickEdit) {
            editing = true;
        }
        const aggregationInfo = this._grid.getAggregationInfo(record, column);
        const values = {
            notifications: columnInfo.ui.getNotifications(),
            value: this._grid.getRecordValue(record, column),
            customFormatting: this._grid.getFieldFormatting(record, column.name),
            customControl: customControl,
            error: columnInfo.error,
            aggregatedValue: aggregationInfo.value,
            loading: columnInfo.ui.isLoading(),
            errorMessage: columnInfo.errorMessage,
            editable: columnInfo.security.editable,
            editing: editing,
            parameters: parameters,
            columnAlignment: column.alignment,
            customComponent: columnInfo.ui.getCustomControlComponent()
        } as ICellValues;
        const valueKey = `${record.getRecordId()}_${column.name}`;
        this._cellDataMap.set(valueKey, values);
        return valueKey;
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

    private _isColumnEditable(column: IGridColumn, params: EditableCallbackParams<IRecord, any>): boolean {
        if (column.name === CHECKBOX_COLUMN_KEY) {
            return false;
        }
        //we cannot edit aggregated or grouped columns
        if (params?.data?.getDataProvider().getSummarizationType() !== 'none') {
            return false;
        }
        const columnInfo = params.data?.getColumnInfo(column.name);
        if (!this._grid.isEditingEnabled() || columnInfo?.ui.isLoading() === true) {
            return false;
        }
        //disable ag grid cell editor if oneClickEdit is enabled
        //editor control will be used in cell renderer
        if (column.oneClickEdit) {
            return false;
        }
        return columnInfo?.security.editable ?? true;
    }

    private get _dataset() {
        return this._grid.getDataset();
    }
}