import { Attribute, Client, Constants, DataType, DataTypes, IColumn, ICommand, ICustomColumnControl, ICustomColumnFormatting, IDataset, IRecord, Sanitizer } from "@talxis/client-libraries";
import { IGrid, IGridParameters } from "../../interfaces";
import { Selection } from "../../selection/model/Selection";
import { KeyHoldListener } from "../services/KeyListener";
import { CHECKBOX_COLUMN_KEY } from "../../constants";
import { IGridColumn } from "../interfaces/IGridColumn";
import { BaseControls, IFluentDesignState } from "../../../../utils";
import { IBinding } from "../../../NestedControlRenderer/interfaces";
import { merge } from "merge-anything";
import { Aggregation } from "../../aggregation/Aggregation";
import { ITranslation } from "../../../../hooks/useControlLabels";
import { gridTranslations } from "../../translations";
import { ITheme, Theming } from "@talxis/react-components";
import { getTheme } from "@fluentui/react";
import { Filtering, Sorting } from "../../../../utils/dataset/extensions";

interface IGridDependencies {
    labels: Required<ITranslation<typeof gridTranslations>>;
    onGetProps: () => IGrid;
    theme?: ITheme;
}

interface IPCFContext extends Omit<ComponentFramework.Context<any, any>, 'fluentDesignLanguage'> {
    fluentDesignLanguage?: IFluentDesignState
}

