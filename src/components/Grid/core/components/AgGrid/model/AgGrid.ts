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

export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>;
    private _currentlyEditingCellId: string = '';
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
                onCellDoubleClicked: (e) => this._onCellDoubleClicked(column, e),
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
    public isCellBeingEdited(node: IRowNode<IRecord>, columnName: string) {
        return `${node.id}_${columnName}` === this._currentlyEditingCellId;
    }
    
    public stopEditing() {
        this._currentlyEditingCellId = '';
        //TODO: optimize
        this._gridApi?.refreshCells({
            force: true
        })
    }

    public getCellFormatting(params: CellClassParams<IRecord, any>): Required<ICustomColumnFormatting> {
        const formatting = params.data?.ui.getCustomFormatting('text') ?? {};
        if(!formatting.backgroundColor) {
            //set colors for even/odd
            formatting.backgroundColor = params.node!.rowIndex! % 2 === 0 ? this._theme.palette.white : this._theme.palette.neutralLighter;
        }
        if(!formatting.primaryColor) {
            formatting.primaryColor = this._theme.palette.themePrimary;
        }
        if(!formatting.textColor) {
            formatting.textColor = Theming.GetTextColorForBackground(formatting.backgroundColor);
        }
        return formatting as any;
    }

    private get _gridApi() {
        return this._gridApiRef.current;
    }

    private _getCellStyles(params: CellClassParams<IRecord, any>): CellStyle {
        return {
            backgroundColor: this.getCellFormatting(params).backgroundColor
        }
    }


    private _isColumnEditable(column: IGridColumn, record: IRecord): boolean {
        if (!this._grid.parameters.EnableEditing?.raw || record?.ui.isLoading?.(column.name) === true) {
            return false;
        }
        return record?.getColumnInfo(column.name).security.editable ?? true;
    }
    
    private _onCellDoubleClicked(column: IGridColumn, event: CellDoubleClickedEvent<any, any>) {
        if(this._isColumnEditable(column, event.data)) {
            this._currentlyEditingCellId = `${event.node.id}_${column.name}`;
            this._gridApi?.refreshCells({
                force: true
            })
        }
    }
}