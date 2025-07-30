import { Attribute, Constants, DataType, DataTypes, EventEmitter, IColumn, ICommand, ICustomColumnControl, ICustomColumnFormatting, IDataProvider, IDataset, IRecord, Operators, Sanitizer } from "@talxis/client-libraries";
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
    canBeAggregated: boolean;
    canBeGrouped: boolean;
    isSortedDescending: boolean;
    isResizable: boolean;
    alignment: IColumn['alignment'],
    getEntityName: () => string
}

export class GridModel {
    private _getProps: () => IGrid;
    private _sorting: Sorting;
    private _aggregation: Aggregation;
    private _grouping: Grouping;
    private _filtering: Filtering;
    private _labels: Required<ITranslation<typeof gridTranslations>>;
    private _theme: ITheme;
    private _cachedColumns: IGridColumn[] = [];
    private _getCurrentlyHeldKey = useCurrentlyHeldKey();
    public readonly oddRowCellTheme: ITheme;
    public readonly evenRowCellTheme: ITheme;

    constructor({ onGetProps, labels, theme }: IGridDependencies) {
        this._getProps = onGetProps;
        this._labels = labels;
        this._theme = theme ?? getTheme();
        this.oddRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.neutralLighterAlt, this._theme.semanticColors.bodyText);
        this.evenRowCellTheme = Theming.GenerateThemeV8(this._theme.palette.themePrimary, this._theme.palette.white, this._theme.semanticColors.bodyText);
        this._sorting = new Sorting(() => this.getDataset());
        this._aggregation = new Aggregation({
            onGetDataset: () => this.getDataset(),
            translations: {
                calculationLimitExceededError: this._labels["error-2147750198"]()
            }
        })
        this._aggregation.addEventListener('onRequestMainDatasetRefresh', () => this._dataset.refresh())
        this._filtering = new Filtering(() => this.getDataset().getDataProvider());
        this._grouping = new Grouping(() => this.getDataset());
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

    public getColumnAlignment(column: IColumn) {
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
        if (column.type === 'action' || column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return 'right';
        }
        return 'left';
    }

    public getSorting(): Sorting {
        return this._sorting;
    }
    public getFiltering(): Filtering {
        return this._filtering;
    }
    public getAggregation(): Aggregation {
        return this._aggregation
    }
    public getGrouping(): Grouping {
        return this._grouping;
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

    public getFieldBindingParameters(record: IRecord, column: IGridColumn, editing: boolean, recordCommands?: ICommand[]) {
        const aggregationInfo = this.getAggregationInfo(record, column);
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
            raw: this.isNavigationEnabled(),
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
            raw: aggregationInfo.aggregatedColumn?.aggregationFunction ?? null,
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
        const isEven = record.getIndex() % 2 === 0;
        const defaultTheme = this.getDefaultCellTheme(isEven);
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

    public getDefaultCellTheme(isEven: boolean): ITheme {
        if (isEven || !this.isZebraEnabled()) {
            return this.evenRowCellTheme;
        }
        return this.oddRowCellTheme;
    }

    public onNotifyOutputChanged(record: IRecord, column: IColumn, editing: boolean, newValue: any, rerenderCell: () => void) {
        record.setValue(column.name, newValue);
        if (!editing) {
            this.getPcfContext().factory.requestRender();
            return;
        }
        setTimeout(() => {
            rerenderCell();
        }, 0);
    }

    public getCachedGridColumns(): IGridColumn[] {
        return this._cachedColumns;
    }

    public getGridColumns(): { haveColumnsBeenUpdated: boolean, columns: IGridColumn[] } {
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

    public getAggregationInfo(record: IRecord, column: IGridColumn): IAggregationInfo {
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
        const parentRecord = groupRecord;
        const level = groupRecord.getDataProvider().getNestingLevel();
        const parentDataProvider = parentRecord.getDataProvider();
        const groupDataProvider = parentDataProvider.getChildDataProvider(parentRecord.getRecordId());
        //this makes sure client API can register events in the child dataset
        const groupDataset = this._dataset.getChildDataset(groupDataProvider);
        const nextGroupedColumn = this._dataset.getDataProvider().getColumnsMap().get(groupBys[level + 1]?.columnName);
        const groupedColumn = this._dataset.getDataProvider().getColumnsMap().get(groupBys[level].columnName)!;
        groupDataProvider.setViewId('');
        groupDataProvider.getColumnsMap().clear();
        //make the grouped column virtual column does not appear in the grid
        groupDataProvider.setColumns(parentDataProvider.getColumns().map(col => {
            if (col.name === groupedColumn.name) {
                return {
                    ...col,
                    isVirtual: true
                }
            }
            else {
                return col;
            }
        }));
        groupDataProvider.getPaging().setPageSize(25);
        groupDataProvider.grouping.clear();
        groupDataProvider.aggregation.clear();

        if (nextGroupedColumn) {
            const groupBy = this._dataset.grouping.getGroupBy(nextGroupedColumn.grouping?.alias!)!;
            const aggregation = this._dataset.aggregation.getAggregation(nextGroupedColumn.aggregation?.alias!)!;
            groupDataProvider.grouping.addGroupBy(groupBy);
            groupDataProvider.aggregation.addAggregation(aggregation);
        }
        this._dataset.aggregation.getAggregations().map(aggr => {
            const isGrouped = groupBys.find(x => x.columnName === aggr.columnName);
            //adds aggregations that are not grouped
            if (groupDataProvider.grouping.getGroupBys().length > 0 && !isGrouped) {
                groupDataProvider.aggregation.addAggregation(aggr);
            }
        })
        const filterDataProvider = groupDataProvider.getChildDataProvider();
        filterDataProvider.setColumns(this._dataset.columns);
        const filtering = new Filtering(() => filterDataProvider);
        const columnFilter = filtering.getColumnFilter(groupedColumn.name);
        const condition = columnFilter.addCondition();
        const value = this._getFilterValueFromRecordValue(parentRecord, groupedColumn.dataType, groupedColumn.name);

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

    private _getGroupRecordIds(ids: string[]): string[] {
        return ids.filter(id => id.startsWith('group_'));
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
                alignment: this.getColumnAlignment(column),
                isEditable: this._isColumnEditable(column),
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

    private _isColumnEditable(column: IColumn): boolean {
        //only allow editing if specifically allowed
        if (!this.getParameters().EnableEditing?.raw) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        //these field types do not support editing
        switch (column.dataType) {
            case DataTypes.File:
            case DataTypes.Image: {
                return false;
            }
        }
        return column.metadata?.IsValidForUpdate ?? false;
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

    private get _dataset() {
        return this.getDataset();
    }
}