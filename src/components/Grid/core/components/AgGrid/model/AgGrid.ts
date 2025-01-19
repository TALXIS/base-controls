import { CellClassParams, CellDoubleClickedEvent, CellStyle, ColDef, EditableCallbackParams, GridApi, IRowNode } from "@ag-grid-community/core";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";
import { DataType } from "../../../enums/DataType";
import { IGridColumn } from "../../../interfaces/IGridColumn";
import { CHECKBOX_COLUMN_KEY } from "../../../../constants";
import { ICustomColumnFormatting, IRecord } from "@talxis/client-libraries";
import { GlobalCheckBox } from "../../ColumnHeader/components/GlobalCheckbox/GlobalCheckbox";
import { ColumnHeader } from "../../ColumnHeader/ColumnHeader";
import { Cell } from "../../Cell/Cell";
import { ITheme} from "@fluentui/react";
import { Theming } from "@talxis/react-components";
import { getEditableCell } from "../../Cell/getEditableCell";

const EditableCell = getEditableCell();

export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>;
    private _theme: ITheme

    constructor(grid: Grid, gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>, theme: ITheme) {
        super(grid);
        this._gridApiRef = gridApiRef;
        this._theme = theme;
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
                resizable: column.isResizable,
                autoHeaderHeight: true,
                suppressMovable: column.isDraggable === false ? true : false,
                suppressSizeToFit: column.name === CHECKBOX_COLUMN_KEY,
                cellStyle: (params) => this._getCellStyles(params),
                cellRenderer: Cell,
                cellEditor: EditableCell,
                editable: (p) => this._isColumnEditable(column, p), 
                //onCellDoubleClicked: (e) => this._onCellDoubleClicked(column, e),
                headerComponent: ColumnHeader,
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
                }
            }
            if(agColumn.field === CHECKBOX_COLUMN_KEY) {
                agColumn.lockPosition = 'left';
                agColumn.headerComponent = GlobalCheckBox
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
        for (const column of this._gridApi.getAllDisplayedColumns()) {
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
    public getCellFormatting(params: CellClassParams<IRecord, any>): Required<ICustomColumnFormatting> {
        const formatting = params.data?.getColumnInfo(params.colDef.colId!).customFormatting ?? {};
        const isEven = params.node!.rowIndex! % 2 === 0;
        const defaultBackgroundColor = isEven ? this._theme.palette.white : this._theme.palette.neutralLighterAlt;
        if(!formatting.backgroundColor) {
            //set colors for even/odd
            formatting.backgroundColor = defaultBackgroundColor;
        }
        if(!formatting.primaryColor) {
            formatting.primaryColor = this._theme.palette.themePrimary;
        }
        if(!formatting.textColor) {
            formatting.textColor = Theming.GetTextColorForBackground(formatting.backgroundColor);
        }
        if(!formatting.className) {
            formatting.className = '';
        }
        if(!formatting.themeOverride) {
            formatting.themeOverride = {};
        }
        return formatting as any;
    }

    private get _gridApi() {
        return this._gridApiRef.current;
    }

    private _getCellStyles(params: CellClassParams<IRecord, any>): CellStyle {
        const color = this.getCellFormatting(params).backgroundColor;
        return {
            backgroundColor: color
        }
    }


    private _isColumnEditable(column: IGridColumn, params: EditableCallbackParams<IRecord, any>): boolean {
        if (!this._grid.parameters.EnableEditing?.raw || params.data?.ui.isLoading?.(column.name) === true) {
            return false;
        }
        return params.data?.getColumnInfo(column.name).security.editable ?? true;
    }
}