export class Grid2 {
    private _getProps: () => IGrid;
    private _sorting: Sorting;
    private _selection: Selection;
    private _aggregation: Aggregation;
    private _filtering: Filtering;
    private _labels: Required<ITranslation<typeof gridTranslations>>;
    private _theme: ITheme;
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
        this._selection = new Selection({
            onGetDataset: () => this.getDataset(),
            onGetSelectionType: () => this.getSelectionType()
        })
        this._filtering = new Filtering(() => this.getDataset())
    }

    public getGridColumns(): IGridColumn[] {
        const gridColumns: IGridColumn[] = this.getDataset().columns.map(column => {
            const sorted = this.getDataset().sorting?.find(sort => sort.name === column.name);
            return {
                ...column,
                alignment: this.getColumnAlignment(column),
                isEditable: this._isColumnEditable(column),
                isRequired: this._isColumnRequired(column),
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
        this._injectCheckboxColumn(gridColumns);
        return gridColumns;
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
    public getSelection(): Selection {
        return this._selection;
    }
    public getAggregation(): Aggregation {
        return this._aggregation
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
                value: this._getBindingValue(record, column),
                formattedValue: record.getFormattedValue(column.name),
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
        const aggregation = this.getAggregation().getAggregationForColumn(column.name);
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
            raw: record.getDataProvider().getSummarizationType() !== 'none' ? aggregation?.aggregationFunction ?? null : null,
            type: DataTypes.SingleLineText
        }
        parameters.RecordCommands = {
            raw: recordCommands ?? [],
            type: DataTypes.Object
        }
        switch (column.dataType) {
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding':
            case 'Lookup.Simple': {
                parameters.IsInlineNewEnabled = {
                    raw: false,
                    type: DataTypes.TwoOptions
                }
                break;
            }
            case 'SingleLine.Email':
            case 'SingleLine.Phone':
            case 'SingleLine.URL': {
                parameters.EnableTypeSuffix = {
                    raw: false,
                    type: DataTypes.TwoOptions
                }
                break;
            }
            case 'OptionSet':
            case 'TwoOptions':
            case 'MultiSelectPicklist': {
                parameters.EnableOptionSetColors = {
                    raw: this.optionSetColorsEnabled(),
                    type: DataTypes.TwoOptions
                }
                break;
            }
        }
        return parameters;
    }

    public getFieldFormatting(record: IRecord, columnName: string): Required<ICustomColumnFormatting> {
        //get the latest reference - ag grid might still be referencing the old one and give us wrong index
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
        if (column.name.endsWith('__virtual')) {
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
        if (column.name.endsWith('__virtual')) {
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


    private _getBindingValue(record: IRecord, column: IColumn) {
        let value = record.getValue(column.name);
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

    private _injectCheckboxColumn(gridColumns: IGridColumn[]) {
        if (this.getSelectionType() !== 'none') {
            gridColumns.unshift({
                name: CHECKBOX_COLUMN_KEY,
                alias: CHECKBOX_COLUMN_KEY,
                dataType: DataTypes.SingleLineText,
                alignment: 'center',
                displayName: '',
                isEditable: false,
                isFilterable: false,
                isRequired: false,
                isResizable: false,
                canBeAggregated: false,
                disableSorting: true,
                isSorted: false,
                isSortedDescending: false,
                order: 0,
                visualSizeFactor: 45,
                getEntityName: () => this._getColumnEntityName(CHECKBOX_COLUMN_KEY)
            });
        }
    }
}



const DEFAULT_ROW_HEIGHT = 42;

export interface IGridHeightSettings {
    isAutoHeightEnabled: boolean;
    height?: string;
}

export class Grid {
    private _props: IGrid;
    private _dataset: IDataset
    private _pcfContext: ComponentFramework.Context<any>;
    private _columns: IGridColumn[] = [];
    //used for optimization
    private _previousRecordsReference: {
        [id: string]: IRecord;
    } = {};
    //TODO: fix types
    private _labels: any;
    private _shouldRerender: boolean = false;
    private _records: IRecord[] = [];
    //TODO: the dependencies might not have fully loaded grid
    //need to make sure that the grid is initialized before creating them
    private _dependencies: {
        filtering: Filtering,
        sorting: Sorting,
        selection: Selection,
        aggregation: Aggregation
    };
    private _usesNestedPcfs: boolean = false;
    private _client = new Client();
    private _isUpdateScheduled: boolean = false;

    public readonly keyHoldListener: KeyHoldListener;

    constructor(props: IGrid, labels: any, keyHoldListener: KeyHoldListener) {
        this._props = props;
        this._dataset = props.parameters.Grid;
        this._pcfContext = props.context;
        this._labels = labels;
        this.keyHoldListener = keyHoldListener;

        this._dependencies = {
            filtering: new Filtering(this as any),
            selection: new Selection(this as any),
            sorting: new Sorting(this as any),
            aggregation: new Aggregation(this as any)
        }

    };
    public get isNavigationEnabled() {
        //enabled by default
        return this.parameters.EnableNavigation?.raw !== false;
    }
    public get isEditable() {
        return this._columns.find(x => x.isEditable) ? true : false;
    }
    public get parameters() {
        return this._props.parameters
    }
    public get error() {
        return this._dataset.error;
    }
    public get errorMessage() {
        return this._dataset.errorMessage
    }
    public get labels() {
        return this._labels;
    }
    public get dataset() {
        return this._dataset;
    }
    public get pcfContext() {
        return this._pcfContext;
    }
    public get props() {
        return this._props;
    }
    public get columns() {
        return this._columns;
    }
    public get records() {
        return this._records
    }
    public get sorting() {
        return this._dependencies.sorting;
    }
    public get filtering() {
        return this._dependencies.filtering;
    }
    public get aggregation() {
        return this._dependencies.aggregation;
    }
    public get selection() {
        return this._dependencies.selection;
    }
    public get paging() {
        return this._dataset.paging
    }
    public get shouldRerender() {
        return this._shouldRerender;
    }
    public get loading() {
        return this._dataset.loading;
    }
    public get state() {
        return this._props.state;
    }
    public get enableOptionSetColors() {
        return this.parameters.EnableOptionSetColors?.raw === true;
    }
    public get linking() {
        return this.dataset.linking;
    }

    public get isZebraEnabled() {
        return this.parameters.EnableZebra?.raw !== false;
    }

    public get inlineRibbonButtonIds() {
        const idString = this.parameters.InlineRibbonButtonIds?.raw;
        if (!idString) {
            return undefined;
        }
        return idString.split(',');
    }

    public get rowHeight() {
        let height = this.parameters.RowHeight?.raw;
        if (!height) {
            height = DEFAULT_ROW_HEIGHT;
        }
        return height;
    }

    public getHeightSettings(): IGridHeightSettings {
        if (this.parameters.Height?.raw) {
            return {
                isAutoHeightEnabled: false,
                height: this.parameters.Height?.raw
            }
        }
        if (this._records.length <= 15) {
            return {
                isAutoHeightEnabled: true
            }
        }
        return {
            isAutoHeightEnabled: false,
            //+2 for header and footer
            height: `${this.rowHeight * 17 + 5}px`
        }


    }

    public getClient() {
        return this._client;
    }

    public updateDependencies(props: IGrid): void {
        this._props = props;
        this._dataset = props.parameters.Grid;
        this._pcfContext = props.context;
        if (this._previousRecordsReference !== this._dataset.records) {
            this._records = Object.values(this._dataset.records);
            this._previousRecordsReference = this._dataset.records;
            this._isUpdateScheduled = true;
            queueMicrotask(() => {
                this._isUpdateScheduled = false;
            })
        }
        Object.values(this._dependencies).map(dep => {
            //dep.onDependenciesUpdated()
        })
        this._shouldRerender = !this.shouldRerender;
    }

    public isUpdateScheduled() {
        return this._isUpdateScheduled
    }
    public async refreshColumns(): Promise<IGridColumn[]> {
        const gridColumns: IGridColumn[] = [];
        for (const column of this._dataset.columns) {
            const sorted = this._dataset.sorting?.find(sort => sort.name === column.name);
            const gridColumn: IGridColumn = {
                ...column,
                alignment: this.getColumnAlignment(column),
                isEditable: this._isColumnEditable(column),
                isRequired: this._isColumnRequired(column),
                isFilterable: this._isColumnFilterable(column),
                disableSorting: !this._isColumnSortable(column),
                canBeAggregated: this._canColumnBeAggregated(column),
                isSortedDescending: sorted?.sortDirection === 1 ? true : false,
                type: this._getColumnType(column),
                isResizable: true,
                isSorted: sorted ? true : false,
                //@ts-ignore
                isFiltered: false,
                getEntityName: () => this._getColumnEntityName(column.name)
            }
            //const condition = await this.filtering.condition(gridColumn);
            //@ts-ignore
            gridColumn.isFiltered = condition.isAppliedToDataset;
            gridColumns.push(gridColumn);
        }
        //@ts-ignore
        if (this.selection.type !== undefined) {
            gridColumns.unshift({
                name: CHECKBOX_COLUMN_KEY,
                alias: CHECKBOX_COLUMN_KEY,
                dataType: DataTypes.SingleLineText,
                alignment: 'center',
                displayName: '',
                isEditable: false,
                isFilterable: false,
                //@ts-ignore
                isFiltered: false,
                isRequired: false,
                isResizable: false,
                canBeAggregated: false,
                disableSorting: true,
                isSorted: false,
                isSortedDescending: false,
                order: 0,
                visualSizeFactor: 45,
                getEntityName: () => this._getColumnEntityName(CHECKBOX_COLUMN_KEY)
            });
        }
        this._columns = gridColumns;
        return gridColumns;
    }

    public getTotalVisibleColumnsWidth(): number {
        let totalWidth = 0;
        this._columns.filter(x => !x.isHidden).map(col => {
            totalWidth = totalWidth + (col.visualSizeFactor ?? 0);
        })
        return totalWidth;
    }

    public onNotifyOutputChanged(record: IRecord, column: IColumn, editing: boolean, newValue: any, rerenderCell: () => void) {
        record.setValue(column.name, newValue);
        if (!editing) {
            this.pcfContext.factory.requestRender();
            return;
        }
        setTimeout(() => {
            rerenderCell();
        }, 0);
    }

    public setUsesNestedPcfs() {
        this._usesNestedPcfs = true;
    }


    public getFieldBindingParameters(record: IRecord, column: IGridColumn, editing: boolean, recordCommands?: ICommand[]) {
        const aggregation = this.aggregation.getAggregationForColumn(column.name);
        const parameters: any = {
            Dataset: {
                raw: this.dataset,
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
        parameters.EnableNavigation = {
            raw: this.isNavigationEnabled,
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
            raw: record.getDataProvider().getSummarizationType() !== 'none' ? aggregation?.aggregationFunction ?? null : null,
            type: DataTypes.SingleLineText
        }
        parameters.RecordCommands = {
            raw: recordCommands ?? [],
            type: DataTypes.Object
        }
        switch (column.dataType) {
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding':
            case 'Lookup.Simple': {
                parameters.IsInlineNewEnabled = {
                    raw: false,
                    type: DataTypes.TwoOptions
                }
                break;
            }
            case 'SingleLine.Email':
            case 'SingleLine.Phone':
            case 'SingleLine.URL': {
                parameters.EnableTypeSuffix = {
                    raw: false,
                    type: DataTypes.TwoOptions
                }
                break;
            }
            case 'OptionSet':
            case 'TwoOptions':
            case 'MultiSelectPicklist': {
                parameters.EnableOptionSetColors = {
                    raw: this.enableOptionSetColors,
                    type: DataTypes.TwoOptions
                }
                break;
            }
        }
        return parameters;
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

    public destroy() {
        this._previousRecordsReference = {};
        this._records.length = 0;
        this.keyHoldListener.destroy();
        //@ts-ignore - internal types
        //if any nested PCF has been loaded and we are in Power Apps, do a page refresh to prevent memory leaks
        //this should be moved to dataset control
        if (this._usesNestedPcfs && !this._client.isTalxisPortal()) {
            //leaving this uncommented causes memory leak
            //the reload is bad UX when view switcher is active since every view switch destroys the control in Power Apps
            //we cannot gradually unmount nested PCF due to performance (all nested PCF get renderer => lag, blinking)
            //Power Apps tries to clear the child elements, but the array containing all elements does not get cleared
            //the method for it won't trigger since it's part of a setState that does not finish when we navigate away
            //location.reload();
        }
    }

    private _isColumnEditable(column: IColumn): boolean {
        //only allow editing if specifically allowed
        if (!this._props.parameters.EnableEditing?.raw) {
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
        if (!this.parameters.EnableEditing?.raw) {
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
        if (column.name.endsWith('__virtual')) {
            return false;
        }
        if (this._props.parameters.EnableSorting?.raw === false) {
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
        if (this.props.parameters.EnableFiltering?.raw === false) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        //by default, do not make virtual columns filterable unless explicitly set
        if (column.name.endsWith('__virtual')) {
            return column.metadata?.isFilterable ?? false;
        }
        return column.metadata?.isFilterable ?? true;
    }
    private _getColumnEntityName(columnName: string) {
        const entityAliasName = Attribute.GetLinkedEntityAlias(columnName);
        if (!entityAliasName) {
            return this.dataset.getTargetEntityType();
        }
        return this.dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
    }

    private _canColumnBeAggregated(column: IColumn): boolean {
        //aggregations disabled by default
        if (this.parameters.EnableAggregation?.raw !== true) {
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
}