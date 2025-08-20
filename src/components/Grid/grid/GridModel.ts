import { AggregationFunction, DataProvider, DataType, DataTypes, FieldValue, Filtering, IColumn, ICommand, ICustomColumnControl, ICustomColumnFormatting, IDataProvider, IDataset, IGroupByMetadata, IRecord, Sanitizer } from "@talxis/client-libraries";
import { merge } from "merge-anything";
import { ITheme, Theming } from "@talxis/react-components";
import { getTheme } from "@fluentui/react";
import deepEqual from 'fast-deep-equal';
import { gridTranslations } from "../translations";
import { ITranslation } from "../../../hooks";
import { IBinding } from "../../NestedControlRenderer/interfaces";
import { BaseControls, IFluentDesignState } from "../../../utils";
import { IGrid, IGridParameters } from "../interfaces";
import { Aggregation, Sorting, Grouping } from "../../../utils/dataset/extensions";
import { CHECKBOX_COLUMN_KEY } from "../constants";
import { Type as FilterType } from "@talxis/client-libraries";
import { useCurrentlyHeldKey } from "@solid-primitives/keyboard";

const DEFAULT_ROW_HEIGHT = 42;

interface IGridDependencies {
    labels: Required<ITranslation<typeof gridTranslations>>;
    onGetProps: () => IGrid;
    theme?: ITheme;
}

interface IPCFContext extends Omit<ComponentFramework.Context<any, any>, 'fluentDesignLanguage'> {
    fluentDesignLanguage?: IFluentDesignState
}

interface IAggregationInfo {
    value: number | null;
    formattedValue: string | null;
    aggregatedColumn: IColumn | null;
}

export interface IGridColumn extends IColumn {
    isRequired: boolean;
    isEditable: boolean;
    isFilterable: boolean;
    isSorted: boolean;
    isFiltered: boolean;
    canBeAggregated: boolean;
    canBeGrouped: boolean;
    isSortedDescending: boolean;
    isResizable: boolean;
    alignment: IColumn['alignment'],
}

export class GridModel {
    public readonly oddRowCellTheme: ITheme;
    public readonly evenRowCellTheme: ITheme;
    private _getProps: () => IGrid;
    private _labels: Required<ITranslation<typeof gridTranslations>>;
    private _theme: ITheme;
    private _cachedColumns: IGridColumn[] = [];
    private _cachedColumnsMap: Map<string, IGridColumn> = new Map();
    private _hasFirstDataBeenLoaded = false;
    private _getCurrentlyHeldKey = useCurrentlyHeldKey();
    private __sorting?: Sorting;
    private __aggregation?: Aggregation;
    private __grouping?: Grouping;
    private __filtering?: Filtering;

