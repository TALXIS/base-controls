import { ColDef, GridApi, IRowNode } from "@ag-grid-community/core";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";
import { DataType } from "../../../enums/DataType";
import { IGridColumn } from "../../../interfaces/IGridColumn";

export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>

    constructor(grid: Grid, gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>) {
        super(grid);
        this._gridApiRef = gridApiRef;
    }
    public get columns() {
        const agColumns: ColDef[] = [];
        for (const column of this._grid.columns) {
            const agColumn: ColDef = {
                colId: column.key,
                field: column.key,
                headerName: column.displayName,
                initialWidth: column.width,
                sortable: column.isSortable,
                editable: column.isEditable,
                resizable: column.isResizable,
                suppressMovable: this._grid.props.parameters.ChangeEditorMode ? true : undefined,
                autoHeaderHeight: true,
                suppressSizeToFit: column.key === '__checkbox',
                cellClass: this._getCellClassName(column),
                valueFormatter: (p) => {
                    return p.data.getFormattedValue(column.key)
                },
                valueGetter: (p) => {
                    return p.data.getValue(column.key)
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
                        case DataType.MULTI_SELECT_OPTIONSET:
                        case DataType.OPTIONSET:
                        case DataType.TWO_OPTIONS:
                        case DataType.WHOLE_DURATION: {
                            return true;
                        }
                    }
                    return false;
                }
            }
            agColumns.push(agColumn)
        }
        return agColumns;
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
            columns: ['__checkbox'],
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
}