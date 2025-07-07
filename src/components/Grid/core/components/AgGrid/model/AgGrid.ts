import { CellClassParams, ColDef, ColumnMovedEvent, ColumnResizedEvent, EditableCallbackParams, GridApi, IRowNode, RowNode, SelectionChangedEvent, SuppressKeyboardEventParams, ValueFormatterParams, ValueGetterParams, ValueParserParams } from "@ag-grid-community/core";
import { Grid, Grid2 } from "../../../model/Grid";
import { IGridColumn } from "../../../interfaces/IGridColumn";
import { CHECKBOX_COLUMN_KEY } from "../../../../constants";
import { DataTypes, IAddControlNotificationOptions, IColumn, IColumnInfo, IControlParameters, ICustomColumnComponent, ICustomColumnControl, ICustomColumnFormatting, IRecord, Sanitizer } from "@talxis/client-libraries";
import { GlobalCheckBox } from "../../ColumnHeader/components/GlobalCheckbox/GlobalCheckbox";
import { ColumnHeader } from "../../ColumnHeader/ColumnHeader";
import { Cell } from "../../Cell/Cell";
import { merge } from "@fluentui/react";
import { Comparator } from "./Comparator";
import { NestedControl } from "../../../../../NestedControlRenderer/NestedControl";
import { Datasource } from "./Datasource";

interface IAgGridTestDependencies {
    grid: Grid2;
}


export interface ICellValues {
    notifications: IAddControlNotificationOptions[];
    customFormatting: Required<ICustomColumnFormatting>;
    customControl: Required<ICustomColumnControl>;
    customComponent: ICustomColumnComponent;
    loading: boolean;
    value: any;
    error: boolean;
    height: number;
    errorMessage: string;
    parameters: IControlParameters;
    columnAlignment: Required<IColumn['alignment']>;
    editing: boolean;
    editable: boolean;
    disabled: boolean;
}

export class AgGrid {
    private _grid: Grid2;
    private _pendingSelectionChange: boolean = false;
    private _hasCheckboxBeenClicked: boolean = false;
    private _dataSource: Datasource;
    private _gridApi: GridApi | undefined;

    constructor({ grid }: IAgGridTestDependencies) {
        this._grid = grid;
        this._dataSource = new Datasource(this);
        this._grid.getAggregation().setOnRequestRenderHandler(() => this._setPinnedRowData())
    }

