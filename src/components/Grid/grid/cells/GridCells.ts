import { CellDoubleClickedEvent, GridApi, ValueFormatterParams, ValueGetterParams } from "@ag-grid-community/core";
import { DataProvider, DataType, DataTypes, IColumn, ICustomColumnControl, ICustomColumnFormatting, IDataProvider, IRecord, Sanitizer } from "@talxis/client-libraries";
import { merge } from "merge-anything";
import { BaseControls, HookRegistry } from "@utils";
import { IBinding } from "@components/NestedControlRenderer/interfaces";
import { NestedControl } from "@components/NestedControlRenderer/NestedControl";
import { IGridColumn } from "../columns/interfaces";
import { ICellValues } from "./interfaces";
import { IGridServiceLocator } from "../../services";

/**
 * A hook over the values a cell reads.
 *
 * Mutates rather than returning: the bag is on its way to the cell, and a module adds what it knows —
 * an aggregated value, say — without the grid having to know the feature exists.
 */
export type GridCellValuesHook = (values: ICellValues, params: { record: IRecord; column: IColumn }) => void;

export interface IGridCellsParameters {
    services: IGridServiceLocator;
}

/**
 * What a cell shows.
 *
 * Everything a cell needs is worked out here and handed over as one bag, because AG Grid asks for it per
 * cell per value read: the control it renders with, the value, the formatting, whether it may be edited.
 * A module adds to that bag through a hook rather than the grid knowing what it wants.
 */
export class GridCells {
    private _services: IGridServiceLocator;
    private _hooks = new HookRegistry<GridCellValuesHook>();

    constructor(parameters: IGridCellsParameters) {
        this._services = parameters.services;
    }

    /**
     * Registers a hook over a cell's values. Runs per cell per value read, so keep it cheap.
     *
     * @param priority Ascending: a lower number runs earlier, so a higher one gets the later word.
     */
    public registerCellValuesHook(hook: GridCellValuesHook, priority?: number): void {
        this._hooks.register(hook, priority);
    }

    /** What a cell reads, for the column it is in. */
    public getValues(params: ValueGetterParams<IRecord>, column: IGridColumn): ICellValues | undefined {
        return this._valueGetter(params, column);
    }

    /** What a cell shows when it is not rendering a control of its own. */
    public getFormattedValue(params: ValueFormatterParams<IRecord>): string {
        return this._valueFormatter(params);
    }

    /**
     * What a cell renderer or editor is given.
     *
     * The control and its parameters are worked out here rather than in the value getter, because
     * `isCellEditor` is AG Grid's own answer and only the params it hands over carry it. One value getter
     * serves both the renderer and the editor and so cannot know which of them it is answering.
     */
    public getCellParameters(record: IRecord, column: IGridColumn, isCellEditor: boolean) {
        //a row with no record of its own is a placeholder, and there is no control to configure for it
        if (!record) {
            return { baseColumn: column, record: record, isCellEditor: isCellEditor };
        }
        const customControl = this.getControl(column, record, isCellEditor || !!column.oneClickEdit);
        return {
            baseColumn: column,
            record: record,
            isCellEditor: isCellEditor,
            customControl: customControl,
            parameters: this._getControlParameters(record, column, customControl, isCellEditor),
        };
    }