    constructor({ onGetProps, labels, theme }: IGridDependencies) {
        this._getProps = onGetProps;
        this._labels = labels;
        this._theme = theme ?? getTheme();
        this.oddRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.neutralLighterAlt, this._theme.semanticColors.bodyText);
        this.evenRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.white, this._theme.semanticColors.bodyText);
        this._registerEventListeners();
    }
    public init() {
        if (this._hasFirstDataBeenLoaded) {
            return;
        }
        this._hasFirstDataBeenLoaded = true;
        this.__sorting = new Sorting(() => this.getDataset());
        this.__aggregation = new Aggregation({
            onGetDataProvider: () => this.getDataset().getDataProvider(),
        })
        this.__filtering = new Filtering(() => this.getDataset().getDataProvider() , FieldValue);
        this.__grouping = new Grouping(() => this.getDataset().getDataProvider());
    }

    public getDataset(): IDataset {
        return this._getProps().parameters.Grid;
    }

    public getPcfContext(): IPCFContext {
        return this._getProps().context;
    }

    public getParameters(): IGridParameters {
        return this._getProps().parameters;
    }
    public getLabels(): Required<ITranslation<typeof gridTranslations>> {
        return this._labels;
    }
    public isZebraEnabled(): boolean {
        return this._getProps().parameters.EnableZebra?.raw !== false;
    }
    public isNavigationEnabled(): boolean {
        return this.getParameters().EnableNavigation?.raw !== false;
    }
    public isAutoSaveEnabled(): boolean {
        return this.getParameters().EnableAutoSave?.raw === true;
    }
    public isEditingEnabled(): boolean {
        return this.getParameters().EnableEditing?.raw === true;
    }
    public optionSetColorsEnabled(): boolean {
        return this.getParameters().EnableOptionSetColors?.raw === true;
    }

    public getDefaultExpandedGroupLevel(): number {
        return this.getParameters().DefaultExpandedGroupLevel?.raw ?? -1;
    }
    public getDefaultRowHeight(): number {
        const height = this.getParameters().RowHeight?.raw;
        if (height) {
            return height;
        }
        return DEFAULT_ROW_HEIGHT;
    }
    public getSelectionType(): 'none' | 'single' | 'multiple' {
        switch (this.getParameters().SelectableRows?.raw) {
            case undefined:
            case null: {
                return 'multiple'
            }
        }
        return this.getParameters().SelectableRows!.raw;
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
            name: editing ? BaseControls.GetControlNameForDataType(column.dataType as DataType) : 'GridCellRenderer',
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
                value: this.getControlValue(record, column),
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

    public getFieldBindingParameters(record: IRecord, column: IColumn, editing: boolean, recordCommands?: ICommand[]) {
        //make sure we have IColumn, not IGridColumn
        column = record.getDataProvider().getColumnsMap()[column.name]!;
        const summarizationType = record.getDataProvider().getSummarizationType();
        const value = this.getRecordValue(record, column);
        const formattedValue = this.getRecordFormattedValue(record, column);
        const aggregationColumn = record.getDataProvider().getColumnsMap()[column.aggregation?.alias!];
        const parameters: any = {
            Dataset: {
                raw: this.getDataset(),
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
                if (!this.isNavigationEnabled()) {
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
        parameters.RecordCommands = {
            raw: recordCommands ?? [],
            type: DataTypes.Object
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
            raw: this.optionSetColorsEnabled(),
            type: DataTypes.TwoOptions
        }
        parameters.ShouldStopEditWhenOutputChanges = {
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

    public isColumnExpandable(record: IRecord, column: IColumn): boolean {
        return !!record.getDataProvider().grouping.getGroupBy(column.grouping?.alias!);
    }

    public getFieldFormatting(record: IRecord, columnName: string): Required<ICustomColumnFormatting> {
        const defaultTheme = this.getDefaultCellTheme(record, columnName);
        const defaultBackgroundColor = defaultTheme.semanticColors.bodyBackground;;

        // Handle checkbox column specifically
        if (columnName === CHECKBOX_COLUMN_KEY || !record) {
            return {
                primaryColor: this._theme.palette.themePrimary,
                backgroundColor: defaultBackgroundColor,
                textColor: Theming.GetTextColorForBackground(defaultBackgroundColor),
                className: '',
                themeOverride: {}
            };
        }

        const customFormatting = record.getColumnInfo(columnName).ui.getCustomFormatting(defaultTheme) ?? {};

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

    public getDefaultCellTheme(record: IRecord, columnName?: string): ITheme {
        const isEven = record.getIndex() % 2 === 0;
        const summarizationType = record.getDataProvider().getSummarizationType();
        if (summarizationType !== 'none') {
            return this.oddRowCellTheme;
        }
        //child of a group record
        else if (record.getDataProvider().getParentDataProvider()) {
            return this.evenRowCellTheme;
        }
        else if (isEven || !this.isZebraEnabled()) {
            return this.evenRowCellTheme;
        }
        else {
            return this.oddRowCellTheme;
        }
    }

    public getGridColumns(): IGridColumn[] {
        return this._cachedColumns;
    }

    public getGridColumnByName(columnName: string): IGridColumn {
        return this._cachedColumnsMap.get(columnName)!;
    }

    public refreshGridColumns(): { haveColumnsOrderBeenUpdated: boolean, columns: IGridColumn[] } {
        if (!this._hasFirstDataBeenLoaded) {
            return {
                haveColumnsOrderBeenUpdated: false,
                columns: []
            }
        }
        const gridColumns = this._getGridColumnsFromDataset();
        const gridColumnNames = this._getVisibleColumnNames(gridColumns);
        const cachedGridColumnNames = this._getVisibleColumnNames(this._cachedColumns);
        if (!deepEqual(gridColumnNames, cachedGridColumnNames)) {
            this._cachedColumns = gridColumns;
            return {
                haveColumnsOrderBeenUpdated: true,
                columns: gridColumns
            }
        }
        else {
            this._cachedColumns = gridColumns;
            return {
                haveColumnsOrderBeenUpdated: false,
                columns: this._cachedColumns
            }
        }
    }

    public getColumnByName(columnName: string): IColumn {
        return this.getDataset().getDataProvider().getColumnsMap()[columnName]!;
    }

    public getRecordValue(record: IRecord, column: IColumn | string) {
        return this._getRecordValue(record, column, false);
    }
    public getRecordFormattedValue(record: IRecord, column: IColumn | string) {
        return this._getRecordValue(record, column, true);
    }
    //returns record value in a form that is compatible with PCF typings
    public getControlValue(record: IRecord, column: IColumn | string): any {
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

    public isRecordSelectionDisabled(record: IRecord): boolean {
        const dataProvider = record.getDataProvider();
        const level = dataProvider.getNestingLevel();
        const groupBys = this.getDataset().grouping.getGroupBys();
        if (level < groupBys.length - 1) {
            return true;
        }
        if (dataProvider.getSummarizationType() === 'grouping' && this.getSelectionType() === 'single') {
            return true;
        }
        return false;
    }

    public getCurrentlyHeldKey(): string | null {
        return this._getCurrentlyHeldKey();
    }

    public isColumnEditable(columnName: string, record?: IRecord): boolean {
        let isEditable = true;
        const mainDatasetColumn = this.getDataset().getDataProvider().getColumnsMap()[columnName]!;
        let column = mainDatasetColumn;
        if (record) {
            column = record.getDataProvider().getColumnsMap()[columnName]!;
        }
        switch (true) {
            case !this.isEditingEnabled():
            case record?.isSaving():
            case column.oneClickEdit: {
                isEditable = false;
                break;
            }
        }
        switch (column.name) {
            case DataProvider.CONST.CHECKBOX_COLUMN_KEY:
            case DataProvider.CONST.RIBBON_BUTTONS_COLUMN_NAME: {
                isEditable = false;
                break;
            }
        }
        //these field types do not support editing
        switch (column.dataType) {
            case DataTypes.File:
            case DataTypes.Image: {
                isEditable = false;
                break;
            }
        }
        //if the column is not editable, return false
        if (!isEditable) {
            return false
        }
        else {
            //columns is editable and we are not asking for record
            if (!record) {
                return true;
            }
            //column is editable, but we need to check if the record is editable
            else return this._isRecordFieldEditable(record, column);
        }
    }

    public addAggregation(columnName: string, aggregationFunction: AggregationFunction) {
        this._dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => {
            this._setAggregationDecorator(() => {
                this._aggregation.addAggregation(columnName, aggregationFunction)
            })
        })
    }
    public removeAggregation(alias: string) {
        this._dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => {
            this._setAggregationDecorator(() => {
                this._aggregation.removeAggregation(alias);
            })
        })
    }
    public toggleColumnGroup(columnName: string) {
        this._dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => {
            const column = this.getDataset().getDataProvider().getColumnsMap()[columnName]!;
            if (column.grouping?.isGrouped) {
                this._grouping.ungroupColumn(column.grouping.alias!);
            }
            else {
                this._grouping.groupColumn(column.name);
            }
            this._dataset.refresh();
        })
    }

    public getColumnFilter(columnName: string) {
        return this._filtering.getColumnFilter(columnName);
    }

    public removeColumnFilter(columnName: string, saveToDataset?: boolean) {
        this._filtering.removeColumnFilter(columnName);
        if (!saveToDataset) {
            return;
        }
        this._dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => {
            const filterExpression = this._filtering.getFilterExpression(FilterType.And.Value);
            if (!filterExpression) {
                throw new Error('Unexpected error when clearing column filter.');
            }
            this._dataset.filtering.setFilter(filterExpression);
            this._dataset.refresh();
        })
    }

    public sortColumn(columnName: string, descending?: boolean) {
        this._dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => {
            this._sorting.getColumnSorting(columnName).setSortValue(descending ? 1 : 0);
            this._dataset.refresh();
        })
    }

    public clearColumnSorting(columnName: string) {
        this._dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => {
            this._sorting.getColumnSorting(columnName).clear();
            this._dataset.refresh();
        })
    }

    public getAggregation() {
        return this._aggregation;
    }

    public getFiltering() {
        return this._filtering;
    }

    public getColumnSortingLabel(columnName: string, descending?: boolean): string {
        const column = this.getDataset().getDataProvider().getColumnsMap()[columnName]!;
        switch (column.dataType) {
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.WholeDuration:
            case DataTypes.Currency: {
                if (!descending) {
                    return this._labels['filtersortmenu-sortnumber-a-z']()
                }
                return this._labels['filtersortmenu-sortnumber-z-a']()
            }
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                if (!descending) {
                    return this._labels['filtersortmenu-sortdate-a-z']()
                }
                return this._labels['filtersortmenu-sortdate-z-a']()
            }
            case DataTypes.TwoOptions: {
                const options = column.metadata?.OptionSet ?? [];
                if (!descending) {
                    return `${options[0].Label} ${this._labels['filtersortmenu-sorttwooption-joint']()} ${options[1].Label}`
                }
                return `${options[1].Label} ${this._labels['filtersortmenu-sorttwooption-joint']()} ${options[0].Label}`
            }
            default: {
                if (!descending) {
                    return this._labels['filtersortmenu-sorttext-a-z']()
                }
                return this._labels['filtersortmenu-sorttext-z-a']()
            }
        }

    }

    private _getVisibleColumnNames(columns: IGridColumn[]): string[] {
        const names: string[] = [];
        for (const column of columns) {
            if (!column.isHidden) {
                //we also need to push the group state
                //to force ag grid to set new columns when grouping
                names.push(`${column.name}_${column.grouping?.isGrouped}`);
            }
        }
        return names;
    }

    private _setAggregationDecorator(fn: () => void) {
        fn();
        if (this._dataset.grouping.getGroupBys().length > 0) {
            this._dataset.refresh();
        }
        else {
            this._aggregation?.refresh();
            this._dataset.render();
        }
    }

    private _getGroupRecordIds(ids: string[]): string[] {
        return ids.filter(id => id.startsWith(DataProvider.CONST.GROUP_PREFIX));
    }

    private _getFilterValueFromRecordValue(record: IRecord, dataType: DataType, columnAlias: string) {
        const value = this.getControlValue(record, columnAlias);
        if (value == null || (Array.isArray(value) && value.length === 0)) {
            return null;
        }
        switch (dataType) {
            case 'OptionSet': {
                return [value];
            }
            case 'TwoOptions': {
                return [value ? 1 : 0];
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

    private _getGridColumnsFromDataset(): IGridColumn[] {
        const gridColumns: IGridColumn[] = this.getDataset().columns.map(column => {
            const sorted = this.getDataset().sorting?.find(sort => sort.name === column.name);
            const gridColumn = {
                ...column,
                alignment: column.alignment!,
                isFiltered: this._filtering.getColumnFilter(column.name).isAppliedToDataset(),
                isEditable: this._isColumnEditable(column),
                isRequired: this._isColumnRequired(column),
                canBeGrouped: this._isColumnGroupable(column),
                isFilterable: this._isColumnFilterable(column),
                disableSorting: !this._isColumnSortable(column),
                canBeAggregated: this._canColumnBeAggregated(column),
                isSortedDescending: sorted?.sortDirection === 1 ? true : false,
                isResizable: true,
                isSorted: sorted ? true : false
            }
            this._cachedColumnsMap.set(column.name, gridColumn);
            return gridColumn;
        })
        return gridColumns;
    }

    private _isRecordFieldEditable(record: IRecord, column: IColumn): boolean {
        const columnInfo = record.getColumnInfo(column.name);
        //if editable not defined, return true since column is editable in this case
        return columnInfo?.security.editable ?? true;
    }

    private _isColumnRequired(column: IColumn): boolean {
        if (!this.getParameters().EnableEditing?.raw) {
            return false;
        }
        switch (column.metadata?.RequiredLevel) {
            case 1:
            case 2: {
                return true;
            }
            default: {
                return false;
            }
        }
    }
    private _isColumnSortable(column: IColumn): boolean {
        //sorting enabled by default
        if (this.getParameters().EnableSorting?.raw === false) {
            return false;
        }
        return !column.disableSorting;
    }
    private _isColumnFilterable(column: IColumn): boolean {
        //filtering enabled by default
        if (this.getParameters().EnableFiltering?.raw === false) {
            return false;
        }
        if (!column.metadata?.SupportedFilterConditionOperators || column.metadata.SupportedFilterConditionOperators.length === 0) {
            return false;
        }
        return true;
    }

    private _isColumnGroupable(column: IColumn): boolean {
        //grouping disabled by default
        if (this.getParameters().EnableGrouping?.raw !== true) {
            return false;
        }
        return !!column.metadata?.CanBeGrouped;
    }

    private _isColumnEditable(column: IColumn): boolean {
        //editing disabled by default
        if (this.getParameters().EnableEditing?.raw !== true) {
            return false;
        }
        return !!column.metadata?.IsValidForUpdate;
    }

    private _canColumnBeAggregated(column: IColumn): boolean {
        //aggregations disabled by default
        if (this.getParameters().EnableAggregation?.raw !== true) {
            return false;
        }
        if (!column.metadata?.SupportedAggregations || column.metadata.SupportedAggregations.length === 0) {
            return false;
        }
        return true;
    }

    private _registerEventListeners() {
        this._dataset.addEventListener('onInitialDataLoaded', () => this.init());
        this._dataset.addEventListener('onRecordColumnValueChanged', (record) => this._autoSaveRecord(record))
        this._setGroupingInterceptor();
    }
    private _autoSaveRecord(record: IRecord) {
        if (this.isAutoSaveEnabled() && record.isDirty()) {
            record.save();
        }
    }

    //this method makes sure that the grouping is only applied to the first grouping column
    //this allows for nested grouping to work correctly
    private _setGroupingInterceptor() {
        let originalGrouping: IGroupByMetadata[] = [];
        let originalAggregation: IGroupByMetadata[] = [];
        this._dataset.addEventListener('onBeforeNewDataLoaded', () => {
            originalGrouping = this._dataset.grouping.getGroupBys();
            originalAggregation = this._dataset.aggregation.getAggregations();

            if (originalGrouping.length > 1) {
                this._dataset.grouping.clear();
                const groupBy = originalGrouping[0];
                const column = this._dataset.getDataProvider().getColumnsMap()[groupBy.columnName]!;
                this._dataset.grouping.addGroupBy(originalGrouping[0], column.order);
                //clear all grouping aggregations except the first one
                for (let i = 1; i < originalGrouping.length; i++) {
                    const column = this._dataset.getDataProvider().getColumnsMap()[originalGrouping[i].columnName];
                    this._dataset.aggregation.removeAggregation(column?.aggregation?.alias!);
                }
            }
        })
        this._dataset.addEventListener('onNewDataLoaded', () => {
            originalGrouping.map((group) => {
                const column = this._dataset.getDataProvider().getColumnsMap()[group.columnName]!;
                this._dataset.grouping.addGroupBy(group, column.order);
            })
            originalAggregation.map((aggr: any) => {
                this._dataset.aggregation.addAggregation(aggr);
            })
        })
    }

    private get _dataset() {
        return this.getDataset();
    }

    private get _sorting(): Sorting {
        if (!this.__sorting) {
            throw new Error('Sorting is not initialized. Call init() method first.');
        }
        return this.__sorting;
    }

    private get _filtering(): Filtering {
        if (!this.__filtering) {
            throw new Error('Filtering is not initialized. Call init() method first.');
        }
        return this.__filtering;
    }

    private get _aggregation(): Aggregation {
        if (!this.__aggregation) {
            throw new Error('Aggregation is not initialized. Call init() method first.');
        }
        return this.__aggregation;
    }

    private get _grouping(): Grouping {
        if (!this.__grouping) {
            throw new Error('Grouping is not initialized. Call init() method first.');
        }
        return this.__grouping;
    }
}