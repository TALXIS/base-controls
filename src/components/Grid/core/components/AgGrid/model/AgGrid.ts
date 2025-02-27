import { CellClassParams, ColDef, ColumnMovedEvent, ColumnResizedEvent, EditableCallbackParams, GridApi, IRowNode, RowNode, SuppressKeyboardEventParams } from "@ag-grid-community/core";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";
import { IGridColumn } from "../../../interfaces/IGridColumn";
import { CHECKBOX_COLUMN_KEY } from "../../../../constants";
import { DataTypes, IAddControlNotificationOptions, IColumn, IColumnInfo, IControlParameters, ICustomColumnComponent, ICustomColumnControl, ICustomColumnFormatting, IRecord, Sanitizer } from "@talxis/client-libraries";
import { GlobalCheckBox } from "../../ColumnHeader/components/GlobalCheckbox/GlobalCheckbox";
import { ColumnHeader } from "../../ColumnHeader/ColumnHeader";
import { Cell } from "../../Cell/Cell";
import { ITheme } from "@fluentui/react";
import { Theming } from "@talxis/react-components";
import { Comparator } from "./Comparator";
import { NestedControl } from "../../../../../NestedControlRenderer/NestedControl";

export interface ICellValues {
    notifications: IAddControlNotificationOptions[];
    customFormatting: Required<ICustomColumnFormatting>;
    customControl: ICustomColumnControl;
    customComponent: ICustomColumnComponent;
    loading: boolean;
    value: any;
    error: boolean;
    height: number;
    errorMessage: string;
    parameters: IControlParameters;
    columnAlignment: Required<IColumn['alignment']>
    editing: boolean;
    editable: boolean;
    disabled: boolean;
}

export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>;
    private _theme: ITheme;
    private _rerenderCallback: () => void = () => { };
    private _comparator: Comparator = new Comparator();
    public readonly oddRowCellTheme: ITheme;
    public readonly evenRowCellTheme: ITheme;

    constructor(grid: Grid, gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>, theme: ITheme) {
        super(grid);
        this._gridApiRef = gridApiRef;
        this._theme = theme;
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
                initialWidth: column.visualSizeFactor,
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
                valueFormatter: (p) => {
                    if (column.name === CHECKBOX_COLUMN_KEY) {
                        return null;
                    }
                    return p.data.getFormattedValue(column.name)
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
                agColumn.headerComponentParams = () => {
                    return {
                        checkboxState: this._getGlobalCheckBoxState()
                    }
                }
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
            return;
        }
        this._gridApi?.hideOverlay();
        setTimeout(() => {
            if (this._grid.records.length === 0) {
                this._gridApi?.showNoRowsOverlay();
            }
        })
        if (this._grid.records.length > 0) {
            this._gridApi?.ensureIndexVisible(0)
        }
    }

    public copyCellValue(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
            const cell = this._gridApi?.getFocusedCell();
            if (!cell) {
                return;
            }
            const row = this._gridApi?.getDisplayedRowAtIndex(cell.rowIndex);
            const formattedValue = this._gridApi?.getCellValue({
                rowNode: row!,
                colKey: cell.column.getColId(),
                useFormatter: true
            })
            navigator.clipboard.writeText(formattedValue ?? "");
        }
    }

    public getRowHeight(record: IRecord) {
        const columnWidths: { [name: string]: number } = {};
        this._gridApi?.getAllGridColumns().map(col => {
            columnWidths[col.getColId()] = col.getActualWidth()
        })
        return record.getHeight(columnWidths, this._grid.rowHeight) ?? this._grid.rowHeight;
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
        const nodesToSelect: IRowNode[] = [];
        const nodesToDeselect: IRowNode[] = [];
        this._gridApi.forEachNode((node: IRowNode) => {
            if (this._grid.dataset.getSelectedRecordIds().includes(node.data.getRecordId())) {
                nodesToSelect.push(node);
            }
            else {
                nodesToDeselect.push(node);
            }
        });
        this._gridApi.setNodesSelected({
            nodes: nodesToSelect,
            newValue: true,
        });
        this._gridApi.setNodesSelected({
            nodes: nodesToDeselect,
            newValue: false
        })
        this._gridApi.refreshCells({
            columns: [CHECKBOX_COLUMN_KEY],
            force: true,
        })
        this._gridApi.refreshHeader()
    }

    public getCellFormatting(params: CellClassParams<IRecord, any>): Required<ICustomColumnFormatting> {
        const isEven = params.node!.rowIndex! % 2 === 0;
        //set colors for even/odd
        const defaultBackgroundColor = isEven ? this.evenRowCellTheme.semanticColors.bodyBackground : this.oddRowCellTheme.semanticColors.bodyBackground;
        switch (params.colDef.colId) {
            case CHECKBOX_COLUMN_KEY: {
                return {
                    primaryColor: this._theme.palette.themePrimary,
                    backgroundColor: defaultBackgroundColor,
                    textColor: Theming.GetTextColorForBackground(defaultBackgroundColor),
                    className: '',
                    themeOverride: {}
                }
            }
            default: {

            }
        }
        switch (params.colDef.colId) {
            default: {
                const formatting = params.data!.getColumnInfo(params.colDef.colId!).ui.getCustomFormatting(isEven ? this.evenRowCellTheme : this.oddRowCellTheme) ?? {}
                if (!formatting.backgroundColor) {
                    formatting.backgroundColor = defaultBackgroundColor;
                }
                if (!formatting.primaryColor) {
                    formatting.primaryColor = this._theme.palette.themePrimary;
                }
                if (!formatting.textColor) {
                    formatting.textColor = Theming.GetTextColorForBackground(formatting.backgroundColor);
                }
                if (!formatting.className) {
                    formatting.className = '';
                }
                if (!formatting.themeOverride) {
                    formatting.themeOverride = {};
                }
                return formatting as Required<ICustomColumnFormatting>;
            }
        }
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
        const columnInfo = params.data?.getColumnInfo(column.name);
        if (column.name === CHECKBOX_COLUMN_KEY) {
            return false;
        }
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

    private _getGlobalCheckBoxState(): 'unchecked' | 'checked' | 'intermediate' {
        if (this._grid.selection.allRecordsSelected) {
            return 'checked';
        }
        if (this._grid.dataset.getSelectedRecordIds().length > 0) {
            return 'intermediate';
        }
        return 'unchecked';
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
            if (column.name === CHECKBOX_COLUMN_KEY) {
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
            const values = {
                notifications: columnInfo.ui.getNotifications(),
                value: p.data!.getValue(column.name),
                customFormatting: this.getCellFormatting(p),
                customControl: customControl,
                height: columnInfo.ui.getHeight(p.api.getColumn(column.name).getActualWidth(), this._grid.rowHeight),
                error: columnInfo.error,
                loading: columnInfo.ui.isLoading(),
                errorMessage: columnInfo.errorMessage,
                editable: columnInfo.security.editable,
                editing: editing,
                parameters: parameters,
                columnAlignment: this._grid.getColumnAlignment(column),
                customComponent: columnInfo.ui.getCustomControlComponent()
            } as ICellValues;
            return values;
        }
}