    public getColumns(): ColDef[] {
        return this._grid.getGridColumns().map(column => {
            const isCheckboxColumn = column.name === CHECKBOX_COLUMN_KEY;
            const agColumn: ColDef = {
                colId: column.name,
                field: column.name,
                headerName: column.displayName,
                hide: column.isHidden,
                width: column.visualSizeFactor,
                sortable: !column.disableSorting,
                resizable: column.isResizable,
                autoHeaderHeight: true,
                suppressMovable: column.isDraggable === false ? true : false,
                suppressSizeToFit: isCheckboxColumn,
                lockPosition: isCheckboxColumn ? 'left' : undefined,
                headerComponentParams: {
                    baseColumn: column
                },
                cellRendererParams: {
                    baseColumn: column,
                    isCellEditor: false
                },
                cellEditorParams: {
                    baseColumn: column,
                    isCellEditor: true
                },
                editable: (p) => this._isColumnEditable(column, p),
                headerComponent: ColumnHeader,
                cellRenderer: Cell,
                cellEditor: Cell,
                valueGetter: (p: ValueGetterParams<IRecord>) => this._valueGetter(p, column),
                valueFormatter: (p: ValueFormatterParams<IRecord>) => this._valueFormatter(p, column)
                //suppressKeyboardEvent: (params) => this._grid._suppressKeyboardEvent(params, column),
            }
            if (agColumn.field === CHECKBOX_COLUMN_KEY) {
                agColumn.lockPosition = 'left';
                agColumn.headerComponent = GlobalCheckBox;
            }
            return agColumn;
        })
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

    public getGrid(): Grid2 {
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

    private _registerEventListeners() {
        this._dataset.addEventListener('onLoading', (isLoading: boolean) => this._setLoadingOverlay(isLoading));
        this._dataset.addEventListener('onRecordsSelected', (ids) => this._setSelectedNodes())
        this._dataset.addEventListener('onNewDataLoaded', () => {
            this.getGridApi().refreshServerSide();
            this._setNoRowsOverlay();
        })
        this.getGridApi().addEventListener('selectionChanged', (e: SelectionChangedEvent) => this._onSelectionChanged(e))
    }

    private _onSelectionChanged(e: SelectionChangedEvent) {
        switch (e.source) {
            case 'api':
            case 'apiSelectAll': {
                return;
            }
            //@ts-ignore - typings
            case '__CHECKBOX': {
                this._hasCheckboxBeenClicked = true;
            }
        }
        if (this._pendingSelectionChange) {
            return;
        }
        this._pendingSelectionChange = true;

        queueMicrotask(() => {
            this._pendingSelectionChange = false;
            const selectedNodes = this.getGridApi().getSelectedNodes();
            if (this._hasCheckboxBeenClicked) {
                this._hasCheckboxBeenClicked = false;
                return;
            }
            this._dataset.setSelectedRecordIds(selectedNodes.map(node => node.id!));
        })
    }

    private _setSelectedNodes() {
        this.getGridApi().deselectAll();
        this.getGridApi().forEachNode(node => {
            if (this._grid.getSelection().getSelectedRecordIdsSet().has(node.id!)) {
                node.setSelected(true);
            }
        })
        this.getGridApi().refreshCells({
            columns: [CHECKBOX_COLUMN_KEY]
        })
    }

    private _valueFormatter(p: ValueFormatterParams<IRecord>, column: IGridColumn): string {
        if (column.name === CHECKBOX_COLUMN_KEY) {
            return ''
        }
        return p.data?.getFormattedValue(column.name) ?? '';
    }

    private _valueGetter(p: ValueGetterParams<IRecord>, column: IGridColumn) {
        if (column.name === CHECKBOX_COLUMN_KEY || !p.data) {
            return {
                customFormatting: this._grid.getFieldFormatting(p.data!, column.name)
            }
        }
        let editing: boolean = false;
        const record = p.data;
        const columnInfo = p.data!.getColumnInfo(column.name) as IColumnInfo;
        //i hate this, there is no other way to get the information if we are in edit mode or not
        if (p.api.getEditingCells().length > 0 || Error().stack!.includes('startEditing')) {
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
        const isAggregatedRecord = record.getDataProvider().getSummarizationType() === 'aggregation';
        const values = {
            notifications: columnInfo.ui.getNotifications(),
            value: p.data!.getValue(column.name),
            customFormatting: this._grid.getFieldFormatting(p.data!, column.name),
            customControl: customControl,
            height: p.node!.rowHeight,
            //validations need to be disabled for aggregated records
            error: isAggregatedRecord ? false : columnInfo.error,
            loading: columnInfo.ui.isLoading(),
            errorMessage: columnInfo.errorMessage,
            editable: columnInfo.security.editable,
            editing: editing,
            parameters: parameters,
            columnAlignment: column.alignment,
            customComponent: columnInfo.ui.getCustomControlComponent()
        } as ICellValues;
        return values;
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

/* export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>;
    private _theme: ITheme;
    private _rerenderCallback: () => void = () => { };
    private _rerenderGlobalCheckBox: () => void = () => { };
    private _comparator: Comparator = new Comparator();
    public readonly oddRowCellTheme: ITheme;
    public readonly evenRowCellTheme: ITheme;

    constructor(grid: Grid, gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>, theme: ITheme) {
        super(grid);
        this._gridApiRef = gridApiRef;
        this._theme = theme;
        this._grid.dataset.addEventListener('onRecordsSelected', (ids) => {
            this.refreshRowSelection();
        })
        this.oddRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.neutralLighterAlt, this._theme.semanticColors.bodyText);
        this.evenRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.white, this._theme.semanticColors.bodyText);
    }
    public getColumns() {
        const agColumns: ColDef[] = [];
        for (const column of this._grid.columns) {
            const agColumn: ColDef = {
                colId: column.name,
                field: column.name,
                headerName: column.displayName,
                hide: column.isHidden,
                width: column.visualSizeFactor,
                sortable: !column.disableSorting,
                resizable: column.isResizable,
                autoHeaderHeight: true,
                suppressMovable: column.isDraggable === false ? true : false,
                suppressSizeToFit: column.name === CHECKBOX_COLUMN_KEY,
                suppressKeyboardEvent: (params) => this._suppressKeyboardEvent(params, column),
                cellRenderer: Cell,
                cellEditor: Cell,
                editable: (p) => this._isColumnEditable(column, p),
                headerComponent: ColumnHeader,
                onCellClicked: (event) => {
                    this._grid.dataset.fireEventListeners?.('onRecordColumnClick', event.data, column.name);
                },
                valueFormatter: (p) => {
                    if (column.name === CHECKBOX_COLUMN_KEY) {
                        return null;
                    }
                    return p.data?.getFormattedValue(column.name)
                },
                valueGetter: (p: any) => this._getValue(p, column),
                equals: (valueA, valueB) => {
                    return this._comparator.isEqual(valueA, valueB);
                },
                cellRendererParams: {
                    baseColumn: column,
                    isCellEditor: false
                },
                cellEditorParams: {
                    baseColumn: column,
                    isCellEditor: true
                },
                headerComponentParams: {
                    baseColumn: column
                },
            }
            if (agColumn.field === CHECKBOX_COLUMN_KEY) {
                agColumn.lockPosition = 'left';
                agColumn.headerComponent = GlobalCheckBox;
            }
            agColumns.push(agColumn)
        }
        return agColumns;
    }

    public refresh() {
        if (this._grid.loading) {
            return;
        }
        this._gridApi?.resetRowHeights();
        this._gridApi?.refreshCells({
            rowNodes: this._gridApi.getRenderedNodes()
        });
    }

    public setGlobalCheckBoxRenderer(renderer: () => void) {
        this._rerenderGlobalCheckBox = renderer;
    }

    public rerenderGlobalCheckBox() {
        this._rerenderGlobalCheckBox();
    }

    public updateColumnOrder(e: ColumnMovedEvent<IRecord, any>) {
        if (e.type === 'gridOptionsChanged' || !e.finished) {
            return;
        }
        const sortedIds = e.api.getState().columnOrder?.orderedColIds;
        if (!sortedIds) {
            return;
        }
        const idIndexMap = new Map<string, number>();
        sortedIds.forEach((id, index) => {
            idIndexMap.set(id, index);
        });

        const orderedColumns = [...this._grid.dataset.columns].sort((a, b) => {
            const aIndex = idIndexMap.has(a.name) ? idIndexMap.get(a.name)! : sortedIds.length;
            const bIndex = idIndexMap.has(b.name) ? idIndexMap.get(b.name)! : sortedIds.length;
            return aIndex - bIndex;
        });
        this._grid.dataset.setColumns?.(orderedColumns);
    }

    public updateColumnVisualSizeFactor(e: ColumnResizedEvent<IRecord, any>) {
        const resizedColumnKey = this._grid.dataset.columns.find(x => x.name === e.column?.getId())?.name;
        if (!resizedColumnKey) {
            return;
        }
        const columns = this._grid.dataset.columns;
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].name === resizedColumnKey) {
                columns[i].visualSizeFactor = e.column?.getActualWidth()!
            }
        }
        this._grid.dataset.setColumns?.(columns);
        this.refresh();
    }

    public toggleOverlay() {
        if (this._grid.loading) {
            this._gridApi?.showLoadingOverlay();
        }
        else {
            setTimeout(() => {
                if (this._grid.dataset.sortedRecordIds.length === 0) {
                    this._gridApi?.showNoRowsOverlay();
                }
            }, 0);
        }
    }

    public copyCellValue(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
            const cell = this._gridApi?.getFocusedCell();
            if (!cell) {
                return;
            }
            let record: IRecord | undefined;
            //aggregated record
            if (cell.rowPinned) {
                record = this._gridApi?.getPinnedBottomRow(cell.rowIndex)?.data;
            }
            else {
                record = this._gridApi?.getDisplayedRowAtIndex(cell.rowIndex)?.data as IRecord;
            }
            if (record) {
                navigator.clipboard.writeText(record.getFormattedValue(cell.column.getColId()) ?? '');
            }
        }
    }

    public getRowHeight(record?: IRecord) {
        const columnWidths: { [name: string]: number } = {};
        this._gridApi?.getAllGridColumns().map(col => {
            columnWidths[col.getColId()] = col.getActualWidth()
        })
        if (Object.keys(columnWidths).length === 0) {
            return this._grid.rowHeight;
        }
        //not defined for grouping
        return record?.getHeight(columnWidths, this._grid.rowHeight) ?? this._grid.rowHeight;
    }

    public getTotalColumnsWidth() {
        if (!this._gridApi) {
            return 0;
        }
        let width = 0;
        for (const column of this._gridApi.getAllDisplayedColumns()) {
            width = width + column.getActualWidth();
        }
        return width;
    }
    public refreshRowSelection() {
        if (!this._gridApi) {
            return;
        }
        const selectedIdsSet = new Set(this._grid.dataset.getSelectedRecordIds().map(id => id));
        this._gridApi.forEachNode(node => {
            if (selectedIdsSet.has(node.id!)) {
                node.setSelected(true);
            }
            else {
                node.setSelected(false);
            }
        })
        this._gridApi.refreshCells({
            columns: [CHECKBOX_COLUMN_KEY],
            force: true,
        })
        this._rerenderGlobalCheckBox();
    }

    public getCellFormatting(params: CellClassParams<IRecord, any>): Required<ICustomColumnFormatting> {
        //get the latest reference - ag grid might still be referencing the old one and give us wrong index
        const record = this._grid.dataset.records[params.data!.getRecordId()];
        const isEven = record?.getIndex() % 2 === 0;
        const defaultTheme = this.getDefaultCellTheme(isEven);
        const defaultBackgroundColor = defaultTheme.semanticColors.bodyBackground;
        const colId = params.colDef.colId!;

        // Handle checkbox column specifically
        if (colId === CHECKBOX_COLUMN_KEY || !params.data) {
            return {
                primaryColor: this._theme.palette.themePrimary,
                backgroundColor: defaultBackgroundColor,
                textColor: Theming.GetTextColorForBackground(defaultBackgroundColor),
                className: '',
                themeOverride: {}
            };
        }

        const customFormatting = params.data!.getColumnInfo(colId).ui.getCustomFormatting(defaultTheme) ?? {};

        // Prepare the result with defaults
        const result: Required<ICustomColumnFormatting> = {
            backgroundColor: customFormatting.backgroundColor ?? defaultBackgroundColor,
            primaryColor: customFormatting.primaryColor ?? this._theme.palette.themePrimary,
            textColor: customFormatting.textColor ?? '',
            className: customFormatting.className ?? '',
            themeOverride: customFormatting.themeOverride ?? {}
        };

        // Apply background-specific adjustments
        if (result.backgroundColor !== defaultBackgroundColor) {
            result.themeOverride = merge({}, {
                fonts: {
                    medium: {
                        fontWeight: 600
                    }
                }
            }, result.themeOverride);

            if (!customFormatting.primaryColor) {
                result.primaryColor = Theming.GetTextColorForBackground(result.backgroundColor);
            }
        }

        // Ensure text color is set
        if (!result.textColor) {
            result.textColor = Theming.GetTextColorForBackground(result.backgroundColor);
        }

        return result;
    }

    public getDefaultCellTheme(isEven: boolean): ITheme {
        if (isEven || !this._grid.isZebraEnabled) {
            return this.evenRowCellTheme;
        }
        return this.oddRowCellTheme;
    }


    public setRerenderCallback(callback: () => void) {
        this._rerenderCallback = callback;
    }

    public rerender() {
        this._rerenderCallback();
    }

    private get _gridApi() {
        return this._gridApiRef.current;
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
        if (!this._grid.parameters.EnableEditing?.raw || columnInfo?.ui.isLoading() === true) {
            return false;
        }
        //disable ag grid cell editor if oneClickEdit is enabled
        //editor control will be used in cell renderer
        if (column.oneClickEdit) {
            return false;
        }
        return columnInfo?.security.editable ?? true;
    }
    private _suppressKeyboardEvent(params: SuppressKeyboardEventParams<IRecord, any>, column: IGridColumn) {
        if (params.event.key !== 'Enter' || params.api.getEditingCells().length === 0) {
            return false;
        }
        switch (column.dataType) {
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly:
            case DataTypes.LookupOwner:
            case DataTypes.LookupCustomer:
            case DataTypes.LookupRegarding:
            case DataTypes.LookupSimple:
            case DataTypes.MultiSelectOptionSet:
            case DataTypes.OptionSet:
            case DataTypes.TwoOptions:
            case DataTypes.WholeDuration: {
                return true;
            }
        }
        return false;
    }

    private _getValue(p: any, column: IGridColumn) {
        if (column.name === CHECKBOX_COLUMN_KEY || !p.data) {
            return {
                customFormatting: this.getCellFormatting(p)
            }
        }
        let editing: boolean = false;
        const record = p.data as IRecord;
        const columnInfo = p.data!.getColumnInfo(column.name) as IColumnInfo;
        //i hate this, there is no other way to get the information if we are in edit mode or not
        if (p.api.getEditingCells() > 0 || Error().stack!.includes('startEditing')) {
            editing = true;
        }
        const customControl = this._grid.getControl(column, record, editing || !!column.oneClickEdit);
        const control = new NestedControl({
            onGetBindings: () => this._grid.getBindings(record, column, customControl),
            parentPcfContext: this._grid.pcfContext,
        });
        const parameters = columnInfo.ui.getControlParameters({
            ...control.getParameters(),
            ...this._grid.getParameters(record, column, editing),
        })
        if (column.oneClickEdit) {
            editing = true;
        }
        const isAggregatedRecord = record.getDataProvider().getSummarizationType() === 'aggregation';
        const values = {
            notifications: columnInfo.ui.getNotifications(),
            value: p.data!.getValue(column.name),
            customFormatting: this.getCellFormatting(p),
            customControl: customControl,
            height: p.node.rowHeight,
            //validations need to be disabled for aggregated records
            error: isAggregatedRecord ? false : columnInfo.error,
            loading: columnInfo.ui.isLoading(),
            errorMessage: columnInfo.errorMessage,
            editable: columnInfo.security.editable,
            editing: editing,
            parameters: parameters,
            columnAlignment: column.alignment,
            customComponent: columnInfo.ui.getCustomControlComponent()
        } as ICellValues;
        return values;
    }
} */