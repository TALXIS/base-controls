import { ColDef, EditableCallbackParams, GridApi, IRowNode } from "@ag-grid-community/core";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";
import { DataType } from "../../../enums/DataType";
import { IGridColumn } from "../../../interfaces/IGridColumn";
import { CHECKBOX_COLUMN_KEY } from "../../../../constants";
import { IRecord } from "@talxis/client-libraries";

export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>;

    constructor(grid: Grid, gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>) {
        super(grid);
        this._gridApiRef = gridApiRef;
    }
    public get columns() {
        const agColumns: ColDef[] = [];
        for (const column of this._grid.columns) {
            const agColumn: ColDef = {
                colId: column.name,
                field: column.name,
                headerName: column.displayName,
                hide: column.isHidden,
                initialWidth: column.visualSizeFactor,
                sortable: !column.disableSorting,
                editable: (p) => this._isColumnEditable(column, p), 
                resizable: column.isResizable,
                autoHeaderHeight: true,
                suppressSizeToFit: column.name === CHECKBOX_COLUMN_KEY,
                cellClass: this._getCellClassName(column),
                valueFormatter: (p) => {
                    if(column.name === CHECKBOX_COLUMN_KEY) {
                        return null;
                    }
                    return p.data.getFormattedValue(column.name)
                },
                valueGetter: (p) => {
                    if(column.name === CHECKBOX_COLUMN_KEY) {
                        return null;
                    }
                    return p.data.getValue(column.name)
                },
                cellRendererParams: {
                    baseColumn: column
                },
                cellEditorParams: {
                    baseColumn: column,
                },
                headerComponentParams: {
                    baseColumn: column
                },
                suppressKeyboardEvent: (params) => {
                    if (params.event.key !== 'Enter' || params.api.getEditingCells().length === 0) {
                        return false;
                    }
                    switch (column.dataType) {
                        case DataType.DATE_AND_TIME_DATE_AND_TIME:
                        case DataType.DATE_AND_TIME_DATE_ONLY:
                        case DataType.LOOKUP_OWNER:
                        case DataType.LOOKUP_SIMPLE:
                        case DataType.LOOKUP_CUSTOMER:
                        case DataType.MULTI_SELECT_OPTIONSET:
                        case DataType.OPTIONSET:
                        case DataType.TWO_OPTIONS:
                        case DataType.WHOLE_DURATION: {
                            return true;
                        }
                    }
                    return false;
                },
            }
            agColumns.push(agColumn)
        }
        return agColumns;
    }
    public getTotalColumnsWidth() {
        if (!this._gridApi) {
            return 0;
        }
        let width = 0;
        for (const column of this._gridApi.getAllGridColumns()) {
            width = width + column.getActualWidth();
        }
        return width;
    }
    public selectRows() {
        if (!this._gridApi) {
            return;
        }
        const nodesToSelect: IRowNode[] = [];
        this._gridApi.deselectAll();
        this._gridApi.forEachNode((node: IRowNode) => {
            if (this._grid.dataset.getSelectedRecordIds().includes(node.data.getRecordId())) {
                nodesToSelect.push(node);
            }
        });
        this._gridApi.setNodesSelected({
            nodes: nodesToSelect,
            newValue: true
        });
        this._gridApi.refreshCells({
            columns: [CHECKBOX_COLUMN_KEY],
            force: true
        })
    }
    private get _gridApi() {
        return this._gridApiRef.current;
    }
    private _getCellClassName(column: IGridColumn) {
        switch (column.dataType) {
            case DataType.CURRENCY:
            case DataType.DECIMAL:
            case DataType.WHOLE_NONE: {
                return 'talxis-cell-align-right';
            }
        }
        return 'talxis-cell-align-left';
    }

    private _isColumnEditable(column: IGridColumn, params: EditableCallbackParams<IRecord, any>): boolean {
        if (!this._grid.parameters.EnableEditing?.raw || params.data?.isLoading?.(column.name) === true) {
            return false;
        }
        return params.data?.getColumnInfo(column.name).security.editable ?? true;
    }
}