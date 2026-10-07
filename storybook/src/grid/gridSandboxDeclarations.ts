/** Ambient types for the Monaco editor behind the live Grid examples. */
export const gridSandboxDeclarations = `
declare const React: typeof import('react');
declare const dayjs: typeof import('dayjs');
declare const confetti: typeof import('canvas-confetti');
/** Sanitizes HTML before it is drawn, from dompurify. */
declare const DOMPurify: typeof import('dompurify').default;
/** react-simple-wysiwyg's HTML editor, with its toolbar. */
declare const DefaultEditor: typeof import('react-simple-wysiwyg').DefaultEditor;
type Dayjs = import('dayjs').Dayjs;

/** What React's types say about JSX, for an editor that cannot load them. */
declare namespace JSX {
    interface ElementAttributesProperty {
        props: {};
    }
    interface IntrinsicAttributes {
        key?: React.Key | null;
    }
}

declare const ActionButton: typeof import('@fluentui/react').ActionButton;
declare const Checkbox: typeof import('@fluentui/react').Checkbox;
declare const ChoiceGroup: typeof import('@fluentui/react').ChoiceGroup;
/** Fluent's command bar, with its menus drawn in the application's theme. */
declare const CommandBar: (props: import('@fluentui/react').ICommandBarProps) => JSX.Element;
declare const DefaultButton: typeof import('@fluentui/react').DefaultButton;
declare const Dropdown: typeof import('@fluentui/react').Dropdown;
declare const FontWeights: typeof import('@fluentui/react').FontWeights;
declare const Icon: typeof import('@fluentui/react').Icon;
declare const IconButton: typeof import('@fluentui/react').IconButton;
declare const Label: typeof import('@fluentui/react').Label;
declare const Link: typeof import('@fluentui/react').Link;
declare const mergeStyleSets: typeof import('@fluentui/react').mergeStyleSets;
declare const MessageBar: typeof import('@fluentui/react').MessageBar;
declare const MessageBarButton: typeof import('@fluentui/react').MessageBarButton;
declare const MessageBarType: typeof import('@fluentui/react').MessageBarType;
declare const Panel: typeof import('@talxis/base-controls').Panel;
declare const PanelType: typeof import('@fluentui/react').PanelType;
declare const PrimaryButton: typeof import('@fluentui/react').PrimaryButton;
declare const ProgressIndicator: typeof import('@fluentui/react').ProgressIndicator;
declare const SearchBox: typeof import('@fluentui/react').SearchBox;
declare const Separator: typeof import('@fluentui/react').Separator;
declare const Slider: typeof import('@fluentui/react').Slider;
declare const Spinner: typeof import('@fluentui/react').Spinner;
declare const Stack: typeof import('@fluentui/react').Stack;
/** Fluent's Text component, merged into the DOM's Text type. */
declare var Text: { new (data?: string): Text; prototype: Text };
interface Text extends React.Component<ITextProps> {
    props: ITextProps;
}
declare const TextField: typeof import('@fluentui/react').TextField;
declare const Toggle: typeof import('@fluentui/react').Toggle;
declare const TooltipHost: typeof import('@fluentui/react').TooltipHost;

type IButtonProps = import('@fluentui/react').IButtonProps;
type ICalloutProps = import('@fluentui/react').ICalloutProps;
type ICheckboxProps = import('@fluentui/react').ICheckboxProps;
type IChoiceGroupOption = import('@fluentui/react').IChoiceGroupOption;
type ICommandBarItemProps = import('@fluentui/react').ICommandBarItemProps;
type ICommandBarProps = import('@fluentui/react').ICommandBarProps;
type IContextualMenuItem = import('@fluentui/react').IContextualMenuItem;
type IContextualMenuProps = import('@fluentui/react').IContextualMenuProps;
type IDropdownOption = import('@fluentui/react').IDropdownOption;
type IIconProps = import('@fluentui/react').IIconProps;
type IMessageBarProps = import('@fluentui/react').IMessageBarProps;
type IShimmerProps = import('@fluentui/react').IShimmerProps;
type ISpinnerProps = import('@fluentui/react').ISpinnerProps;
type ITextProps = import('@fluentui/react').ITextProps;
type ITooltipHostProps = import('@fluentui/react').ITooltipHostProps;
type Target = import('@fluentui/react').Target;

declare namespace ComponentFramework {
    interface EntityReference {
        id: { guid: string };
        etn?: string;
        name: string;
    }
    interface Context<TInputs = any, TOutputs = any> {
        client: any;
        device: any;
        factory: any;
        formatting: any;
        mode: any;
        navigation: any;
        resources: any;
        userSettings: any;
        utils: any;
        webAPI: any;
        parameters: TInputs;
        updatedProperties: string[];
        events: any;
        fluentDesignLanguage?: any;
    }
    namespace PropertyHelper.DataSetApi {
        namespace Types {
            type ConditionOperator = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 22 | 23 | 25 | 26 | 27 | 28 | 29 | 33 | 34 | 37 | 38 | 49 | 70 | 75 | 76 | 77 | 78 | 79 | 87;
            /** 0 for and, 1 for or. */
            type FilterOperator = 0 | 1;
            /** 0 for ascending, 1 for descending. */
            type SortDirection = -1 | 0 | 1;
        }
        interface SortStatus {
            name: string;
            sortDirection: Types.SortDirection;
        }
        interface ConditionExpression {
            attributeName: string;
            conditionOperator: Types.ConditionOperator;
            value: string | string[];
            entityAliasName?: string;
        }
        interface FilterExpression {
            conditions: ConditionExpression[];
            filterOperator: Types.FilterOperator;
            filters?: FilterExpression[];
        }
    }
}

interface IEventEmitter<T extends { [K in keyof T]: (...args: any[]) => any }> {
    addEventListener<K extends keyof T>(event: K, callback: T[K]): void;
    removeEventListener<K extends keyof T>(event: K, callbackToRemove: T[K]): void;
    dispatchEvent<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean;
    clearEventListeners<K extends keyof T>(eventsToIgnore?: Set<K>): void;
}

/** Runs in place of the default action handed to it as defaultAction. */
type IInterceptor<T extends { [K in keyof T]: (parameters: any) => any }, K extends keyof T> = (parameters: Parameters<T[K]>[0], defaultAction: (parameters: Parameters<T[K]>[0]) => ReturnType<T[K]>) => ReturnType<T[K]>;

type DataType = 'SingleLine.Text' | 'SingleLine.TextArea' | 'SingleLine.Email' | 'SingleLine.Phone' | 'SingleLine.URL' | 'Multiple' | 'Whole.None' | 'Decimal' | 'DateAndTime.DateAndTime' | 'DateAndTime.DateOnly' | 'Currency' | 'OptionSet' | 'MultiSelectPicklist' | 'TwoOptions' | 'Lookup.Simple' | 'Lookup.Owner' | 'Lookup.Customer' | 'Lookup.Regarding' | 'Whole.Language' | 'Whole.Duration' | 'Whole.TimeZone' | 'File' | 'Image' | 'Enum' | 'Object';

declare class DataTypes {
    static readonly SingleLineText: 'SingleLine.Text';
    static readonly SingleLineTextArea: 'SingleLine.TextArea';
    static readonly SingleLineEmail: 'SingleLine.Email';
    static readonly SingleLinePhone: 'SingleLine.Phone';
    static readonly SingleLineUrl: 'SingleLine.URL';
    static readonly Multiple: 'Multiple';
    static readonly WholeNone: 'Whole.None';
    static readonly Decimal: 'Decimal';
    static readonly Fp: 'Decimal';
    static readonly DateAndTimeDateAndTime: 'DateAndTime.DateAndTime';
    static readonly DateAndTimeDateOnly: 'DateAndTime.DateOnly';
    static readonly Currency: 'Currency';
    static readonly OptionSet: 'OptionSet';
    static readonly MultiSelectOptionSet: 'MultiSelectPicklist';
    static readonly TwoOptions: 'TwoOptions';
    static readonly LookupSimple: 'Lookup.Simple';
    static readonly LookupOwner: 'Lookup.Owner';
    static readonly LookupCustomer: 'Lookup.Customer';
    static readonly LookupRegarding: 'Lookup.Regarding';
    static readonly WholeLanguage: 'Whole.Language';
    static readonly WholeDuration: 'Whole.Duration';
    static readonly WholeTimeZone: 'Whole.TimeZone';
    static readonly File: 'File';
    static readonly Image: 'Image';
    static readonly Enum: 'Enum';
    static readonly Object: 'Object';
    static IsLookup(dataType: DataType): boolean;
    static GetAll(): Exclude<DataType, 'Lookup.Regarding'>[];
}

type OperatorName = 'like' | 'not-like' | 'eq' | 'ne' | 'not-null' | 'null' | 'yesterday' | 'today' | 'tomorrow' | 'last-seven-days' | 'next-seven-days' | 'last-week' | 'this-week' | 'last-month' | 'this-month' | 'on' | 'on-or-before' | 'on-or-after' | 'last-year' | 'this-year' | 'last-x-days' | 'next-x-days' | 'last-x-months' | 'next-x-months' | 'gt' | 'ge' | 'le' | 'lt' | 'contain-values' | 'not-contain-values' | 'begins-with' | 'not-begin-with' | 'ends-with' | 'not-end-with' | 'in' | 'not-in' | 'between' | 'not-between';

interface IOperator {
    Name: OperatorName;
    Value: ComponentFramework.PropertyHelper.DataSetApi.Types.ConditionOperator;
}

declare class Operators {
    static readonly Like: IOperator;
    static readonly NotLike: IOperator;
    static readonly Equal: IOperator;
    static readonly DoesNotEqual: IOperator;
    static readonly NotNull: IOperator;
    static readonly ContainsData: IOperator;
    static readonly DoesNotContainData: IOperator;
    static readonly Yesterday: IOperator;
    static readonly Today: IOperator;
    static readonly Tomorrow: IOperator;
    static readonly Last7Days: IOperator;
    static readonly Next7Days: IOperator;
    static readonly LastWeek: IOperator;
    static readonly ThisWeek: IOperator;
    static readonly LastMonth: IOperator;
    static readonly ThisMonth: IOperator;
    static readonly On: IOperator;
    static readonly OnOrBefore: IOperator;
    static readonly OnOrAfter: IOperator;
    static readonly LastYear: IOperator;
    static readonly ThisYear: IOperator;
    static readonly LastXDays: IOperator;
    static readonly NextXDays: IOperator;
    static readonly LastXMonths: IOperator;
    static readonly NextXMonths: IOperator;
    static readonly GreaterThan: IOperator;
    static readonly GreaterThanOrEqual: IOperator;
    static readonly LessThanOrEqual: IOperator;
    static readonly LessThan: IOperator;
    static readonly ContainValues: IOperator;
    static readonly DoesNotContainValues: IOperator;
    static readonly BeginsWith: IOperator;
    static readonly DoesNotBeginWith: IOperator;
    static readonly EndsWith: IOperator;
    static readonly DoesNotEndWith: IOperator;
    static readonly In: IOperator;
    static readonly NotIn: IOperator;
    static readonly Between: IOperator;
    static readonly NotBetween: IOperator;
    static GetOperatorsForDataType(dataType: DataType): IOperator[];
    static GetValueFromName(name: OperatorName): ComponentFramework.PropertyHelper.DataSetApi.Types.ConditionOperator;
    static GetNameFromValue(value: ComponentFramework.PropertyHelper.DataSetApi.Types.ConditionOperator): string;
}

/** The operators a filter expression combines its conditions with. */
declare class Type {
    static readonly And: { Name: 'and' | 'or'; Value: 0 | 1 };
    static readonly Or: { Name: 'and' | 'or'; Value: 0 | 1 };
    static GetValueFromName(name: 'and' | 'or'): 0 | 1;
    static GetNameFromValue(value: 0 | 1): 'and' | 'or';
}

type AggregationFunction = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'countcolumn';

/** none for a record, grouping for a group row, aggregation for the totals row. */
type DataProviderSummarizationType = 'none' | 'aggregation' | 'grouping';

interface IAttributeMetadata {
    IsValidForGrid?: boolean;
    /** The provider defaults it to true for most data types. */
    IsValidForUpdate?: boolean;
    /** 1 (system) or 2 (application) marks the column as required. */
    RequiredLevel?: 0 | 1 | 2 | 3;
    CanBeGrouped?: boolean;
    SupportedAggregations?: AggregationFunction[];
    SupportedFilterConditionOperators?: IOperator['Value'][];
    OptionSet?: { Color: string; Label: string; Value: number }[];
    IsGroupedOrAggregatedVirtualColumn?: boolean;
    LogicalName?: string;
    DisplayName?: string;
    Precision?: number;
    Behavior?: number;
    [key: string]: any;
}

interface ICustomColumnControl {
    /** A base control such as OptionSet, or a control registered in Dataverse. */
    name?: string;
    appliesTo: 'renderer' | 'editor' | 'both';
    bindings?: { [name: string]: { value: any; type: DataType } };
}

interface IColumn {
    name: string;
    dataType: DataType;
    displayName?: string;
    alias?: string;
    /** The grid writes it back when the user moves a column. */
    order?: number;
    /** The width in pixels, written back when the user resizes the column. */
    visualSizeFactor?: number;
    isHidden?: boolean;
    /** Whether the value is drawn as a link to the record. */
    isPrimary?: boolean;
    disableSorting?: boolean;
    isVirtual?: boolean;
    metadata?: IAttributeMetadata;
    type?: 'data' | 'action';
    aggregation?: { aggregationFunction: AggregationFunction; columnName?: string; alias?: string };
    grouping?: { isGrouped: boolean; alias?: string; ungroupedOrder?: number };
    controls?: ICustomColumnControl[];
}

interface IRawRecord {
    [columnName: string]: any;
}

interface IFieldValidationResult {
    error: boolean;
    errorMessage: string;
}

interface IRecordSaveOperationResult {
    recordId: string;
    success: boolean;
    /** The columns the save wrote. */
    fields: string[];
    errors?: { fieldName?: string; message: string }[];
}

interface IRecordDeleteOperationResult {
    recordId: string;
    success: boolean;
    errorMessage?: string;
}

interface IControlNotificationAction {
    message?: string;
    actions: (() => void)[];
    iconName?: string;
}

/** A notification on a record's field, drawn as a command in its cell. */
interface IAddControlNotificationOptions {
    uniqueId: string;
    /** Only the first message is shown. */
    messages: string[];
    notificationLevel?: 'ERROR' | 'RECOMMENDATION';
    text?: string;
    iconName?: string;
    /** renderedInOverflow puts the command in the cell's overflow menu. */
    buttonProps?: Partial<ICommandBarItemProps> & { renderedInOverflow?: boolean };
    /** With exactly one action, a click runs it. */
    actions?: IControlNotificationAction[];
}

interface ICustomColumnFormatting {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    className?: string;
    themeOverride?: any;
}

interface ICustomColumnComponent {
    key: string;
    onRender: (defaultControlProps: any, theme: any, container: HTMLDivElement) => void;
    onUnmount: (container: HTMLDivElement) => void;
}

interface IControlParameters {
    [key: string]: any;
    Dataset?: any;
    Record?: IRecord;
    Column?: IColumn;
    EnableNavigation?: { raw: boolean };
    ColumnAlignment?: { raw: 'left' | 'center' | 'right' | undefined };
    IsPrimaryColumn?: { raw: boolean };
    ShowErrorMessage?: { raw: boolean };
    CellType?: { raw: 'editor' | 'renderer' };
    AutoFocus?: { raw: boolean };
    IsInlineNewEnabled?: { raw: boolean };
    EnableTypeSuffix?: { raw: boolean };
    EnableOptionSetColors?: { raw: boolean };
    PrefixIcon?: { raw: string };
    SuffixIcon?: { raw: string };
}

interface IRecordUiExpression {
    setNotificationsExpression(columnName: string, notificationExpression: () => IAddControlNotificationOptions[]): void;
    setLoadingExpression(columnName: string, loadingExpression: () => boolean): void;
    setCustomControlsExpression(columnName: string, customControlExpression: (defaultCustomControls: ICustomColumnControl[]) => ICustomColumnControl[]): void;
    /** A text colour left out is worked out from the background. */
    setCustomFormattingExpression(columnName: string, customFormattingExpression: (cellTheme: any) => ICustomColumnFormatting | undefined): void;
    setControlParametersExpression(columnName: string, controlParametersExpression: (defaultParameters: IControlParameters) => IControlParameters): void;
    setCustomControlComponentExpression(columnName: string, customControlComponentExpression: () => ICustomColumnComponent | undefined): void;
}

interface IRecordExpressions {
    ui: IRecordUiExpression;
    setValidationExpression(columnName: string, validator: () => IFieldValidationResult): void;
    /** Returning undefined falls back to the raw value. */
    setValueExpression(columnName: string, valueExpression: () => any): void;
    setFormattedValueExpression(columnName: string, valueExpression: (defaultFormattedValue: string | null) => string | null): void;
    setDisabledExpression(columnName: string, disabledExpression: () => boolean): void;
    setRequiredLevelExpression(columnName: string, requiredLevelExpression: () => 'none' | 'recommended' | 'required'): void;
    setCurrencySymbolExpression(columnName: string, currencySymbolExpression: () => string): void;
}

interface IRecordEvents {
    onFieldValueChanged: (columnName: string, newValue: any) => void;
    onBeforeSaved: () => void;
    onAfterSaved: (result: IRecordSaveOperationResult) => void;
}

interface IColumnUi {
    getNotifications(): IAddControlNotificationOptions[];
    isLoading(): boolean;
    getControlParameters(currentParameters: IControlParameters): IControlParameters;
    getCustomControls(defaultCustomControls: ICustomColumnControl[]): ICustomColumnControl[];
    getCustomFormatting(cellTheme: any): ICustomColumnFormatting | undefined;
    getCustomControlComponent(): ICustomColumnComponent | undefined;
}

interface ISecurityValues {
    editable: boolean;
    readable: boolean;
    secured: boolean;
    requiredLevel?: 'none' | 'recommended' | 'required';
}

interface IColumnInfo extends IFieldValidationResult {
    security: ISecurityValues;
    type: string;
    ui: IColumnUi;
}

/** What the record's expressions say about a field's UI. */
interface FieldUi {
    getNotifications(): IAddControlNotificationOptions[];
    isLoading(): boolean;
    getControlParameters(defaultParameters: IControlParameters): IControlParameters;
    getCustomControls(defaultCustomControls: ICustomColumnControl[]): ICustomColumnControl[];
    getCustomFormatting(cellTheme: any): ICustomColumnFormatting;
    getCustomControlComponent(): ICustomColumnComponent | undefined;
}

interface IField {
    ui: FieldUi;
    getColumn(): IColumn;
    setValue(value: any): void;
    getValue(): any;
    getFormattedValue(): string | null;
    isDirty(): boolean;
    isValid(): IFieldValidationResult;
    getRequiredLevel(): 'none' | 'recommended' | 'required';
    isDisabled(): boolean;
    getCurrencySymbol(): string;
    getRecord(): IRecord;
    getColumnInfo(): IColumnInfo;
    setCustomProperty(name: string, value: any): void;
    getCustomProperty(name: string): any;
    destroy(): void;
}

interface IRecord extends IEventEmitter<IRecordEvents> {
    getRecordId(): string;
    getNamedReference(): ComponentFramework.EntityReference;
    getValue(columnName: string): any;
    getFormattedValue(columnName: string): string | null;
    /** Changes the value without saving it. */
    setValue(columnName: string, value: any): void;
    getField(columnName: string): IField;
    /** Refuses to save while a value is invalid. */
    save(): Promise<IRecordSaveOperationResult>;
    getColumnInfo(columnName: string): IColumnInfo;
    isValid(): boolean;
    isDirty(columnName?: string): boolean;
    getIndex(): number;
    expressions: IRecordExpressions;
    getCurrencySymbol(columnName: string): string;
    /** The values as loaded, before any change. */
    getRawData(): IRawRecord;
    /** The values with the unsaved changes. */
    toRawData(): IRawRecord;
    destroy(): void;
    getDataProvider(): IDataProvider;
    isSaving(): boolean;
    getSummarizationType(): DataProviderSummarizationType;
    getFields(): IField[];
    clearChanges(): void;
    setRawData(newRawData: IRawRecord): void;
    /** Whether the record was made with newRecord and is not saved yet. */
    isNew(): boolean;
    /** An inactive record is locked in the grid. */
    isActive(): boolean;
    getColumns(): IColumn[];
}

interface IAggregationMetadata {
    aggregationFunction: AggregationFunction;
    alias: string;
    columnName: string;
    /** Only needed to show several totals of one column. */
    uiColumnName?: string;
}

interface IAggregation {
    addAggregation(aggregation: IAggregationMetadata): void;
    clear(): void;
    getAggregations(): IAggregationMetadata[];
    getAggregation(alias: string): IAggregationMetadata | undefined;
    removeAggregation(alias: string): void;
}

interface IGroupByMetadata {
    alias: string;
    columnName: string;
}

interface IGrouping {
    getGroupBys(): IGroupByMetadata[];
    getGroupBy(alias: string): IGroupByMetadata | undefined;
    /** Groups by the column under the alias columnName_group, ignoring alias. */
    addGroupBy(groupBy: IGroupByMetadata, order?: number): void;
    removeGroupBy(alias: string): void;
    clear(): void;
}

interface ICommand {
    canExecute: boolean;
    children: any[];
    commandId: string;
    commandButtonId: string;
    controlType: any;
    icon: string;
    label: string;
    shouldBeVisible: boolean;
    tooltip: string;
    execute(): Promise<void>;
}

interface IRetrieveRecordCommandOptions {
    recordIds?: string[];
    specificCommands?: string[];
    filterByPriority?: boolean;
    useNestedFormat?: boolean;
    refreshAllRules?: boolean;
    isInline?: boolean;
    isGrouped?: boolean;
}

interface IAvailableColumnOptions {
    entityName?: string;
}

interface IAvailableRelatedColumn extends IColumn {
    relatedEntityName: string;
    relatedEntityPrimaryIdAttribute: string;
    relatedEntityDisplayName: string;
}

interface ICurrency {
    currencysymbol: string;
    transactioncurrencyid: string;
    currencyname: string;
}

interface IEventBubbleOptions {
    onRecordLoaded?: boolean;
    onRecordColumnValueChanged?: boolean;
    onAfterRecordSaved?: boolean;
    onAfterSaved?: boolean;
    onBeforeRecordSaved?: boolean;
}

interface IOpenDatasetItemContext {
    /** The column the record was opened from. */
    columnName?: string;
}

interface IDataProviderEventListeners {
    onNewDataLoaded: () => void;
    onBeforeNewDataLoaded: () => void;
    onFirstDataLoaded: () => void;
    /** Fired for each record a load brings in. */
    onRecordLoaded: (record: IRecord) => void;
    onRecordColumnValueChanged: (record: IRecord, columnName: string, newValue: any) => void;
    onRecordsSelected: (selectedRecordIds: string[]) => void;
    onPageSizeChanged: (pageSize: number) => void;
    onDestroyed: () => void;
    onError: (errorMessage: string, details?: any) => void;
    onLoading: (isLoading: boolean) => void;
    onBeforeFirstDataLoaded: () => void;
    onBeforeRecordSaved: (record: IRecord) => void;
    onAfterRecordSaved: (result: IRecordSaveOperationResult) => void;
    /** The legacy client API module redraws the cells and headers on it. */
    onRenderRequested: () => void;
    onRecordCommandsRetrieved: (commands: ICommand[], options?: IRetrieveRecordCommandOptions) => void;
    /** Fired once save() has saved every record. */
    onAfterSaved: (results: IRecordSaveOperationResult[]) => void;
    onNestedProviderPagingLimitReached: () => void;
}

interface IDataProviderInterceptors {
    onFirstDataLoad: () => Promise<void>;
    onOpenDatasetItem: (entityReference: ComponentFramework.EntityReference, context?: IOpenDatasetItemContext) => void;
    /** Resolve success: false with errors to report a failure. */
    onRecordSave: (record: IRecord) => Promise<IRecordSaveOperationResult>;
    onRetrieveRecordCommand: (options?: IRetrieveRecordCommandOptions) => Promise<ICommand[]>;
    onGetAvailableColumns: (options?: IAvailableColumnOptions) => Promise<IColumn[]>;
    onGetAvailableRelatedColumns: () => Promise<IAvailableRelatedColumn[]>;
    /** Has to return copies of the columns it changes. */
    columns: (columns: IColumn[]) => IColumn[];
}

interface IDataProviderProperties {
    /** Overridden by the grouping module's type. */
    groupingType: 'flat' | 'nested';
    autoSave?: boolean;
    isStandalone?: boolean;
    allowAggregationWithoutGrouping?: boolean;
    inlineRibbonButtonsIds?: Set<string>;
    hasPreviousState?: boolean;
}

interface IDataProvider extends IEventEmitter<IDataProviderEventListeners> {
    isError(): boolean;
    getErrorMessage(): string;
    setError(error: boolean, errorMessage?: string): void;
    /** Takes effect on the next refresh(). */
    setSorting(sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]): void;
    getSorting(): ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    /** Takes effect on the next refresh(). */
    setFiltering(filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null): void;
    getFiltering(): ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null;
    setLinking(expr: any[]): void;
    getLinking(): any[];
    setSearchQuery(query?: string): void;
    getSearchQuery(): string;
    /** Loads the records again with the current sorting, filtering, grouping and paging. */
    refresh(): Promise<IRecord[]>;
    refreshSync(): IRecord[];
    preload(): Promise<void>;
    /** While grouped, these are the group rows. */
    getRecords(): IRecord[];
    /** Every loaded record by id, including those under loaded groups. */
    getRecordsMap(): { [recordId: string]: IRecord };
    getRecordIndex(recordId: string): number;
    getSortedRecordIds(): string[];
    getPaging(): {
        totalResultCount: number;
        firstPageNumber: number;
        lastPageNumber: number;
        pageNumber: number;
        pageSize: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        loadNextPage(): Promise<IRecord[]>;
        loadPreviousPage(): Promise<IRecord[]>;
        loadExactPage(pageNumber: number): Promise<IRecord[]>;
        reset(): void;
        setPageSize(pageSize: number): void;
        setPageNumber(pageNumber: number): void;
    };
    getColumns(): IColumn[];
    /** Every column ever set, including removed ones. */
    getColumnsMap(): { [columnName: string]: IColumn };
    setColumns(columns: IColumn[]): void;
    getAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]>;
    getAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]>;
    getQuickFindColumns(): IColumn[];
    /** Without records, saves every dirty record. */
    save(records?: IRecord[]): Promise<IRecordSaveOperationResult[]>;
    isDirty(): boolean;
    isValid(): boolean;
    getDirtyRecordIds(): string[];
    getInvalidRecordIds(): string[];
    clearChanges(): void;
    newRecord(options?: { rawData?: IRawRecord; index?: number; recordId?: string; position?: 'start' | 'end' }): IRecord;
    deleteRecords(recordIds: string[]): Promise<{ success: boolean; results: IRecordDeleteOperationResult[] }>;
    setRecordRawData(recordId: string, newRawData: IRawRecord): void;
    getRawData(): IRawRecord[];
    getRawDataMap(): { [recordId: string]: IRawRecord };
    getRawRecord(recordId: string): IRawRecord | undefined;
    getTitle(): string;
    setTitle(title: string): void;
    getCurrencies(): ICurrency[];
    setCurrencies(currencies: ICurrency[]): void;
    getRecordCurrencySymbol(record: IRecord, columnName: string): string;
    /** Runs the onOpenDatasetItem interceptor. */
    openDatasetItem(entityReference: ComponentFramework.EntityReference, context?: IOpenDatasetItemContext): void;
    getMetadata(): any;
    setMetadata(metadata: any): void;
    getDataSource(): any;
    setDataSource(dataSource: any): void;
    getEntityName(): string;
    getViewId(): string;
    setViewId(id: string): void;
    isLoading(): boolean;
    /** Whether the first load has been requested, by a refresh or a page load. */
    isFirstLoadRequested(): boolean;
    getLoadingMessage(): string;
    /** The message shows in the grid's loading overlay. */
    setLoading(value: boolean, message?: string): void;
    addEventListener<K extends keyof IDataProviderEventListeners>(event: K, eventListener: IDataProviderEventListeners[K]): void;
    setInterceptor<K extends keyof IDataProviderInterceptors>(name: K, interceptor: IInterceptor<IDataProviderInterceptors, K>): void;
    setProperty<K extends keyof IDataProviderProperties>(name: K, value: IDataProviderProperties[K]): void;
    getProperty<K extends keyof IDataProviderProperties>(name: K): IDataProviderProperties[K];
    setCustomProperty(name: string, value: any): void;
    getCustomProperty(name: string): any;
    isDestroyed(): boolean;
    destroy(): void;
    /** Fires onRenderRequested. */
    requestRender(): void;
    retrieveRecordCommand(options?: IRetrieveRecordCommandOptions): Promise<ICommand[]>;
    aggregation: IAggregation;
    grouping: IGrouping;
    getParentRecordId(): string;
    getParentDataProvider(): IDataProvider | null;
    createNewDataProvider(eventBubbleOptions?: IEventBubbleOptions): IDataProvider;
    getGroupedRecordDataProviders(allLevels?: boolean): IDataProvider[];
    createGroupedRecordDataProvider(group: IRecord): IDataProvider;
    /** The provider of the records under a group row. */
    getGroupedRecordDataProvider(groupedRecordId: string): IDataProvider | null;
    getTopLevelDataProvider(): IDataProvider;
    isTopLevelDataProvider(): boolean;
    getSummarizationType(): DataProviderSummarizationType;
    getNestingLevel(): number;
    /** Leaves group row ids out unless includeGroupRecordIds is set. */
    getSelectedRecordIds(options?: { includeGroupRecordIds?: boolean; includeChildrenRecordIds?: boolean }): string[];
    setSelectedRecordIds(ids: string[]): void;
    toggleSelectedRecordId(recordId: string, options?: { clearExisting?: boolean }): void;
    clearSelectedRecordIds(): void;
}

interface IRetrievedData {
    data: { [key: string]: any }[];
    totalRecordCount: number;
    hasNextPage: boolean;
}

type GetDataEvent = 'refresh' | 'loadExactPage' | 'loadPreviousPage' | 'loadNextPage';

interface IMemoryProviderEntityMetadata {
    PrimaryIdAttribute: string;
    /** The column drawn as a link to the record. */
    PrimaryNameAttribute?: string;
    LogicalName?: string;
    EntitySetName?: string;
    LogicalCollectionName?: string;
    PrimaryImageAttribute?: string;
    ObjectTypeCode?: number;
    IsActivity?: boolean;
    EntityColor?: string;
    /** The columns setSearchQuery looks in. */
    QuickFindColumns?: string[];
    SavedQueries?: { columns: IColumn[] }[];
}

interface IMemoryDataProviderOptions {
    /** The rows, or the rows as JSON. */
    dataSource: IRawRecord[] | string;
    metadata: IMemoryProviderEntityMetadata;
    columns?: IColumn[];
    /** Every record on one page unless given. */
    pageSize?: number;
}

interface IMemoryProvider extends IDataProvider {
    getDataSource(): IRawRecord[];
    setMetadata(metadata: IMemoryProviderEntityMetadata): void;
    getMetadata(): IMemoryProviderEntityMetadata;
    getDataSourceIndex(recordId: string): number | undefined;
}

interface DataProvider extends IDataProvider {}

/** DataProvider.CONST holds the ids the grid and the providers reserve. */
declare abstract class DataProvider {
    static CONST: {
        KEY_SPLITTER: string;
        /** What a group row's record id starts with. */
        GROUP_PREFIX: string;
        DEFAULT_PAGE_SIZE_SUBGRID: number;
        DEFAULT_PAGE_SIZE_GRID: number;
        RIBBON_BUTTONS_COLUMN_NAME: string;
        SAVE_COMMAND_ID: string;
        DELETE_COMMAND_ID: string;
        EDIT_COMMAND_ID: string;
        NEW_COMMAND_ID: string;
        REFRESH_COMMAND_ID: string;
        CLEAR_CHANGES_COMMAND_ID: string;
        POWERAPPS_DATASET_MAX_SELECTED_RECORDS: number;
        CUSTOM_COLUMN_NAME_SUFFIX: string;
        PLATFORM_COMMAND_IDS: string[];
        NATIVE_COMMAND_IDS: string[];
        NATIVE_COMMAND_IDS_SET: Set<string>;
        PLATFORM_COMMAND_IDS_SET: Set<string>;
    };
    constructor(args: any);
    abstract onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult>;
    abstract onIsRecordActive(recordId: string): boolean;
    abstract onOpenDatasetItem(entityReference: ComponentFramework.EntityReference, context?: IOpenDatasetItemContext): void;
    abstract getDataAsync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): Promise<IRetrievedData | Error>;
    abstract getDataSync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): IRetrievedData | Error;
}

declare class MemoryDataProvider extends DataProvider implements IMemoryProvider {
    constructor(options: IMemoryDataProviderOptions);
    setDataSource(dataSource: IRawRecord[] | string): void;
    getDataSource(): IRawRecord[];
    getDataSourceIndex(recordId: string): number | undefined;
    getMetadata(): IMemoryProviderEntityMetadata;
    setMetadata(metadata: IMemoryProviderEntityMetadata): void;
    /** Succeeds for every dirty field. */
    onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult>;
    onIsRecordActive(recordId: string): boolean;
    onOpenDatasetItem(entityReference: ComponentFramework.EntityReference): void;
    getDataAsync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): Promise<IRetrievedData>;
    getDataSync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): IRetrievedData;
}

/** The example's provider, loaded with the dataset the example names. */
declare const provider: IDataProvider;

/** A new, unloaded provider over the 30 deals of a sales pipeline. */
/** Works out a provider's totals in a provider of its own, as the grid's total row does. */
declare class TotalRow {
    constructor(provider: IDataProvider);
    /** Null while there are no aggregations or no records, or while the totals load. */
    getTotalRowRecord(): IRecord | null;
    addAggregation(columnName: string, aggregationFunction: AggregationFunction): void;
    removeAggregation(alias: string): void;
    /** The provider the totals are loaded into. */
    getDataProvider(): IDataProvider;
    refresh(): Promise<IRecord[]>;
    destroy(): void;
}

declare function createDealsProvider(): MemoryDataProvider;
/** A new, unloaded provider over a consulting team's 24 timesheet entries of last week. */
declare function createTimesheetsProvider(): MemoryDataProvider;
/** A new, unloaded provider over a support desk's 36 tickets. */
declare function createTicketsProvider(): MemoryDataProvider;
/** A new, unloaded provider over an office furniture shop's 16 products. */
declare function createProductsProvider(): MemoryDataProvider;

interface Sorting {
    /** Sorts the provider by one column from its next refresh. */
    getColumnSorting(columnName: string): {
        setSortValue(direction: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection, multiSort?: boolean): void;
        clear(): void;
    };
}

interface Condition extends IEventEmitter<{ onOperatorChanged: (operator: IOperator['Value']) => void; onValueChanged: (value: any) => void; onError: (errorMessage: string) => void }> {
    getId(): string;
    isAppliedToDataset(): boolean;
    setOperator(operator: IOperator['Value']): void;
    getOperator(decorate?: boolean): IOperator['Value'];
    getColumn(): IColumn;
    getValue(decorate?: boolean): any;
    setValue(value: any): void;
    getControlValue(): any;
    getMetadata(): any;
    isValueLoading(): boolean;
    getBindings(): { [key: string]: any };
    getValidationResult(): IFieldValidationResult[];
    setIsValueRequired(isRequired: boolean): void;
    getDataType(): DataType | null;
}

interface ColumnFilter {
    isAppliedToDataset(): boolean;
    getCondition(id: string): Condition | undefined;
    getConditions(): Condition[];
    addCondition(): Condition;
    clear(): void;
    getExpressionConditions(): ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression[];
}

interface Filtering {
    getColumnFilter(columnName: string): ColumnFilter;
    getColumnFilters(): ColumnFilter[];
    removeColumnFilter(columnName: string): void;
    /** False where a condition is not valid. */
    getFilterExpression(filterOperator: ComponentFramework.PropertyHelper.DataSetApi.Types.FilterOperator): ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | false;
}

/** Fluent's theme with this package's additions. */
type ITheme = import('@fluentui/react').ITheme & { effects: import('@fluentui/react').IEffects & { underlined?: boolean } };

/** The three colours a theme is generated from. */
interface IThemeColors {
    primary: string;
    background: string;
    text: string;
}

/** Builds a theme from three colours and the edits over the result. */
interface ThemeBuilder {
    /** Changing one regenerates the whole palette. */
    readonly colors: IThemeColors;
    /** The same key has to mean the same edit. */
    edit(key: string, edit: (theme: ITheme) => void): void;
    getTheme(): ITheme;
}

declare class ThemeGenerator {
    static generate(colors: IThemeColors): ITheme;
}

type IThemeProviderProps = React.HTMLAttributes<HTMLDivElement> & {
    theme: import('@fluentui/react').ITheme;
    /** What callouts, menus and tooltips opened inside are drawn in. */
    surfaceTheme?: import('@fluentui/react').ITheme;
    /** Whether the element itself is painted in the theme. */
    applyTo?: 'element' | 'none';
    children?: React.ReactNode;
};

/** An element that draws everything inside it in a theme. */
declare const ThemeProvider: (props: IThemeProviderProps & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;

/** A text colour that reads on the background. */
declare function getTextColorForBackground(backgroundColor: string): string;

/** Whether text drawn on the colour has to be dark to be read. */
declare function isLightColor(color: string): boolean;

type IAlignment = 'left' | 'center' | 'right';

interface IParameters {
    [key: string]: any;
}

interface ILocalizationService<T> {
    getLocalizedString(key: keyof T, variables?: { [key: string]: string }): string;
}

interface IServiceLocator<TServiceMap extends object> {
    /** Throws while nothing registered the service. */
    get<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey];
    /** Undefined while nothing registered the service. */
    find<TKey extends keyof TServiceMap>(key: TKey): TServiceMap[TKey] | undefined;
    /** The resolver runs on every lookup. */
    register<TKey extends keyof TServiceMap>(key: TKey, resolve: () => TServiceMap[TKey]): void;
    /** Runs the callback as soon as the service is registered. */
    whenAvailable<TKey extends keyof TServiceMap>(key: TKey, callback: (service: TServiceMap[TKey]) => void): void;
    destroy(): void;
}

/** An AG Grid row. */
interface IRowNode<TData = any> {
    id: string | undefined;
    data: TData | undefined;
    displayed: boolean;
    rowPinned: 'top' | 'bottom' | null | undefined;
    selectable: boolean;
    rowHeight: number | null | undefined;
    rowTop: number | null;
    group: boolean | undefined;
    firstChild: boolean;
    lastChild: boolean;
    childIndex: number;
    level: number;
    uiLevel: number;
    parent: IRowNode<TData> | null;
    stub: boolean;
    failedLoad: boolean;
    rowIndex: number | null;
    master: boolean;
    detail: boolean;
    field: string | null;
    key: string | null;
    expanded: boolean;
    allChildrenCount: number | null;
    childrenAfterGroup: IRowNode<TData>[] | null;
    footer: boolean;
    setSelected(newValue: boolean, clearSelection?: boolean, source?: string): void;
    isSelected(): boolean | undefined;
    isRowPinned(): boolean;
    isExpandable(): boolean;
    setExpanded(expanded: boolean, sourceEvent?: MouseEvent | KeyboardEvent, forceSync?: boolean): void;
    isFullWidthCell(): boolean;
    isHovered(): boolean;
    addEventListener(eventType: 'rowSelected' | 'selectableChanged' | 'displayedChanged' | 'dataChanged' | 'cellChanged' | 'masterChanged' | 'heightChanged' | 'topChanged' | 'groupChanged' | 'allChildrenCountChanged' | 'firstChildChanged' | 'lastChildChanged' | 'childIndexChanged' | 'rowIndexChanged' | 'expandedChanged' | 'hasChildrenChanged' | 'uiLevelChanged' | 'rowHighlightChanged' | 'mouseEnter' | 'mouseLeave' | 'draggingChanged', listener: Function): void;
    removeEventListener(eventType: 'rowSelected' | 'selectableChanged' | 'displayedChanged' | 'dataChanged' | 'cellChanged' | 'masterChanged' | 'heightChanged' | 'topChanged' | 'groupChanged' | 'allChildrenCountChanged' | 'firstChildChanged' | 'lastChildChanged' | 'childIndexChanged' | 'rowIndexChanged' | 'expandedChanged' | 'hasChildrenChanged' | 'uiLevelChanged' | 'rowHighlightChanged' | 'mouseEnter' | 'mouseLeave' | 'draggingChanged', listener: Function): void;
    depthFirstSearch(callback: (rowNode: IRowNode<TData>) => void): void;
    setRowHeight(rowHeight: number | undefined | null, estimated?: boolean): void;
    setData(data: TData): void;
    updateData(data: TData): void;
    setDataValue(colKey: string | Column, newValue: any, eventSource?: string): boolean;
    getRoute(): string[] | undefined;
}

/** An AG Grid column. */
interface Column {
    getColId(): string;
    getId(): string;
    getColDef(): IGridColDef;
    getUserProvidedColDef(): IGridColDef | null;
    getActualWidth(): number;
    getMinWidth(): number | null | undefined;
    getMaxWidth(): number | null | undefined;
    getFlex(): number;
    getLeft(): number | null;
    getPinned(): 'left' | 'right' | boolean | null | undefined;
    getSort(): 'asc' | 'desc' | null | undefined;
    getSortIndex(): number | null | undefined;
    isVisible(): boolean;
    isPinned(): boolean;
    isPinnedLeft(): boolean;
    isPinnedRight(): boolean;
    isResizable(): boolean;
    isSortable(): boolean;
    isAutoHeight(): boolean;
}

interface ColumnState {
    colId: string;
    width?: number;
    hide?: boolean;
    pinned?: 'left' | 'right' | boolean | null;
    sort?: 'asc' | 'desc' | null;
    sortIndex?: number | null;
    flex?: number;
}

interface ApplyColumnStateParams {
    state?: ColumnState[];
    applyOrder?: boolean;
    defaultState?: Omit<ColumnState, 'colId'>;
}

interface CellPosition {
    rowIndex: number;
    rowPinned: 'top' | 'bottom' | null | undefined;
    column: Column;
}

interface CellRange {
    id?: string;
    startRow?: { rowIndex: number; rowPinned: 'top' | 'bottom' | null | undefined };
    endRow?: { rowIndex: number; rowPinned: 'top' | 'bottom' | null | undefined };
    columns: Column[];
    startColumn: Column;
}

/** AG Grid's state, such as column order, widths and sorting. */
interface GridState {
    aggregation?: { aggregationModel: { colId: string; aggFunc: string }[] };
    columnGroup?: { openColumnGroupIds: string[] };
    columnOrder?: { orderedColIds: string[] };
    columnPinning?: { leftColIds: string[]; rightColIds: string[] };
    columnSizing?: { columnSizingModel: { colId: string; width?: number; flex?: number }[] };
    columnVisibility?: { hiddenColIds: string[] };
    filter?: { filterModel?: any; advancedFilterModel?: any };
    focusedCell?: { colId: string; rowIndex: number; rowPinned: 'top' | 'bottom' | null | undefined };
    pagination?: { page?: number; pageSize?: number };
    pivot?: { pivotMode: boolean; pivotColIds: string[] };
    rangeSelection?: { cellRanges: any[] };
    rowGroup?: { groupColIds: string[] };
    rowGroupExpansion?: { expandedRowGroupIds: string[] };
    rowSelection?: string[] | any;
    scroll?: { top: number; left: number };
    sideBar?: any;
    sort?: { sortModel: { colId: string; sort: 'asc' | 'desc' }[] };
}

/** AG Grid's own api, a last resort beside the grid's hooks. */
interface GridApi {
    getGridId(): string;
    /** Loads again the server-side rows that failed to load. */
    retryServerSideLoads(): void;
    isDestroyed(): boolean;
    getGridOption(key: string): any;
    setGridOption(key: string, value: any): void;
    updateGridOptions(options: GridOptions<IRecord>): void;
    addEventListener(eventType: string, listener: (event: any) => void): void;
    removeEventListener(eventType: string, listener: (event: any) => void): void;
    getRowNode(id: string): IRowNode<IRecord> | undefined;
    getDisplayedRowAtIndex(index: number): IRowNode<IRecord> | undefined;
    getDisplayedRowCount(): number;
    getFirstDisplayedRowIndex(): number;
    getLastDisplayedRowIndex(): number;
    getPinnedBottomRow(index: number): IRowNode<IRecord> | undefined;
    getPinnedBottomRowCount(): number;
    forEachNode(callback: (rowNode: IRowNode<IRecord>, index: number) => void): void;
    forEachNodeAfterFilterAndSort(callback: (rowNode: IRowNode<IRecord>, index: number) => void): void;
    getSelectedNodes(): IRowNode<IRecord>[];
    getSelectedRows(): IRecord[];
    getColumn(key: string | Column): Column | null;
    getColumns(): Column[] | null;
    getAllDisplayedColumns(): Column[];
    getColumnDefs(): IGridColDef[] | undefined;
    getColumnState(): ColumnState[];
    applyColumnState(params: ApplyColumnStateParams): boolean;
    resetColumnState(): void;
    setColumnsVisible(keys: (string | Column)[], visible: boolean): void;
    setColumnsPinned(keys: (string | Column)[], pinned: 'left' | 'right' | boolean | null): void;
    setColumnWidths(columnWidths: { key: string | Column; newWidth: number }[], finished?: boolean): void;
    moveColumns(columnsToMoveKeys: (string | Column)[], toIndex: number): void;
    autoSizeColumns(keys: (string | Column)[], skipHeader?: boolean): void;
    autoSizeAllColumns(skipHeader?: boolean): void;
    sizeColumnsToFit(params?: { defaultMinWidth?: number; defaultMaxWidth?: number }): void;
    ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle' | null): void;
    ensureNodeVisible(node: IRowNode<IRecord>, position?: 'top' | 'bottom' | 'middle' | null): void;
    ensureColumnVisible(key: string | Column, position?: 'auto' | 'start' | 'middle' | 'end'): void;
    getFocusedCell(): CellPosition | null;
    setFocusedCell(rowIndex: number, colKey: string | Column, rowPinned?: 'top' | 'bottom' | null): void;
    clearFocusedCell(): void;
    refreshCells(params?: { rowNodes?: IRowNode<IRecord>[]; columns?: (string | Column)[]; force?: boolean; suppressFlash?: boolean }): void;
    redrawRows(params?: { rowNodes?: IRowNode<IRecord>[] }): void;
    refreshHeader(): void;
    flashCells(params?: { rowNodes?: IRowNode<IRecord>[]; columns?: (string | Column)[]; flashDuration?: number; fadeDuration?: number }): void;
    onRowHeightChanged(): void;
    resetRowHeights(): void;
    getState(): GridState;
    showNoRowsOverlay(): void;
    hideOverlay(): void;
    startEditingCell(params: { rowIndex: number; colKey: string | Column; rowPinned?: 'top' | 'bottom' | null; key?: string }): void;
    stopEditing(cancel?: boolean): void;
    getEditingCells(): { rowIndex: number; rowPinned: 'top' | 'bottom' | null | undefined; colId: string }[];
    getCellRanges(): CellRange[] | null;
    addCellRange(params: { rowStartIndex: number | null; rowEndIndex: number | null; columnStart?: string | Column; columnEnd?: string | Column; columns?: (string | Column)[] }): void;
    clearCellSelection(): void;
    copyToClipboard(params?: { includeHeaders?: boolean; includeGroupHeaders?: boolean }): void;
    copySelectedRangeToClipboard(params?: { includeHeaders?: boolean; includeGroupHeaders?: boolean }): void;
    expandAll(): void;
    collapseAll(): void;
    getVerticalPixelRange(): { top: number; bottom: number };
    getHorizontalPixelRange(): { left: number; right: number };
}

interface ICellRendererParams<TData = any, TValue = any> {
    value: TValue | null | undefined;
    valueFormatted: string | null | undefined;
    fullWidth?: boolean;
    pinned?: 'left' | 'right' | null;
    data: TData | undefined;
    node: IRowNode<TData>;
    rowIndex: number;
    colDef?: IGridColDef;
    column?: Column;
    eGridCell: HTMLElement;
    eParentOfValue: HTMLElement;
    getValue?: () => any;
    setValue?: (value: any) => void;
    formatValue?: (value: any) => any;
    refreshCell?: () => void;
    registerRowDragger: (rowDraggerElement: HTMLElement, dragStartPixels?: number, value?: string, suppressVisibilityChange?: boolean) => void;
    setTooltip: (value: string, shouldDisplayTooltip?: () => boolean) => void;
    api: GridApi;
    context: any;
}

interface ILoadingCellRendererParams<TData = any> extends ICellRendererParams<TData> {}

interface ValueGetterParams<TData = any> {
    data: TData | undefined;
    node: IRowNode<TData> | null;
    colDef: IGridColDef;
    column: Column;
    getValue: (field: string) => any;
    api: GridApi;
    context: any;
}

interface ValueFormatterParams<TData = any, TValue = any> {
    value: TValue | null | undefined;
    data: TData | undefined;
    node: IRowNode<TData> | null;
    colDef: IGridColDef;
    column: Column;
    api: GridApi;
    context: any;
}

interface CellClassParams<TData = any, TValue = any> {
    value: TValue | null | undefined;
    data: TData | undefined;
    node: IRowNode<TData>;
    colDef: IGridColDef;
    column: Column;
    rowIndex: number;
    api: GridApi;
    context: any;
}

interface EditableCallbackParams<TData = any> {
    data: TData | undefined;
    node: IRowNode<TData>;
    colDef: IGridColDef;
    column: Column;
    api: GridApi;
    context: any;
}

interface SuppressKeyboardEventParams<TData = any> {
    event: KeyboardEvent;
    editing: boolean;
    data: TData | undefined;
    node: IRowNode<TData>;
    colDef: IGridColDef;
    column: Column;
    api: GridApi;
    context: any;
}

interface ITooltipParams<TData = any> {
    location: string;
    value?: any;
    valueFormatted?: string | null;
    data?: TData;
    node?: IRowNode<TData>;
    colDef?: IGridColDef | null;
    column?: Column;
    rowIndex?: number;
    api: GridApi;
    context: any;
}

interface CellEvent<TData = any, TValue = any> {
    type: string;
    data: TData | undefined;
    node: IRowNode<TData>;
    value: TValue | null | undefined;
    column: Column;
    colDef: IGridColDef;
    rowIndex: number | null;
    rowPinned: 'top' | 'bottom' | null | undefined;
    event?: Event | null;
    api: GridApi;
    context: any;
}

interface CellRendererSelectorResult {
    component?: any;
    params?: any;
}

interface RowClassParams<TData = any> {
    data: TData | undefined;
    node: IRowNode<TData>;
    rowIndex: number;
    api: GridApi;
    context: any;
}

interface RowHeightParams<TData = any> {
    data: TData | undefined;
    node: IRowNode<TData>;
    api: GridApi;
    context: any;
}

interface ProcessCellForExportParams<TData = any> {
    value: any;
    accumulatedRowIndex?: number;
    node?: IRowNode<TData> | null;
    column: Column;
    type: string;
    formatValue: (value: any) => string;
    parseValue: (value: string) => any;
    api: GridApi;
    context: any;
}

interface ProcessHeaderForExportParams {
    column: Column;
    api: GridApi;
    context: any;
}

interface ProcessGroupHeaderForExportParams {
    columnGroup: any;
    api: GridApi;
    context: any;
}

interface ProcessDataFromClipboardParams {
    data: string[][];
    api: GridApi;
    context: any;
}

interface SendToClipboardParams {
    data: string;
}

/** AG Grid's options, as an option hook sets them. */
interface GridOptions<TData = any> {
    columnDefs?: IGridColDef[] | null;
    defaultColDef?: Partial<IGridColDef>;
    rowHeight?: number;
    getRowHeight?: (params: RowHeightParams<TData>) => number | undefined | null;
    headerHeight?: number;
    rowClassRules?: { [cssClassName: string]: ((params: RowClassParams<TData>) => boolean) | string };
    getRowClass?: (params: RowClassParams<TData>) => string | string[] | undefined;
    getRowStyle?: (params: RowClassParams<TData>) => { [cssProperty: string]: string | number } | undefined;
    rowSelection?: { mode: 'singleRow' | 'multiRow'; checkboxes?: boolean; headerCheckbox?: boolean; enableClickSelection?: boolean | 'enableDeselection' | 'enableSelection'; copySelectedRows?: boolean };
    animateRows?: boolean;
    enableCellTextSelection?: boolean;
    ensureDomOrder?: boolean;
    suppressCellFocus?: boolean;
    enterNavigatesVertically?: boolean;
    enterNavigatesVerticallyAfterEdit?: boolean;
    singleClickEdit?: boolean;
    stopEditingWhenCellsLoseFocus?: boolean;
    enableBrowserTooltips?: boolean;
    tooltipShowDelay?: number;
    tooltipHideDelay?: number;
    suppressMovableColumns?: boolean;
    suppressDragLeaveHidesColumns?: boolean;
    pinnedTopRowData?: any[];
    pinnedBottomRowData?: any[];
    cellSelection?: boolean | IGridCellSelectionOptions;
    loading?: boolean;
    domLayout?: 'normal' | 'autoHeight' | 'print';
    rowBuffer?: number;
    context?: any;
    onCellClicked?: (event: CellEvent<TData>) => void;
    onCellDoubleClicked?: (event: CellEvent<TData>) => void;
    onRowClicked?: (event: any) => void;
    onRowDoubleClicked?: (event: any) => void;
    onSelectionChanged?: (event: any) => void;
    onFirstDataRendered?: (event: any) => void;
    onModelUpdated?: (event: any) => void;
    [option: string]: any;
}

/** AG Grid's column definition with the grid's own settings. */
interface IGridColDef {
    colId?: string;
    type?: string | string[];
    headerName?: string;
    headerTooltip?: string;
    headerClass?: string | string[] | ((params: any) => string | string[] | undefined);
    /** Defaults to Grid.ColumnHeader.Renderer. */
    headerComponent?: (props: IColumnHeaderParams) => JSX.Element | null;
    /** Grid.ColumnHeader.Renderer reads theme and components from it. */
    headerComponentParams?: IColumnHeaderRendererOptions & { [param: string]: any };
    /** Defaults to the grid's cell bound to the column, or Grid.Cell.EmptyRenderer for an added column. */
    cellRenderer?: (props: IGridCellParams) => JSX.Element | null;
    /** The grid's cell renderers read theme and components from it. */
    cellRendererParams?: { theme?: ITheme; components?: ICellRendererComponents } & { [param: string]: any };
    cellRendererSelector?: (params: ICellRendererParams<IRecord>) => CellRendererSelectorResult | undefined;
    cellEditor?: any;
    cellEditorParams?: any;
    cellClass?: string | string[] | ((params: CellClassParams<IRecord>) => string | string[] | null | undefined);
    cellClassRules?: { [cssClassName: string]: ((params: CellClassParams<IRecord>) => boolean) | string };
    cellStyle?: { [cssProperty: string]: string | number } | ((params: CellClassParams<IRecord>) => { [cssProperty: string]: string | number } | null | undefined);
    editable?: boolean | ((params: EditableCallbackParams<IRecord>) => boolean);
    singleClickEdit?: boolean;
    valueGetter?: string | ((params: ValueGetterParams<IRecord>) => any);
    valueFormatter?: string | ((params: ValueFormatterParams<IRecord>) => string);
    equals?: (valueA: any, valueB: any) => boolean;
    comparator?: (valueA: any, valueB: any, nodeA: IRowNode<IRecord>, nodeB: IRowNode<IRecord>, isDescending: boolean) => number;
    tooltipValueGetter?: (params: ITooltipParams<IRecord>) => string | any;
    /** Set by the sorting module from the provider column's disableSorting. */
    sortable?: boolean;
    sort?: 'asc' | 'desc' | null;
    filter?: any;
    resizable?: boolean;
    width?: number;
    initialWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    flex?: number;
    initialFlex?: number;
    hide?: boolean;
    initialHide?: boolean;
    pinned?: boolean | 'left' | 'right' | null;
    initialPinned?: boolean | 'left' | 'right';
    lockPinned?: boolean;
    lockPosition?: boolean | 'left' | 'right';
    lockVisible?: boolean;
    suppressMovable?: boolean;
    suppressSizeToFit?: boolean;
    suppressAutoSize?: boolean;
    suppressNavigable?: boolean | ((params: any) => boolean);
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams<IRecord>) => boolean;
    suppressHeaderKeyboardEvent?: (params: any) => boolean;
    suppressHeaderMenuButton?: boolean;
    /** Also draws the grip a row is dragged taller by. */
    autoHeight?: boolean;
    autoHeaderHeight?: boolean;
    wrapText?: boolean;
    wrapHeaderText?: boolean;
    colSpan?: (params: any) => number;
    rowSpan?: (params: any) => number;
    enableCellChangeFlash?: boolean;
    onCellClicked?: (event: CellEvent<IRecord>) => void;
    onCellDoubleClicked?: (event: CellEvent<IRecord>) => void;
    onCellContextMenu?: (event: CellEvent<IRecord>) => void;
    /** What the grid's cells and header read about this column, and your own options beside them. */
    context?: IGridColumnContext;
}

/** New values for a column, or a function of the column as built. */
type IGridColDefOverride = Partial<IGridColDef> | ((colDef: IGridColDef | null) => Partial<IGridColDef>);

interface IGridCellLoading {
    isLoading: boolean;
}

interface IGridCellCommands {
    items: ICommandBarItemProps[];
    /** What stays in the overflow menu however much room there is. */
    overflowItems: ICommandBarItemProps[];
}

interface IGridLock {
    isLocked: boolean;
}

type IGridLockLevel = 'column' | 'record' | 'cell';

/** Nothing for the grid, a column, a record's row, or both for a cell. */
interface IGridLockContext {
    record?: IRecord;
    columnName?: string;
}

interface IGridLockResult {
    isLocked: boolean;
    lockedBy?: IGridLockLevel;
}

/** What a column decides for each of its cells, after the cell hooks. */
interface IGridColumnCellContext {
    /** Whether the cell takes input in place without opening an editor. */
    oneClickEdit?: boolean;
    /** Whether the grip a row is dragged taller by is drawn in this column's cells. */
    isRowResizable?: boolean;
    /** Runs after registerCellCommands. */
    onGetCommands?: (result: IGridCellCommands, params: { record: IRecord }) => void;
    /** Runs after every registerCellTheme. */
    onGetTheme?: (theme: ThemeBuilder, params: { record: IRecord }) => void;
    /** Runs after the cell-level registerLock hooks. */
    onGetLock?: (result: IGridLock, params: { record: IRecord }) => void;
    /** Runs after registerCellLoading. */
    onGetLoading?: (result: IGridCellLoading, params: { record: IRecord }) => void;
    /** Runs after registerValidation. */
    onGetValidation?: (result: IFieldValidationResult, params: { record: IRecord }) => void;
    /** Runs after registerControlParameters. */
    onGetControlParameters?: (parameters: IParameters, params: { record: IRecord }) => void;
}

/** What a column decides for its header, after the header hooks. */
interface IGridColumnHeaderContext {
    /** Runs after registerColumnHeaderTheme. */
    onGetTheme?: (theme: ThemeBuilder) => void;
    /** Runs after registerColumnHeaderAdornments. */
    onGetAdornments?: (adornments: IColumnHeaderAdornment[]) => void;
    /** Runs after registerColumnMenuSection. */
    onGetMenuSections?: (sections: IColumnMenuSection[]) => void;
    /** Runs after registerColumnMenuItems. */
    onGetMenuItems?: (items: IContextualMenuItem[]) => void;
}

interface IGridColumnContext {
    alignment?: IAlignment;
    /** No hook can unlock a column locked here. */
    isLocked?: boolean;
    /** Whether the value is drawn as a link to the record. */
    isPrimary?: boolean;
    /** Whether the header draws the required marker. */
    isRequired?: boolean;
    /** Unsaved width a module adds for what it draws. */
    widthOffset?: number;
    cell?: IGridColumnCellContext;
    header?: IGridColumnHeaderContext;
    /** Your own options for the column, read back with \`getColumnContext\`. */
    [key: string]: unknown;
}

/** The settings a column definition carries in its \`context\`. */
declare function getColumnContext(colDef: IGridColDef | null | undefined): IGridColumnContext;

/** Something a module draws in a column header beside its name. */
interface IColumnHeaderAdornment {
    key: string;
    placement: 'prefix' | 'suffix';
    /** Named in parentheses in the header's tooltip. */
    title?: string;
    onRender?: () => JSX.Element | null;
}

/** A titled section of a column's menu. */
interface IColumnMenuSection {
    /** The built-in modules use sorting, filtering, grouping and aggregation. */
    key: string;
    title: string;
    items: IContextualMenuItem[];
}

interface IGridColumnHeaderEvents {
    onMenuVisibilityChanged: (isOpen: boolean) => void;
}

interface IGridColumnHeaderTheme {
    /** Sets the seed the header's theme is worked out from. */
    setSeed(seed: ITheme | undefined): void;
    get(): ITheme;
}

/** The column a header is drawn for. */
interface IGridColumnHeader {
    readonly events: IEventEmitter<IGridColumnHeaderEvents>;
    getTheme(): IGridColumnHeaderTheme;
    openMenu(): void;
    closeMenu(): void;
    getColDef(): IGridColDef;
    /** The provider's column, if there is one. */
    getColumn(): IColumn | undefined;
    getContext(): IGridColumnContext;
    getAlignment(): IAlignment;
    isRequired(): boolean;
    getName(): string;
    /** The name, with the adornments' titles in parentheses. */
    getTitle(): string;
    getAdornments(placement?: 'prefix' | 'suffix'): IColumnHeaderAdornment[];
    getMenuItems(): IContextualMenuItem[];
    /** The element AG Grid draws the header in. */
    getElement(): HTMLElement | undefined;
}

type GridColumnMenuSectionsHook = (sections: IColumnMenuSection[], header: IGridColumnHeader) => void;
type GridColumnMenuItemsHook = (items: IContextualMenuItem[], header: IGridColumnHeader) => void;
type GridColumnHeaderThemeHook = (theme: ThemeBuilder, header: IGridColumnHeader) => void;
type GridColumnHeaderAdornmentsHook = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader) => void;

interface IGridColumnHeadersEvents {
    onRenderRequested: () => void;
}

interface IGridColumnHeaders {
    readonly events: IEventEmitter<IGridColumnHeadersEvents>;
    /** Redraws every header, for state their columns do not hold. */
    render(): void;
    /** The built-in modules add their sections at GRID_MODULE_PRIORITY. */
    registerColumnMenuSection(hook: GridColumnMenuSectionsHook, priority?: number): () => void;
    /** Runs on the menu the sections became. */
    registerColumnMenuItems(hook: GridColumnMenuItemsHook, priority?: number): () => void;
    registerColumnHeaderAdornments(hook: GridColumnHeaderAdornmentsHook, priority?: number): () => void;
    registerColumnHeaderTheme(hook: GridColumnHeaderThemeHook, priority?: number): () => void;
    getMenuItems(header: IGridColumnHeader): IContextualMenuItem[];
    getAdornments(header: IGridColumnHeader): IColumnHeaderAdornment[];
    /** The header of one column, as the parts drawing it read it. */
    createHeader(parameters: { column: Column; element?: HTMLElement }): IGridColumnHeader;
    /** Run by the header in question. */
    applyColumnHeaderThemeHooks(theme: ThemeBuilder, header: IGridColumnHeader): void;
}

type GridColumnDefinitionsHook = (columnDefs: IGridColDef[]) => void;

interface IGridColumnsEvents {
    /** Fired whether or not the record then opens. */
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
    /** Fired when the user resizes or moves a column. */
    onColumnsChanged: (columns: IColumn[]) => void;
}

interface IGridColumns {
    readonly events: IEventEmitter<IGridColumnsEvents>;
    readonly headers: IGridColumnHeaders;
    /** Runs on every column build, before the colDefs prop. */
    registerColumnDefinitions(hook: GridColumnDefinitionsHook, priority?: number): () => void;
    getColumnDefinitions(): IGridColDef[];
}

/** Which cell a hook is running for. */
interface IGridCellHookParameters {
    record: IRecord;
    columnName: string;
    /** Whether the cell draws a control the user types in. */
    takesInput: boolean;
}

type GridControlHook = (result: { control: Required<ICustomColumnControl> }, params: IGridCellHookParameters) => void;
type GridControlParametersHook = (result: IParameters, params: IGridCellHookParameters) => void;
type GridCellThemeHook = (theme: ThemeBuilder, params: { record: IRecord; columnName: string }) => void;
type GridCellCommandsHook = (result: IGridCellCommands, params: { record: IRecord; columnName: string }) => void;
type GridCellLoadingHook = (result: IGridCellLoading, params: { record: IRecord; columnName: string }) => void;

interface IGridCellsEvents {
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
}

interface IGridEditedCell {
    recordId: string;
    columnName: string;
}

interface IGridEditingEvents {
    onEditedCellChanged: (previous: IGridEditedCell | undefined, next: IGridEditedCell | undefined) => void;
}

/** Which cell the user is editing. */
interface IGridEditing {
    readonly events: IEventEmitter<IGridEditingEvents>;
    /** Whether a column, a record's row or a cell is locked. */
    readonly locks: IGridLocks;
    isEditing(record: IRecord, columnName: string): boolean;
    /** Counts an editor from the moment it is drawn. */
    isBeingEdited(cell: IGridCell): boolean;
    isEditorAvailable(record: IRecord | undefined, colDef: IGridColDef): boolean;
    start(cell: IGridCell): void;
    /** Ends the edit, giving the focus back to the cell. */
    finish(cell: IGridCell): void;
    /** Whether an edit saves its record straight away. */
    isAutoSaveEnabled(): boolean;
}

interface IGridCellEvents {
    onRenderRequested: () => void;
}

interface IGridCellTheme {
    /** Sets the seed the cell's theme is worked out from. */
    setSeed(seed: ITheme | undefined): void;
    get(): ITheme;
}

/** Hands out the fields of the grid's records. */
interface IGridFields {
    /** The same instance for as long as the record lives. */
    get(record: IRecord, columnName: string): IGridField;
}

/** One column of one record. */
interface IGridField {
    getRecord(): IRecord;
    getColumnName(): string;
    getColumn(): IColumn;
    getValue(): any;
    /** Returns the record's save, or null without auto-save. */
    setValue(newValue: any): Promise<IRecordSaveOperationResult> | null;
    getFormattedValue(): string | null;
    isValid(): IFieldValidationResult;
}

interface IGridFieldControl {
    getField(): IGridField;
    getColumn(): IColumn;
    getControlName(): string;
    getParameters(): Partial<IGridValueRendererParameters>;
}

interface IGridControl {
    getFieldControl(): IGridFieldControl | undefined;
    isCustomRendererEnabled(): boolean;
    getControlProps(): IGridValueRenderer;
    getContext(): ComponentFramework.Context<any, any>;
    getCustomControl(): Required<ICustomColumnControl>;
    getFinalControlParameters(parameters: IParameters): IParameters;
}

/** A cell on screen. */
interface IGridCell {
    readonly events: IEventEmitter<IGridCellEvents>;
    /** Redraws the cell, for state its record does not hold. */
    render(): void;
    getId(): string;
    getRecord(): IRecord;
    getColDef(): IGridColDef;
    getColumnName(): string;
    getElement(): HTMLElement | undefined;
    getNode(): IRowNode<IRecord> | undefined;
    getTheme(): IGridCellTheme;
    isLoading(): boolean;
    /** Whether the cell's control takes input instead of showing the value. */
    takesInput(): boolean;
    getContext(): IGridColumnContext;
    getAlignment(): IAlignment;
    isBeingEdited(): boolean;
    /** The user stepped into the control this cell draws. */
    startEditing(): void;
    /** The edit is over. */
    finishEditing(): void;
    /** The record's field this cell is bound to, where it is bound to one. */
    getField(): IGridField | undefined;
    createControl(): IGridControl;
    isLocked(): boolean;
    getCommands(): IGridCellCommands;
}

interface IGridCells {
    readonly events: IEventEmitter<IGridCellsEvents>;
    /** Redraws every cell, for state their records do not hold. */
    render(): void;
    getCells(): IGridCell[];
    /** The cell drawing this field, where one is on screen. */
    getCell(record: IRecord, columnName: string): IGridCell | undefined;
    /** Which control draws a cell. */
    registerControl(hook: GridControlHook, priority?: number): () => void;
    /** The parameters the control drawing a cell is handed. */
    registerControlParameters(hook: GridControlParametersHook, priority?: number): () => void;
    /** Below GRID_MODULE_PRIORITY.grouping, a background is lost while grouped. */
    registerCellTheme(hook: GridCellThemeHook, priority?: number): () => void;
    registerCellLoading(hook: GridCellLoadingHook, priority?: number): () => void;
    /** Commands show while the row is hovered, focused or selected. */
    registerCellCommands(hook: GridCellCommandsHook, priority?: number): () => void;
    createCell(parameters: Omit<IGridCellParameters, 'services'>): IGridCell;
    /** Registers a cell as rendered. */
    addCell(cell: IGridCell): void;
    removeCell(cell: IGridCell): void;
    /** Run by the control of the cell in question. */
    applyControlHooks(result: { control: Required<ICustomColumnControl> }, params: IGridCellHookParameters): void;
    applyControlParametersHooks(result: IParameters, params: IGridCellHookParameters): void;
    /** Run by the theme of the cell in question. */
    applyCellThemeHooks(theme: ThemeBuilder, params: { record: IRecord; columnName: string }): void;
    /** Run by the cell in question. */
    applyCellLoadingHooks(result: IGridCellLoading, params: { record: IRecord; columnName: string }): void;
    /** Run by the cell in question. */
    applyCellCommandsHooks(result: IGridCellCommands, params: { record: IRecord; columnName: string }): void;
}

interface IGridCellParameters {
    services: IGridServiceLocator;
    record: IRecord;
    /** The column AG Grid is drawing. */
    colDef: IGridColDef;
    /** The row AG Grid is drawing. */
    node?: IRowNode<IRecord>;
    /** Whether the cell draws a control the user types in. */
    takesInput?: boolean;
    /** The element AG Grid draws the cell in. */
    element?: HTMLElement;
}

interface IGridRowsEvents {
    onHighlightedRowsChanged: () => void;
    onRowClicked: (record: IRecord) => void;
}

interface IGridRowHeight {
    /** In pixels, or undefined for the grid's own row height. */
    height?: number;
}

type GridRowHeightHook = (result: IGridRowHeight, params: { record: IRecord; node: IRowNode<IRecord> }) => void;

/** What the caller decides for each row, after the row-level hooks. */
interface IGridRowSettings {
    /** Locks a record as a whole, drawn as a muted row. */
    onGetLock?: (result: IGridLock, params: { record: IRecord }) => void;
    onGetHeight?: GridRowHeightHook;
}

interface IGridRows extends IEventEmitter<IGridRowsEvents> {
    /** Whether the row is hovered, focused or selected. */
    isHighlighted(record: IRecord): boolean;
    registerRowHeight(hook: GridRowHeightHook, priority?: number): () => void;
    /** Sets the row's height over what the hooks decide. */
    setRowHeight(record: IRecord, height: number): void;
}

type GridLockHook = (result: IGridLock, context: IGridLockContext) => void;

interface IGridLocks {
    get(context?: IGridLockContext): IGridLockResult;
    /** A context with a record and no columnName asks about the whole row. */
    registerLock(hook: GridLockHook, priority?: number): () => void;
}

type GridValidationHook = (result: IFieldValidationResult, params: { record: IRecord; columnName: string }) => void;

interface IGridValidation {
    get(params: { record: IRecord; columnName: string }): IFieldValidationResult;
    /** An error blocks the record's save. */
    registerValidation(hook: GridValidationHook, priority?: number): () => void;
}

interface IGridSettings {
    isNavigationEnabled(): boolean;
    isZebraEnabled(): boolean;
    areOptionSetColorsEnabled(): boolean;
    getDefaultRowHeight(): number;
    getMaxVisibleRows(): number;
    getColDefs(): { [colId: string]: IGridColDefOverride };
    getRowSettings(): IGridRowSettings;
}

interface IGridKeyboard {
    getKeyBeingPressed(): KeyboardEvent | undefined;
    /** Runs for every key pressed inside the grid. */
    onKeyDown(handler: (event: KeyboardEvent) => void): () => void;
}

/** Something a module draws over the grid. */
interface IGridSurface {
    key: string;
    onRender: () => JSX.Element | null;
}

type GridSurfacesHook = (surfaces: IGridSurface[]) => void;

interface IGridSurfaces {
    registerSurface(hook: GridSurfacesHook, priority?: number): () => void;
    getSurfaces(): IGridSurface[];
}

type IGridRowModelType = 'clientSide' | 'serverSide';

interface IGridRowModelGroupingParameters {
    /** Whether a group row opens itself when it first appears. */
    isGroupOpenByDefault: (node: IRowNode<IRecord>) => boolean;
}

/** What grouping asks of the row model it runs on. */
interface IGridRowModelGrouping {
    onAgGridOptions: (result: IGridAgGridOptions) => void;
    onApplyColumnDefinition: (colDef: IGridColDef, isGrouped: boolean) => void;
    onApplyExpandedLevel: (gridApi: GridApi) => void;
    onExpansionChanged: () => void;
}

/** How the grid gets its rows. */
interface IGridRowModel {
    readonly type: IGridRowModelType;
    /** Reloads the rows once new data lands. */
    refresh(): void;
    createGrouping(parameters: IGridRowModelGroupingParameters): IGridRowModelGrouping;
    setSelectedRecordIds(gridApi: GridApi, recordIds: string[]): void;
    getSelectedRecordIds(gridApi: GridApi): string[];
}

interface IGridAgGridOptions {
    options: GridOptions<IRecord>;
}

interface IGridAgGridInitialOptions {
    options: GridOptions<IRecord>;
}

type GridAgGridOptionsHook = (result: IGridAgGridOptions) => void;

/** What the grid's root element is styled with, on top of the grid's own styles. */
interface IGridStyles {
    styles: import('@fluentui/react').IStyle[];
}

type GridStylesHook = (result: IGridStyles, theme: ITheme) => void;
type GridAgGridInitialOptionsHook = (result: IGridAgGridInitialOptions) => void;

interface IGridRuntimeEvents {
    onDataLoaded: () => void;
    onDestroyed: () => void;
}

/** The running grid with its services and AG Grid options. */
interface IGridRuntime {
    readonly events: IEventEmitter<IGridRuntimeEvents>;
    readonly services: IGridServiceLocator;
    /** A hook over the options AG Grid reads once, when it is created. */
    registerAgGridInitialOptions(hook: GridAgGridInitialOptionsHook, priority?: number): () => void;
    /** AG Grid is handed an option again whenever its reference changes. */
    registerAgGridOptions(hook: GridAgGridOptionsHook, priority?: number): () => void;
    /** Runs the option hooks again. */
    refreshAgGridOptions(): void;
    /** A later style wins where the selectors are equally specific. */
    registerStyles(hook: GridStylesHook, priority?: number): () => void;
    getStyles(theme: ITheme): import('@fluentui/react').IStyle[];
    /** Opens a record as the grid does, through onOpenRecord when the grid has one. */
    openRecord(params: IGridOpenRecordParams): void;
}

interface IGridOpenRecordParams {
    record: IRecord;
    /** The record to open: the row's own, or the one a lookup link points to. */
    reference: ComponentFramework.EntityReference;
    /** None for a double-click on the row. */
    columnName?: string;
}

type IGridRowSelectionState = 'checked' | 'unchecked' | 'indeterminate';

interface IGridSelectRecordsParameters {
    provider: IDataProvider;
    recordIds: string[];
}

interface IGridRowSelectionInterceptors {
    /** Writes a selection to the provider that owns the records. */
    onSelectRecords: (parameters: IGridSelectRecordsParameters) => Promise<void>;
}

interface IGridRowSelectionEvents {
    onSelectionChanged: (selectedRecordIds: string[]) => void;
}

interface IGridRowSelection {
    readonly events: IEventEmitter<IGridRowSelectionEvents>;
    getMode(): 'single' | 'multiple';
    setInterceptor<K extends keyof IGridRowSelectionInterceptors>(event: K, interceptor: IInterceptor<IGridRowSelectionInterceptors, K>): void;
    /** Selects the records through the onSelectRecords interceptor. */
    selectRecords(provider: IDataProvider, recordIds: string[]): Promise<void>;
    toggleRecord(record: IRecord): Promise<void>;
    isSelectionColumn(columnName: string | undefined): boolean;
    getRecordSelectionState(node: IRowNode<IRecord>): IGridRowSelectionState;
    isRecordSelectionDisabled(record: IRecord): boolean;
}

interface IGridSorting {
    getSorting(): Sorting;
    /** Whether the column does not set disableSorting. */
    isColumnSortable(column: IColumn): boolean;
    isSorted(column: IColumn): boolean;
    isSortedDescending(column: IColumn): boolean;
    /** appendToExisting adds to the current sorting. */
    sortColumn(columnName: string, descending?: boolean, appendToExisting?: boolean): void;
    clearColumnSorting(columnName: string): void;
    getSortingLabel(columnName: string, descending?: boolean): string;
    readonly components: IGridSortingComponents;
}

interface IGridFilteringEvents {
    onFilterOpened: (columnName: string) => void;
    onFilterClosed: () => void;
}

type GridFilterControl = 'operator' | 'value';

type GridFilterControlParametersHook = (result: IParameters, params: { column: IColumn; control: GridFilterControl; index: number }) => void;

interface IGridFiltering {
    readonly events: IEventEmitter<IGridFilteringEvents>;
    getLabels(): ILocalizationService<IGridFilteringLabels>;
    getFiltering(): Filtering;
    /** Whether the column lists SupportedFilterConditionOperators. */
    isColumnFilterable(column: IColumn): boolean;
    isFiltered(column: IColumn): boolean;
    getColumnFilter(columnName: string): ColumnFilter;
    /** saveToDataset also refreshes the provider without the filter. */
    removeColumnFilter(columnName: string, saveToDataset?: boolean): void;
    getOpenColumnName(): string | undefined;
    getOpenTarget(): HTMLElement | undefined;
    openFilter(columnName: string, target?: HTMLElement): void;
    closeFilter(): void;
    /** A hook over the parameters the filter callout's operator and value controls are handed. */
    registerFilterControlParameters(hook: GridFilterControlParametersHook, priority?: number): () => void;
    getFilterControlParameters(parameters: IParameters, params: { column: IColumn; control: GridFilterControl; index: number }): IParameters;
    readonly components: IGridFilteringComponents;
}

interface IGridGroupingEvents {
    onGroupSelectionLimitDialogChanged: () => void;
}

interface IGridGrouping {
    readonly events: IEventEmitter<IGridGroupingEvents>;
    getMaxGroupLoadsPerSelection(): number;
    isGroupSelectionLimitDialogOpen(): boolean;
    closeGroupSelectionLimitDialog(): void;
    getLabels(): ILocalizationService<IGridGroupingLabels>;
    isColumnGrouped(column: IColumn): boolean;
    canColumnBeGrouped(column: IColumn): boolean;
    /** Whether the row stands for a group rather than for a record. */
    isGroupRow(node: IRowNode<IRecord>): boolean;
    getGroupedValueColumnName(record: IRecord, columnName: string): string;
    /** How many records a group holds, where the column totals a count. */
    getGroupedCount(record: IRecord, columnName: string): number | undefined;
    isColumnExpandable(record: IRecord, columnName: string): boolean;
    isRowGroupedBy(record: IRecord, columnName: string): boolean;
    /** The deepest level open, -1 for none. */
    getExpandedLevel(): number;
    getDeepestLevel(): number;
    /** Opens the groups down to a level. */
    setExpandedLevel(level: number): void;
    toggleGroup(node: IRowNode<IRecord>): void;
    /** Groups or ungroups the rows by the column. */
    toggleColumnGroup(columnName: string): void;
    readonly components: IGridGroupingComponents;
}

interface IGridAggregation {
    readonly components: IGridAggregationComponents;
    canColumnBeAggregated(column: IColumn): boolean;
    addAggregation(columnName: string, aggregationFunction: AggregationFunction): void;
    removeAggregation(alias: string): void;
    /** What the column's total is called in the totals row. */
    getTotalLabel(columnName: string): string | undefined;
    getAggregateValueColumnName(record: IRecord, columnName: string): string;
}

/** The services the modules register, each there only with its module. */
interface IGridModuleServiceMap {
    /** There with the editing module. */
    editing: IGridEditing;
    aggregation: IGridAggregation;
    grouping: IGridGrouping;
    filtering: IGridFiltering;
    sorting: IGridSorting;
    rowSelection: IGridRowSelection;
}

/** Everything the grid is made of. */
interface IGridServiceMap extends IGridModuleServiceMap {
    /** The grid's own element, there once it is mounted. */
    gridRoot: HTMLElement;
    /** AG Grid's own api, there once the grid is ready. */
    gridApi: GridApi;
    /** What the caller asked the grid to be, with its defaults applied. */
    settings: IGridSettings;
    rows: IGridRows;
    validation: IGridValidation;
    provider: IDataProvider;
    pcfContext: ComponentFramework.Context<any, any>;
    /** Every string the grid renders, resolved. */
    labels: ILocalizationService<IGridLabels>;
    /** The theme the grid was given. */
    theme: ITheme;
    columns: IGridColumns;
    cells: IGridCells;
    keyboard: IGridKeyboard;
    surfaces: IGridSurfaces;
    /** The fields of the grid's records, saved as the grid saves. */
    fields: IGridFields;
    rowModel: IGridRowModel;
    grid: IGridRuntime;
}

type IGridDeferredService = keyof IGridModuleServiceMap | 'gridRoot' | 'gridApi';

type IGridServiceLocator = IServiceLocator<IGridServiceMap>;

/** Reads a grid service from inside something the grid draws. */
declare function useGridService<TKey extends keyof IGridServiceMap>(key: TKey): TKey extends IGridDeferredService ? IGridServiceMap[TKey] | undefined : IGridServiceMap[TKey];

/** Throws outside Grid.Cell.Root. */
declare function useGridCell(): IGridCell;

/** Undefined outside Grid.Cell.Field. */
declare function useGridField(): IGridField | undefined;

/** Throws outside Grid.ColumnHeader.Root. */
declare function useGridColumnHeader(): IGridColumnHeader;

/** Formats values in the user's own formatting. */
interface IFormatting {
    formatCurrency(value: number, precision?: number, symbol?: string): string;
    formatDecimal(value: number, precision?: number): string;
    formatDateShort(value: Date, includeTime?: boolean): string;
}

/** The PCF context the grid is drawn in. */
interface IPcfContext {
    formatting: IFormatting;
}

/** Throws outside PcfContextProvider. */
declare function usePcfContext(): IPcfContext;

/** The record form: Form.Root, Form.Section, Form.Field, Form.Cell, Form.Control and the rest. */
declare const Form: typeof import('@talxis/base-controls').Form;
/** A form strategy over a record kept in memory. */
declare const MemoryStrategy: typeof import('@talxis/base-controls').MemoryStrategy;

declare const FluentProvider: typeof import('@fluentui/react-components').FluentProvider;
declare const webLightTheme: typeof import('@fluentui/react-components').webLightTheme;
declare const Toaster: typeof import('@fluentui/react-components').Toaster;
declare const Toast: typeof import('@fluentui/react-components').Toast;
declare const ToastTitle: typeof import('@fluentui/react-components').ToastTitle;
declare const ToastBody: typeof import('@fluentui/react-components').ToastBody;
declare const useToastController: typeof import('@fluentui/react-components').useToastController;

/** An optional feature a grid can be given. */
interface IGridModule {
    /** AG Grid modules the feature needs. */
    agGridModules?: any[];
    /** Registers what the module contributes to the grid. */
    onRegister?: (runtime: IGridRuntime) => void;
}

/** Read once, at mount. */
interface IGridModules {
    rowModel: IGridModule;
    license?: IGridModule;
    rowSelection?: IGridModule;
    cellSelection?: IGridModule;
    editing?: IGridModule;
    sorting?: IGridModule;
    filtering?: IGridModule;
    grouping?: IGridModule;
    aggregation?: IGridModule;
    clipboard?: IGridModule;
    legacyClientApiCompatibility?: IGridModule;
    /** Your own modules, ordered against GRID_MODULE_PRIORITY. */
    custom?: IGridModule[];
}

/** A hook's priority defaults to 0. */
declare const GRID_MODULE_PRIORITY: {
    readonly legacyClientApiCompatibility: 0;
    readonly rowModel: 10;
    readonly editing: 15;
    readonly rowSelection: 20;
    readonly cellSelection: 30;
    readonly sorting: 40;
    readonly filtering: 50;
    readonly grouping: 60;
    readonly aggregation: 70;
    readonly clipboard: 80;
};

/** The id of the column a record locked as a whole shows its lock in. */
declare const RECORD_LOCK_COLUMN_KEY: 'recordLock';
/** The id of the row selection's checkbox column. */
declare const SELECTION_COLUMN_KEY: '__checkbox__virtual';
/** The id of the column a row reports its save in. */
declare const RECORD_SAVE_COLUMN_KEY: 'recordSaveStatus';
/** The class on the row of a record locked as a whole. */
declare const LOCKED_RECORD_ROW_CLASS: 'talxis__baseControl__GridRow--locked';
/** The id of the column whose header opens and closes the groups a level at a time. */
declare const GROUP_EXPANSION_COLUMN_KEY: 'groupExpansion';
/** The width of a column that does not say, in pixels. */
declare const DEFAULT_COLUMN_WIDTH: 200;

interface IGridLabels {
    noRecordsFound: string;
    valueLocked: string;
    recordLocked: string;
    columnLocked: string;
    recordSaveErrorTitle: string;
    recordSaveErrorDismiss: string;
}

interface IGridSortingLabels {
    sortTextAscending: string;
    sortTextDescending: string;
    sortDateAscending: string;
    sortDateDescending: string;
    sortNumberAscending: string;
    sortNumberDescending: string;
    /** Joins a two-options column's labels, as in "No to Yes". */
    sortTwoOptionsJoint: string;
    clear: string;
    menuSection: string;
}

interface IGridFilteringLabels {
    filterMenuFilterBy: string;
    clear: string;
    menuSection: string;
}

interface IGridGroupingLabels {
    group: string;
    ungroup: string;
    /** Takes {{maxGroupChildren}}. */
    maximumGroupChildrenLimitReached: string;
    headerTitle: string;
    menuSection: string;
    expandLevel: string;
    collapseLevel: string;
    /** Takes {{maxGroupLoads}}. */
    groupSelectionLimitMessage: string;
    groupSelectionLimitConfirm: string;
}

interface IGridAggregationLabels {
    totalNone: string;
    totalAverage: string;
    totalMaximum: string;
    totalMinimum: string;
    totalSum: string;
    totalCount: string;
    totalCountColumn: string;
    menuSection: string;
}

/** The English defaults of the strings the grid itself renders. */
declare const GRID_LABELS: IGridLabels;
declare const GRID_SORTING_LABELS: IGridSortingLabels;
declare const GRID_FILTERING_LABELS: IGridFilteringLabels;
declare const GRID_GROUPING_LABELS: IGridGroupingLabels;
declare const GRID_AGGREGATION_LABELS: IGridAggregationLabels;

interface ICellUiContainerComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

interface ICellUiControlComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

interface ICellUiLoadingComponents {
    onRenderShimmer: (props: IShimmerProps) => JSX.Element | null;
}

interface ICellUiCommandsComponents {
    /** What the bar is drawn in, measured as the row resizes. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

interface ICellUiLockIconComponents {
    /** What carries the message and holds the icon. */
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
}

interface ICellUiFieldErrorComponents {
    /** What marks the cell's edges. */
    onRenderOutline: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
}

interface ICellUiResizeGripComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What the drag is started from. */
    onRenderGrip: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

type ICellUiContainerProps = React.HTMLAttributes<HTMLDivElement> & {
    components?: Partial<ICellUiContainerComponents>;
};

type ICellUiControlProps = React.HTMLAttributes<HTMLDivElement> & {
    alignment?: IAlignment;
    components?: Partial<ICellUiControlComponents>;
};

interface ICellUiLoadingProps {
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
    components?: Partial<ICellUiLoadingComponents>;
}

type ICellUiCommandsProps = ICommandBarProps & {
    alignment?: IAlignment;
    components?: Partial<ICellUiCommandsComponents>;
};

interface ICellUiLockIconProps {
    /** Why the value cannot be changed, shown in the tooltip. */
    message?: string;
    alignment?: IAlignment;
    className?: string;
    components?: Partial<ICellUiLockIconComponents>;
}

interface ICellUiFieldErrorProps {
    /** Nothing is drawn without one. */
    message?: string;
    alignment?: IAlignment;
    components?: Partial<ICellUiFieldErrorComponents>;
}

interface ICellUiResizeGripProps {
    /** The row's height a drag starts from. */
    height?: number;
    onResize: (height: number) => void;
    className?: string;
    children?: React.ReactNode;
    components?: Partial<ICellUiResizeGripComponents>;
}

/** Draws a cell without knowing about the grid. */
interface ICellUi {
    Container: (props: ICellUiContainerProps) => JSX.Element | null;
    FieldError: (props: ICellUiFieldErrorProps) => JSX.Element | null;
    ResizeGrip: (props: ICellUiResizeGripProps) => JSX.Element | null;
    Commands: (props: ICellUiCommandsProps) => JSX.Element | null;
    Control: (props: ICellUiControlProps) => JSX.Element | null;
    Loading: (props: ICellUiLoadingProps) => JSX.Element | null;
    LockIcon: (props: ICellUiLockIconProps) => JSX.Element | null;
}

interface IFileValue {
    fileName: string;
    fileSize?: number;
    fileUrl?: string;
    thumbnailUrl?: string;
    mimeType?: string;
}

interface IFieldTextProps {
    text: string | null;
    isMultiline?: boolean;
    isPlaceholder?: boolean;
}

interface IFieldLinkProps {
    text: string | null;
    /** Without one, the link only calls onClick. */
    href?: string;
    onClick?: () => void;
    isMultiline?: boolean;
}

interface IFieldLookupProps {
    children: JSX.Element[];
}

interface IFieldFileProps {
    file: IFileValue;
    isImage: boolean;
}

interface IOptionSetRendererOption {
    label: string;
    value?: string | number;
    color?: string;
}

interface IOptionProps {
    option: IOptionSetRendererOption;
}

interface IOptionSetRendererComponents {
    onRenderOption: (props: IOptionProps) => JSX.Element;
}

interface IOptionSetRendererProps {
    options: IOptionSetRendererOption[];
    alignment?: IAlignment;
    components?: Partial<IOptionSetRendererComponents>;
}

/** The replaceable pieces of how a value is drawn. */
interface IGridValueRendererComponents {
    onRenderText: (props: IFieldTextProps) => JSX.Element;
    /** What an empty value shows in place of itself. */
    onRenderPlaceholder: (props: IFieldTextProps) => JSX.Element;
    onRenderLink: (props: IFieldLinkProps) => JSX.Element;
    onRenderLookup: (props: IFieldLookupProps) => JSX.Element;
    onRenderOptions: (props: IOptionSetRendererProps) => JSX.Element;
    onRenderFile: (props: IFieldFileProps) => JSX.Element;
    onRenderPrefixIcon: (props: IIconProps) => JSX.Element;
    onRenderSuffixIcon: (props: IIconProps) => JSX.Element;
}

/** The parameters a cell's control is handed. */
interface IGridValueRendererParameters extends IParameters {
    value: any;
    ColumnAlignment: { raw: IAlignment };
    CellType: { raw: 'renderer' | 'editor' };
    EnableNavigation: { raw: boolean; type?: string };
    EnableOptionSetColors?: { raw: boolean; type?: string };
    IsPrimaryColumn?: { raw: boolean; type?: string };
    IsMultiline?: { raw: boolean; type?: string };
    Column: { raw: IColumn | undefined };
    Cell: { raw: IGridCell | undefined };
    /** Always the grid's own provider, also in a group row. */
    Provider: { raw: IDataProvider };
    /** The grid the value is drawn in, which opens records. */
    Runtime: { raw: IGridRuntime };
    Record: { raw: IRecord };
    PrefixIcon: { raw: string | null; type?: string };
    SuffixIcon: { raw: string | null; type?: string };
    /** Defaults to ---. */
    Placeholder?: { raw: string | null; type?: string };
}

/** What draws a cell's value. */
interface IGridValueRenderer {
    context: ComponentFramework.Context<any>;
    parameters: IGridValueRendererParameters;
    components?: Partial<IGridValueRendererComponents>;
    onNotifyOutputChanged?: (outputs: { [key: string]: any }) => void;
}

/** Draws a value the way a cell does outside editing. */
declare const GridValueRenderer: (props: IGridValueRenderer) => JSX.Element;

declare const OptionSetRenderer: (props: IOptionSetRendererProps) => JSX.Element;

interface ICellColumnControlComponents {
    /** What draws the value, handed the default as defaultRender. */
    onRenderControl: (props: IGridValueRenderer, defaultRender: (props: IGridValueRenderer) => JSX.Element | null) => JSX.Element | null;
}

/** The replaceable pieces of a cell, drawn whether it is being edited or not. */
interface ICellComponents {
    resizeGrip?: Partial<ICellUiResizeGripComponents>;
    container?: Partial<ICellUiContainerComponents>;
    loading?: Partial<ICellUiLoadingComponents>;
    control?: Partial<ICellUiControlComponents>;
    columnControl?: Partial<ICellColumnControlComponents>;
}

/** The replaceable pieces of a cell, by the part they belong to. */
interface ICellRendererComponents extends ICellComponents {
    fieldError?: Partial<ICellUiFieldErrorComponents>;
    commands?: Partial<ICellUiCommandsComponents>;
}

/** The replaceable pieces of the editing module's cell; it also draws the lock. */
interface IEditingCellRendererComponents extends ICellRendererComponents {
    lockIcon?: Partial<ICellUiLockIconComponents>;
}

/** What AG Grid hands whatever renders a cell. */
interface IGridCellParams extends ICellRendererParams<IRecord> {
    data: IRecord;
}

interface ICellRendererProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from. */
    theme?: ITheme;
    components?: ICellRendererComponents;
}


interface IEditingCellRendererProps extends ICellRendererParams {
    theme?: ITheme;
    components?: IEditingCellRendererComponents;
}


/** The replaceable pieces of the editing module's editor. */
interface IEditingCellEditorComponents extends ICellComponents {}

interface IEditingCellEditorProps extends ICellRendererParams {
    theme?: ITheme;
    components?: IEditingCellEditorComponents;
}


interface ICellEmptyRendererProps extends ICellRendererParams {
    theme?: ITheme;
    components?: Pick<ICellRendererComponents, 'resizeGrip' | 'container' | 'loading' | 'commands'>;
}

interface ICellRootProps extends ICellRendererParams {
    /** Whether the cell's control takes input instead of showing the value. */
    takesInput?: boolean;
    children?: React.ReactNode;
}

interface IEditingCellRootProps extends Omit<ICellRootProps, 'takesInput'> {
    /** Whether this is the editor AG Grid opened over the cell. */
    isEditor?: boolean;
}

interface ICellThemeProps {
    theme?: ITheme;
    children?: React.ReactNode;
}

interface ICellContainerProps {
    children?: React.ReactNode;
    components?: Partial<ICellUiContainerComponents>;
}

interface ICellLoadingProps {
    children?: React.ReactNode;
    components?: Partial<ICellUiLoadingComponents>;
}

interface ICellFieldErrorProps {
    components?: Partial<ICellUiFieldErrorComponents>;
}

interface ICellControlProps {
    components?: Partial<ICellUiControlComponents>;
    children?: React.ReactNode;
}

interface ICellColumnControlProps {
    components?: Partial<ICellColumnControlComponents>;
}

interface ICellCommandsProps {
    components?: Partial<ICellUiCommandsComponents>;
}

interface ICellLockIconProps {
    components?: Partial<ICellUiLockIconComponents>;
}

interface ICellResizeGripProps {
    children?: React.ReactNode;
    components?: Partial<ICellUiResizeGripComponents>;
}

interface ICellFieldProps {
    record: IRecord;
    /** The column to bind to, by name. */
    name: string;
    children?: React.ReactNode;
}

interface ICellNestedRootProps {
    children?: React.ReactNode;
}

interface ICellLegacyNestedControlProps {
    controlProps: IGridValueRenderer;
    control: IGridControl;
}

/** Everything a cell is drawn from. */
interface IGridCellNamespace {
    /** The grid's cell; wrap it in Grid.Cell.Field to bind it to a record's column. */
    Renderer: (props: ICellRendererProps) => JSX.Element;
    /** A cell with no value in it, for a column that holds none. */
    EmptyRenderer: (props: ICellEmptyRendererProps) => JSX.Element;
    /** useGridCell reads the cell it creates. */
    Root: (props: ICellRootProps) => JSX.Element;
    Theme: (props: ICellThemeProps) => JSX.Element;
    /** Grid.Cell.Loading has to be drawn inside it. */
    Container: (props: ICellContainerProps) => JSX.Element;
    /** What stands in for the content it wraps while the cell waits. */
    Loading: (props: ICellLoadingProps) => JSX.Element;
    /** What the cell says when the record refuses the value. */
    FieldError: (props: ICellFieldErrorProps) => JSX.Element;
    /** The room the value is drawn in; whatever is inside it keeps the cell's layout. */
    Control: (props: ICellControlProps) => JSX.Element | null;
    /** Decides what the column draws for the cell's value: its control, a PCF control or onRenderControl. */
    ColumnControl: (props: ICellColumnControlProps) => JSX.Element;
    /** Shown while the row is hovered, focused or selected. */
    Commands: (props: ICellCommandsProps) => JSX.Element | null;
    /** Has to be drawn around Grid.Cell.Container. */
    ResizeGrip: (props: ICellResizeGripProps) => JSX.Element;
    /** Binds what is inside it to one record's column, for useGridField. */
    Field: (props: ICellFieldProps) => JSX.Element;
    /** Runs its children's handlers before the grid's, in a React root of its own. */
    NestedRoot: (props: ICellNestedRootProps) => JSX.Element;
    /** What draws a column that named a control of its own. */
    LegacyNestedControl: (props: ICellLegacyNestedControlProps) => JSX.Element;
    Ui: ICellUi;
}

interface IColumnHeaderUiContainerComponents {
    /** What the header is drawn in and clicked to open its menu. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

interface IColumnHeaderUiContentComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

interface IColumnHeaderUiLabelComponents {
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

interface IColumnHeaderUiRequiredMarkerComponents {
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

interface IColumnHeaderUiPrefixComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

interface IColumnHeaderUiSuffixComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

interface IColumnHeaderUiMenuComponents {
    onRenderContextualMenu: (props: IContextualMenuProps) => JSX.Element | null;
}

type IColumnHeaderUiContainerProps = IButtonProps & {
    components?: Partial<IColumnHeaderUiContainerComponents>;
};

type IColumnHeaderUiContentProps = React.HTMLAttributes<HTMLDivElement> & {
    alignment?: IAlignment;
    components?: Partial<IColumnHeaderUiContentComponents>;
};

type IColumnHeaderUiLabelProps = ITextProps & {
    name?: string;
    components?: Partial<IColumnHeaderUiLabelComponents>;
};

type IColumnHeaderUiRequiredMarkerProps = ITextProps & {
    /** Nothing is drawn unless it is true. */
    isRequired?: boolean;
    components?: Partial<IColumnHeaderUiRequiredMarkerComponents>;
};

interface IColumnHeaderUiPrefixProps {
    alignment?: IAlignment;
    className?: string;
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiPrefixComponents>;
}

interface IColumnHeaderUiSuffixProps {
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiSuffixComponents>;
}

type IColumnHeaderUiMenuProps = Omit<IContextualMenuProps, 'items'> & {
    /** Nothing to offer is nothing to draw. */
    items?: IContextualMenuItem[];
    components?: Partial<IColumnHeaderUiMenuComponents>;
};

/** Draws a column header without knowing about the grid. */
interface IColumnHeaderUi {
    Container: (props: IColumnHeaderUiContainerProps) => JSX.Element | null;
    Content: (props: IColumnHeaderUiContentProps) => JSX.Element | null;
    Label: (props: IColumnHeaderUiLabelProps) => JSX.Element | null;
    RequiredMarker: (props: IColumnHeaderUiRequiredMarkerProps) => JSX.Element | null;
    Prefix: (props: IColumnHeaderUiPrefixProps) => JSX.Element | null;
    Suffix: (props: IColumnHeaderUiSuffixProps) => JSX.Element | null;
    Menu: (props: IColumnHeaderUiMenuProps) => JSX.Element | null;
}

/** The replaceable pieces of a column header, by the part they belong to. */
interface IColumnHeaderRendererComponents {
    container?: Partial<IColumnHeaderUiContainerComponents>;
    prefix?: Partial<IColumnHeaderUiPrefixComponents>;
    content?: Partial<IColumnHeaderUiContentComponents>;
    label?: Partial<IColumnHeaderUiLabelComponents>;
    requiredMarker?: Partial<IColumnHeaderUiRequiredMarkerComponents>;
    suffix?: Partial<IColumnHeaderUiSuffixComponents>;
    menu?: Partial<IColumnHeaderUiMenuComponents>;
}

/** What AG Grid hands a header component that the grid reads. */
interface IColumnHeaderParams {
    column: Column;
    /** The element AG Grid draws the header in. */
    eGridHeader?: HTMLElement;
}

/** What colDef.headerComponentParams sets to change a column's header. */
interface IColumnHeaderRendererOptions {
    /** The seed the header's theme is generated from. */
    theme?: ITheme;
    components?: IColumnHeaderRendererComponents;
}

interface IColumnHeaderRendererProps extends IColumnHeaderParams, IColumnHeaderRendererOptions {}

interface IColumnHeaderRootProps extends IColumnHeaderParams {
    children?: React.ReactNode;
}

interface IColumnHeaderThemeProps {
    theme?: ITheme;
    children?: React.ReactNode;
}

interface IColumnHeaderContainerProps {
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiContainerComponents>;
}

interface IColumnHeaderPrefixProps {
    components?: Partial<IColumnHeaderUiPrefixComponents>;
}

interface IColumnHeaderContentProps {
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiContentComponents>;
}

interface IColumnHeaderLabelProps {
    components?: Partial<IColumnHeaderUiLabelComponents>;
}

interface IColumnHeaderRequiredMarkerProps {
    components?: Partial<IColumnHeaderUiRequiredMarkerComponents>;
}

interface IColumnHeaderSuffixProps {
    components?: Partial<IColumnHeaderUiSuffixComponents>;
}

interface IColumnHeaderMenuProps {
    components?: Partial<IColumnHeaderUiMenuComponents>;
}

/** Everything a column header is drawn from. */
interface IGridColumnHeaderNamespace {
    /** A column's header, with what the modules add to it. */
    Renderer: (props: IColumnHeaderRendererProps) => JSX.Element;
    /** useGridColumnHeader reads the header it creates. */
    Root: (props: IColumnHeaderRootProps) => JSX.Element;
    Theme: (props: IColumnHeaderThemeProps) => JSX.Element;
    /** Opens the menu on click. */
    Container: (props: IColumnHeaderContainerProps) => JSX.Element;
    /** What the modules draw before the name. */
    Prefix: (props: IColumnHeaderPrefixProps) => JSX.Element;
    Content: (props: IColumnHeaderContentProps) => JSX.Element;
    Label: (props: IColumnHeaderLabelProps) => JSX.Element;
    RequiredMarker: (props: IColumnHeaderRequiredMarkerProps) => JSX.Element;
    /** What the modules draw after the name, with the lock icon. */
    Suffix: (props: IColumnHeaderSuffixProps) => JSX.Element;
    /** The menu the header opens over the grid. */
    Menu: (props: IColumnHeaderMenuProps) => JSX.Element;
    Ui: IColumnHeaderUi;
}

interface IOverlayUiLoadingComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderSpinner: (props: ISpinnerProps) => JSX.Element | null;
    /** Drawn only while there is a message. */
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

interface IOverlayUiEmptyRecordsComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

interface IOverlayUiLoadingProps {
    /** What is being waited on, drawn under the spinner. */
    message?: string;
    components?: Partial<IOverlayUiLoadingComponents>;
}

interface IOverlayUiEmptyRecordsProps {
    message: string;
    components?: Partial<IOverlayUiEmptyRecordsComponents>;
}

interface IOverlayUi {
    Loading: (props: IOverlayUiLoadingProps) => JSX.Element | null;
    EmptyRecords: (props: IOverlayUiEmptyRecordsProps) => JSX.Element | null;
}

/** What the grid draws over its rows. */
interface IGridOverlayNamespace {
    /** Its parts are replaced through components.overlays.loading. */
    Loading: () => JSX.Element;
    /** Its parts are replaced through components.overlays.emptyRecords. */
    EmptyRecords: () => JSX.Element;
    Ui: IOverlayUi;
}

interface IRowUiLoadingComponents {
    onRenderShimmer: (props: IShimmerProps) => JSX.Element | null;
}

interface IRowUiErrorComponents {
    onRenderMessageBar: (props: IMessageBarProps) => JSX.Element | null;
}

interface IRowUiLoadingProps {
    components?: Partial<IRowUiLoadingComponents>;
}

interface IRowUiErrorProps {
    message: string;
    components?: Partial<IRowUiErrorComponents>;
}

interface IRowUi {
    Loading: (props: IRowUiLoadingProps) => JSX.Element | null;
    Error: (props: IRowUiErrorProps) => JSX.Element | null;
}

interface IRowErrorProps extends ICellRendererParams<IRecord> {
    errorMessage: string;
}

/** What the grid draws across a whole row. */
interface IGridRowNamespace {
    /** Its parts are replaced through components.rows.loading. */
    Loading: (props: ILoadingCellRendererParams<IRecord>) => JSX.Element;
    /** Its parts are replaced through components.rows.error. */
    Error: (props: IRowErrorProps) => JSX.Element;
    Ui: IRowUi;
}

interface IRecordSaveUiError {
    /** The display name of the field it is about, if it is about one. */
    fieldName?: string;
    message: string;
}

interface IRecordSaveUiErrorCalloutComponents {
    onRenderCallout: (props: ICalloutProps) => JSX.Element | null;
    onRenderHeader: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    onRenderTitle: (props: ITextProps) => JSX.Element | null;
    onRenderFields: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderField: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderFieldName: (props: ITextProps) => JSX.Element | null;
    onRenderMessage: (props: ITextProps) => JSX.Element | null;
    onRenderFooter: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What clears the failure. */
    onRenderDismissButton: (props: IButtonProps) => JSX.Element | null;
}

interface IRecordSaveUiErrorCalloutProps {
    target: React.RefObject<HTMLElement>;
    title: string;
    dismissText: string;
    errors: IRecordSaveUiError[];
    onDismiss: () => void;
    /** Called by the dismiss button, to clear the failure. */
    onClear: () => void;
    components?: Partial<IRecordSaveUiErrorCalloutComponents>;
}

type IRecordSaveUiIndicatorState = 'saving' | 'succeeded' | 'failed';

type IRecordSaveUiIndicatorButtonProps = IButtonProps & {
    state: 'succeeded' | 'failed';
};

interface IRecordSaveUiIndicatorComponents {
    /** The element the error callout points at. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderSpinner: (props: ISpinnerProps) => JSX.Element | null;
    /** Opens the error callout after a failed save. */
    onRenderButton: (props: IRecordSaveUiIndicatorButtonProps) => JSX.Element | null;
    onRenderErrorCallout: (props: IRecordSaveUiErrorCalloutProps) => JSX.Element | null;
}

interface IRecordSaveUiIndicatorProps {
    state: IRecordSaveUiIndicatorState;
    errorCallout?: Omit<IRecordSaveUiErrorCalloutProps, 'target' | 'onDismiss'>;
    components?: Partial<IRecordSaveUiIndicatorComponents>;
}

/** The replaceable pieces a record's save status is drawn with, by the part they belong to. */
interface IRecordSaveUiComponents {
    /** Used where the indicator has a cell of its own. */
    container?: Partial<ICellUiContainerComponents>;
    indicator?: Partial<IRecordSaveUiIndicatorComponents>;
    /** The callout a failed save opens. */
    errorCallout?: Partial<IRecordSaveUiErrorCalloutComponents>;
}

interface IRecordSaveUi {
    Indicator: (props: IRecordSaveUiIndicatorProps) => JSX.Element | null;
    ErrorCallout: (props: IRecordSaveUiErrorCalloutProps) => JSX.Element | null;
}

interface IRecordSaveIndicatorProps {
    /** What is drawn while there is no save to report. */
    children?: React.ReactNode;
    components?: IRecordSaveUiComponents;
}

interface IRecordSaveIndicatorCellProps extends ICellRendererParams {
    theme?: ITheme;
    components?: IRecordSaveUiComponents;
}

/** The save status of the cell's record, or its children while there is none; from the editing module. */
declare const RecordSaveIndicator: (props: IRecordSaveIndicatorProps) => JSX.Element;
/** The cell a row reports its save in, on a grid with no checkbox column; from the editing module. */
declare const RecordSaveIndicatorCell: (props: IRecordSaveIndicatorCellProps) => JSX.Element;
/** What draws a save status without knowing which record; from the editing module. */
declare const RecordSaveUi: IRecordSaveUi;

/** The replaceable pieces of the lock cell, by the part they belong to. */
interface IRecordLockIndicatorCellComponents {
    container?: Partial<ICellUiContainerComponents>;
    lockIcon?: Partial<ICellUiLockIconComponents>;
}

interface IRecordLockIconProps {
    components?: Partial<ICellUiLockIconComponents>;
}

interface IRecordLockIndicatorCellProps extends ICellRendererParams {
    theme?: ITheme;
    components?: IRecordLockIndicatorCellComponents;
}

/** A row's checkbox cell that also reports its save. */
interface IRecordSaveSelectionCellComponents extends IRecordSaveUiComponents {
    checkbox?: Partial<IRowSelectionUiCheckboxComponents>;
}

interface IRecordSaveSelectionCellProps extends ICellRendererParams<IRecord> {
    theme?: ITheme;
    components?: IRecordSaveSelectionCellComponents;
}

/** Replaces parts of what the grid draws over its rows. */
interface IGridOverlayComponents {
    loading?: Partial<IOverlayUiLoadingComponents>;
    emptyRecords?: Partial<IOverlayUiEmptyRecordsComponents>;
}

/** Replaces parts of the rows the grid draws in place of records. */
interface IGridRowComponents {
    loading?: Partial<IRowUiLoadingComponents>;
    error?: Partial<IRowUiErrorComponents>;
}

/** Replaces parts of what the grid draws itself. */
interface IGridComponents {
    overlays?: IGridOverlayComponents;
    rows?: IGridRowComponents;
}

/** What happens inside the grid, for a consumer to react to. */
interface IGridEventHandlers {
    onDataLoaded: () => void;
    onLoadingChanged: (isLoading: boolean) => void;
    onRecordValueChanged: (record: IRecord, columnName: string, newValue: any) => void;
    onBeforeRecordSaved: (record: IRecord) => void;
    /** Fired per record, auto-save included. */
    onAfterRecordSaved: (result: IRecordSaveOperationResult) => void;
    /** Fired once provider.save() has saved every record. */
    onAfterSaved: (results: IRecordSaveOperationResult[]) => void;
    onError: (message: string, details?: any) => void;
    /** Fired whether or not the record then opens. */
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
    onRowClicked: (record: IRecord) => void;
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
    /** Fired when the user resizes or moves a column. */
    onColumnsChanged: (columns: IColumn[]) => void;
}

interface IGrid extends Partial<IGridEventHandlers> {
    /** Read once, at mount. */
    provider: IDataProvider;
    /** Read once, at mount. */
    modules: IGridModules;
    /** True by default and read once, at mount. */
    enableNavigation?: boolean;
    /** Read once, at mount. */
    enableOptionSetColors?: boolean;
    /** True by default and read once, at mount. */
    enableZebra?: boolean;
    /** 42 pixels by default and read once, at mount. */
    rowHeight?: number;
    /** 15 by default. */
    maxVisibleRows?: number;
    /** Without one, the grid grows to fit its rows up to maxVisibleRows. */
    height?: string;
    className?: string;
    components?: IGridComponents;
    /** Read once, at mount. */
    labels?: Partial<IGridLabels>;
    /** Applied by id on every column build, after every module's hook. */
    colDefs?: { [colId: string]: IGridColDefOverride };
    /** Read whenever the grid asks. */
    rowSettings?: IGridRowSettings;
    /** Read once, at mount. */
    state?: GridState;
    /** Replaces opening a record from the grid. */
    onOpenRecord?: (params: IGridOpenRecordParams) => void;
    /** Fired once gridApi is among the runtime's services. */
    onGridReady?: (runtime: IGridRuntime) => void;
    /** Fired before the grid tears down. */
    onDestroyed?: (runtime: IGridRuntime) => void;
}

/** Everything a grid is rendered from. */
interface IGridNamespace {
    Root: (props: IGrid) => JSX.Element;
    Cell: IGridCellNamespace;
    ColumnHeader: IGridColumnHeaderNamespace;
    Overlay: IGridOverlayNamespace;
    Row: IGridRowNamespace;
}

declare const Grid: IGridNamespace;

interface IRowSelectionUiCheckboxComponents {
    /** What the checkbox is drawn in, and what takes the click. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderCheckbox: (props: ICheckboxProps) => JSX.Element | null;
}

interface IRowSelectionUiHeaderCheckboxComponents {
    /** Drawn even while the checkbox is not. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderCheckbox: (props: ICheckboxProps) => JSX.Element | null;
}

/** The checkbox cell, also showing a row's save status. */
interface ISelectionCellComponents {
    container?: Partial<ICellUiContainerComponents>;
    checkbox?: Partial<IRowSelectionUiCheckboxComponents>;
}

interface ISelectionHeaderComponents {
    headerCheckbox?: Partial<IRowSelectionUiHeaderCheckboxComponents>;
}

interface ISelectionCellProps extends ICellRendererParams<IRecord> {
    theme?: ITheme;
    components?: ISelectionCellComponents;
}

interface ISelectionHeaderProps extends IColumnHeaderParams {
    components?: ISelectionHeaderComponents;
}

interface IRowSelectionModuleOptions {
    mode: 'single' | 'multiple';
    /** Called when the selected records change, with the ids now selected. */
    onSelectionChanged?: (selectedRecordIds: string[]) => void;
}

interface IGridCellSelectionOptions {
    suppressMultiRanges?: boolean;
    /** The fill handle does not change records. */
    handle?: { mode: 'range' } | { mode: 'fill'; direction?: 'x' | 'y' | 'xy'; suppressClearOnFillReduction?: boolean };
    enableHeaderHighlight?: boolean;
}

interface IGridClipboardOptions {
    clipboardDelimiter?: string;
    copyHeadersToClipboard?: boolean;
    copyGroupHeadersToClipboard?: boolean;
    suppressCutToClipboard?: boolean;
    suppressClipboardPaste?: boolean;
    suppressClipboardApi?: boolean;
    suppressLastEmptyLineOnPaste?: boolean;
    processCellForClipboard?: (params: ProcessCellForExportParams<IRecord>) => any;
    processHeaderForClipboard?: (params: ProcessHeaderForExportParams) => any;
    processGroupHeaderForClipboard?: (params: ProcessGroupHeaderForExportParams) => any;
    processCellFromClipboard?: (params: ProcessCellForExportParams<IRecord>) => any;
    processDataFromClipboard?: (params: ProcessDataFromClipboardParams) => string[][] | null;
    sendToClipboard?: (params: SendToClipboardParams) => void;
}

type IGridSortingIconProps = IIconProps & {
    descending: boolean;
};

interface IGridSortingIconComponents {
    onRenderIcon: (props: IGridSortingIconProps) => JSX.Element | null;
}

interface IGridSortingComponents {
    /** What a sorted column shows in its header. */
    sortIcon?: Partial<IGridSortingIconComponents>;
}

interface ISortingModuleOptions {
    labels?: Partial<IGridSortingLabels>;
    components?: IGridSortingComponents;
}

interface IGridFilteringIconComponents {
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
}

interface IFilteringUiCalloutComponents {
    /** What everything is drawn in, pointed at the column's header. */
    onRenderCallout: (props: ICalloutProps) => JSX.Element | null;
    onRenderHeader: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTitle: (props: ITextProps) => JSX.Element | null;
    onRenderCloseButton: (props: IButtonProps) => JSX.Element | null;
}

interface IGridFilteringComponents {
    /** What a filtered column shows in its header. */
    filterIcon?: Partial<IGridFilteringIconComponents>;
    /** The callout a column's filter is set in. */
    filterCallout?: Partial<IFilteringUiCalloutComponents>;
}

interface IFilteringModuleOptions {
    labels?: Partial<IGridFilteringLabels>;
    components?: IGridFilteringComponents;
}

interface IGridGroupingIconComponents {
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
}

type IGroupingUiToggleButtonProps = IButtonProps & {
    isExpanded: boolean;
};

interface IGroupingUiToggleComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderButton: (props: IGroupingUiToggleButtonProps) => JSX.Element | null;
}

interface IGroupingUiCountComponents {
    onRenderCount: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

interface IGroupingUiExpandCollapseComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderExpandButton: (props: IButtonProps) => JSX.Element | null;
    onRenderCollapseButton: (props: IButtonProps) => JSX.Element | null;
}

/** What a group row draws in the column it is grouped by. */
interface IGroupCellComponents extends Pick<ICellRendererComponents, 'container' | 'loading' | 'control' | 'columnControl' | 'commands'> {
    /** The chevron that opens and closes the group. */
    toggle?: Partial<IGroupingUiToggleComponents>;
    /** How many records the group holds. */
    count?: Partial<IGroupingUiCountComponents>;
}

interface IGroupExpansionHeaderComponents {
    expandCollapse?: Partial<IGroupingUiExpandCollapseComponents>;
}

interface IGridGroupingComponents {
    /** What a grouped column shows in its header, before the name. */
    groupingIcon?: Partial<IGridGroupingIconComponents>;
    groupCell?: IGroupCellComponents;
}

interface IGroupExpansionHeaderProps extends IColumnHeaderParams {
    components?: IGroupExpansionHeaderComponents;
}

interface IGroupingModuleOptions {
    labels?: Partial<IGridGroupingLabels>;
    components?: IGridGroupingComponents;
    /** True by default. */
    allowUserGrouping?: boolean;
    /** nested by default. */
    type?: 'nested' | 'flat';
    /** -1 by default. */
    defaultExpandedLevel?: number;
    /** True by default. */
    pinGroupedColumns?: boolean;
    /** 100 by default. */
    maxGroupLoadsPerSelection?: number;
}

interface IAggregationUiTotalValueComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** Drawn only where there is a label. */
    onRenderLabel: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    onRenderValue: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** What a column that totals something draws in the totals row. */
interface ITotalCellComponents extends Pick<ICellRendererComponents, 'container' | 'loading' | 'commands'> {
    totalValue?: Partial<IAggregationUiTotalValueComponents>;
}

/** What a column that totals something draws in a group's row. */
interface IAggregateCellComponents extends Pick<ICellRendererComponents, 'container' | 'loading' | 'control' | 'columnControl' | 'commands'> {}

interface IGridAggregationComponents {
    totalCell?: ITotalCellComponents;
    aggregateCell?: IAggregateCellComponents;
}

interface IAggregationModuleOptions {
    labels?: Partial<IGridAggregationLabels>;
    /** True by default. */
    allowUserAggregation?: boolean;
    components?: IGridAggregationComponents;
}

interface ILicenseModuleOptions {
    /** The AG Grid Enterprise key. */
    key: string;
}

interface IRowSelectionUiCheckboxProps {
    state: IGridRowSelectionState;
    disabled?: boolean;
    onToggle: () => void;
    components?: Partial<IRowSelectionUiCheckboxComponents>;
}

interface IRowSelectionUiHeaderCheckboxProps {
    state: IGridRowSelectionState;
    isCheckboxVisible: boolean;
    onChange: (checked: boolean) => void;
    components?: Partial<IRowSelectionUiHeaderCheckboxComponents>;
}

/** Draws row selection without knowing about the grid. */
interface IRowSelectionUi {
    Checkbox: (props: IRowSelectionUiCheckboxProps) => JSX.Element | null;
    HeaderCheckbox: (props: IRowSelectionUiHeaderCheckboxProps) => JSX.Element | null;
}

declare const RowSelectionUi: IRowSelectionUi;

interface IFilteringUiCalloutProps {
    /** What the callout points at. */
    target?: Target;
    title: string;
    onDismiss: () => void;
    /** What the filter is set with, drawn under the header. */
    children?: React.ReactNode;
    components?: Partial<IFilteringUiCalloutComponents>;
}

/** Draws filtering without knowing about the grid. */
interface IFilteringUi {
    Callout: (props: IFilteringUiCalloutProps) => JSX.Element | null;
}

declare const FilteringUi: IFilteringUi;

interface IGroupingUiExpandCollapseProps {
    expandTitle: string;
    collapseTitle: string;
    canExpand: boolean;
    canCollapse: boolean;
    onExpand: () => void;
    onCollapse: () => void;
    components?: Partial<IGroupingUiExpandCollapseComponents>;
}

interface IGroupingUiToggleProps {
    isExpanded: boolean;
    onToggle: () => void;
    components?: Partial<IGroupingUiToggleComponents>;
}

interface IGroupingUiCountProps {
    count: number;
    alignment?: IAlignment;
    components?: Partial<IGroupingUiCountComponents>;
}

/** Draws grouping without knowing about the grid. */
interface IGroupingUi {
    ExpandCollapse: (props: IGroupingUiExpandCollapseProps) => JSX.Element | null;
    Toggle: (props: IGroupingUiToggleProps) => JSX.Element | null;
    Count: (props: IGroupingUiCountProps) => JSX.Element | null;
}

declare const GroupingUi: IGroupingUi;

interface IAggregationUiTotalValueProps {
    /** What the total is of. */
    label?: string;
    /** The total, formatted. */
    value?: string;
    components?: Partial<IAggregationUiTotalValueComponents>;
}

/** Draws the totals without knowing about the grid. */
interface IAggregationUi {
    TotalValue: (props: IAggregationUiTotalValueProps) => JSX.Element | null;
}

declare const AggregationUi: IAggregationUi;

declare const GridSortingIconComponents: IGridSortingIconComponents;
declare const GridFilteringIconComponents: IGridFilteringIconComponents;
declare const GridGroupingIconComponents: IGridGroupingIconComponents;

interface IGroupCellProps extends ICellRendererParams<IRecord> {
    theme?: ITheme;
    /** Merged over the module's groupCell. */
    components?: IGroupCellComponents;
}

interface ITotalCellProps extends ICellRendererParams<IRecord> {
    theme?: ITheme;
    /** Merged over the module's totalCell. */
    components?: ITotalCellComponents;
}

interface IAggregateCellProps extends ICellRendererParams<IRecord> {
    theme?: ITheme;
    /** Merged over the module's aggregateCell. */
    components?: IAggregateCellComponents;
}

/** What a group row draws in the column it is grouped by. */
declare const GroupCell: (props: IGroupCellProps) => JSX.Element;
/** What a column that totals something draws in the totals row. */
declare const TotalCell: (props: ITotalCellProps) => JSX.Element;
/** What a column that totals something draws in a group's row. */
declare const AggregateCell: (props: IAggregateCellProps) => JSX.Element;
/** The header of the column that opens and closes the groups a level at a time. */
declare const GroupExpansionHeader: (props: IGroupExpansionHeaderProps) => JSX.Element;

interface INotificationCardAction {
    key: string;
    text: string;
    iconName?: string;
    onClick: () => void;
}

interface INotificationCardProps {
    title?: string;
    message?: string;
    /** More than two are drawn as links. */
    actions?: INotificationCardAction[];
}

/** A notification read in full, as a cell's notification callout shows it. */
declare const NotificationCard: (props: INotificationCardProps) => JSX.Element;

interface INotificationMessageBarLabels {
    /** Takes {{ count }}. */
    groupedNotificationsSummary: string;
}

interface INotificationMessageBarProps {
    /** Several messages fold into one bar. */
    messages?: { text: string; level: 'ERROR' | 'WARNING' | 'INFO' }[];
    components?: {};
    labels?: Partial<INotificationMessageBarLabels>;
}

declare const NotificationMessageBar: (props: INotificationMessageBarProps) => JSX.Element;

/** Holds every row at once. */
declare function createClientSideRowModelModule(): IGridModule;
/** An AG Grid Enterprise module that reads a level at a time. */
declare function createServerSideRowModelModule(): IGridModule;
/** Licenses AG Grid Enterprise. */
declare function createLicenseModule(options: ILicenseModuleOptions): IGridModule;
/** Lets rows be selected from a checkbox column. */
declare function createRowSelectionModule(options: IRowSelectionModuleOptions): IGridModule;
/** An AG Grid Enterprise module for highlighting ranges of cells. */
declare function createCellSelectionModule(options?: IGridCellSelectionOptions): IGridModule;
/** AG Grid Enterprise copying, with no paste into records. */
declare function createClipboardModule(options?: IGridClipboardOptions): IGridModule;
/** The cells the editing module draws its columns with, named like those in Grid.Cell. */
declare const EditingCell: {
    /** A cell that also says when it is locked for its record. */
    Renderer: (props: IEditingCellRendererProps) => JSX.Element;
    /** The cell while it is being edited. */
    Editor: (props: IEditingCellEditorProps) => JSX.Element;
    /** Grid.Cell.Root for a cell that takes input as an editor or a one-click column. */
    Root: (props: IEditingCellRootProps) => JSX.Element;
};
/** What says a cell is locked for its record; from the editing module. */
declare const CellLockIcon: (props: ICellLockIconProps) => JSX.Element | null;
/** The checkbox that selects the cell's record; from the row selection module. */
declare const SelectionCheckbox: (props: { components?: Partial<IRowSelectionUiCheckboxComponents> }) => JSX.Element;
/** A row's checkbox cell; from the row selection module. */
declare const SelectionCell: (props: ISelectionCellProps) => JSX.Element;
/** The checkbox column's header, which selects every record; from the row selection module. */
declare const SelectionHeader: (props: ISelectionHeaderProps) => JSX.Element;
/** The checkbox cell with the row's save status; from the editing module. */
declare const RecordSaveSelectionCell: (props: IRecordSaveSelectionCellProps) => JSX.Element;
/** The lock drawn for a record locked as a whole, or nothing; from the editing module. */
declare const RecordLockIcon: (props: IRecordLockIconProps) => JSX.Element | null;
/** The cell a locked record's row shows its lock in; from the editing module. */
declare const RecordLockIndicatorCell: (props: IRecordLockIndicatorCellProps) => JSX.Element;
/** Lets the cells be edited, and saves each edit with autoSave. */
declare function createEditingModule(options?: { autoSave?: boolean; onEditedCellChanged?: IGridEditingEvents['onEditedCellChanged'] }): IGridModule;
/** Lets a column be sorted from its menu, unless it sets disableSorting. */
declare function createSortingModule(options?: ISortingModuleOptions): IGridModule;
/** Lets a column with filter operators be filtered from its menu. */
declare function createFilteringModule(options?: IFilteringModuleOptions): IGridModule;
/** Groups the rows by a column with AG Grid Enterprise. */
declare function createGroupingModule(options?: IGroupingModuleOptions): IGridModule;
/** Shows totals in a row pinned under the rest. */
declare function createAggregationModule(options?: IAggregationModuleOptions): IGridModule;
/** Carries what legacy scripts set on records' fields into the cells. */
declare function createLegacyClientApiCompatibilityModule(): IGridModule;
`
