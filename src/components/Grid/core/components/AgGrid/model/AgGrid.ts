import { CellClassParams, ColDef, EditableCallbackParams, GridApi, IRowNode, SuppressKeyboardEventParams } from "@ag-grid-community/core";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";
import { IGridColumn } from "../../../interfaces/IGridColumn";
import { CHECKBOX_COLUMN_KEY } from "../../../../constants";
import { DataTypes, ICustomColumnFormatting, IRecord } from "@talxis/client-libraries";
import { GlobalCheckBox } from "../../ColumnHeader/components/GlobalCheckbox/GlobalCheckbox";
import { ColumnHeader } from "../../ColumnHeader/ColumnHeader";
import { Cell } from "../../Cell/Cell";
import { ITheme } from "@fluentui/react";
import { Theming } from "@talxis/react-components";
import { getEditableCell } from "../../Cell/getEditableCell";

const EditableCell = getEditableCell();

export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>;
    private _theme: ITheme;
    private _refreshGlobalCheckBox: () => void = () => {};
    public readonly oddRowCellTheme: ITheme;
    public readonly evenRowCellTheme: ITheme;

    constructor(grid: Grid, gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>, theme: ITheme) {
        super(grid);
        this._gridApiRef = gridApiRef;
        this._theme = theme;
        this.oddRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.neutralLighterAlt, this._theme.semanticColors.bodyText);
        this.evenRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.white, this._theme.semanticColors.bodyText);
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
                suppressKeyboardEvent: (params) => this._suppressKeyboardEvent(params, column),
                cellRenderer: Cell,
                cellEditor: EditableCell,
                editable: (p) => this._isColumnEditable(column, p),
                headerComponent: ColumnHeader,
                valueFormatter: (p) => {
                    if (column.name === CHECKBOX_COLUMN_KEY) {
                        return null;
                    }
                    return p.data.getFormattedValue(column.name)
                },
                valueGetter: (p) => {
                    if (column.name === CHECKBOX_COLUMN_KEY) {
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
            if (agColumn.field === CHECKBOX_COLUMN_KEY) {
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
    public refreshRowSelection(disableCellRefresh?: boolean) {
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
            newValue: true,
        });
        if(!disableCellRefresh) {
            this._gridApi.refreshCells({
                columns: [CHECKBOX_COLUMN_KEY],
                force: true,
            })
        }
        this._refreshGlobalCheckBox();
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

    public setRefreshGlobalCheckBoxCallback(callback: () => void) {
        this._refreshGlobalCheckBox = callback;
    }

    private get _gridApi() {
        return this._gridApiRef.current;
    }

    private _isColumnEditable(column: IGridColumn, params: EditableCallbackParams<IRecord, any>): boolean {
        if(column.name === CHECKBOX_COLUMN_KEY) {
            return false;
        }
        if (!this._grid.parameters.EnableEditing?.raw || params.data?.getColumnInfo(column.name).ui.isLoading() === true) {
            return false;
        }
        return params.data?.getColumnInfo(column.name).security.editable ?? true;
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
}