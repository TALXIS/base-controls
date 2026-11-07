/** Ambient types for the Monaco editor behind the live Grid examples. */
export const gridSandboxDeclarations = `
declare const React: typeof import('react');
/** One place to hook into; what add returns takes the hook back off. */
interface IHookPoint<THook extends (...args: any[]) => void> {
    add(hook: THook, priority?: number): () => void;
}
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
    interface ElementChildrenAttribute {
        children: {};
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
declare const DocumentCard: typeof import('@fluentui/react').DocumentCard;
declare const DocumentCardActivity: typeof import('@fluentui/react').DocumentCardActivity;
declare const DocumentCardDetails: typeof import('@fluentui/react').DocumentCardDetails;
declare const DocumentCardImage: typeof import('@fluentui/react').DocumentCardImage;
declare const DocumentCardTitle: typeof import('@fluentui/react').DocumentCardTitle;
declare const Dropdown: typeof import('@fluentui/react').Dropdown;
declare const Pivot: typeof import('@fluentui/react').Pivot;
declare const PivotItem: typeof import('@fluentui/react').PivotItem;
declare const FontWeights: typeof import('@fluentui/react').FontWeights;
declare const Icon: typeof import('@fluentui/react').Icon;
declare const IconButton: typeof import('@fluentui/react').IconButton;
declare const ImageFit: typeof import('@fluentui/react').ImageFit;
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
declare const Spinner: typeof import('@talxis/base-controls').Spinner;
declare const Stack: typeof import('@fluentui/react').Stack;
/** Registers Fluent's icon font; a new window, such as an isolated frame, needs it once. */
declare const initializeIcons: typeof import('@fluentui/react').initializeIcons;
/** Fluent's Text component, merged into the DOM's Text type. */
declare var Text: { new (data?: string): Text; prototype: Text };
interface Text extends React.Component<ITextProps> {
    props: ITextProps;
}
declare const TextField: typeof import('@fluentui/react').TextField;
declare const Toggle: typeof import('@fluentui/react').Toggle;
declare const TooltipHost: typeof import('@fluentui/react').TooltipHost;

type IButtonProps = import('@fluentui/react').IButtonProps;
type ILinkProps = import('@fluentui/react').ILinkProps;
type ICheckProps = import('@fluentui/react').ICheckProps;
type ICalloutProps = import('@fluentui/react').ICalloutProps;
type ICheckboxProps = import('@fluentui/react').ICheckboxProps;
type IChoiceGroupOption = import('@fluentui/react').IChoiceGroupOption;
type ICommandBarItemProps = import('@fluentui/react').ICommandBarItemProps;
type ICommandBarProps = import('@fluentui/react').ICommandBarProps;
type IContextualMenuItem = import('@fluentui/react').IContextualMenuItem;
type IPanelProps = import('@fluentui/react').IPanelProps;
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
    /** Returns the function that removes the listener again. */
    addEventListener<K extends keyof T>(event: K, callback: T[K]): () => void;
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
    /** Fired once deleteRecords() has deleted the records. */
    onAfterRecordsDeleted: (results: IRecordDeleteOperationResult[]) => void;
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
    addEventListener<K extends keyof IDataProviderEventListeners>(event: K, eventListener: IDataProviderEventListeners[K]): () => void;
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
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;
    searchQuery?: string;
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
    /** Deletes the records from wherever the provider keeps them; deleteRecords calls it. */
    abstract onRecordsDelete(recordIds: string[]): Promise<{ success: boolean; results: IRecordDeleteOperationResult[] }>;
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
    /** Removes the records from the data source. */
    onRecordsDelete(recordIds: string[]): Promise<{ success: boolean; results: IRecordDeleteOperationResult[] }>;
    onIsRecordActive(recordId: string): boolean;
    onOpenDatasetItem(entityReference: ComponentFramework.EntityReference): void;
    /** The columns Edit columns offers to add. */
    onGetAvailableColumns(): Promise<IColumn[]>;
    getDataAsync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): Promise<IRetrievedData>;
    getDataSync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): IRetrievedData;
}

/** The example's provider, loaded with the dataset the example names. */
declare const provider: IDataProvider;

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

/** A new, unloaded provider over the 30 deals of a sales pipeline. */
declare function createDealsProvider(): MemoryDataProvider;
/** A script an isolated frame loads, in order: a URL, or a module. */
type IsolatedFrameScript = string | { src: string; type: 'module' };
interface IIsolatedComponentParameters {
    /** What the frame loads, in order; pass it when the content is in a script of its own. */
    scripts?: IsolatedFrameScript[];
    /** Called with the frame's window before its scripts load. */
    prepareWindow?: (frameWindow: Window) => void;
}
/** The frame's own settings; every other prop goes to the content. */
type IIsolatedComponentProps = { frame?: { className?: string; title?: string } };
/** The component the page renders: an iframe that loads options.scripts and renders what they registered under key. */
declare function createIsolatedHost<TProps extends object>(key: string, options?: IIsolatedComponentParameters): React.ComponentType<TProps & IIsolatedComponentProps>;
/** Registers what frames render under key; outside a frame it does nothing. */
declare function defineIsolatedContent<TProps extends object>(key: string, Content: React.ComponentType<TProps>): void;
/** Both sides from one bundle: the host on the page, the registered content in a frame. */
declare function createIsolatedComponent<TProps extends object>(key: string, Content: React.ComponentType<TProps>, options?: IIsolatedComponentParameters): React.ComponentType<TProps & IIsolatedComponentProps>;
/** What an isolated frame loads to run this example: the docs' bundle, then the example's own code. */
declare const SANDBOX_FRAME_SCRIPTS: IsolatedFrameScript[];
/** The 30 deals of the sales pipeline, as raw records. */
declare const DEAL_ROWS: IRawRecord[];
/** The columns of the deals. */
declare const DEAL_COLUMNS: IColumn[];
/** The id attribute of the deals. */
declare const DEAL_PRIMARY_ID: string;
/** A new, unloaded provider over a consulting team's 24 timesheet entries of last week. */
declare function createTimesheetsProvider(): MemoryDataProvider;
/** A new, unloaded provider over a support desk's 36 tickets. */
declare function createTicketsProvider(): MemoryDataProvider;
/** A new, unloaded provider over an office furniture shop's 16 products. */
declare function createProductsProvider(): MemoryDataProvider;
/** A new, unloaded provider over a product launch's checklist of 6 items: name, completed, stackrank, priority, owner, duedate and estimate, a duration in minutes that is totalled. */
declare function createLaunchPlanProvider(): MemoryDataProvider;

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

/** An edit over a built theme; the same key has to mean the same edit. */
interface IThemeEdit {
    key: string;
    edit: (theme: ITheme) => void;
}

/** A built theme whose colours are the seed, the three colours, or a Fluent v9 theme. */
type IThemeBuilderSource = { theme: ITheme } | { colors: IThemeColors } | { fluentDesignLanguage: any };

/** Builds a theme from three colours and the edits over the result. */
interface ThemeBuilder {
    /** Changing one regenerates the whole palette. */
    readonly colors: IThemeColors;
    /** Tints the background and text by a hue, so they read in a light theme and a dark one; a solid tint's primary is its text. */
    tint(hue: string, strength?: ITintStrength): void;
    /** The same key has to mean the same edit. */
    edit(key: string, edit: (theme: ITheme) => void): void;
    getTheme(): ITheme;
}

/** A wash behind the theme's text, a fill with text of its own, or the hue under black or white text. */
type ITintStrength = 'subtle' | 'strong' | 'solid';

interface ITintColors {
    background: string;
    border: string;
    text: string;
}

/** A hue as a surface that sits right in the theme it lands in, light or dark. */
declare function getTintColors(hue: string, surface: { background: string; text: string }, strength?: ITintStrength): ITintColors;

type IThemeProviderProps = React.HTMLAttributes<HTMLDivElement> & {
    /** The theme above, or the default theme, where left out. */
    theme?: import('@fluentui/react').ITheme;
    /** Whether the element itself is painted in the theme. */
    applyTo?: 'element' | 'none';
    children?: React.ReactNode;
};

/** An element that draws everything inside it in a theme. */
declare const ThemeProvider: (props: IThemeProviderProps & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;

/** The application's theme, which dialogs, menus and other surfaces are drawn in. */
declare const AppThemeProvider: (props: IThemeProviderProps & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;

/** The theme of the nearest provider above; throws outside an AppThemeProvider. */
declare const useTheme: () => ITheme;
/** A Fluent button's menu as a Base Controls surface, drawn in the app theme. */
declare function useSurfaceMenuProps<TMenu extends IContextualMenuProps | undefined>(menuProps: TMenu): TMenu;

/** Fluent's callout, drawn in the application theme. */
declare const Callout: (props: import('@fluentui/react').ICalloutProps & { children?: React.ReactNode }) => JSX.Element;

/** The theme dialogs, menus and other surfaces are drawn in; throws outside an AppThemeProvider. */
declare function useAppTheme(): ITheme;

/** The theme a ThemeBuilder builds, kept while the colours and the edit's key stay the same. */
declare function useThemeBuilder(source: IThemeBuilderSource, options?: IUseThemeBuilderParameters): ITheme;

interface IUseThemeBuilderParameters {
    /** A hue the background and text are tinted by, as ThemeBuilder.tint does. */
    tint?: { hue: string; strength?: ITintStrength };
    /** One edit over the result; the same key has to mean the same edit. */
    edit?: IThemeEdit;
}

/** A builder starting from a theme, three colours or a Fluent v9 theme; Fluent's defaults where left out. */
declare function createThemeBuilder(source?: IThemeBuilderSource): ThemeBuilder;

/** The nearest shade of the background's hue at 7:1 contrast, or black or white. */
declare function getTextColorForBackground(backgroundColor: string): string;

/** The WCAG contrast ratio between two colours, from 1 to 21. */
declare function getColorContrast(color: string, otherColor: string): number;

/** color mixed into base: a weight of 0 is base, 1 is color. */
declare function mixColors(color: string, base: string, weight: number): string;

/** Whether dark text reads better on the colour than light text. */
declare function isLightColor(color: string): boolean;

type IAlignment = 'left' | 'center' | 'right';

interface IParameters {
    [key: string]: any;
}

/** A component's strings: label keys and their English defaults. */
interface ILabelSet {
    readonly defaults: { [key: string]: string };
}

/** The strings of one label set, as the nearest LabelsProvider gives them. */
interface ILabels {
    get(key: string, variables?: { [name: string]: string | number }): string;
}

/** Resolves strings from label sets. */
interface ILabelsService {
    getLabels(set: ILabelSet): ILabels;
}

/** Finds the services of one mount by name. */
interface IServiceLocator<TMap extends object> {
    /** Throws while nothing is provided under key. */
    get<TKey extends keyof TMap>(key: TKey): TMap[TKey];
    /** Undefined while nothing is provided under key. */
    find<TKey extends keyof TMap>(key: TKey): TMap[TKey] | undefined;
    has(key: keyof TMap): boolean;
    /** Runs effect with the service now if it is there, and again for every later one; what it returns runs when that service goes. */
    observe<TKey extends keyof TMap>(key: TKey, effect: (service: TMap[TKey]) => void | (() => void)): () => void;
}

/** Holds the services of one mount, and ends them all with it. */
interface IServiceRegistry<TMap extends object> extends IServiceLocator<TMap> {
    /** Provides service under key, ending what was there; returns the remover of this one only. */
    provide<TKey extends keyof TMap>(key: TKey, service: TMap[TKey], parameters?: { onDestroy?: (service: TMap[TKey]) => void }): () => void;
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
    activeOverlay?: any;
    suppressOverlays?: ('loading' | 'noRows' | 'noMatchingRows' | 'exporting')[];
    theme?: AgGridTheme | 'legacy';
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
    headerComponentParams?: IColumnHeaderRendererParameters & { [param: string]: any };
    /** Defaults to the grid's cell bound to the column, or Grid.Cell.EmptyRenderer for an added column. */
    cellRenderer?: (props: IGridCellParams) => JSX.Element | null;
    /** The grid's cell renderers read theme and components from it. */
    cellRendererParams?: { theme?: ITheme; components?: ICellRendererComponents | ICompletionCellComponents | INameCellComponents } & { [param: string]: any };
    cellRendererSelector?: (params: ICellRendererParams<IRecord>) => CellRendererSelectorResult | undefined;
    cellEditor?: any;
    cellEditorParams?: any;
    /** Draws the editor in a popup over the cell. */
    cellEditorPopup?: boolean;
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
interface IGridLockHookParameters {
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
    enableOneClickEdit?: boolean;
    /** Whether the grip a row is dragged taller by is drawn in this column's cells. */
    isRowResizable?: boolean;
    /** Runs after hooks.commands. */
    commandsHook?: (result: IGridCellCommands, params: { record: IRecord }) => void;
    /** Runs after every hooks.theme. */
    themeHook?: (builder: ThemeBuilder, params: { record: IRecord }) => void;
    /** Runs after the cell-level hooks.lock hooks. */
    lockHook?: (result: IGridLock, params: { record: IRecord }) => void;
    /** Runs after hooks.loading. */
    loadingHook?: (result: IGridCellLoading, params: { record: IRecord }) => void;
    /** Runs after hooks.validation. */
    validationHook?: (result: IFieldValidationResult, params: { record: IRecord }) => void;
    /** Runs after hooks.controlParameters. */
    controlParametersHook?: (parameters: IParameters, params: { record: IRecord }) => void;
}

/** What a column decides for its header, after the header hooks. */
interface IGridColumnHeaderContext {
    /** Runs after hooks.theme. */
    themeHook?: (builder: ThemeBuilder) => void;
    /** Runs after hooks.adornments. */
    adornmentsHook?: (adornments: IColumnHeaderAdornment[]) => void;
    /** Runs after hooks.menuSections. */
    menuSectionsHook?: (sections: IColumnMenuSection[]) => void;
    /** Runs after hooks.menuItems. */
    menuItemsHook?: (items: IContextualMenuItem[]) => void;
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
type GridColumnHeaderThemeHook = (builder: ThemeBuilder, header: IGridColumnHeader) => void;
type GridColumnHeaderAdornmentsHook = (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader) => void;

interface IGridColumnHeadersEvents {
    onRenderRequested: () => void;
}

interface IGridColumnHeaders {
    /** Redraws every header, for state their columns do not hold. */
    render(): void;
    readonly hooks: {
        /** The built-in modules add their sections at GRID_MODULE_PRIORITY. */
        readonly menuSections: IHookPoint<GridColumnMenuSectionsHook>;
        /** Runs on the menu the sections became. */
        readonly menuItems: IHookPoint<GridColumnMenuItemsHook>;
        readonly adornments: IHookPoint<GridColumnHeaderAdornmentsHook>;
        readonly theme: IHookPoint<GridColumnHeaderThemeHook>;
    };
}

type GridColumnDefinitionsHook = (columnDefs: IGridColDef[]) => void;

interface IGridColumnsEvents {
    /** Fired whether or not the record then opens. */
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
    /** Fired when the user resizes or moves a column. */
    onColumnsChanged: (columns: IColumn[]) => void;
}

interface IGridColumns {
    readonly headers: IGridColumnHeaders;
    readonly hooks: {
        /** Runs on every column build, before the colDefs prop. */
        readonly columnDefinitions: IHookPoint<GridColumnDefinitionsHook>;
    };
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
type GridCellThemeHook = (builder: ThemeBuilder, params: { record: IRecord; columnName: string }) => void;
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
    /** Redraws every cell, for state their records do not hold. */
    render(): void;
    getCells(): IGridCell[];
    /** The cell drawing this field, where one is on screen. */
    getCell(record: IRecord, columnName: string): IGridCell | undefined;
    readonly hooks: {
        /** Which control draws a cell. */
        readonly control: IHookPoint<GridControlHook>;
        /** The parameters the control drawing a cell is handed. */
        readonly controlParameters: IHookPoint<GridControlParametersHook>;
        /** Below GRID_MODULE_PRIORITY.grouping, a background is lost while grouped. */
        readonly theme: IHookPoint<GridCellThemeHook>;
        readonly loading: IHookPoint<GridCellLoadingHook>;
        /** Commands show while the row is hovered, focused or selected. */
        readonly commands: IHookPoint<GridCellCommandsHook>;
    };
}

interface IGridCellParameters {
    services: IGridServiceRegistry;
    record: IRecord;
    /** The column AG Grid is drawing. */
    colDef: IGridColDef;
    /** The row AG Grid is drawing. */
    node?: IRowNode<IRecord>;
    /** Whether the cell draws a control the user types in. */
    takesInput?: boolean;
    /** The element AG Grid draws the cell in. */
    element?: HTMLElement;
    /** The field the cell draws, where it draws one. */
    field?: IGridField;
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
    /** Locks a record as a whole, drawn as a dimmed row. */
    lockHook?: (result: IGridLock, params: { record: IRecord }) => void;
    heightHook?: GridRowHeightHook;
}

interface IGridRows {
    readonly hooks: {
        readonly height: IHookPoint<GridRowHeightHook>;
    };
    /** Puts the class on every row with a record the rule holds for; pinned rows never take it. */
    addRowClass(className: string, rule: (params: { record: IRecord; node: IRowNode<IRecord> }) => boolean): () => void;
    /** Runs the class rules over the records' rows again. */
    refreshRowClasses(records: IRecord[]): void;
}

type GridLockHook = (result: IGridLock, context: IGridLockHookParameters) => void;

interface IGridLocks {
    get(context?: IGridLockHookParameters): IGridLockResult;
    readonly hooks: {
        /** A context with a record and no columnName asks about the whole row. */
        readonly lock: IHookPoint<GridLockHook>;
    };
}

type GridValidationHook = (result: IFieldValidationResult, params: { record: IRecord; columnName: string }) => void;

interface IGridValidation {
    readonly hooks: {
        /** An error blocks the record's save. */
        readonly validation: IHookPoint<GridValidationHook>;
    };
}

interface IGridSettings {
    isNavigationEnabled(): boolean;
    isZebraEnabled(): boolean;
    isOptionSetColorsEnabled(): boolean;
    getDefaultRowHeight(): number;
    getMaxVisibleRows(): number;
    /** How tall the grid is, as a CSS length, or undefined while it grows with its rows. */
    getHeight(): string | undefined;
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
    readonly hooks: {
        readonly surfaces: IHookPoint<GridSurfacesHook>;
    };
}

type IGridRowModelType = 'clientSide' | 'serverSide';

interface IGridRowModelGroupingParameters {
    /** Whether a group row opens itself when it first appears. */
    isGroupOpenByDefault: (node: IRowNode<IRecord>) => boolean;
}

/** What grouping asks of the row model it runs on. */
interface IGridRowModelGrouping {
    applyAgGridOptions: (result: IGridAgGridOptions) => void;
    applyColumnDefinition: (colDef: IGridColDef, isGrouped: boolean) => void;
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

type GridStylesHook = (result: IGridStyles, fluentTheme: ITheme) => void;

/** An AG Grid theme from its Theming API; themes don't change in place. */
interface AgGridTheme {
    /** A copy of the theme with these parameters set. */
    withParams(params: { [param: string]: unknown }, mode?: string): AgGridTheme;
}

/** The AG Grid theme a hook edits; replace it. */
interface IGridAgTheme {
    theme: AgGridTheme;
}

type GridThemeHook = (result: IGridAgTheme, fluentTheme: ITheme) => void;

/** The AG Grid theme the grid is drawn in, and the styles of its root element. */
interface IGridTheme {
    readonly hooks: {
        /** A hook over the AG Grid theme, read at mount. */
        readonly theme: IHookPoint<GridThemeHook>;
        /** A later style wins where the selectors are equally specific. */
        readonly styles: IHookPoint<GridStylesHook>;
    };
}
type GridAgGridInitialOptionsHook = (result: IGridAgGridInitialOptions) => void;

/** What the grid raises while it shows data; its mount's events are on lifecycle. */
interface IGridEvents {
    onDataLoaded: () => void;
}

/** The running grid: what onSetup and onLoad hand you, and what a module's onLoad gets. */
interface IGrid extends IRuntime {
    readonly events: IEventSubscriber<IGridEvents>;
    /** Every part of the grid, by key. */
    readonly services: IGridServiceRegistry;
    /** The modules the grid was given, by name. */
    readonly modules: { get(name: string): any; find(name: string): any; observe(name: string, callback: (instance: any) => void | (() => void)): () => void };
    readonly hooks: {
        /** A hook over the options AG Grid reads once, when it is created. */
        readonly agGridInitialOptions: IHookPoint<GridAgGridInitialOptionsHook>;
        /** AG Grid is handed an option again whenever its reference changes. */
        readonly agGridOptions: IHookPoint<GridAgGridOptionsHook>;
    };
    /** Runs the option hooks again. */
    refreshAgGridOptions(): void;
    /** Opens a record as the grid does, through onOpenRecord when the grid has one. */
    openRecord(params: IGridOpenRecordParameters): void;
    /** A label set's strings, as the LabelsProvider around the grid gives them. */
    getLabels(set: ILabelSet): ILabels;
}

interface IGridOpenRecordParameters {
    record: IRecord;
    /** The record to open: the row's own, or the one a lookup link points to. */
    reference: ComponentFramework.EntityReference;
    /** None for a double-click on the row. */
    columnName?: string;
}

type IGridRowSelectionState = 'checked' | 'unchecked' | 'indeterminate';

/** The selection about to be written; a hook may change the ids or cancel it. */
interface IGridRecordsSelection {
    recordIds: string[];
    isCancelled: boolean;
}

/** Runs before a selection is written, awaited in priority order. */
type GridSelectRecordsHook = (selection: IGridRecordsSelection, context: { provider: IDataProvider }) => void | Promise<void>;

/** Adjusts how a row's checkbox reads, starting from whether the row is selected. */
type GridSelectionStateHook = (result: { state: IGridRowSelectionState }, context: { node: IRowNode<IRecord>; record: IRecord }) => void;

interface IGridRowSelectionEvents {
    onSelectionChanged: (selectedRecordIds: string[]) => void;
}

interface IGridRowSelection {
    readonly events: IEventEmitter<IGridRowSelectionEvents>;
    getMode(): 'single' | 'multiple';
    readonly hooks: {
        readonly selectRecords: IHookPoint<GridSelectRecordsHook>;
        readonly selectionState: IHookPoint<GridSelectionStateHook>;
    };
    /** Selects the records through the hooks.selectRecords hooks. */
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
    readonly hooks: {
        /** A hook over the parameters the filter callout's operator and value controls are handed. */
        readonly filterControlParameters: IHookPoint<GridFilterControlParametersHook>;
    };
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
    isColumnGrouped(column: IColumn): boolean;
    canGroupColumn(column: IColumn): boolean;
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
    canAggregateColumn(column: IColumn): boolean;
    addAggregation(columnName: string, aggregationFunction: AggregationFunction): void;
    removeAggregation(alias: string): void;
    /** What the column's total is called in the totals row. */
    getTotalLabel(columnName: string): string | undefined;
    getAggregateValueColumnName(record: IRecord, columnName: string): string;
}

/** What the store keeps, by id; plain data, so a host can persist it. */
type IStateDictionary = { [id: string]: unknown };

/** Keeps state by id, for whatever needs it back after a remount. */
interface IStateStore {
    get<TValue>(id: string): TValue | undefined;
    set<TValue>(id: string, value: TValue): void;
    delete(id: string): void;
    /** A store over the entry under \`id\`, created on first use. */
    scope(id: string): IStateStore;
}

/** Everything the grid is made of. */
interface IGridServiceMap {
    /** AG Grid's own api, there once the grid is ready. */
    gridApi: GridApi;
    /** What the caller asked the grid to be, with its defaults applied. */
    settings: IGridSettings;
    /** What the grid's parts keep for the next mount. */
    state: IStateStore;
    rows: IGridRows;
    validation: IGridValidation;
    provider: IDataProvider;
    pcfContext: IPcfContext;
    /** Resolves the strings the grid draws. */
    labels: ILabelsService;
    /** The scroll position and the header's height. */
    viewport: { getScrollTop(): number; setScrollTop(top: number): void; getScrollElement(): HTMLElement | undefined; getHeaderHeight(): number };
    /** The theme the grid was given. */
    theme: ITheme;
    /** The AG Grid theme made from it, and the root element's styles. */
    gridTheme: IGridTheme;
    columns: IGridColumns;
    cells: IGridCells;
    keyboard: IGridKeyboard;
    surfaces: IGridSurfaces;
    /** The fields of the grid's records, saved as the grid saves. */
    fields: IGridFields;
    grid: IGrid;
}

type IGridDeferredService = 'gridApi';

type IGridServiceRegistry = IServiceRegistry<IGridServiceMap>;

/** Reads a grid service from inside something the grid draws. */
declare function useGridService<TKey extends keyof IGridServiceMap>(key: TKey): TKey extends IGridDeferredService ? IGridServiceMap[TKey] | undefined : IGridServiceMap[TKey];

/** One of the grid's modules by name, inside anything the grid draws; throws if it was not given. */
declare function useGridModule(name: string): any;

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
    formatInteger(value: number): string;
    formatDateShort(value: Date, includeTime?: boolean): string;
    formatDateLong(value: Date): string;
    /** Minutes, such as 150, as a duration. */
    formatDuration(value: number, hoursPerDay?: number): string;
}

interface IPcfUserSettings {
    languageId: number;
    userId: string;
    userName: string;
    isRTL: boolean;
}

interface IPcfNavigation {
    openAlertDialog(alertStrings: { text: string; confirmButtonLabel?: string; title?: string }): Promise<void>;
    openConfirmDialog(confirmStrings: { text: string; title?: string; subtitle?: string; confirmButtonLabel?: string; cancelButtonLabel?: string }): Promise<{ confirmed: boolean }>;
    openErrorDialog(options: { message?: string; details?: string; errorCode?: number }): Promise<void>;
    openForm(options: { entityName: string; entityId?: string }): Promise<unknown>;
}

/** The PCF context the controls are drawn in. */
interface IPcfContext {
    formatting: IFormatting;
    userSettings: IPcfUserSettings;
    navigation: IPcfNavigation;
}

/** Throws outside PcfContextProvider. */
declare function usePcfContext(): IPcfContext;

/** Hands the provider to every grid below it. */
declare const DataProviderScope: (props: { provider: IDataProvider; children?: React.ReactNode }) => JSX.Element;
/** Throws outside DataProviderScope. */
declare function useDataProvider(): IDataProvider;
/** Returns the provider and draws the component again on each of the events, read once at mount. */
declare function useDataProviderEvents(events: (keyof IDataProviderEventListeners)[]): IDataProvider;
/** Keeps state by id in a plain dictionary, written in place. */
declare class StateStore implements IStateStore {
    constructor(parameters?: { state?: IStateDictionary });
    get<TValue>(id: string): TValue | undefined;
    set<TValue>(id: string, value: TValue): void;
    delete(id: string): void;
    scope(id: string): IStateStore;
}
/** Hands one state store to every control below it; a fresh in-memory one without \`store\`. */
declare const StateProvider: (props: { store?: IStateStore; children?: React.ReactNode }) => JSX.Element;
/** Returns the store from the nearest StateProvider, or the page-wide one without it. */
declare function useStateStore(): IStateStore;
/** The store a control keeps its state in, per view inside a DatasetControl; stateKey is read once, at mount. */
declare function useControlStateStore(stateKey: string | undefined): IStateStore;

/** The record form: Form.Root, Form.Section, Form.Field, Form.Cell, Form.Control and the rest. */
declare const Form: typeof import('@talxis/base-controls').Form;
/** The form's layout as plain UI, with no record behind it. */
declare const FormUi: typeof import('@talxis/base-controls').FormUi;
/** The form field the component sits in, or the one named. */
declare const useField: typeof import('@talxis/base-controls').useField;
/** Draws the Base Controls field for a data type, from PCF-style bindings. */
declare const NestedControlRenderer: (props: Omit<React.ComponentProps<typeof import('@talxis/base-controls').NestedControlRenderer>, 'context'> & { context: IPcfContext }) => JSX.Element;
/** Picks the Base Controls field for a column's data type. */
declare const BaseControls: typeof import('@talxis/base-controls').BaseControls;
/** A record held in memory, for a form that has no data provider of its own. */
declare const createMemoryRecord: typeof import('@talxis/base-controls').createMemoryRecord;

declare const FluentProvider: typeof import('@fluentui/react-components').FluentProvider;
declare const webLightTheme: typeof import('@fluentui/react-components').webLightTheme;
/** Fluent UI v9 and its icons, imported by name in a snippet. */
declare module '@fluentui/react-components';
declare module '@fluentui/react-icons';
declare const Toaster: typeof import('@fluentui/react-components').Toaster;
declare const Toast: typeof import('@fluentui/react-components').Toast;
declare const ToastTitle: typeof import('@fluentui/react-components').ToastTitle;
declare const ToastBody: typeof import('@fluentui/react-components').ToastBody;
declare const useToastController: typeof import('@fluentui/react-components').useToastController;

/** An optional feature a grid can be given. */
/** What a module's onLoad gets besides its host. */
interface IModuleLoadParameters {
    /** Aborted when the mount goes or another module fails, so a load can cancel what it started. */
    signal: AbortSignal;
}

interface IGridModule {
    /** Unique within the grid; what onLoad returns is provided under it. */
    name: string;
    /** Lower loads first; modules of the same priority load at the same time. Defaults to 0. */
    priority?: number;
    /** AG Grid modules the feature needs. */
    agGridModules?: any[];
    /** Called once as the grid loads, before AG Grid exists; may return a promise. */
    onLoad(grid: IGrid, context: IModuleLoadParameters): any;
    /** Called as the grid tears down. */
    onDestroy?(instance: any): void;
}

/** A hook's priority defaults to 0. */
/** AG Grid's module behind gridApi.flashCells. */
declare const HighlightChangesModule: unknown;

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

declare const GRID_LABELS: ILabelSet;
declare const GRID_SORTING_LABELS: ILabelSet;
declare const GRID_FILTERING_LABELS: ILabelSet;
declare const GRID_GROUPING_LABELS: ILabelSet;
declare const GRID_AGGREGATION_LABELS: ILabelSet;

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
    onRenderGrip: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
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
interface ICellUiValueRendererComponents {
    /** The box the value sits in; its \`children\` are the icons and the value. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
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

/** The cell of a host, such as a grid, that a control is drawn in. */
interface IControlHostCell {
    /** Tells the host the control has nothing more to take. */
    finishEditing(): void;
}

/** The parameters a cell's control is handed. */
interface IGridValueRendererParameters extends IParameters {
    value: { raw: any };
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
    Runtime: { raw: IGrid };
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
    /** Put on the element the value is drawn in, alongside its own class. */
    className?: string;
    components?: Partial<ICellUiValueRendererComponents>;
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
    /** What says the cell is locked for its record; drawn only with the editing module. */
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
    /** What says the cell is locked for its record; nothing without the editing module. */
    LockIcon: (props: ICellLockIconProps) => JSX.Element | null;
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
interface IColumnHeaderRendererParameters {
    /** The seed the header's theme is generated from. */
    theme?: ITheme;
    components?: IColumnHeaderRendererComponents;
}

interface IColumnHeaderRendererProps extends IColumnHeaderParams, IColumnHeaderRendererParameters {}

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

interface IDatasetControlUiEmptyStateComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

interface IOverlayUiLoadingProps {
    /** What is being waited on, drawn under the spinner. */
    message?: string;
    components?: Partial<IOverlayUiLoadingComponents>;
}

interface IDatasetControlUiEmptyStateProps {
    message: string;
    className?: string;
    components?: Partial<IDatasetControlUiEmptyStateComponents>;
}

interface IOverlayUi {
    Loading: (props: IOverlayUiLoadingProps) => JSX.Element | null;
}

/** What the grid draws over its rows. */
interface IGridOverlayNamespace {
    /** Its parts are replaced through components.overlays.loading. */
    Loading: () => JSX.Element;
    /** Its parts are replaced through components.overlays.emptyState. */
    EmptyState: () => JSX.Element;
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
    emptyState?: Partial<IDatasetControlUiEmptyStateComponents>;
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
interface IGridEventProps {
    onDataLoaded: () => void;
    onLoadingChanged: (isLoading: boolean) => void;
    onRecordValueChanged: (record: IRecord, columnName: string, newValue: any) => void;
    onBeforeRecordSave: (record: IRecord) => void;
    /** Fired per record, auto-save included. */
    onAfterRecordSave: (result: IRecordSaveOperationResult) => void;
    /** Fired once provider.save() has saved every record. */
    onAfterSave: (results: IRecordSaveOperationResult[]) => void;
    onError: (message: string, details?: any) => void;
    /** Fired whether or not the record then opens. */
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
    onRowClicked: (record: IRecord) => void;
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
    /** Fired when the user resizes or moves a column. */
    onColumnsChanged: (columns: IColumn[]) => void;
}

interface IGridProps extends Partial<IGridEventProps> {
    /** What this grid is made of, in load order; read once, at mount, and must hold a row model. */
    modules: IGridModule[];
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
    /** Applied by id on every column build, after every module's hook. */
    colDefs?: { [colId: string]: IGridColDefOverride };
    /** Read whenever the grid asks. */
    /** The key the grid's state is kept under, per view inside a DatasetControl. */
    stateKey?: string;
    rowSettings?: IGridRowSettings;
    /** Replaces opening a record from the grid. */
    onOpenRecord?: (params: IGridOpenRecordParameters) => void;
    /** Called with each new grid, before it loads; subscribe and keep refs here. */
    onSetup?: (grid: IGrid) => void;
    /** Awaited after the modules load and before AG Grid renders, on every mount. */
    onLoad?: (grid: IGrid) => void | Promise<void>;
}

/** The parts a grid is drawn from, attached to the grid itself. */
interface IGridParts {
    Cell: IGridCellNamespace;
    ColumnHeader: IGridColumnHeaderNamespace;
    Overlay: IGridOverlayNamespace;
    Row: IGridRowNamespace;
}

declare const Grid: ((props: IGridProps) => JSX.Element) & IGridParts;

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

interface IRowSelectionModuleParameters {
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

interface ISortingModuleParameters {
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

interface IFilteringModuleParameters {
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

interface IGroupingModuleParameters {
    components?: IGridGroupingComponents;
    /** True by default. */
    enableUserGrouping?: boolean;
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

interface IAggregationModuleParameters {
    /** True by default. */
    enableUserAggregation?: boolean;
    components?: IGridAggregationComponents;
}

interface ILicenseModuleParameters {
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

/** The replaceable pieces of a notification card. */
interface INotificationCardComponents {
    /** The card; its \`children\` are the title, the message and the actions. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTitle: (props: ITextProps) => JSX.Element | null;
    onRenderMessage: (props: ITextProps) => JSX.Element | null;
    /** The row of actions; its \`children\` are the buttons or the links. */
    onRenderActions: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** One action while there are two at most; the first is the primary one. */
    onRenderButton: (props: IButtonProps & { isPrimary: boolean }) => JSX.Element | null;
    /** One action once there are more than two. */
    onRenderLink: (props: ILinkProps) => JSX.Element | null;
}

interface INotificationCardProps {
    title?: string;
    message?: string;
    /** More than two are drawn as links. */
    actions?: INotificationCardAction[];
    components?: Partial<INotificationCardComponents>;
}

/** A notification read in full, as a cell's notification callout shows it. */
declare const NotificationCard: (props: INotificationCardProps) => JSX.Element;
/** The defaults for the card's pieces. */
declare const NotificationCardComponents: INotificationCardComponents;

/** The replaceable pieces of a notification bar. */
interface INotificationMessageBarComponents {
    /** Every bar drawn: the single one, the grouped one and each message listed under it. */
    onRenderMessageBar: (props: IMessageBarProps) => JSX.Element | null;
    /** A message's text, handed over as \`dangerouslySetInnerHTML\`. */
    onRenderMessage: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The chevron that unfolds the grouped messages. */
    onRenderToggleButton: (props: IButtonProps) => JSX.Element | null;
    /** The unfolded list of grouped messages. */
    onRenderMenu: (props: IContextualMenuProps) => JSX.Element | null;
}

interface INotificationMessageBarProps {
    /** Several messages fold into one bar. */
    messages?: { text: string; level: 'ERROR' | 'WARNING' | 'INFO' }[];
    components?: Partial<INotificationMessageBarComponents>;
}

declare const NotificationMessageBar: (props: INotificationMessageBarProps) => JSX.Element;
/** The defaults for the bar's pieces. */
declare const NotificationMessageBarComponents: INotificationMessageBarComponents;

/** Holds every row at once. */
declare function createClientSideRowModelModule(): IGridModule;
/** An AG Grid Enterprise module that reads a level at a time. */
declare function createServerSideRowModelModule(): IGridModule;
/** Licenses AG Grid Enterprise. */
declare function createLicenseModule(options: ILicenseModuleParameters): IGridModule;
/** Lets rows be selected from a checkbox column. */
declare function createRowSelectionModule(options: IRowSelectionModuleParameters): IGridModule;
/** An AG Grid Enterprise module for highlighting ranges of cells. */
declare function createCellSelectionModule(options?: IGridCellSelectionOptions): IGridModule;
/** AG Grid Enterprise copying, with no paste into records. */
declare function createClipboardModule(options?: IGridClipboardOptions): IGridModule;
/** The cells the editing module draws its columns with. */
declare const EditingCell: {
    /** The cell while it is being edited. */
    Editor: (props: IEditingCellEditorProps) => JSX.Element;
};
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
/** Lets the cells be edited, and saves each edit with enableAutoSave. */
declare function createEditingModule(options?: { enableAutoSave?: boolean; onEditedCellChanged?: IGridEditingEvents['onEditedCellChanged'] }): IGridModule;
/** Lets a column be sorted from its menu, unless it sets disableSorting. */
declare function createSortingModule(options?: ISortingModuleParameters): IGridModule;
/** Lets a column with filter operators be filtered from its menu. */
declare function createFilteringModule(options?: IFilteringModuleParameters): IGridModule;
/** Groups the rows by a column with AG Grid Enterprise. */
declare function createGroupingModule(options?: IGroupingModuleParameters): IGridModule;
/** Shows totals in a row pinned under the rest. */
declare function createAggregationModule(options?: IAggregationModuleParameters): IGridModule;
/** Carries what legacy scripts set on records' fields into the cells. */
declare function createLegacyClientApiCompatibilityModule(): IGridModule;
/** Which of the provider's columns carry the label, the order and the completion state. */
/** What makes the grid a checklist: grid.modules.find('checkList'). */
interface IGridChecklist {
    /** The columns the checklist works with. */
    getFieldMapping(): IChecklistFieldMapping;
    /** Whether the record is one of the list's items, not the row that adds one. */
    isItem(record: IRecord): boolean;
    /** Whether the item is finished. */
    isCompleted(record: IRecord): boolean;
}

interface IChecklistFieldMapping {
    /** Column holding the item's label. */
    name: string;
    /** Column the list is ordered by, hidden from the grid. */
    stackRank: string;
    /** Boolean column the item's completion is stored in, drawn as the checkbox column. */
    completed: string;
}

/** The strings a checklist draws on top of the grid's own. */

declare const CHECKLIST_LABELS: ILabelSet;
/** The notification bar's strings, keys \`notificationMessageBar.*\`. */
declare const NOTIFICATION_MESSAGE_BAR_LABELS: ILabelSet;

/** The replaceable pieces of the completion checkbox. */
interface IChecklistUiCompletionCheckboxComponents {
    /** The button; its \`children\` are the check. */
    onRenderButton: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => JSX.Element | null;
    onRenderCheck: (props: ICheckProps) => JSX.Element | null;
}

interface IChecklistProps extends Omit<IGridProps, 'modules'> {
    /** Read once, at mount. */
    fieldMapping: IChecklistFieldMapping;
    /** Defaults to an auto-saving editing module; a list without editing is read-only. Read once, at mount. */
    modules?: IGridModule[];
}

/** The cell an item is ticked off in; put it on a column through the grid's column hooks. */
/** The completion cell's pieces: the cell's own, and the checkbox under \`checkbox\`. */
interface ICompletionCellComponents extends ICellRendererComponents {
    checkbox?: Partial<IChecklistUiCompletionCheckboxComponents>;
}

declare const CompletionCell: (props: ICellRendererParams & { components?: ICompletionCellComponents }) => JSX.Element;

/** The replaceable pieces of an item's name. */
interface IChecklistUiNameCellComponents {
    /** The box the name is drawn in; its \`className\` carries the strike-through. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The name cell's pieces: the cell's own, and the struck-through name under \`name\`. */
interface INameCellComponents extends ICellRendererComponents {
    name?: Partial<IChecklistUiNameCellComponents>;
}

/** The cell of an item's name, struck through once finished; put it on a column through the grid's column hooks. */
declare const NameCell: (props: ICellRendererParams & { components?: INameCellComponents }) => JSX.Element;

/** A grid over the provider's records as a checklist. */
declare const Checklist: (props: IChecklistProps) => JSX.Element;
/** Sorts the provider by the checklist's stackRank column; call it before the provider loads. */
declare const sortChecklistProvider: <TProvider extends IDataProvider>(provider: TProvider, fieldMapping: Pick<IChecklistFieldMapping, 'stackRank'>) => TProvider;

declare const ContextualMenuItemType: typeof import('@fluentui/react').ContextualMenuItemType;

/** A related entity a view's columns come from. */
type ILinkEntityExposedExpression = import('@talxis/client-libraries').ILinkEntityExposedExpression;

/** What a view sets up, resolved only when it is opened. */
interface IDatasetControlViewDefinition<TData = unknown> {
    /** The columns the view shows, completed from the provider's available columns and set on it. */
    columns: IColumn[];
    /** The related entities the view's columns come from, set on the provider with them. */
    linking?: ILinkEntityExposedExpression[];
    /** What else the view carries, read through getView().data. */
    data?: TData;
}

/** A view the user can switch to. */
interface IDatasetControlView<TData = unknown, TProvider extends IDataProvider = IDataProvider> {
    id: string;
    name: string;
    /** The header the view is listed under; views without one are listed under "System views". */
    group?: { id: string; name: string };
    /** Sets the provider up for the view, such as its sorting, and returns its columns. */
    resolve: (provider: TProvider) => IDatasetControlViewDefinition<TData> | Promise<IDatasetControlViewDefinition<TData>>;
}

/** A view as it is opened, with what it sets up. */
type IDatasetControlResolvedView<TData = unknown> = IDatasetControlView<TData> & IDatasetControlViewDefinition<TData>;

interface IDatasetControlLoadResult<TData = unknown> {
    provider: IDataProvider;
    /** The views to switch between; leave out for a control with one view. */
    views?: IDatasetControlView<TData>[];
}


/** The views the switcher's onLoad returns, and switching between them. */
interface IDatasetControlViewSwitcher {
    /** The views of this mount, from the control's onLoad. */
    getViews(): IDatasetControlView[];
    getCurrentView(): IDatasetControlView | undefined;
    /** Loads the control for the view. */
    select(viewId: string): void;
    readonly hooks: {
        /** Registers a hook over the items of the switcher's menu, which it adds to or changes in place. */
        readonly items: IHookPoint<(items: IContextualMenuItem[]) => void>;
    };
}

interface IViewSwitcherProps {
    components?: Partial<{ onRenderButton: (props: IButtonProps) => JSX.Element | null }>;
    /** What adds to the switcher, such as DatasetControl.UserQueries. */
    children?: React.ReactNode;
}

/** A feature of the control, loaded on every mount. */
interface IDatasetControlModule {
    /** Unique within the control; what onLoad returns is provided under it, for datasetControl.modules. */
    name: string;
    /** Lower loads first; modules of the same priority load at the same time. Defaults to 0. */
    priority?: number;
    onLoad(datasetControl: any, context: IModuleLoadParameters): any;
    /** Called as the mount goes, with what onLoad returned. */
    onDestroy?(instance: any): void;
}

/** What a user view keeps of a column; the provider fills in the rest. */
type IUserQueryColumn = Pick<IColumn, 'name' | 'isHidden' | 'order' | 'visualSizeFactor' | 'grouping' | 'aggregation'>;

/** What a user view keeps. */
interface IUserQueryView<TData = unknown> {
    columns: IUserQueryColumn[];
    /** The related entities its columns come from. */
    linking?: ILinkEntityExposedExpression[];
    data?: TData;
}

/** A user view as the view switcher lists it. */
interface IUserQueryListItem {
    id: string;
    name: string;
}

/** Where the user's views are kept. */
interface IUserQueriesStore<TData = unknown> {
    /** The user's views, sorted as listed. */
    getViews(): Promise<IUserQueryListItem[]>;
    getView(viewId: string): Promise<IUserQueryView<TData>>;
    /** Saves a new view and returns its id. */
    createView(name: string, view: IUserQueryView<TData>): Promise<string>;
    updateView(viewId: string, view: IUserQueryView<TData>): Promise<void>;
    /** The views as records Manage views renames and deletes. */
    createManageProvider(): IDataProvider;
}

/** Which of the user views' commands the view switcher offers; each is on unless set to \`false\`. */
interface IUserQueriesCommands {
    enableSaveAsNewView?: boolean;
    /** Save changes, while a user view is shown. */
    enableSaveChanges?: boolean;
    enableManageViews?: boolean;
}

/** The values saved with every user view, by key; extend it to save values of your own. */
interface IUserQuerySavedValueMap {
    sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null;
    [key: string]: unknown;
}

/** The userQueries module, as datasetControl.modules.get('userQueries') returns it. */
interface IDatasetControlUserQueries {
    readonly events: IEventSubscriber<{ onOperationFailed: (error: unknown) => void }>;
    /** Saves what getValue returns with every user view; applyValue puts it back as a user view opens. */
    saveWithView<TKey extends keyof IUserQuerySavedValueMap & string>(key: TKey, getValue: () => IUserQuerySavedValueMap[TKey] | undefined, applyValue?: (value: IUserQuerySavedValueMap[TKey], provider: IDataProvider) => void): () => void;
}

/** A Dataverse table the user's views are kept in. */
interface IDataverseUserQueriesTable {
    name: string;
    fieldMapping: { name: string; layout: string; returnedTypeCode: string; description?: string; recordId?: string };
}

interface ITalxisUserQueriesModuleParameters extends IUserQueriesCommands {
    /** The logical name of the entity the views are of. */
    entityName: string;
    /** Only the views of this record; only views of no record when left out. */
    recordId?: string;
    /** Only the views this owner owns. */
    ownerId?: string;
}

/** The user's views as TALXIS talxis_userquery records. */
declare const createTalxisUserQueriesModule: <TData>(parameters: ITalxisUserQueriesModuleParameters) => IDatasetControlModule;
/** The user's views as records of a Dataverse table, with their columns, linking and data as JSON in its layout column. */
declare const createDataverseUserQueriesModule: <TData>(parameters: ITalxisUserQueriesModuleParameters & { table: IDataverseUserQueriesTable }) => IDatasetControlModule;
/** User views kept in a Dataverse table; extend it to change how a view is written. */
declare class DataverseUserQueriesStore<TData = unknown> implements IUserQueriesStore<TData> {
    constructor(parameters: ITalxisUserQueriesModuleParameters & { table: IDataverseUserQueriesTable });
    getViews(): Promise<IUserQueryListItem[]>;
    getView(viewId: string): Promise<IUserQueryView<TData>>;
    createView(name: string, view: IUserQueryView<TData>): Promise<string>;
    updateView(viewId: string, view: IUserQueryView<TData>): Promise<void>;
    createManageProvider(): IDataProvider;
}


/** The user's own views: listed with the control's, and added and deleted through DatasetControl.UserQueries. */
declare const createUserQueriesModule: <TData>(parameters: {
    /** Makes the store the user's views are kept in. */
    createStore: (datasetControl: IDatasetControl<TData>) => IUserQueriesStore<TData>;
} & IUserQueriesCommands) => IDatasetControlModule;

/** The user's views kept in the browser's localStorage, with their columns and data as JSON. */
declare const createLocalStorageUserQueriesModule: <TData>(parameters: {
    /** The localStorage entry the views are kept in; one per control. */
    storageKey: string;
} & IUserQueriesCommands) => IDatasetControlModule;



type RuntimeStatus = 'initializing' | 'ready' | 'failed' | 'destroyed';

/** What every runtime raises over its one mount. */
interface IRuntimeEvents {
    /** Init succeeded; the control is drawn and usable. */
    onReady: () => void;
    onInitFailed: (error: unknown) => void;
    /** The runtime asks the host to replace it with a new one. */
    onRemountRequested: () => void;
    onDestroyed: () => void;
}

type IEventSubscriber<TEvents> = { addEventListener<K extends keyof TEvents>(event: K, listener: TEvents[K]): () => void; removeEventListener<K extends keyof TEvents>(event: K, listener: TEvents[K]): void };

/** A runtime's lifecycle as the code using the runtime sees it. */
interface IRuntimeLifecycle {
    readonly events: IEventSubscriber<IRuntimeEvents>;
    getStatus(): RuntimeStatus;
    /** What init threw, while the status is failed. */
    getError(): unknown;
    isDestroyed(): boolean;
    /** Replaces the runtime with a new one; this one is destroyed. */
    remount(): void;
}

/** What every runtime offers the code that uses it. */
interface IRuntime {
    readonly lifecycle: IRuntimeLifecycle;
}

/** What every ribbon command has. */
interface IRibbonCommandBase {
    /** Stable across loads. */
    id: string;
    label: string;
    tooltip?: string;
    /** A Fluent icon name. */
    iconName?: string;
    /** The ribbon also disables an action while it runs. */
    disabled?: boolean;
}

/** A command the ribbon runs when clicked. */
interface IRibbonActionCommand extends IRibbonCommandBase {
    onExecute: () => Promise<void> | void;
    commands?: never;
}

/** A command that opens a menu of further commands. */
interface IRibbonMenuCommand extends IRibbonCommandBase {
    commands: IRibbonCommand[];
    onExecute?: never;
}

/** What the ribbon draws: a button that runs, or a menu. */
type IRibbonCommand = IRibbonActionCommand | IRibbonMenuCommand;

interface IRibbonEvents {
    /** The commands were loaded again, after init. */
    onCommandsChanged: () => void;
    /** A reload failed; the commands before it stay. */
    onReloadFailed: (error: unknown) => void;
    onBeforeExecute: (command: IRibbonActionCommand) => void;
    onExecuteFailed: (command: IRibbonActionCommand, error: unknown) => void;
    onAfterExecute: (command: IRibbonActionCommand) => void;
}

/** The ribbon's commands, and which of them are running. */
interface IRibbon extends IRuntime {
    readonly events: IEventSubscriber<IRibbonEvents>;
    /** undefined until init finishes. */
    getCommands(): IRibbonCommand[] | undefined;
    isRunning(commandId: string): boolean;
    /** Loads the commands again in place; the latest call wins. */
    reload(): Promise<void>;
    readonly hooks: {
        /** Registers a hook over the commands, run after onLoad on every load; call reload to apply it now. A higher priority gets the later word. Returns what takes it back off. */
        readonly commands: IHookPoint<(commands: IRibbonCommand[]) => void>;
    };
}

interface IRibbonProps {
    /** Called on init and on every reload(); the commands added through hooks.commands follow. */
    onLoad?: (ribbon: IRibbon) => IRibbonCommand[] | Promise<IRibbonCommand[]>;
    /** Which side the commands are drawn against; defaults to 'start'. */
    align?: 'start' | 'end';
    /** Put on the ribbon's box, and on the shimmer while loading. */
    className?: string;
    /** Disables every command, menus included. */
    disabled?: boolean;
    /** Called with the runtime of each mount, before its init; add hooks and subscribe here. */
    onSetup?: (ribbon: IRibbon) => void;
    components?: {
        onRenderCommandBar?: (props: import('@fluentui/react').ICommandBarProps) => JSX.Element | null;
        /** The shimmer that stands in for the commands until the first load finishes. */
        shimmer?: Partial<{ onRenderShimmer: (props: import('@fluentui/react').IShimmerProps) => JSX.Element | null }>;
        errorMessage?: Partial<IErrorMessageBarComponents>;
    };
}

/** Replacements for the ribbon's slots, and for the pieces inside it by name. */
type IRibbonComponents = NonNullable<IRibbonProps['components']>;

/** A command bar of the commands onLoad returns, each run when clicked. */
declare const Ribbon: (props: IRibbonProps) => JSX.Element;
/** One runtime per mount: creates it, drives its lifecycle, shows a failed init with a retry, and makes a new one on remount. */
declare const RuntimeHost: typeof import('@talxis/base-controls').RuntimeHost;
/** One mount's status, error and events; a runtime owns one, and the host drives it. */
declare const RuntimeLifecycle: typeof import('@talxis/base-controls').RuntimeLifecycle;
/** The runtime of the nearest RuntimeHost; for the control's own mount component only. */
declare const useRuntime: typeof import('@talxis/base-controls').useRuntime;
/** The ribbon's commands as plain UI, with no runtime behind them. */
declare const RibbonUiCommandBar: (props: { items: ICommandBarItemProps[]; align?: 'start' | 'end'; className?: string }) => JSX.Element;
/** The ribbon's default slot: the command bar. */
declare const RibbonUiCommandBarComponents: { onRenderCommandBar: (props: import('@fluentui/react').ICommandBarProps) => JSX.Element | null };
/** The loading boundary's default slots: a spinner with a text beside it. */
declare const LoadingBoundaryComponents: {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderSpinner: (props: import('@fluentui/react').ISpinnerProps) => JSX.Element | null;
    onRenderText: (props: import('@fluentui/react').ITextProps) => JSX.Element | null;
};
/** The ribbon shimmer's default slot. */
declare const RibbonUiShimmerComponents: { onRenderShimmer: (props: import('@fluentui/react').IShimmerProps) => JSX.Element | null };

/** Subscribing to an emitter's events, without dispatching them. */
type IEventSubscriber<T> = {
    addEventListener<K extends keyof T>(event: K, listener: T[K]): () => void;
    removeEventListener<K extends keyof T>(event: K, listener: T[K]): void;
};

/** What the quick find part offers. */
interface IDatasetControlQuickFind {
    readonly events: IEventSubscriber<{ onQueryChanged: () => void }>;
    getQuery(): string;
    /** Edits the query without searching. */
    setQuery(query: string): void;
    /** The columns a search matches on; empty when the provider cannot search. */
    getColumns(): IColumn[];
    /** Whether the query starts with a wildcard, which searches slowly. */
    isLikeQuery(): boolean;
    search(): void;
    clear(): void;
}

/** Opens and closes the column editor. */
interface IDatasetControlEditColumns {
    readonly events: IEventSubscriber<{ onOpenChanged: () => void }>;
    isOpen(): boolean;
    /** Opens the editor over a copy of the provider's columns. */
    open(): void;
    /** Closes the editor and drops whatever was not saved. */
    close(): void;
    /** Asks about unsaved changes first, then writes the edit, closes the editor and remounts the control. */
    save(): Promise<void>;
    /** The edit in progress; there only while the editor is open. */
    getSession(): DatasetControlEditColumnsSession | undefined;
    readonly hooks: {
        /** Registers a hook over the commands at the top of the editor. */
        readonly commands: IHookPoint<(commands: ICommandBarItemProps[], session: DatasetControlEditColumnsSession) => void>;
        /** Registers a hook over each chosen column's commands, Remove first. */
        readonly columnCommands: IHookPoint<(commands: ICommandBarItemProps[], column: IColumn, session: DatasetControlEditColumnsSession) => void>;
    };
}

/** The edit the column editor holds while it is open. */
interface DatasetControlEditColumnsSession {
    readonly events: IEventSubscriber<{ onColumnsChanged: () => void }>;
    /** The chosen columns, in order. */
    getColumns(): IColumn[];
    /** The columns the picker offers, for the current scope. */
    getAvailableColumns(query?: string): Promise<IColumn[]>;
    /** Gives the chosen columns their current definitions, after the provider's columns changed. */
    refreshColumns(): Promise<void>;
    /** Adds the column first. */
    addColumn(column: IColumn): void;
    removeColumn(name: string): void;
    /** Moves the column to where targetName is. */
    moveColumn(name: string, targetName: string): void;
    /** Offers the columns of a related entity in the picker. */
    setScope(scope: IAvailableRelatedColumn): void;
}

/** Moves the provider between its pages. */
interface IDatasetControlPagination {
    readonly events: IEventSubscriber<{ onPagingChanged: () => void }>;
    getPageNumber(): number;
    canMovePrevious(): boolean;
    canMoveNext(): boolean;
    moveFirst(): void;
    movePrevious(): void;
    moveNext(): void;
}

/** How many records a page holds, and which of them the page shows. */
interface IDatasetControlPageSizeSwitcher {
    readonly events: IEventSubscriber<{ onChanged: () => void }>;
    getPageSize(): number;
    getPageSizes(): number[];
    isLoading(): boolean;
    setPageSize(pageSize: number): void;
    getRecordRange(): { first: number; last: string; total?: string };
}

/** What the control has to tell the user about its records. */
interface IDatasetControlNotifications {
    readonly events: IEventSubscriber<{ onNotificationsChanged: () => void }>;
    /** The provider's load error, while there is one. */
    getMessages(): { text: string; level: string }[];
}

/** The parts rendered inside the control, each there only while it is rendered. */
interface IDatasetControlPartMap {
    viewSwitcher: IDatasetControlViewSwitcher;
    ribbon: IRibbon;
    quickFind: IDatasetControlQuickFind;
    pagination: IDatasetControlPagination;
    pageSizeSwitcher: IDatasetControlPageSizeSwitcher;
    notifications: IDatasetControlNotifications;
    editColumns: IDatasetControlEditColumns;
    /** The overlay over the whole control; always there. */
    loadingOverlay: IDatasetControlLoadingOverlay;
    /** The grid in the body, while it is rendered. */
    grid: IGrid;
}

/** What the control keeps of a view's provider in the state store. */
interface IDatasetControlProviderState {
    columns: IColumn[];
    linking: ILinkEntityExposedExpression[];
    sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null;
    pageSize: number;
    pageNumber: number;
    searchQuery: string;
    selectedRecordIds: string[];
}

/** The side of the header or footer the part is in; undefined outside both regions. */
declare function useDatasetControlRegion(): 'start' | 'end' | undefined;
/** A module the control loaded, by name; throws when it was not given. */
declare function useDatasetControlModule(name: string): any;
/** Makes a part once and provides it on the control under name, for control.parts. */
declare function useProvideDatasetControlPart<TName extends keyof IDatasetControlPartMap>(name: TName, create: () => IDatasetControlPartMap[TName]): IDatasetControlPartMap[TName];

/** The overlay that covers the whole control while something runs. */
interface IDatasetControlLoadingOverlay {
    /** Covers the whole control until every caller has hidden it again; returns the hide for this caller. */
    show(message?: string): () => void;
    isLoading(): boolean;
    getMessage(): string | undefined;
}

/** Looks up the parts rendered right now. */
interface IDatasetControlPartLocator {
    /** Throws when the part is not rendered. */
    get<K extends keyof IDatasetControlPartMap>(key: K): IDatasetControlPartMap[K];
    find<K extends keyof IDatasetControlPartMap>(key: K): IDatasetControlPartMap[K] | undefined;
    /** Calls back each time the part is rendered; what it returns runs before the next call. */
    observe<K extends keyof IDatasetControlPartMap>(key: K, callback: (part: IDatasetControlPartMap[K]) => void | (() => void)): () => void;
}

/** Something a module draws in the DatasetControl. */
interface IDatasetControlSurface {
    key: string;
    onRender: () => JSX.Element | null;
}

type DatasetControlSurfacesHook = (surfaces: IDatasetControlSurface[]) => void;

interface IDatasetControlSurfaces {
    readonly hooks: {
        readonly surfaces: IHookPoint<DatasetControlSurfacesHook>;
    };
}

/** The DatasetControl as its consumer drives it; a new one for every mount. */
interface IDatasetControl<TData = unknown> extends IRuntime {
    readonly parts: IDatasetControlPartLocator;
    /** The modules the control loaded, by name. */
    readonly modules: { get(name: string): any; find(name: string): any; observe(name: string, callback: (module: any) => void | (() => void)): () => void };
    /** What modules draw in the control. */
    readonly surfaces: IDatasetControlSurfaces;
    /** The provider shown, once the status is ready. */
    getProvider(): IDataProvider | undefined;
    /** The views of this mount, from onLoad; empty before they loaded. */
    getViews(): IDatasetControlView<TData>[];
    /** The view the provider shown is for. */
    getViewId(): string | undefined;
    /** That view as it was resolved, with its columns and data. */
    getView(): IDatasetControlResolvedView<TData> | undefined;
    /** Loads the view on a new provider; asks first when there are unsaved changes. */
    loadView(viewId: string): Promise<void>;
    /** Loads the current view again on a new provider; asks first when there are unsaved changes. */
    reload(): Promise<void>;
    /** A label set's strings, as the LabelsProvider around the control gives them. */
    getLabels(set: ILabelSet): ILabels;
    getTheme(): ITheme;
}

interface IDatasetControlProps<TData = unknown> {
    /** The control's modules, each with a unique name; read on every mount. */
    modules?: IDatasetControlModule[];
    /** Creates the provider and lists the views; called on every mount. */
    onLoad: (control: IDatasetControl<TData>) => IDatasetControlLoadResult<TData> | Promise<IDatasetControlLoadResult<TData>>;
    children: React.ReactNode;
    /** '100%' fills the parent; the content's height when left out. */
    height?: string;
    className?: string;
    /** The key the control's state is kept under in the state store. */
    stateKey?: string;
    /** Whether the control destroys the providers it lets go of, on unmount and reload; defaults to true. */
    destroyProviderOnUnmount?: boolean;
    components?: Partial<IDatasetControlContainerComponents> & { errorMessage?: Partial<IErrorMessageBarComponents>; skeleton?: { onRenderSkeleton?: (props: any) => JSX.Element | null } };
    /** Called with the control of each mount, before its init; subscribe to its events here. */
    onSetup?: (control: IDatasetControl<TData>) => void;
}

interface IErrorMessageBarComponents {
    /** The bar; children holds the title, actions the command bar. */
    onRenderMessageBar: (props: import('@fluentui/react').IMessageBarProps) => JSX.Element | null;
    /** Wraps the title; its children are the title. */
    onRenderTooltip: (props: import('@fluentui/react').ITooltipHostProps) => JSX.Element | null;
    onRenderTitle: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    /** The details and retry commands; an override can add its own items. */
    onRenderCommandBar: (props: import('@fluentui/react').ICommandBarProps) => JSX.Element | null;
}

/** The quick find's slots. */
interface IDatasetControlUiQuickFindComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTextField: (props: any) => JSX.Element | null;
    /** The search button drawn in place of the field while the quick find is compact. */
    compact: Partial<{ onRenderButton: (props: IButtonProps) => JSX.Element | null }>;
    /** What explains how the search matches, under the field. */
    callout: Partial<{
        onRenderCallout: (props: import('@fluentui/react').ICalloutProps) => JSX.Element | null;
        onRenderLikeWarning: (props: { text: string }) => JSX.Element | null;
        onRenderDescription: (props: { leadingWildcardWarning: string; columnsHintStart: string; columnsHintOperator: string; columnsHintEnd: string }) => JSX.Element | null;
        onRenderColumns: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
        onRenderColumn: (props: { column: IColumn }) => JSX.Element | null;
    }>;
}

type IDatasetControlCommandBarProps = import('@fluentui/react').ICommandBarProps;

interface IDatasetControlContainerComponents { onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null }
interface IDatasetControlListColumn { column: IColumn; text: string; commands: ICommandBarItemProps[] }

interface IEditColumnsComponents {
    button?: Partial<{ onRenderTooltip: (props: import('@fluentui/react').ITooltipHostProps) => JSX.Element | null; onRenderButton: (props: IButtonProps) => JSX.Element | null }>;
    panel?: Partial<{ onRenderPanel: (props: any) => JSX.Element | null; onRenderFooter: (props: any) => JSX.Element | null; onRenderCommandBar: (props: IDatasetControlCommandBarProps) => JSX.Element | null }>;
    scopeSelector?: Partial<{ onRenderSelector: (props: { children: React.ReactNode }) => JSX.Element | null; onRenderOption: (props: { option: any; text: string }) => JSX.Element | null }>;
    columnSelector?: Partial<{ onRenderSelector: (props: { children: React.ReactNode }) => JSX.Element | null; onRenderOption: (props: { option: IColumn; text: string }) => JSX.Element | null }>;
    columnList?: Partial<{ onRenderColumn: (props: IDatasetControlListColumn) => JSX.Element | null }>;
    /** How a failed column or scope load looks. */
    errorMessage?: Partial<IErrorMessageBarComponents>;
}

/** Loads the provider through onLoad and holds every part inside it; the parts are attached to it. */
interface IDatasetControlNamespace {
    <TData = unknown>(props: IDatasetControlProps<TData>): JSX.Element;
    /** The row above the records; Start and End are its left and right regions. */
    Header: ((props: { children?: React.ReactNode; className?: string; components?: Partial<IDatasetControlContainerComponents> }) => JSX.Element) & {
        Start: (props: { children?: React.ReactNode; className?: string; components?: Partial<IDatasetControlContainerComponents> }) => JSX.Element;
        End: (props: { children?: React.ReactNode; className?: string; components?: Partial<IDatasetControlContainerComponents> }) => JSX.Element;
    };
    /** Fills the height the header and footer leave, usually with the grid. */
    Body: (props: { children?: React.ReactNode; className?: string; components?: Partial<IDatasetControlContainerComponents> }) => JSX.Element;
    /** The row below the records; Start and End are its left and right regions. */
    Footer: ((props: { children?: React.ReactNode; className?: string; components?: Partial<IDatasetControlContainerComponents> }) => JSX.Element) & {
        Start: (props: { children?: React.ReactNode; className?: string; components?: Partial<IDatasetControlContainerComponents> }) => JSX.Element;
        End: (props: { children?: React.ReactNode; className?: string; components?: Partial<IDatasetControlContainerComponents> }) => JSX.Element;
    };
    ViewSwitcher: (props: IViewSwitcherProps) => JSX.Element;
    /** The shared Ribbon, loaded again whenever the selected records change. */
    /** Reach it through control.parts.get('ribbon'). */
    Ribbon: (props: Omit<IRibbonProps, 'onSetup' | 'align'> & { enableRefresh?: boolean; enableSave?: boolean; enableDiscard?: boolean }) => JSX.Element;
    QuickFind: (props: {
        components?: Partial<IDatasetControlUiQuickFindComponents>;
    }) => JSX.Element;
    Notifications: (props: { messages?: { text: string; level: 'ERROR' | 'WARNING' | 'INFO' }[]; components?: Partial<{ onRenderNotifications: (props: INotificationMessageBarProps) => JSX.Element | null }> }) => JSX.Element;
    Pagination: (props: { components?: Partial<{ onRenderCommandBar: (props: IDatasetControlCommandBarProps) => JSX.Element | null }> }) => JSX.Element;
    PageSizeSwitcher: (props: { pageSizes?: number[]; components?: Partial<{ onRenderButton: (props: IButtonProps) => JSX.Element | null }> }) => JSX.Element;
    /** The empty state in place of its children while the provider has no records. */
    EmptyState: (props: { children?: React.ReactNode; components?: Partial<IDatasetControlUiEmptyStateComponents> }) => JSX.Element;
    /** The button that opens the column editor, and the editor itself. */
    EditColumns: (props: {
        components?: IEditColumnsComponents;
    }) => JSX.Element;
    /** Saving and managing the user's own views; goes inside ViewSwitcher, with the user queries module. */
    UserQueries: (props: { components?: any }) => JSX.Element;
    Ui: { EditColumnsColumn: (props: IDatasetControlListColumn) => JSX.Element; EmptyState: (props: IDatasetControlUiEmptyStateProps) => JSX.Element | null; [part: string]: any };
}

declare const DatasetControl: IDatasetControlNamespace;
/** Whether the nearest compact provider, such as the DatasetControl header, asks for compact parts; false outside one. */
declare const useCompact: () => boolean;
/** Marks the component as an item of the nearest WrapCompactProvider; removing one lets the rest try full size again. */
declare const useCompactItem: () => void;
/** Forces compact or full size on everything below it. */
declare const CompactContext: React.Context<boolean>;
/** A box that draws everything inside it compact once its content wraps past one line. */
declare const WrapCompactProvider: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
/** A box that draws everything inside it compact while it is at most maxCompactWidth pixels wide (479 by default). */
declare const BreakpointCompactProvider: (props: React.HTMLAttributes<HTMLDivElement> & { maxCompactWidth?: number }) => JSX.Element;
/** The header the component is inside of, or undefined outside one. */
declare const useDatasetControlHeader: () => {
    /** Hides everything in the header except the part calling it. */
    showOnly: () => void;
    /** Shows everything showOnly hid. */
    showAll: () => void;
} | undefined;
/** The DatasetControl the component is inside of; throws outside one. */
declare const useDatasetControl: <TData = unknown>() => IDatasetControl<TData>;
declare const ErrorMessageBarComponents: IErrorMessageBarComponents;
/** The view switcher's default slots, to render the default button with your own items. */
declare const DatasetControlUiViewSwitcherComponents: { onRenderButton: (props: IButtonProps) => JSX.Element | null };


/** Which columns of a task record hold what the task grid works with. */
interface IFieldMapping {
    /** The lookup to the parent task, which makes the tree. */
    parentId: string;
    subject: string;
    /** The order among siblings, compared as text. */
    stackRank: string;
    /** 0 is active. */
    stateCode: string;
    startDate?: string;
    endDate?: string;
    /** The task's duration in minutes, as a duration column holds it. */
    duration?: string;
    percentComplete?: string;
}

/** What a task view starts the provider with, beside its columns and linking. */
interface ITaskViewData {
    sorting?: { name: string; sortDirection: number }[];
    filtering?: any;
    quickFindColumns?: string[];
    searchQuery?: string;
    /** Lists the matching tasks on their own, without the tree, until the user changes it. */
    isFlatList?: boolean;
}

/** A view of the tasks, user views included. */
type ITaskView = IDatasetControlResolvedView<ITaskViewData>;

/** Matches tasks against filters and quick find for columns whose values are kept apart from the tasks. */
interface ITaskColumnMatcher {
    isHandledColumn(columnName: string): boolean;
    /** Whether the task matches a filter condition on a handled column. */
    isMatchingCondition(record: IRecord, condition: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression): boolean;
    /** Whether the task's value in a handled quick find column matches the search query. */
    isMatchingSearch(record: IRecord, columnName: string, searchQuery: string): boolean;
}

/** Holds the tasks back from the tree until it settles, such as values a filter on the module's column reads. */
type TaskLoadWaiter = (params: { taskIds: string[] }) => Promise<void> | void;

/** The tasks of one view, loaded at once and shown as a tree. */
interface ITaskDataProvider extends IDataProvider {
    getFieldMapping(): IFieldMapping;
    /** The columns quick find searches, by name. */
    setQuickFindColumns(columnNames: string[]): void;
    readonly hooks: {
        /** Changes the available columns, also read as definitions for saved views that list them. */
        readonly availableColumns: IHookPoint<(columns: IColumn[]) => void>;
    };
    /** Reads the tasks with this column whatever the view shows; returns its unregistration. */
    addRequiredColumn(column: IColumn): () => void;
    /** Answers filters and quick find for the columns the matcher claims. */
    addColumnMatcher(matcher: ITaskColumnMatcher): () => void;
    /** Runs before every data load hands its tasks out, and is waited for. */
    addLoadWaiter(waiter: TaskLoadWaiter): () => void;
    /** Whether the current sorting, filtering or quick find reads the column. */
    isColumnQueried(columnName: string): boolean;
    /** Merges raw data into the loaded tasks by their primary id, keeping the user's unsaved edits, and redraws them. */
    updateTaskData(rawRecords: IRawRecord[]): void;
}

/** One mount of a TaskDatasetControl: what its modules provide on and its parts read. */
/** How execute shows a run and handles its failure; by default it shows the loading, and the dialog before rethrowing. */
interface ITaskExecuteParameters {
    loading?: {
        /** Defaults to true; false for a run in the background. */
        show?: boolean;
        /** Shown in the grid's loading overlay. */
        message?: string;
    };
    error?: {
        /** Titles the error dialog. */
        title?: string;
        /** Defaults to true; false resolves undefined once the dialog is shown. */
        rethrow?: boolean;
    };
}

/** The task actions, each run with the grid loading and its error shown. */
interface ITaskActions {
    /** The created task, or null when creation is off or the user cancelled. */
    create(parentId?: string, options?: { position?: TaskCreatePosition; data?: { [columnName: string]: any } }): Promise<IRecord | null>;
    /** Opens the tasks in an editor outside the grid, such as a form. */
    open(taskIds: string[]): Promise<any>;
    /** Confirms, deletes the tasks with their subtrees, and reports any it could not delete. */
    delete(taskIds: string[]): Promise<void>;
    /** true once moved, or null when it did not move. */
    move(taskId: string, targetTaskId: string, position: 'above' | 'below' | 'child'): Promise<true | null>;
    /** Opens the task, or the record its lookup points to when columnName is another column. */
    openRecord(reference: ComponentFramework.EntityReference, columnName?: string): Promise<void>;
    openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void>;
}

interface ITaskRuntime extends IRuntime {
    readonly services: { get(key: string): any; find(key: string): any; observe(key: string, effect: (service: any) => void | (() => void)): () => void; register(key: string, resolve: () => any): void };
    getProvider(): ITaskDataProvider;
    /** The view this mount loaded. */
    getView(): ITaskView | undefined;
    /** Every task action, run with the grid loading and its error shown. */
    readonly tasks: ITaskActions;
    isCreationEnabled(): boolean;
    isEditingEnabled(): boolean;
    isDeletionEnabled(): boolean;
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
    /** Runs the operation with the grid loading, and shows its failure once in a dialog. */
    execute<T>(operation: () => Promise<T>, options: ITaskExecuteParameters & { error: { rethrow: false } }): Promise<T | undefined>;
    execute<T>(operation: () => Promise<T>, options?: ITaskExecuteParameters): Promise<T>;
    readonly hooks: {
        /** Registers a hook over every item TaskDatasetControl.Ribbon draws, the ones in its menus included. */
        readonly ribbonCommandUi: IHookPoint<(item: IContextualMenuItem) => void>;
    };
}

interface IDatasetControlModuleMap {
    /** What runs the task grid inside the control. */
    taskRuntime: ITaskRuntime;
}

/** A view of the tasks, set up on the task provider it is opened on. */
type ITaskGridView = IDatasetControlView<ITaskViewData, ITaskDataProvider>;

/** What a TaskDatasetControl's onLoad returns. */
interface ITaskGridLoadResult {
    /** The provider for the view. */
    provider: ITaskDataProvider;
    /** \`stateCode\` defaults to \`statecode\`. */
    fieldMapping: Omit<IFieldMapping, 'stateCode'> & { stateCode?: string };
    /** Scopes the tree to the subtree under this task. */
    rootTaskId?: string;
    /** The views to switch between; leave out for a task grid with one view. */
    views?: ITaskGridView[];
}

/** The project the tasks belong to, as its store loads it. */
interface IProjectData<TData = { [key: string]: unknown }> {
    id: string;
    name?: string;
    /** The table the project lives in, for code that writes a lookup to it. */
    entityName?: string;
    startDate?: import('dayjs').Dayjs;
    endDate?: import('dayjs').Dayjs;
    /** What else the project carries, such as its own columns. */
    data?: TData;
}

/** The project module, registered as project: the project the tasks belong to. */
interface IProject<TData = { [key: string]: unknown }> {
    getId(): string;
    getName(): string | undefined;
    /** The table the project lives in, for code that writes a lookup to it. */
    getEntityName(): string | undefined;
    getStartDate(): import('dayjs').Dayjs | undefined;
    getEndDate(): import('dayjs').Dayjs | undefined;
    /** What else the project carries, such as its own columns. */
    getData(): TData | undefined;
}

/** Loads the project the tasks belong to; goes in TaskDatasetControl's modules. */
interface IProjectModule extends IDatasetControlModule { }

/** Where the project comes from. */
interface IProjectStore<TData = { [key: string]: unknown }> {
    /** Called on every mount, before the tasks load. */
    loadProject(): Promise<IProjectData<TData>>;
}

/** The project the tasks belong to, loaded on every mount and kept on the task runtime as project. */
declare const createProjectModule: <TData>(parameters: { createStore: (taskRuntime: ITaskRuntime) => IProjectStore<TData> }) => IProjectModule;
/** The project module for a project held in memory. */
declare const createMemoryProjectModule: <TData>(parameters: { project: IProjectData<TData> }) => IProjectModule;

interface ITaskDatasetControlProps extends Omit<IDatasetControlProps<ITaskViewData>, 'onLoad' | 'scope' | 'modules'> {
    /** The control's modules; read on every mount. */
    modules?: IDatasetControlModule[];
    /** Hours in a day of a task's duration; 24 when left out. */
    hoursPerDay?: number;
    /** Returns the provider, field mapping and views on every mount; control.modules.get('taskRuntime') is the task runtime. */
    onLoad: (control: IDatasetControl<ITaskViewData>) => ITaskGridLoadResult | Promise<ITaskGridLoadResult>;
    /** The New command and the add-subtask buttons. */
    enableCreation?: boolean;
    /** Where among its parent's children a new task goes; first when left out. */
    defaultCreatePosition?: TaskCreatePosition;
    /** The Edit command, and editing tasks in the grid and in their forms. */
    enableEditing?: boolean;
    /** The Delete command. */
    enableDeletion?: boolean;
    /** Called after tasks are created, with the parent they went under. */
    onTasksCreated?: (records: IRecord[], parentId?: string) => void;
    /** Called after tasks are deleted. */
    onTasksDeleted?: (taskIds: string[]) => void;
    /** Called after tasks change, from a form save or a move. */
    onTasksUpdated?: (records: IRecord[]) => void;
}

interface ITaskGridProps extends Omit<IGridProps, 'modules'> {
    /** Read once, at mount; the task tree and the client-side row model are always added. */
    modules?: IGridModule[];
}

/** A label set's strings, as the nearest LabelsProvider gives them. */
declare const useLabels: (set: ILabelSet) => ILabels;
/** A label set whose keys translateLabels checks. */
interface ILabelSetOf<T extends { [key: string]: string }> extends ILabelSet {
    readonly defaults: T;
}
/** Declares a component's English strings, each under a key prefixed with the component's name. */
declare function defineLabels<T extends { [key: string]: string }>(defaults: T): ILabelSetOf<T>;
/** Translations of one set, with their keys checked against it. */
declare function translateLabels<T extends { [key: string]: string }>(set: ILabelSetOf<T>, strings: Partial<Record<keyof T & string, string>>): { [key: string]: string };
/** User views kept in localStorage; extend it to change how a view is written. */
declare class LocalStorageUserQueriesStore<TData = unknown> implements IUserQueriesStore<TData> {
    constructor(parameters: { storageKey: string });
    getViews(): Promise<IUserQueryListItem[]>;
    getView(viewId: string): Promise<IUserQueryView<TData>>;
    createView(name: string, view: IUserQueryView<TData>): Promise<string>;
    updateView(viewId: string, view: IUserQueryView<TData>): Promise<void>;
    createManageProvider(): IDataProvider;
}
/** The quick find's default slots. */
declare const DatasetControlUiQuickFindComponents: IDatasetControlUiQuickFindComponents;
/** The pagination's default slots. */
declare const DatasetControlUiPaginationComponents: { onRenderCommandBar: (props: IDatasetControlCommandBarProps) => JSX.Element | null };
/** The empty state part's default slots. */
declare const DatasetControlUiEmptyStateComponents: IDatasetControlUiEmptyStateComponents;

/** The task runtime of the TaskDatasetControl around the component. */
declare const useTaskRuntime: () => ITaskRuntime;
/** Provides the strings of every component mounted below it, by label key. */
declare const LabelsProvider: (props: { labels: { [key: string]: string }; children: React.ReactNode }) => JSX.Element;
/** Provides the PCF context below it; userSettings set the language and formatting outside a hosted PCF control. */
declare const PcfContextProvider: (props: { context?: any; userSettings?: { lcid?: number; formatInfoCultureName?: string }; children?: React.ReactNode }) => JSX.Element;
/** The Czech translation of every label. */
declare const CZECH_LABELS: { [key: string]: string };

/** The tasks of a TaskDatasetControl, drawn as a tree; goes in its body and throws anywhere else. */
declare const TaskGrid: (props: ITaskGridProps) => JSX.Element;
/** Lets the task grid's cells be edited, saving each edit straight away. */
declare function createTaskEditingModule(options?: { onEditedCellChanged?: IGridEditingEvents['onEditedCellChanged'] }): IGridModule;
/** Moves tasks by dragging their rows: between rows, sideways between levels, or onto another task; not in a flat list. */
declare const createTaskDraggingModule: (parameters?: {
    /** Called after a dragged task is moved. */
    onTaskMoved?(params: any): void;
}) => IDatasetControlModule;

/** Where custom column definitions and values are kept. */
interface ICustomColumnsStore {
    loadColumns(): Promise<IColumn[]>;
    loadValues(taskIds: string[]): Promise<Map<string, IRawRecord>>;
    saveValue(record: IRecord, column: IColumn, value: unknown): Promise<any>;
    createColumn(): Promise<string | null>;
    updateColumn(columnName: string): Promise<string | null>;
    deleteColumn(columnName: string): Promise<string | null>;
}

/** The user's own task columns, loaded on every mount before the tasks. */
declare const createCustomColumnsModule: (parameters: {
    createStore: (taskRuntime: ITaskRuntime) => ICustomColumnsStore;
    /** The Add custom column command in Edit columns. */
    enableCreation?: boolean;
    /** The edit command on each custom column in Edit columns. */
    enableEditing?: boolean;
    /** The delete command on each custom column in Edit columns. */
    enableDeletion?: boolean;
}) => IDatasetControlModule;

/** A custom column as the IndexedDB store keeps it. */
interface ICustomColumnDefinition {
    displayName: string;
    dataType: string;
    isRequired?: boolean;
    /** Decimal places, for a decimal or currency column. */
    precision?: number;
    /** The labels of a choice column's options, in order. */
    options?: string[];
}

/** The user's own task columns kept in the browser's IndexedDB; a new one is a sample text column. */
declare const createIndexedDbCustomColumnsModule: (parameters: {
    /** The IndexedDB database the columns and their values are kept in; one per control. */
    databaseName: string;
    /** The columns a new database starts with. */
    columns?: ICustomColumnDefinition[];
    enableCreation?: boolean;
    enableDeletion?: boolean;
}) => IDatasetControlModule;

/** How a lookup-many column draws its records. */
type LookupManyAppearance =
    | { type: 'plain' }
    | { type: 'colorful'; /** The record field holding each pill's colour; color when left out. */ colorPropertyName?: string }
    | { type: 'people'; /** The record field holding each person's picture; imageurl when left out. */ imageUrlPropertyName?: string };

/** One lookup-many column, as the module's columns maps it. */
interface ILookupManyColumn {
    displayName: string;
    /** The entity the column's records are of. */
    entityName: string;
    /** Plain when left out. */
    appearance?: LookupManyAppearance;
}

/** What a lookup-many module is handed to create a column's options provider. */
interface ILookupManyOptionsParameters<TColumn extends ILookupManyColumn = ILookupManyColumn> {
    /** Missing when the records are offered for a filter. */
    record?: IRecord;
    column: IColumn;
    /** What the module's columns maps the column to. */
    settings: TColumn;
    taskRuntime: ITaskRuntime;
}

/** Where lookup-many values are kept. */
interface ILookupManyStore<TColumn extends ILookupManyColumn = ILookupManyColumn> {
    /** Every mapped column's references of these tasks, by task id and column name. */
    loadValues(taskIds: string[]): Promise<Map<string, { [columnName: string]: ComponentFramework.EntityReference[] }>>;
    saveValue(taskId: string, columnName: string, value: ComponentFramework.EntityReference[]): Promise<void>;
    /** A provider over the records the column can take; undefined leaves the cell read-only. */
    createOptionsProvider(parameters: ILookupManyOptionsParameters<TColumn>): IDataProvider | undefined;
}

/** The task columns in columns, drawn as pills and picked in a pop-out editor. */
declare const createLookupManyModule: <TColumn extends ILookupManyColumn>(parameters: {
    /** The lookup-many columns by name. */
    columns: { [columnName: string]: TColumn };
    createStore: (taskRuntime: ITaskRuntime) => ILookupManyStore<TColumn>;
}) => IDatasetControlModule;

/** Lookup-many columns over records held in memory, starting over on every mount like the memory tasks. */
declare const createMemoryLookupManyModule: (parameters: {
    /** The sources by entity name, matched against each column's entityName. */
    sources: { [entityName: string]: { records: IRawRecord[]; metadata: IMemoryProviderEntityMetadata; columns: IColumn[] } };
    columns: { [columnName: string]: ILookupManyColumn };
    /** The tasks' references, by task id and column name. */
    values: { [taskId: string]: { [columnName: string]: ComponentFramework.EntityReference[] } };
}) => IDatasetControlModule;

/** One Dataverse lookup-many column: the relationship it is reached through, and what it offers. */
interface IDataverseLookupManyColumn extends ILookupManyColumn {
    /** Either side's navigation property of the 1:N or N:N relationship. */
    navigationPropertyName: string;
    /** The related records' columns to read, comma separated. */
    select?: string;
    /** Set when the relationship goes through an intersection entity of your own. */
    customIntersection?: { navigationPropertyName: string };
    /** Liquid FetchXML over task, project and hostRecord for the records offered; read-only without it. */
    fetchXml?: string;
}

/** Lookup-many columns of Dataverse tasks, loaded and saved through their relationships. */
declare const createDataverseLookupManyModule: (parameters: {
    columns: { [columnName: string]: IDataverseLookupManyColumn };
    /** The record the grid sits on, as hostRecord in a column's FetchXML. */
    hostRecord?: any;
}) => IDatasetControlModule;

/** The people, tags and teams the sample tasks' lookup-many columns pick from. */
declare const LOOKUP_MANY_SOURCES: { [entityName: string]: { records: IRawRecord[]; metadata: IMemoryProviderEntityMetadata; columns: IColumn[] } };
/** The sample tasks' lookup-many columns, as the module maps them. */
declare const LOOKUP_MANY_COLUMNS: { [columnName: string]: ILookupManyColumn };
/** The lookup-many columns as a view names them. */
declare const LOOKUP_MANY_VIEW_COLUMNS: IColumn[];
/** The sample tasks' lookup-many references. */
declare const LOOKUP_MANY_VALUES: { [taskId: string]: { [columnName: string]: ComponentFramework.EntityReference[] } };
/** Moves the tasks' lookup-many references out of the records, by task id, as the lookup-many module keeps them. */
declare const takeLookupManyValues: (tasks: IRawRecord[]) => { [taskId: string]: { [columnName: string]: ComponentFramework.EntityReference[] } };

/** A task to create, with the tasks to create under it. */
interface ICreateTaskTree {
    data?: { [columnName: string]: any };
    children?: ICreateTaskTree[];
}

/** A template: its own task, named after it, with the tasks under it. */
interface ITemplate {
    name: string;
    tree: ICreateTaskTree;
}

/** Where among its parent's children a new task goes. */
type TaskCreatePosition = 'first' | 'last';

/** Where a new task lands, and what it starts with. */
interface ITaskCreateParameters {
    /** None for the top level. */
    parentRecord?: IRecord;
    /** Resolved by the provider; the store saves it as is. */
    stackRank: string;
    /** Column values the task starts with. */
    data?: { [columnName: string]: any };
}

/** Where a template's tasks go: the template, and where its own task lands. */
interface ITemplateTasksCreateParameters extends Omit<ITaskCreateParameters, 'data'> {
    templateId: string;
}

/** The tasks a backend created at once, with what else it changed. */
interface ITasksCreateResult {
    /** Every task created, subtasks included. */
    records: IRawRecord[];
}

/** Where templates are kept, and what creates tasks from them. */
interface ITemplatesStore {
    /** A provider over the templates, searched by the picker; made each time it opens. */
    createTemplatesProvider(): IDataProvider;
    /** The tasks created, or null when there were none or the user cancelled. */
    createTasks(params: ITemplateTasksCreateParameters): Promise<ITasksCreateResult | null>;
    /** Without it, tasks cannot be saved as templates. */
    createTemplate?(template: ITemplate): Promise<void>;
}

/** Offers New, From template and Save as template in the ribbon, and From template on each row. */
declare const createTemplatesModule: (parameters: { createStore: (taskRuntime: ITaskRuntime) => ITemplatesStore }) => IDatasetControlModule;

/** One task of a memory template, with its subtree. */
interface IMemoryTemplateTask {
    /** Column values of the task; its id, parent and position are always the grid's. */
    data?: { [columnName: string]: unknown };
    children?: IMemoryTemplateTask[];
}

/** The template's own task, named after it, with its subtree. */
interface IMemoryTemplate extends IMemoryTemplateTask {
    id: string;
    name: string;
}

/** Templates held in memory. */
declare class MemoryTemplatesStore implements ITemplatesStore {
    /** Its tasks are created in the database the grid's MemoryTaskStore reads. */
    constructor(parameters: { taskRuntime: ITaskRuntime; database: MemoryTaskDatabase; templates: IMemoryTemplate[] });
    createTemplatesProvider(): IDataProvider;
    createTasks(params: ITemplateTasksCreateParameters): Promise<ITasksCreateResult | null>;
    createTemplate(template: ITemplate): Promise<void>;
}

/** Task templates held in memory, the ones captured since kept for as long as the module is. */
declare const createMemoryTemplatesModule: (parameters: { database: MemoryTaskDatabase; templates: IMemoryTemplate[] }) => IDatasetControlModule;

/** The sample templates: a bug fix, a feature and a research spike. */
declare const TEMPLATES: IMemoryTemplate[];

/** One item of a task's checklist. */
interface ITaskChecklistItem {
    id: string;
    name: string;
    isCompleted: boolean;
}

/** Where checklist items are kept. */
interface ITaskChecklistStore {
    /** The items of these tasks, by task id; a task with none may be left out. */
    loadItems(taskIds: string[]): Promise<Map<string, ITaskChecklistItem[]>>;
}

/** Each task's checklist progress as done/total, in a column Edit columns offers. */
declare const createTaskChecklistModule: (parameters: { createStore: (taskRuntime: ITaskRuntime, checklist: any) => ITaskChecklistStore }) => IDatasetControlModule;
/** Checklists held in memory, by task id. */
declare const createMemoryTaskChecklistModule: (parameters: { items: Record<string, ITaskChecklistItem[]> }) => IDatasetControlModule;
/** Checklists stored as JSON on each TALXIS task. */
declare const createTalxisTaskChecklistModule: (parameters?: {}) => IDatasetControlModule;

/** The checklists of the sample tasks. */
declare const CHECKLIST_ITEMS: Record<string, ITaskChecklistItem[]>;
/** The checklist column as a view lists it. */
declare const CHECKLIST_COLUMN: IColumn;
/** Checklists for generated tasks, ticked as far as each task's progress. */
declare const createChecklistItems: (tasks: IRawRecord[]) => Record<string, ITaskChecklistItem[]>;

/** How the two tasks of a dependency relate in time. */
type TaskDependencyType = 'finishToStart' | 'startToStart' | 'finishToFinish' | 'startToFinish';

/** A dependency between two tasks. */
interface ITaskDependency {
    id: string;
    /** The task that comes first. */
    predecessorTaskId: string;
    successorTaskId: string;
    type: TaskDependencyType;
}

/** Where dependencies are kept; a read-only one throws from the writes. */
interface ITaskDependenciesStore {
    /** The dependencies touching any of these tasks, at either end. */
    loadDependencies(taskIds: string[]): Promise<ITaskDependency[]>;
    createDependency(dependency: Omit<ITaskDependency, 'id'>): Promise<ITaskDependency>;
    updateDependency(dependency: ITaskDependency): Promise<void>;
    deleteDependency(dependencyId: string): Promise<void>;
}

/** A Dataverse table of dependencies: two task lookups and an option set of the type. */
interface IDataverseDependenciesSchema {
    entityName: string;
    predecessorAttribute: string;
    successorAttribute: string;
    typeAttribute: string;
    dependencyTypeCodes: Record<number, TaskDependencyType>;
}

/** Holds the tasks' dependencies and shows their counts in the Predecessors and Successors columns. */
declare const createDependenciesModule: (parameters: { createStore: (taskRuntime: ITaskRuntime, dependencies: any) => ITaskDependenciesStore }) => IDatasetControlModule;
/** Dependencies held in memory, starting over on every mount like the memory tasks. */
declare const createMemoryDependenciesModule: (parameters: { dependencies: ITaskDependency[] }) => IDatasetControlModule;
/** Dependencies kept in a Dataverse table of two task lookups and a type. */
declare const createDataverseDependenciesModule: (parameters: IDataverseDependenciesSchema) => IDatasetControlModule;
/** Dependencies kept in TALXIS's task dependency table. */
declare const createTalxisDependenciesModule: (parameters?: {}) => IDatasetControlModule;

/** The dependencies of the sample tasks. */
declare const DEPENDENCIES: ITaskDependency[];
/** The dependency columns as a view lists them. */
declare const DEPENDENCY_COLUMNS: IColumn[];
/** Each task waiting on its previous sibling, under every other parent. */
declare const createDependencies: (tasks: IRawRecord[]) => ITaskDependency[];

/** A DatasetControl of tasks, drawn as a tree in its body. */
declare const TaskDatasetControl: ((props: ITaskDatasetControlProps) => JSX.Element) & {
    /** A menu of the task grid's toggles, such as Show hierarchy. */
    Settings: (props: {
        /** The Show hierarchy toggle; on unless set to \`false\`. */
        enableShowHierarchy?: boolean;
        /** The Hide inactive tasks toggle; on unless set to \`false\`. */
        enableHideInactiveTasks?: boolean;
    }) => JSX.Element;
    /** DatasetControl.PageSizeSwitcher showing the task count, always disabled. */
    PageSizeSwitcher: (props: {}) => JSX.Element;
    /** DatasetControl.Ribbon, its items passed through hooks.ribbonCommandUi. */
    Ribbon: (props: { className?: string; disabled?: boolean; components?: { onRenderCommandBar?: (props: { items: ICommandBarItemProps[] }) => JSX.Element | null } }) => JSX.Element;
};

/** Where the tasks come from and how changing them is persisted. */
interface ITaskStore {
    [operation: string]: any;
}

/** Tasks held in memory. */
declare const createMemoryTaskProvider: (parameters: {
    taskRuntime: ITaskRuntime;
    createStore: (taskRuntime: ITaskRuntime) => ITaskStore;
    provider?: new (parameters: { store: ITaskStore }) => ITaskDataProvider;
}) => ITaskDataProvider;

/** Tasks held in memory, shared by the memory stores that read and write them. */
declare class MemoryTaskDatabase {
    /** The records are copied, so changes never reach the array. */
    constructor(parameters: { records: IRawRecord[]; metadata: IMemoryProviderEntityMetadata });
    getMetadata(): IMemoryProviderEntityMetadata;
    getTasks(): IRawRecord[];
    getTask(taskId: string): IRawRecord | undefined;
    /** Creates the tasks with their subtrees, the first at the rank params give and the rest after it. */
    createTasks(trees: ICreateTaskTree[], params: Omit<ITaskCreateParameters, 'data'>, shape: { fieldMapping: IFieldMapping; columns: IColumn[] }): IRawRecord[];
    updateTask(taskId: string, values: IRawRecord): void;
    deleteTasks(taskIds: string[]): void;
}

/** Tasks held in memory; editing one, or opening a record a lookup points to, shows an alert. */
declare class MemoryTaskStore implements ITaskStore {
    constructor(parameters: { taskRuntime: ITaskRuntime; database: MemoryTaskDatabase; columns: IColumn[] });
    [operation: string]: any;
}

/** The sample tasks: 108 tasks over seven projects. */
declare const TASKS: IRawRecord[];
/** Builds a deterministic tree of count tasks up to eight levels deep, with uneven branching. */
declare const createStressTasks: (count: number) => IRawRecord[];
declare const TASK_COLUMNS: IColumn[];
declare const TASK_METADATA: IMemoryProviderEntityMetadata;
/** Every task column, with the ones not named hidden. */
declare const getTaskColumns: (...visibleColumnNames: string[]) => IColumn[];
/** The sample tasks starting in the morning and due in the afternoon, under the same ids. */
declare const DATE_TIME_TASKS: IRawRecord[];
/** The task columns with a time of day on the start and due dates. */
declare const DATE_TIME_TASK_COLUMNS: IColumn[];
/** Every date-time task column, with the ones not named hidden. */
declare const getDateTimeTaskColumns: (...visibleColumnNames: string[]) => IColumn[];

/** A feature of the Gantt, loaded on every mount before the chart is drawn. */
interface IGanttModule {
    name: string;
    /** Lower loads first; modules of the same priority load at the same time. Defaults to 0. */
    priority?: number;
    onLoad(gantt: any, context: IModuleLoadParameters): any;
    onDestroy?(instance: any): void;
}

/** A date marked on the timeline with a line and a chip on the scale. */
interface IMarker {
    id: string;
    text: string;
    date: import('dayjs').Dayjs;
    /** The line's and the chip's colour; the theme's primary colour by default. */
    color?: string;
}

type MarkerSlot = (props: any) => JSX.Element | null;

interface IMarkersOptions {
    /** Today: enableMarker defaults to \`true\`, color to the theme's primary colour. */
    today?: { enableMarker?: boolean; color?: string };
    /** The project module's start and end: enableMarkers defaults to \`true\`, color to the theme's primary colour. */
    project?: { enableMarkers?: boolean; color?: string };
    /** The replaceable pieces of the markers: layer, column, track, scale and line each have onRenderContainer; chip has onRenderTooltip and onRenderChip. */
    components?: {
        layer?: Partial<{ onRenderContainer: MarkerSlot }>;
        column?: Partial<{ onRenderContainer: MarkerSlot }>;
        track?: Partial<{ onRenderContainer: MarkerSlot }>;
        scale?: Partial<{ onRenderContainer: MarkerSlot }>;
        line?: Partial<{ onRenderContainer: MarkerSlot }>;
        chip?: Partial<{ onRenderTooltip: MarkerSlot; onRenderChip: MarkerSlot }>;
    };
}

/** The marker a slot is drawn for, inside a Gantt marker. */
declare const useMarker: () => { marker: IMarker; left: number };

/** The tasks on a timeline, row for row with the TaskGrid beside it; needs startDate and endDate in the field mapping. */
declare const TaskGantt: ((props: {
    modules: IGanttModule[];
    stateKey?: string;
}) => JSX.Element) & {
    /** The Gantt's zoom; goes in the header. */
    ZoomSlider: (props: { components?: { [slot: string]: unknown } }) => JSX.Element;
    /** The grid and the Gantt side by side; goes in the body. */
    Split: (props: { children: [React.ReactNode, React.ReactNode]; stateKey?: string; defaultGanttSize?: number }) => JSX.Element;
};

/** The free MIT build of DHTMLX Gantt; every TaskGantt needs a library module. */
declare const createLibraryModule: () => IGanttModule;
/** A PRO build of DHTMLX Gantt, passed as its Gantt export. */
declare const createProLibraryModule: (parameters: { Gantt: unknown }) => IGanttModule;
/** Today, the project's start and end, and the store's own markers. */
declare const createMarkersModule: (parameters?: IMarkersOptions & { createStore?: (taskRuntime: ITaskRuntime) => { loadMarkers(): Promise<IMarker[]> } }) => IGanttModule;
/** Markers held in memory. */
declare const createMemoryMarkersModule: (parameters: IMarkersOptions & { markers: IMarker[] }) => IGanttModule;
/** A day, or a run of days, on which tasks are not worked on. */
interface INonWorkingDay {
    id: string;
    /** The first day, of the first occurrence when it recurs. */
    date: import('dayjs').Dayjs;
    /** The last day, inclusive; leave it out for a single day. */
    endDate?: import('dayjs').Dayjs;
    /** What the scale says when its day is pointed at. */
    description?: string;
    /** An RRULE, such as FREQ=YEARLY, whose start is date. */
    recurrence?: string;
    /** What else the day carries, such as its own columns. */
    data?: { [key: string]: unknown };
}

interface INonWorkingDaysOptions {
    /** Whether Saturdays and Sundays are non-working days. Defaults to true. */
    enableWeekends?: boolean;
    isVisibleByDefault?: boolean;
    /** The tooltip's replaceable pieces: onRenderCallout, onRenderContainer, and onRenderDescription, which gets the whole day. */
    components?: {
        tooltip?: Partial<{
            onRenderCallout: (props: any) => JSX.Element | null;
            onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
            onRenderDescription: (props: React.HTMLAttributes<HTMLSpanElement> & { day: { id: string; description: string } }) => JSX.Element | null;
        }>;
    };
}

/** Common holidays, plus a few company days, for the sample Gantt. */
declare const NON_WORKING_DAYS: INonWorkingDay[];

/** Weekends and the store's days, shaded on the timeline and hidden from TaskDatasetControl.Settings. */
declare const createNonWorkingDaysModule: (parameters?: INonWorkingDaysOptions & { createStore?: (taskRuntime: ITaskRuntime) => { loadNonWorkingDays(): Promise<INonWorkingDay[]> } }) => IGanttModule;
/** Non-working days held in memory. */
declare const createMemoryNonWorkingDaysModule: (parameters: INonWorkingDaysOptions & { nonWorkingDays: INonWorkingDay[] }) => IGanttModule;
/** Moves and resizes bars, writing the dates once the bar is dropped. */
declare const createBarDraggingModule: (parameters?: { enableMove?: boolean; enableResize?: boolean }) => IGanttModule;
/** Ctrl+drag over the timeline draws a new task. */
declare const createTaskDrawingModule: (parameters?: { components?: { preview?: { [slot: string]: unknown } } }) => IGanttModule;
/** Selects tasks from the chart; Shift+drag selects the bars under a band. */
declare const createTaskSelectionModule: (parameters?: { enableSelectionBox?: boolean }) => IGanttModule;
type TaskTooltipSlots = Partial<{ [slot: string]: (props: any) => JSX.Element | null }>;

/** The parts a task tooltip is composed of; the module draws them for the hovered bar. */
declare const TaskTooltip: {
    /** The default tooltip: the name and status, the progress, and when it runs. */
    Renderer: (props: { components?: { callout?: TaskTooltipSlots; header?: { [part: string]: TaskTooltipSlots }; progress?: TaskTooltipSlots; dateRange?: TaskTooltipSlots } }) => JSX.Element;
    /** The callout next to the pointer: onRenderCallout, onRenderContainer. */
    Callout: (props: { children?: React.ReactNode; components?: TaskTooltipSlots }) => JSX.Element | null;
    /** The task's name and status pill, slots by part: header, headerStart, headerEnd, title, status. */
    Header: (props: { components?: { [part: string]: TaskTooltipSlots } }) => JSX.Element | null;
    /** Holds the field rows: onRenderContainer. */
    FieldRows: (props: { children?: React.ReactNode; components?: TaskTooltipSlots }) => JSX.Element | null;
    /** Any column: onRenderContainer, onRenderIcon, onRenderLabel, onRenderValue. */
    FieldRow: (props: { columnName: string; iconName?: string; components?: TaskTooltipSlots }) => JSX.Element | null;
    /** The start from the timeline, not the record. */
    StartDateRow: (props: { iconName?: string; components?: TaskTooltipSlots }) => JSX.Element | null;
    /** The end from the timeline, not the record. */
    EndDateRow: (props: { iconName?: string; components?: TaskTooltipSlots }) => JSX.Element | null;
    /** The duration from the timeline's start and end. */
    DurationRow: (props: { iconName?: string; components?: TaskTooltipSlots }) => JSX.Element | null;
    /** The start, end and duration from the timeline, on one line. */
    DateRangeRow: (props: { components?: TaskTooltipSlots }) => JSX.Element | null;
    /** The mapped percentComplete as a bar. */
    ProgressRow: (props: { components?: TaskTooltipSlots }) => JSX.Element | null;
};

/** What a bar says when the pointer is on it, composed from TaskTooltip's parts. */
declare const createTaskTooltipModule: (parameters?: { components?: { onRender?: () => JSX.Element | null; [part: string]: unknown }; statusColumnName?: string }) => IGanttModule;
/** Draws the dependencies module's dependencies between the bars. */
declare const createLinksModule: (parameters?: {}) => IGanttModule;

declare namespace ComponentFramework {
    /** The lifecycle the host calls on a PCF control. */
    interface StandardControl<TInputs, TOutputs> {
        init(context: Context<TInputs, TOutputs>, notifyOutputChanged: () => void, state: Dictionary, container: HTMLDivElement): void;
        updateView(context: Context<TInputs, TOutputs>): void;
        getOutputs?(): TOutputs;
        destroy(): void;
    }
    type Dictionary = { [key: string]: any };
    namespace PropertyTypes {
        /** A text input parameter of the control's manifest. */
        interface StringProperty {
            raw: string | null;
        }
    }
}
declare module 'react-dom';
declare module 'dhtmlx-gantt-pro';

/** The instances grid modules provide, by name; extend it for a module of your own. */
interface IGridModuleMap {}
/** The instances DatasetControl modules provide, by name; extend it for a module of your own. */
interface IDatasetControlModuleMap {}

/** The record a Dataverse task grid sits on, such as the one the form shows. */
interface IDataverseHostRecord {
    entityName: string;
    id?: string;
    data?: IRawRecord;
}
/** Tasks in a Dataverse table, read through FetchXML and opened in their forms. */
declare class DataverseTaskStore implements ITaskStore {
    constructor(parameters: {
        taskRuntime: ITaskRuntime;
        /** Liquid over project and hostRecord. */
        fetchXml: string;
        hostRecord?: IDataverseHostRecord;
        form?: { editId?: string; bulkEditId?: string; getParameters?: (operation: 'edit' | 'bulkEdit' | 'open', defaults: any) => any };
        getNewTaskDefaults?: (params: ITaskCreateParameters) => IRawRecord | Promise<IRawRecord>;
    });
    [operation: string]: any;
}
/** Puts a DataverseTaskStore together with a task provider. */
declare const createDataverseTaskProvider: typeof createMemoryTaskProvider;
/** The user's own task columns as TALXIS attribute definitions and values. */
declare const createTalxisCustomColumnsModule: (parameters: { entityName: string; recordId?: string; navigationPropertyName?: string; enableCreation?: boolean; enableEditing?: boolean; enableDeletion?: boolean }) => IDatasetControlModule;
/** The project module for a project record in Dataverse. */
declare const createDataverseProjectModule: (parameters: { entityName: string; id: string; startDateColumn?: string; endDateColumn?: string; columns?: string[] }) => IProjectModule;

declare const CellUiValueRendererComponents: typeof import('@talxis/base-controls').CellUiValueRendererComponents;
declare const CellColumnControlComponents: typeof import('@talxis/base-controls').CellColumnControlComponents;
declare const CellUiCommandsComponents: typeof import('@talxis/base-controls').CellUiCommandsComponents;
declare const RecordSaveUiIndicatorComponents: typeof import('@talxis/base-controls').RecordSaveUiIndicatorComponents;
declare const RecordSaveUiErrorCalloutComponents: typeof import('@talxis/base-controls').RecordSaveUiErrorCalloutComponents;
declare const RowSelectionUiCheckboxComponents: typeof import('@talxis/base-controls').RowSelectionUiCheckboxComponents;
declare const RowSelectionUiHeaderCheckboxComponents: typeof import('@talxis/base-controls').RowSelectionUiHeaderCheckboxComponents;
declare const GroupingUiToggleComponents: typeof import('@talxis/base-controls').GroupingUiToggleComponents;
declare const GroupingUiCountComponents: typeof import('@talxis/base-controls').GroupingUiCountComponents;
declare const AggregationUiTotalValueComponents: typeof import('@talxis/base-controls').AggregationUiTotalValueComponents;
declare const GroupingUiExpandCollapseComponents: typeof import('@talxis/base-controls').GroupingUiExpandCollapseComponents;
declare const FilteringUiCalloutComponents: typeof import('@talxis/base-controls').FilteringUiCalloutComponents;
declare const ThemeContext: typeof import('@talxis/base-controls').ThemeContext;
declare const Dialog: typeof import('@talxis/base-controls').Dialog;
declare const XrmForm: typeof import('@talxis/base-controls').XrmForm;
declare module '@fluentui/react';
declare const Dataset: typeof import('@talxis/client-libraries').Dataset;
type IMapViewRequest = import('@talxis/base-controls').IMapViewRequest;
type IMapViewportEvents = import('@talxis/base-controls').IMapViewportEvents;
declare const useMap: typeof import('@talxis/base-controls').useMap;
declare const useMapModule: typeof import('@talxis/base-controls').useMapModule;
declare const useMapRecords: typeof import('@talxis/base-controls').useMapRecords;
declare const useMapRecord: typeof import('@talxis/base-controls').useMapRecord;
declare const createGoogleMapsModule: typeof import('@talxis/base-controls').createGoogleMapsModule;
declare const createLeafletModule: typeof import('@talxis/base-controls').createLeafletModule;
type IMapModule = import('@talxis/base-controls').IMapModule;
type IMapLibrary = import('@talxis/base-controls').IMapLibrary;
type IMap = import('@talxis/base-controls').IMap;
type IMapPoint = import('@talxis/base-controls').IMapPoint;
type IMapBounds = import('@talxis/base-controls').IMapBounds;
type IMapFieldMapping = import('@talxis/base-controls').IMapFieldMapping;
type IMapComponents = import('@talxis/base-controls').IMapComponents;
type IMapSurface = import('@talxis/base-controls').IMapSurface;
type ILeafletComponents = import('@talxis/base-controls').ILeafletComponents;
type IGoogleMapsComponents = import('@talxis/base-controls').IGoogleMapsComponents;
type ILeaflet = import('@talxis/base-controls').ILeaflet;
type IGoogleMaps = import('@talxis/base-controls').IGoogleMaps;
type ILeafletUiComponents = import('@talxis/base-controls').ILeafletUiComponents;
type ILeafletMarkersComponents = import('@talxis/base-controls').ILeafletMarkersComponents;
type ILeafletMarkerComponents = import('@talxis/base-controls').ILeafletMarkerComponents;
type ILeafletMarkerPopupComponents = import('@talxis/base-controls').ILeafletMarkerPopupComponents;
type IMapPopupRendererComponents = import('@talxis/base-controls').IMapPopupRendererComponents;
type IRecordCardComponents = import('@talxis/base-controls').IRecordCardComponents;
type IRecordCardHeaderComponents = import('@talxis/base-controls').IRecordCardHeaderComponents;
type IRecordCardHeaderPartsComponents = import('@talxis/base-controls').IRecordCardHeaderPartsComponents;
type IRecordCardTitleComponents = import('@talxis/base-controls').IRecordCardTitleComponents;
type IRecordCardFieldRowComponents = import('@talxis/base-controls').IRecordCardFieldRowComponents;
type ILeafletUiPopupComponents = import('@talxis/base-controls').ILeafletUiPopupComponents;
type IGoogleMapsUiComponents = import('@talxis/base-controls').IGoogleMapsUiComponents;
type IGoogleMapsUiPopupComponents = import('@talxis/base-controls').IGoogleMapsUiPopupComponents;
type IGoogleMapsMarkerComponents = import('@talxis/base-controls').IGoogleMapsMarkerComponents;
type IMapPopupComponents = import('@talxis/base-controls').IMapPopupComponents;
declare const MapUi: typeof import('@talxis/base-controls').MapUi;
declare const MapUiContainerComponents: typeof import('@talxis/base-controls').MapUiContainerComponents;
declare const MapUiMarkerComponents: typeof import('@talxis/base-controls').MapUiMarkerComponents;
declare const MapUiMarkerPin: typeof import('@talxis/base-controls').MapUiMarkerPin;
type IMapUiMarkerPinProps = import('@talxis/base-controls').IMapUiMarkerPinProps;
type IMapUiMarkerProps = import('@talxis/base-controls').IMapUiMarkerProps;
type IMapUiMarkerComponents = import('@talxis/base-controls').IMapUiMarkerComponents;
declare const LeafletUi: typeof import('@talxis/base-controls').LeafletUi;
declare const LeafletUiComponents: typeof import('@talxis/base-controls').LeafletUiComponents;
declare const MapPopup: typeof import('@talxis/base-controls').MapPopup;
declare const RecordCard: typeof import('@talxis/base-controls').RecordCard;
declare const RecordCardHeader: typeof import('@talxis/base-controls').RecordCardHeader;
declare const RecordCardHeaderStart: typeof import('@talxis/base-controls').RecordCardHeaderStart;
declare const RecordCardHeaderEnd: typeof import('@talxis/base-controls').RecordCardHeaderEnd;
declare const RecordCardTitle: typeof import('@talxis/base-controls').RecordCardTitle;
declare const RecordCardTitleComponents: typeof import('@talxis/base-controls').RecordCardTitleComponents;
declare const OptionTag: typeof import('@talxis/base-controls').OptionTag;
declare const RecordCardFieldRows: typeof import('@talxis/base-controls').RecordCardFieldRows;
declare const RecordCardFieldRow: typeof import('@talxis/base-controls').RecordCardFieldRow;
declare const RecordCardDateRange: typeof import('@talxis/base-controls').RecordCardDateRange;
declare const RecordCardProgress: typeof import('@talxis/base-controls').RecordCardProgress;
declare const RecordCardHeaderComponents: typeof import('@talxis/base-controls').RecordCardHeaderComponents;
declare const RecordCardComponents: typeof import('@talxis/base-controls').RecordCardComponents;
declare const LeafletUiPopupComponents: typeof import('@talxis/base-controls').LeafletUiPopupComponents;
declare const GoogleMapsUi: typeof import('@talxis/base-controls').GoogleMapsUi;
declare const GoogleMapsUiComponents: typeof import('@talxis/base-controls').GoogleMapsUiComponents;
declare const GoogleMapsUiPopupComponents: typeof import('@talxis/base-controls').GoogleMapsUiPopupComponents;
declare module 'react-leaflet';
declare const ControlComponents: typeof import('@talxis/base-controls').ControlComponents;
type IXrmFormContext = import('@talxis/base-controls').IXrmFormContext;
declare const useForm: typeof import('@talxis/base-controls').useForm;
declare const useValidationSummary: typeof import('@talxis/base-controls').useValidationSummary;
type IFormApi = import('@talxis/base-controls').IFormApi;
type ITabsComponentProps = import('@talxis/base-controls').ITabsComponentProps;
`

/** What only `import { … } from '@talxis/base-controls'` reaches, never a global. */
export const gridSandboxImportOnlyDeclarations = `const Map: typeof import('@talxis/base-controls').Map;`
