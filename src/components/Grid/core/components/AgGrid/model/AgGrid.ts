import { CellClassParams, ColDef, EditableCallbackParams, GridApi, IRowNode, SuppressKeyboardEventParams } from "@ag-grid-community/core";
import { Grid } from "../../../model/Grid";
import { GridDependency } from "../../../model/GridDependency";
import { IGridColumn } from "../../../interfaces/IGridColumn";
import { CHECKBOX_COLUMN_KEY } from "../../../../constants";
import { DataType, DataTypes, IColumn, IColumnInfo, ICustomColumnControl, ICustomColumnFormatting, IRecord, Sanitizer } from "@talxis/client-libraries";
import { GlobalCheckBox } from "../../ColumnHeader/components/GlobalCheckbox/GlobalCheckbox";
import { ColumnHeader } from "../../ColumnHeader/ColumnHeader";
import { Cell } from "../../Cell/Cell";
import { IComboBoxStyles, IDatePickerStyles, ITextFieldStyles, ITheme } from "@fluentui/react";
import { Theming } from "@talxis/react-components";
import { getEditableCell } from "../../Cell/getEditableCell";
import { Comparator, IValues } from "./Comparator";
import { IBinding, NestedControl } from "../../../../../NestedControlRenderer/NestedControl";
import { BaseControls, ControlTheme, IFluentDesignState } from "../../../../../../utils";
import { merge } from "merge-anything";

const EditableCell = getEditableCell();