    /** Whether a column takes a cell editor at all, for this record. */
    public isCellEditorEnabled(column: IGridColumn, record: IRecord): boolean {
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

    /** Whether the grid keeps a keystroke to itself rather than letting AG Grid navigate with it. */
    public suppressKeyboardEvent(column: IGridColumn): boolean {
        return !!column.oneClickEdit;
    }

    public onNotifyOutputChanged(record: IRecord, columnName: string, value: any, parameters: any) {
        record.setValue(columnName, value);
        //AG Grid asks a cell for its values *before* the control reports a new one, so everything it
        //cached - the value and the validation result derived from it - describes the value that has just
        //been replaced. Recompute the row now that the record holds the new one, otherwise the cell keeps
        //showing state for the old value: a validation error stayed invisible until the next edit.
        this._withGridApi(gridApi => {
            const node = gridApi.getRowNode(record.getRecordId());
            //no node means the row is not rendered, and it reads current values whenever it is
            if (node) {
                gridApi.refreshCells({ rowNodes: [node] });
            }
        });
        if (this._settings.isAutoSaveEnabled()) {
            record.save();
        }
        const { ShouldUnmountWhenOutputChanges } = parameters;
        if (ShouldUnmountWhenOutputChanges?.raw) {
            this._withGridApi(gridApi => gridApi.stopEditing());
        }
    }

    public getControl(column: IColumn, record: IRecord, editing: boolean): Required<ICustomColumnControl> {
        editing = record.getSummarizationType() === 'aggregation' ? false : editing;
        //file and image currently do not support editor, always force cell renderers
        switch (column.dataType) {
            case 'File':
            case 'Image': {
                return {
                    name: 'GridCellRenderer',
                    appliesTo: 'both',
                    bindings: {}
                }
            }
        }
        const defaultControl: Required<ICustomColumnControl> = {
            name: (() => {
                if (record.getSummarizationType() === 'aggregation') {
                    return 'GridCellRenderer';
                }
                if (column.name === DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME) {
                    return BaseControls.GridInlineRibbon;
                }
                if (editing) {
                    return BaseControls.GetControlNameForDataType(column.dataType as DataType)
                }
                return 'GridCellRenderer';
            })(),
            appliesTo: 'both',
            bindings: {}
        };
        const customControls = record.getColumnInfo(column.name).ui.getCustomControls([defaultControl]);
        const appliesToValue = editing ? 'editor' : 'renderer';
        const customControl = customControls.find(
            control => control.appliesTo === 'both' || control.appliesTo === appliesToValue
        );
        if (customControl) {
            return merge(defaultControl, customControl) as Required<ICustomColumnControl>;
        }

        return defaultControl;
    }

    public getBindings(record: IRecord, column: IColumn, control: ICustomColumnControl) {
        const columnInfo = record.getColumnInfo(column.name);
        const bindings: { [name: string]: IBinding } = {
            'value': {
                isStatic: false,
                type: column.dataType as any,
                value: this._getControlValue(record, column),
                formattedValue: this.getRecordFormattedValue(record, column).value,
                error: columnInfo.error,
                errorMessage: columnInfo.errorMessage,
                onNotifyOutputChanged: () => { },
                metadata: {
                    onOverrideMetadata: () => column.metadata
                }
            },
            'IsCellCustomizer': {
                isStatic: true,
                type: DataTypes.TwoOptions,
                value: true
            }
        }
        if (control.bindings) {
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

    public getFieldBindingParameters(record: IRecord, column: IColumn, editing: boolean) {
        //make sure we have IColumn, not IGridColumn
        column = record.getDataProvider().getColumnsMap()[column.name]!;
        const summarizationType = record.getDataProvider().getSummarizationType();
        const value = this.getRecordValue(record, column);
        const formattedValue = this.getRecordFormattedValue(record, column);
        const aggregationColumn = record.getDataProvider().getColumnsMap()[column.aggregation?.alias!];
        const parameters: any = {
            Dataset: {
                raw: this._provider,
                type: DataTypes.Object
            },
            Record: {
                raw: record,
                type: DataTypes.Object
            },
            Column: {
                raw: column,
                type: DataTypes.Object
            }
        }
        parameters.AggregatedValue = {
            raw: value.aggregatedValue,
            formatted: formattedValue.aggregatedValue,
            type: aggregationColumn?.dataType ?? DataTypes.Decimal
        }
        parameters.EnableNavigation = {
            raw: (() => {
                if (!this._settings.isNavigationEnabled()) {
                    return false;
                }
                if (summarizationType === 'aggregation') {
                    return false;
                }
                else if (summarizationType === 'grouping') {
                    switch (column.dataType) {
                        case DataTypes.LookupCustomer:
                        case DataTypes.LookupRegarding:
                        case DataTypes.LookupOwner:
                        case DataTypes.LookupSimple:
                        case DataTypes.File:
                        case DataTypes.Image:
                        case DataTypes.SingleLineEmail:
                        case DataTypes.SingleLineUrl:
                        case DataTypes.SingleLinePhone: {
                            return true;
                        }
                        default: {
                            return false;
                        }
                    }
                }
                else {
                    return true;
                }
            })(),
            type: DataTypes.TwoOptions
        }
        parameters.ColumnAlignment = {
            raw: column.alignment,
            type: DataTypes.SingleLineText
        }
        parameters.IsPrimaryColumn = {
            raw: column.isPrimary,
            type: DataTypes.TwoOptions
        }
        parameters.ShowErrorMessage = {
            raw: false,
            type: DataTypes.TwoOptions
        }
        parameters.CellType = {
            raw: editing ? 'editor' : 'renderer',
            type: DataTypes.SingleLineText
        }
        parameters.AutoFocus = {
            raw: editing,
            type: DataTypes.TwoOptions
        }
        parameters.AggregationFunction = {
            raw: summarizationType === 'aggregation' ? aggregationColumn?.aggregation?.aggregationFunction : null,
            type: DataTypes.SingleLineText
        }
        parameters.PrefixIcon = {
            raw: null,
            type: DataTypes.SingleLineText
        }
        parameters.SuffixIcon = {
            raw: null,
            type: DataTypes.SingleLineText
        }
        parameters.IsInlineNewEnabled = {
            raw: false,
            type: DataTypes.TwoOptions
        }
        parameters.EnableTypeSuffix = {
            raw: false,
            type: DataTypes.TwoOptions
        }
        parameters.EnableOptionSetColors = {
            raw: this._settings.areOptionSetColorsEnabled(),
            type: DataTypes.TwoOptions
        }
        parameters.CommandButtonIds = {
            raw: this._settings.getInlineRibbonButtonIds(),
            type: DataTypes.SingleLineText
        }
        parameters.ShouldUnmountWhenOutputChanges = {
            raw: (() => {
                //by default, leave cell editor opened for these types since
                // they can output partial changes as values
                switch (column.dataType) {
                    case 'DateAndTime.DateAndTime':
                    case 'MultiSelectPicklist': {
                        return false;
                    }
                    default: {
                        return true;
                    }
                }
            })(),
            type: DataTypes.TwoOptions
        }
        return parameters;
    }

    public getFieldFormatting(record: IRecord, columnName: string): Required<ICustomColumnFormatting> {
        const theming = this._services.get('theming');
        //the selection column has no record value to format, so it takes the row's plain colours
        if (this._services.find('selection')?.isSelectionColumn(columnName) || !record) {
            return theming.getPlainFormatting(record);
        }
        return theming.getColumnFormatting(record, columnName);
    }

    public getRecordValue(record: IRecord, column: IColumn | string) {
        return this._getRecordValue(record, column, false);
    }
    public getRecordFormattedValue(record: IRecord, column: IColumn | string) {
        return this._getRecordValue(record, column, true);
    }
    //returns record value in a form that is compatible with PCF typings
    private _getControlValue(record: IRecord, column: IColumn | string): any {
        const columnName = typeof column === 'string' ? column : column.name;
        column = record.getDataProvider().getColumnsMap()[columnName]!;
        //can be the aggregated value
        let value = this.getRecordValue(record, column).value;
        switch (column.dataType) {
            //getValue always returns string for TwoOptions
            case 'TwoOptions': {
                if (typeof value === 'string') {
                    value = value == '1' ? true : false
                }
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

    private _getRecordValue(record: IRecord, column: IColumn | string, formatted: boolean): { value: any; aggregatedValue: any } {
        if (!record) {
            return {
                value: null,
                aggregatedValue: null
            }
        }
        const columnName = typeof column === 'string' ? column : column.name;
        column = record.getDataProvider().getColumnsMap()[columnName]!;
        if (!column) {
            return {
                value: null,
                aggregatedValue: null
            }
        }
        const method = formatted ? 'getFormattedValue' : 'getValue';
        const groupBy = record.getDataProvider().grouping.getGroupBy(column.grouping?.alias!);
        const aggregation = record.getDataProvider().aggregation.getAggregation(column.aggregation?.alias!);

        let value = record[method](columnName);
        let aggregatedValue = null;

        if (groupBy) {
            value = record[method](groupBy.alias);
        }
        if (aggregation) {
            aggregatedValue = record[method](aggregation.alias);
        }
        return {
            value: value,
            aggregatedValue: aggregatedValue
        }
    }

    private _valueFormatter(p: ValueFormatterParams<IRecord>): string {
        const formattedValue = this.getRecordFormattedValue(p.data!, p.colDef.colId!);
        return formattedValue.value ?? formattedValue.aggregatedValue;
    }

    //the bindings are resolved once and handed back: the control asks for them while constructing its
    //properties and again in getParameters(), and each call rebuilt the whole binding graph for the same
    //record and column
    private _getControlParameters(record: IRecord, column: IGridColumn, customControl: Required<ICustomColumnControl>, isCellEditor: boolean) {
        const bindings = this.getBindings(record, column, customControl);
        const control = new NestedControl({
            onGetBindings: () => bindings,
            parentPcfContext: this._services.get('pcfContext'),
        });
        return record.getColumnInfo(column.name).ui.getControlParameters({
            ...this.getFieldBindingParameters(record, column, isCellEditor),
            ...control.getParameters(),
        });
    }

    private _valueGetter(p: ValueGetterParams<IRecord>, column: IGridColumn) {
        const record = p.data!;
        const columnInfo = record.getColumnInfo(column.name);
        const value = this.getRecordValue(record, column);
        const values = {
            notifications: columnInfo.ui.getNotifications(),
            value: value.value,
            customFormatting: this.getFieldFormatting(record, column.name),
            error: columnInfo.error,
            aggregatedValue: value.aggregatedValue,
            loading: columnInfo.ui.isLoading(),
            errorMessage: columnInfo.errorMessage,
            editable: column.isEditable && columnInfo.security.editable,
            saving: record.isSaving(),
            columnAlignment: column.alignment,
            customComponent: columnInfo.ui.getCustomControlComponent()
        } as ICellValues;
        //what a module knows about this cell, which the grid does not
        this._hooks.apply(values, { record, column });
        return values;
    }

    /**
     * Navigation on a double click, for the definitions the columns part builds.
     *
     * An editable grid never navigates: a double click there means "edit this" on some columns and "open
     * this" on others, and one gesture cannot mean both. Neither does a summarized row, which stands for a
     * group rather than a record, nor a column whose cell is not a value at all.
     */
    public onCellDoubleClick(event: CellDoubleClickedEvent<IRecord>): void {
        const column = this._provider.getColumnsMap()[event.colDef.colId!]!;
        switch (true) {
            case !this._settings.isNavigationEnabled():
            case this._settings.isEditingEnabled():
            case this._services.get('columns').isColumnEditable(column.name, event.data):
            case event.data?.getSummarizationType() !== 'none':
            case !!this._services.find('selection')?.isSelectionColumn(column.name): {
                return;
            }
        }
        const record = event.data!;
        record.getDataProvider().openDatasetItem(record.getNamedReference());
    }

    private _withGridApi(callback: (gridApi: GridApi<IRecord>) => void): void {
        const gridApi = this._services.find('gridApi');
        if (gridApi && !gridApi.isDestroyed()) {
            callback(gridApi);
        }
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}
