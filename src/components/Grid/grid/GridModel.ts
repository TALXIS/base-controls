import { AggregationFunction, Attribute, Constants, DataProvider, DataType, DataTypes, EventEmitter, IColumn, ICommand, ICustomColumnControl, ICustomColumnFormatting, IDataProvider, IDataset, IGroupByMetadata, IRecord, Operators, Sanitizer } from "@talxis/client-libraries";
import { merge } from "merge-anything";
import { ITheme, Theming } from "@talxis/react-components";
import { getTheme } from "@fluentui/react";
import deepEqual from 'fast-deep-equal';
import { gridTranslations } from "../translations";
import { ITranslation } from "../../../hooks";
import { IBinding } from "../../NestedControlRenderer/interfaces";
import { BaseControls, IFluentDesignState } from "../../../utils";
import { IGrid, IGridParameters } from "../interfaces";
import { Aggregation, Sorting, Selection, Grouping } from "../../../utils/dataset/extensions";
import { CHECKBOX_COLUMN_KEY } from "../constants";
import { Filtering } from "../../../utils/dataset/extensions/filtering";
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
    getEntityName: () => string
}

export class GridModel {
    public readonly oddRowCellTheme: ITheme;
    public readonly evenRowCellTheme: ITheme;
    private _getProps: () => IGrid;
    private _labels: Required<ITranslation<typeof gridTranslations>>;
    private _theme: ITheme;
    private _cachedColumns: IGridColumn[] = [];
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
            translations: {
                calculationLimitExceededError: this._labels["error-2147750198"]()
            }
        })
        this.__filtering = new Filtering(() => this.getDataset().getDataProvider());
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
        return false;
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
                formattedValue: this.getRecordFormattedValue(record, column),
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
        column = record.getDataProvider().getColumnsMap().get(column.name)!;
        const aggregationInfo = this.getAggregationInfo(record, column);
        const summarizationType = record.getDataProvider().getSummarizationType();
        const aggregationFunction = aggregationInfo.aggregatedColumn?.aggregation?.aggregationFunction ?? null;
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
            raw: aggregationInfo.value,
            formatted: aggregationInfo.formattedValue,
            type: aggregationInfo.aggregatedColumn?.dataType ?? DataTypes.Decimal
        }
        parameters.EnableNavigation = {
            //TODO: enable navigation for grouped lookups
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
            raw: summarizationType === 'aggregation' ? aggregationFunction : null,
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
        return parameters;
    }

    public isColumnExpandable(record: IRecord, column: IColumn): boolean {
        const grouping = record.getDataProvider().grouping.getGroupBy(column.grouping?.alias!);
        const aggregation = record.getDataProvider().aggregation.getAggregation(column.aggregation?.alias!);
        if (grouping && aggregation) {
            return this.getRecordValue(record, aggregation.alias) != null;
        }
        else {
            return false;
        }
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

    public getCachedGridColumns(): IGridColumn[] {
        return this._cachedColumns;
    }

    public getGridColumns(): { haveColumnsBeenUpdated: boolean, columns: IGridColumn[] } {
        if (!this._hasFirstDataBeenLoaded) {
            return {
                haveColumnsBeenUpdated: false,
                columns: []
            }
        }
        const gridColumns = this._getGridColumnsFromDataset();
        if (!deepEqual(gridColumns, this._cachedColumns)) {
            this._cachedColumns = gridColumns;
            return {
                haveColumnsBeenUpdated: true,
                columns: gridColumns
            }
        }
        else {
            return {
                haveColumnsBeenUpdated: false,
                columns: this._cachedColumns
            }
        }
    }

    public getAggregationInfo(record: IRecord, column: IColumn): IAggregationInfo {
        const aggregation = record.getDataProvider().aggregation.getAggregation(column.aggregation?.alias!);
        const aggrColumn = record.getDataProvider().getColumnsMap().get(aggregation?.alias ?? '') ?? null;
        if (aggregation) {
            return {
                value: this.getRecordValue(record, aggregation.alias),
                formattedValue: this.getRecordFormattedValue(record, aggregation.alias),
                aggregatedColumn: aggrColumn ?? null
            }
        }
        else {
            return {
                value: null,
                formattedValue: null,
                aggregatedColumn: null
            }
        }
    }

    public getRecordValue(record: IRecord, column: IColumn | string): any {
        return this._getRecordValue(record, column, false);
    }
    public getRecordFormattedValue(record: IRecord, column: IColumn | string): string | null {
        return this._getRecordValue(record, column, true);
    }
    //returns record value in a form that is compatible with PCF typings
    public getControlValue(record: IRecord, column: IColumn | string): any {
        column = typeof column === 'string' ? record.getDataProvider().getColumnsMap().get(column)! : column;
        let value = this.getRecordValue(record, column);
        if (record.getDataProvider().getSummarizationType() === 'aggregation') {
            //total row control value is always null (the control displays just the aggregated value)
            return null;
        }
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

    public getGroupChildrenDataProvider(groupRecord: IRecord): IDataProvider {
        const groupBys = this._dataset.grouping.getGroupBys();
        const aggregations = this._dataset.aggregation.getAggregations();
        const parentRecord = groupRecord;
        const level = groupRecord.getDataProvider().getNestingLevel();
        const parentDataProvider = parentRecord.getDataProvider();
        const groupDataProvider = parentDataProvider.getChildDataProvider({ parentRecordId: parentRecord.getRecordId() });
        //this makes sure client API can register events in the child dataset
        this._dataset.getChildDataset(groupDataProvider);
        //grid supports nested grouping, if this is defined, the next level will be grouped by this column
        const nextGroupedColumn = this._dataset.getDataProvider().getColumnsMap().get(groupBys[level + 1]?.columnName);
        //the column that is the current data provider grouped on
        const currentGroupedColumn = this._dataset.getDataProvider().getColumnsMap().get(groupBys[level].columnName)!;
        groupDataProvider.setViewId('');
        groupDataProvider.getColumnsMap().clear();
        //make the current grouped column virtual column does not appear in the grid
        groupDataProvider.setColumns(parentDataProvider.getColumns().map(col => {
            if (col.name === currentGroupedColumn.name) {
                return {
                    ...col,
                    isVirtual: true,
                    //this is so the cell renderer will not try to render empty value
                    type: 'action'
                }
            }
            else {
                return col;
            }
        }));
        groupDataProvider.getPaging().setPageSize(50);
        groupDataProvider.grouping.clear();
        groupDataProvider.aggregation.clear();
        //ignore the sorting on grouped columns if we are going to fetch the last level - it causes data to be fetched
        if (!nextGroupedColumn) {
            groupDataProvider.setSorting(parentDataProvider.getSorting().filter(sort => !groupBys.find(groupBy => sort.name === groupBy.columnName)));
        }

        //set the aggregations and grouping for child dataset if it has grouped column on the next level
        if (nextGroupedColumn) {
            const groupBy = this._dataset.grouping.getGroupBy(nextGroupedColumn.grouping?.alias!)!;
            const aggregation = this._dataset.aggregation.getAggregation(nextGroupedColumn.aggregation?.alias!)!;
            groupDataProvider.grouping.addGroupBy(groupBy);
            groupDataProvider.aggregation.addAggregation(aggregation);
        }
        //add aggregations that are not applied to grouped columns
        aggregations.map(aggr => {
            const isGrouped = groupBys.find(x => x.columnName === aggr.columnName);
            if (groupDataProvider.grouping.getGroupBys().length > 0 && !isGrouped) {
                groupDataProvider.aggregation.addAggregation(aggr);
            }
        })
        //apply filtering to the group dataset
        const filterDataProvider = groupDataProvider.getChildDataProvider();
        filterDataProvider.setColumns(this._dataset.columns);
        const filtering = new Filtering(() => filterDataProvider);
        const columnFilter = filtering.getColumnFilter(currentGroupedColumn.name);
        const condition = columnFilter.addCondition();
        const value = this._getFilterValueFromRecordValue(parentRecord, currentGroupedColumn.dataType, currentGroupedColumn.name);

        if (value == null) {
            condition.setOperator(Operators.DoesNotContainData.Value)
        }
        else {
            condition.setOperator(Operators.Equal.Value);
            condition.setValue(value);
        }
        const filterExpression = filtering.getFilterExpression(FilterType.And.Value);
        if (!filterExpression) {
            throw new Error('Unexpected error when filtering group dataset');
        }
        groupDataProvider.setFiltering(filterExpression);
        return groupDataProvider;
    }

    public isRecordSelectionDisabled(record: IRecord): boolean {
        const dataProvider = record.getDataProvider();
        if (dataProvider.getSummarizationType() === 'grouping') {
            if (this.getSelectionType() === 'single') {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    public async loadGroups(ids: string[], onRequestLoading: () => void) {
        let pendingPromises: Promise<any>[] = [];
        const groupIds = this._getGroupRecordIds(ids);
        const providersToRefresh: Promise<IDataProvider>[] = [];
        for (const groupId of groupIds) {
            const record = this._dataset.getDataProvider().getRecordsMap(true)[groupId];
            const groupDataProvider = this.getGroupChildrenDataProvider(record);
            if (groupDataProvider.getRecords().length === 0) {
                onRequestLoading();
                providersToRefresh.push(new Promise(async (resolve) => {
                    await groupDataProvider.refresh();
                    resolve(groupDataProvider);
                }))
            }
            else {
                groupDataProvider.setSelectedRecordIds(groupDataProvider.getSortedRecordIds(), { propagateToChildren: false, disableEvent: true });
            }
        }
        if (providersToRefresh.length > 0) {
            const providers = await Promise.all(providersToRefresh);
            for (const provider of providers) {
                provider.setSelectedRecordIds(provider.getSortedRecordIds(), { propagateToChildren: false });
                for (const record of provider.getRecords()) {
                    if (record.getRecordId().startsWith('group')) {
                        pendingPromises.push(this.loadGroups(provider.getSelectedRecordIds(), onRequestLoading))
                    }
                }
            }
        }
        return Promise.all(pendingPromises);
    }

    public getCurrentlyHeldKey(): string | null {
        return this._getCurrentlyHeldKey();
    }

    public isColumnEditable(columnName: string, record?: IRecord): boolean {
        let isEditable = true;
        const mainDatasetColumn = this.getDataset().getDataProvider().getColumnsMap().get(columnName)!;
        let column = mainDatasetColumn;
        if (record) {
            column = record.getDataProvider().getColumnsMap().get(columnName)!;
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
        this._setAggregationDecorator(() => {
            this._aggregation.addAggregation(columnName, aggregationFunction)
        })
    }
    public removeAggregation(alias: string) {
        this._setAggregationDecorator(() => {
            this._aggregation.removeAggregation(alias);
        })
    }
    public toggleColumnGroup(columnName: string) {
        const column = this.getDataset().getDataProvider().getColumnsMap().get(columnName)!;
        if (column.grouping?.isGrouped) {
            this._grouping.ungroupColumn(column.grouping.alias!);
        }
        else {
            this._grouping.groupColumn(column.name);
        }
        this._dataset.refresh();
    }

    public getColumnFilter(columnName: string) {
        return this._filtering.getColumnFilter(columnName)
    }

    public removeColumnFilter(columnName: string, saveToDataset?: boolean) {
        this._filtering.removeColumnFilter(columnName);
        if (!saveToDataset) {
            return;
        }
        const filterExpression = this._filtering.getFilterExpression(FilterType.And.Value);
        if (!filterExpression) {
            throw new Error('Unexpected error when clearing column filter.');
        }
        this._dataset.filtering.setFilter(filterExpression);
        this._dataset.refresh();
    }

    public sortColumn(columnName: string, descending?: boolean) {
        this._sorting.getColumnSorting(columnName).setSortValue(descending ? 1 : 0);
        this._dataset.refresh();
    }

    public clearColumnSorting(columnName: string) {
        this._sorting.getColumnSorting(columnName).clear();
        this._dataset.refresh();
    }

    public getAggregation() {
        return this._aggregation;
    }

    public getFiltering() {
        return this._filtering;
    }

    public getColumnSortingLabel(columnName: string, descending?: boolean): string {
        const column = this.getDataset().getDataProvider().getColumnsMap().get(columnName)!;
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

    private _getRecordValue(record: IRecord, column: IColumn | string, formatted: boolean): any {
        if (!record) {
            return null;
        }
        column = typeof column === 'string' ? record.getDataProvider().getColumnsMap().get(column)! : column;
        if (!column) {
            return null;
        }
        const method = formatted ? 'getFormattedValue' : 'getValue';
        const groupBy = record.getDataProvider().grouping.getGroupBy(column.grouping?.alias!);
        const aggregation = record.getDataProvider().aggregation.getAggregation(column.aggregation?.alias!);
        //aggregation is considered as value when it's set but no grouping is applied to the column
        if (!groupBy && aggregation) {
            return record[method](aggregation.alias);
        }
        else {
            return record[method](groupBy?.alias ?? column.name);
        }
    }

    private _getGridColumnsFromDataset(): IGridColumn[] {
        const gridColumns: IGridColumn[] = this.getDataset().columns.map(column => {
            const sorted = this.getDataset().sorting?.find(sort => sort.name === column.name);
            return {
                ...column,
                alignment: column.alignment!,
                isFiltered: this._filtering.getColumnFilter(column.name).isAppliedToDataset(),
                isEditable: this.isColumnEditable(column.name),
                isRequired: this._isColumnRequired(column),
                canBeGrouped: true,
                isFilterable: this._isColumnFilterable(column),
                disableSorting: !this._isColumnSortable(column),
                canBeAggregated: this._canColumnBeAggregated(column),
                isSortedDescending: sorted?.sortDirection === 1 ? true : false,
                type: this._getColumnType(column),
                isResizable: true,
                isSorted: sorted ? true : false,
                getEntityName: () => this._getColumnEntityName(column.name)
            }
        })
        return gridColumns;
    }

    private _isRecordFieldEditable(record: IRecord, column: IColumn): boolean {
        // summarized records are not editable
        if (record.getDataProvider().getSummarizationType() !== 'none') {
            return false;
        }
        const columnInfo = record.getColumnInfo(column.name);
        if (columnInfo.ui.isLoading()) {
            return false;
        }
        //if editable not defined, return true since column is editable in this case
        return columnInfo?.security.editable ?? true;
    }

    private _isColumnRequired(column: IColumn): boolean {
        if (!this.getParameters().EnableEditing?.raw) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        const requiredLevel = column.metadata?.RequiredLevel;
        if (requiredLevel === 1 || requiredLevel === 2) {
            return true;
        }
        return false;
    }
    private _isColumnSortable(column: IColumn): boolean {
        if (column.isVirtual) {
            return false;
        }
        if (this.getParameters().EnableSorting?.raw === false) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        switch (column.dataType) {
            case DataTypes.Image: {
                return false;
            }
        }
        if (column.disableSorting === undefined) {
            return true;
        }
        return !column.disableSorting;
    }
    private _isColumnFilterable(column: IColumn): boolean {
        if (this.getParameters().EnableFiltering?.raw === false) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        //by default, do not make virtual columns filterable unless explicitly set
        if (column.isVirtual) {
            return column.metadata?.isFilterable ?? false;
        }
        return column.metadata?.isFilterable ?? true;
    }
    private _getColumnEntityName(columnName: string) {
        const entityAliasName = Attribute.GetLinkedEntityAlias(columnName);
        if (!entityAliasName) {
            return this.getDataset().getTargetEntityType();
        }
        return this.getDataset().linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
    }

    private _canColumnBeAggregated(column: IColumn): boolean {
        //aggregations disabled by default
        if (this.getParameters().EnableAggregation?.raw !== true) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        if (!column.metadata?.SupportedAggregations || column.metadata.SupportedAggregations.length === 0) {
            return false;
        }
        //do not allow aggregations if grouping is present and only 
        if (this._dataset.grouping.getGroupBys().length > 0) {
            const aggregations = [...column.metadata.SupportedAggregations];
            for (const aggregation of [...aggregations]) {
                if (aggregation === 'count' || aggregation === 'countcolumn') {
                    aggregations.pop();
                }
            }
            if (aggregations.length === 0) {
                return false;
            }
        }
        return true;
    }

    private _getColumnType(column: IColumn) {
        if (column.type) {
            return column.type;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return 'action';
        }
        return undefined;
    }

    private _registerEventListeners() {
        this._dataset.addEventListener('onInitialDataLoaded', () => this.init());
        this._setGroupingInterceptor();
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
                const column = this._dataset.getDataProvider().getColumnsMap().get(groupBy.columnName)!;
                this._dataset.grouping.addGroupBy(originalGrouping[0], column.order);
                //clear all grouping aggregations except the first one
                for (let i = 1; i < originalGrouping.length; i++) {
                    const column = this._dataset.getDataProvider().getColumnsMap().get(originalGrouping[i].columnName);
                    this._dataset.aggregation.removeAggregation(column?.aggregation?.alias!);
                }
            }
        })
        this._dataset.addEventListener('onNewDataLoaded', () => {
            originalGrouping.map((group) => {
                const column = this._dataset.getDataProvider().getColumnsMap().get(group.columnName)!;
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