export class AgGrid extends GridDependency {
    private _gridApiRef: React.MutableRefObject<GridApi<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> | undefined>;
    private _theme: ITheme;
    private _refreshGlobalCheckBox: () => void = () => { };
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
                cellEditor: EditableCell,
                editable: (p) => this._isColumnEditable(column, p),
                headerComponent: ColumnHeader,
                valueFormatter: (p) => {
                    if (column.name === CHECKBOX_COLUMN_KEY) {
                        return null;
                    }
                    return p.data.getFormattedValue(column.name)
                },
                valueGetter: (p: any) => {
                    if (column.name === CHECKBOX_COLUMN_KEY) {
                        return {
                            customFormatting: this.getCellFormatting(p)
                        }
                    }
                    const record = p.data as IRecord;
                    const columnInfo = p.data!.getColumnInfo(column.name) as IColumnInfo;
                    const node = p.node;
                    const values = {
                        notifications: columnInfo.ui.getNotifications(),
                        value: p.data!.getValue(column.name),
                        customFormatting: this.getCellFormatting(p),
                        customControls: columnInfo.ui.getCustomControls(),
                        height: columnInfo.ui.getHeight(p.column.getActualWidth(), this._grid.rowHeight),
                        //controlParameters: columnInfo.ui.getControlParameters(),
                        error: columnInfo.error,
                        loading: columnInfo.ui.isLoading(),
                        errorMessage: columnInfo.errorMessage
                    } as IValues;

                    const control = new NestedControl({
                        onGetBindings: () => this._getBindings(values as any, p.data, column),
                        onGetControlName: () => this._getControl(false, column, values).name,
                        parentPcfContext: this._grid.pcfContext,
                        overrides: {
                            onGetProps: (controlProps) => {
                                const parameters = this._getParameters(record, column, false);
                                return {
                                    ...controlProps,
                                    context: {
                                        ...controlProps.context,
                                        mode: Object.create(controlProps.context.mode, {
                                            allocatedHeight: {
                                                value: (node.rowHeight ?? this._grid.rowHeight) - 1
                                            },

                                        }),
                                        parameters: {
                                            ...controlProps.parameters,
                                            ...parameters
                                        },
                                        fluentDesignLanguage: this._getFluentDesignLanguage(column, values, controlProps.context.fluentDesignLanguage)
                                    },
                                    parameters: record.getColumnInfo(column.name).ui.getControlParameters({
                                        ...controlProps.parameters,
                                        ...parameters
                                    })
                                }
                            }
                        }
                    });
                    console.log(control.getProps());
                    return values;
                },
                equals: (valueA, valueB) => {
                    return this._comparator.isEqual(valueA, valueB);
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
        if (!disableCellRefresh) {
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

    public rerender() {
        this._rerenderCallback();
    }

    public setRefreshGlobalCheckBoxCallback(callback: () => void) {
        this._refreshGlobalCheckBox = callback;
    }

    public setRerenderCallback(callback: () => void) {
        this._rerenderCallback = callback;
    }

    private get _gridApi() {
        return this._gridApiRef.current;
    }

    private _isColumnEditable(column: IGridColumn, params: EditableCallbackParams<IRecord, any>): boolean {
        if (column.name === CHECKBOX_COLUMN_KEY) {
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

    private _getBindings(values: IValues, record: IRecord, column: IColumn) {
        const bindings: { [name: string]: IBinding } = {
            'value': {
                isStatic: false,
                type: column.dataType as any,
                value: this._getBindingValue(values, column),
                error: values.error,
                errorMessage: values.errorMessage,
                onNotifyOutputChanged: (value) => {
                    /* record.setValue(column.name, value);
                    setTimeout(() => {
                        if(mountedRef.current) {
                            rerender();
                        }
                        //allow cell renderer to update the grid
                        if(!props.editing) {
                            grid.pcfContext.factory.requestRender();
                        }
                    }, 0) */
                },
                metadata: {
                    onOverrideMetadata: () => column.metadata
                }
            }
        }
        const control = this._getControl(false, column, values)
        if (control?.bindings) {
            Object.entries(control.bindings).map(([name, binding]) => {
                bindings[name] = {
                    isStatic: true,
                    type: binding.type!,
                    value: binding.value
                }
            })
        }
        return bindings;
    }

    private _getControl(editing: boolean, column: IColumn, values: IValues) {
        const appliesToValue = editing ? 'editor' : 'renderer';
        const customControl = values.customControls.find(
            control => control.appliesTo === 'both' || control.appliesTo === appliesToValue
        );
        if (customControl) {
            return customControl;
        }
        const defaultControl: Partial<ICustomColumnControl> = {
            name: editing ? BaseControls.GetControlNameForDataType(column.dataType as DataType) : 'GridCellRenderer',
            appliesTo: 'both',
        };

        return defaultControl as ICustomColumnControl;
    }

    private _getBindingValue(values: IValues, column: IColumn) {
        let value = values.value;
        switch (column.dataType) {
            //getValue always returns string for TwoOptions
            case 'TwoOptions': {
                value = value == '1' ? true : false
                break;
            }
            //getValue always returns string for OptionSet
            case 'OptionSet': {
                value = value ? parseInt(value) : null;
                break;
            }
            case 'MultiSelectPicklist': {
                value = value ? value.split(',').map((x: string) => parseInt(x)) : null;
                break;
            }
            case 'Lookup.Simple':
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding': {
                //our implementation returns array, Power Apps returns object
                if (value && !Array.isArray(value)) {
                    value = [value];
                }
                value = value?.map((x: ComponentFramework.EntityReference) => Sanitizer.Lookup.getLookupValue(x))
                break;
            }
        }
        return value;
    }

    private _getParameters(record: IRecord, column: IColumn, editing: boolean) {
        const parameters: any = {
            Dataset: this._grid.dataset
        }
        parameters.Record = record;
        parameters.Column = column

        parameters.EnableNavigation = {
            raw: this._grid.isNavigationEnabled
        }
        parameters.ColumnAlignment = {
            raw: this._getColumnAlignment(column)
        }
        parameters.IsPrimaryColumn = {
            raw: column.isPrimary
        }
        parameters.ShowErrorMessage = {
            raw: false
        }
        parameters.CellType = {
            raw: editing ? 'editor' : 'renderer'
        }
        if (editing) {
            parameters.AutoFocus = {
                raw: true
            }
        }
        switch (column.dataType) {
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding':
            case 'Lookup.Simple': {
                parameters.IsInlineNewEnabled = {
                    raw: false
                }
                break;
            }
            case 'SingleLine.Email':
            case 'SingleLine.Phone':
            case 'SingleLine.URL': {
                parameters.EnableTypeSuffix = {
                    raw: false
                }
                break;
            }
            case 'OptionSet':
            case 'TwoOptions':
            case 'MultiSelectPicklist': {
                parameters.EnableOptionSetColors = {
                    raw: this._grid.enableOptionSetColors
                }
                break;
            }
        }
        return parameters;
    }

    private _getFluentDesignLanguage(column: IColumn, values: IValues, fluentDesignLanguage?: IFluentDesignState) {
        const formatting = values.customFormatting;
        const theme = Theming.GenerateThemeV8(formatting.primaryColor, formatting.backgroundColor, formatting.textColor, formatting.themeOverride)
        const mergedOverrides = merge(fluentDesignLanguage?.v8FluentOverrides ?? {}, formatting.themeOverride);
        const columnAlignment = this._getColumnAlignment(column);
        const result = ControlTheme.GenerateFluentDesignLanguage(theme.palette.themePrimary, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText, {
            v8FluentOverrides: merge(
                {
                    semanticColors: {
                        inputBorder: 'transparent',
                        inputBorderHovered: 'transparent',
                        inputBackground: theme.semanticColors.bodyBackground,
                        focusBorder: 'transparent',
                        disabledBorder: 'transparent',
                        inputFocusBorderAlt: 'transparent',
                        errorText: 'transparent'

                    },
                    effects: {
                        underlined: false
                    },
                    components: {
                        'TextField': {
                            styles: () => {
                                return {
                                    field: {
                                        textAlign: columnAlignment
                                    }
                                } as ITextFieldStyles
                            }
                        },
                        'ComboBox': {
                            styles: () => {
                                return {
                                    input: {
                                        textAlign: columnAlignment === 'right' ? 'right' : undefined,
                                        paddingRight: columnAlignment === 'right' ? 8 : undefined,
                                    }
                                } as IComboBoxStyles
                            }
                        },
                        'DatePicker': {
                            styles: () => {
                                return {
                                    root: {
                                        '.ms-TextField-field': {
                                            paddingRight: columnAlignment === 'right' ? 8 : undefined,
                                            textAlign: columnAlignment === 'right' ? 'right' : 'left'
                                        }
                                    } as any
                                } as IDatePickerStyles
                            }
                        }
                    }
                },
                mergedOverrides
            ),
            applicationTheme: fluentDesignLanguage?.applicationTheme
        })
        return result;
    }

    private _getColumnAlignment(column: IColumn) {
        if (column.alignment) {
            return column.alignment;
        }
        switch (column.dataType) {
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.Currency: {
                return 'right';
            }
        }
        return 'left';
    }
}