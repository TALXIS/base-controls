/** Ambient types for the Monaco editor of the live Grid examples, covering what the sandbox injects. */
export const gridSandboxDeclarations = `
declare const React: typeof import('react');

declare const Icon: typeof import('@fluentui/react').Icon;
declare const IconButton: typeof import('@fluentui/react').IconButton;
declare const PrimaryButton: typeof import('@fluentui/react').PrimaryButton;
declare const DefaultButton: typeof import('@fluentui/react').DefaultButton;
declare const MessageBar: typeof import('@fluentui/react').MessageBar;
declare const MessageBarType: typeof import('@fluentui/react').MessageBarType;
declare const Stack: typeof import('@fluentui/react').Stack;
declare const Toggle: typeof import('@fluentui/react').Toggle;
declare const TooltipHost: typeof import('@fluentui/react').TooltipHost;
declare const mergeStyleSets: typeof import('@fluentui/react').mergeStyleSets;
declare const FontWeights: typeof import('@fluentui/react').FontWeights;

type ICommandBarItemProps = import('@fluentui/react').ICommandBarItemProps;
type IContextualMenuItem = import('@fluentui/react').IContextualMenuItem;
type IIconProps = import('@fluentui/react').IIconProps;
type ITextProps = import('@fluentui/react').ITextProps;
type ISpinnerProps = import('@fluentui/react').ISpinnerProps;
type IShimmerProps = import('@fluentui/react').IShimmerProps;
type IMessageBarProps = import('@fluentui/react').IMessageBarProps;
type IButtonProps = import('@fluentui/react').IButtonProps;

type IAlignment = 'left' | 'center' | 'right';

interface IOptionSetOption {
    Value: number;
    Label: string;
    Color?: string;
}

/** What the grid reads off a column's metadata. */
interface IColumnMetadata {
    /** Whether the column can be sorted. */
    IsValidForGrid?: boolean;
    /** Whether the column's values can be edited. */
    IsValidForUpdate?: boolean;
    /** 1 or 2 marks the column as required. */
    RequiredLevel?: number;
    /** Whether the column can be grouped by. */
    CanBeGrouped?: boolean;
    /** Which totals the column offers. */
    SupportedAggregations?: ('sum' | 'avg' | 'min' | 'max' | 'count' | 'countcolumn')[];
    /** Which filter operators the column offers. */
    SupportedFilterConditionOperators?: number[];
    OptionSet?: IOptionSetOption[];
    [key: string]: any;
}

interface IColumn {
    name: string;
    dataType: string;
    displayName?: string;
    /** Width in pixels. */
    visualSizeFactor?: number;
    isHidden?: boolean;
    alignment?: IAlignment;
    metadata?: IColumnMetadata;
    [key: string]: any;
}

interface IRawRecord {
    [columnName: string]: any;
}

interface IRecord {
    getRecordId(): string;
    getValue(columnName: string): any;
    getFormattedValue(columnName: string): string | null;
    setValue(columnName: string, value: any): void;
    getDataProvider(): IDataProvider;
    expressions: {
        setValidationExpression(columnName: string, expression: () => { error: boolean; errorMessage: string }): void;
    };
}

interface IRecordSaveOperationResult {
    recordId: string;
    success: boolean;
    fields: string[];
    errors?: { fieldName: string; message: string }[];
}

interface IDataProvider {
    getColumns(): IColumn[];
    setColumns(columns: IColumn[]): void;
    getRecords(): IRecord[];
    getRecordsMap(): { [recordId: string]: IRecord };
    getSelectedRecordIds(): string[];
    refresh(): void;
    isLoading(): boolean;
    getLoadingMessage(): string;
    grouping: {
        addGroupBy(groupBy: { alias: string; columnName: string }): void;
        clear(): void;
    };
    aggregation: {
        addAggregation(aggregation: { alias: string; columnName: string; aggregationFunction: 'sum' | 'avg' | 'min' | 'max' | 'count' }): void;
        clear(): void;
    };
    addEventListener(event: string, callback: (...args: any[]) => void): void;
    removeEventListener(event: string, callback: (...args: any[]) => void): void;
}

declare class MemoryDataProvider implements IDataProvider {
    constructor(parameters: {
        dataSource: IRawRecord[];
        metadata: { PrimaryIdAttribute: string; PrimaryNameAttribute: string; LogicalName: string; EntitySetName: string };
    });
    getColumns(): IColumn[];
    setColumns(columns: IColumn[]): void;
    getRecords(): IRecord[];
    getRecordsMap(): { [recordId: string]: IRecord };
    getSelectedRecordIds(): string[];
    refresh(): void;
    isLoading(): boolean;
    getLoadingMessage(): string;
    grouping: IDataProvider['grouping'];
    aggregation: IDataProvider['aggregation'];
    addEventListener(event: string, callback: (...args: any[]) => void): void;
    removeEventListener(event: string, callback: (...args: any[]) => void): void;
    getPaging(): { setPageSize(pageSize: number): void };
}

declare const DataTypes: {
    SingleLineText: string;
    SingleLineEmail: string;
    SingleLineUrl: string;
    Multiple: string;
    OptionSet: string;
    TwoOptions: string;
    WholeNone: string;
    WholeDuration: string;
    Decimal: string;
    Currency: string;
    DateAndTimeDateOnly: string;
    DateAndTimeDateAndTime: string;
    [dataType: string]: string;
};

declare const Operators: {
    GetOperatorsForDataType(dataType: string): { Value: number }[];
};

/** The provider the example is handed: the docs tasks, loaded. */
declare const provider: IDataProvider;

/** A fresh provider over the docs tasks, not yet loaded. */
declare function createDocsProvider(): MemoryDataProvider;

interface IGridCellHookParams {
    record: IRecord;
    columnName: string;
}

interface IThemeColors {
    primary: string;
    background: string;
    text: string;
}

interface IThemeBuilder {
    /** Change one and the cell's palette is generated from it. */
    colors: IThemeColors;
}

interface IGridCellCommands {
    items: ICommandBarItemProps[];
    overflowItems: ICommandBarItemProps[];
}

interface IGridColumnSettings {
    alignment?: IAlignment;
    oneClickEdit?: boolean;
    isEditable?: boolean;
    isRequired?: boolean;
    widthOffset?: number;
    onGetCommands?: (record: IRecord) => Partial<IGridCellCommands>;
}

interface IGridCellParams {
    data: IRecord;
    value: any;
    colDef?: IGridColDef;
    [key: string]: any;
}

interface IColumnHeaderParams {
    displayName: string;
    column: any;
    [key: string]: any;
}

type IColumnHeaderRendererProps = IColumnHeaderParams;

interface IGridColDef {
    colId?: string;
    headerName?: string;
    pinned?: 'left' | 'right' | null;
    initialWidth?: number;
    width?: number;
    hide?: boolean;
    sortable?: boolean;
    resizable?: boolean;
    autoHeight?: boolean;
    valueGetter?: (params: { data?: IRecord }) => any;
    cellRenderer?: (props: IGridCellParams) => JSX.Element | null;
    headerComponent?: (props: IColumnHeaderParams) => JSX.Element | null;
    settings?: IGridColumnSettings;
    [key: string]: any;
}

interface IGridColumnHeader {
    /** What the column is called. */
    getName(): string;
    /** The header's tooltip: the name, and the adornments' titles. */
    getTitle(): string;
    /** The provider column, where the header has one. */
    getColumn(): IColumn | undefined;
}

interface IColumnHeaderAdornment {
    key: string;
    placement: 'prefix' | 'suffix';
    /** Named in parentheses in the header's tooltip. */
    title?: string;
    onRender?: () => JSX.Element;
}

interface IGridSurface {
    key: string;
    onRender: () => JSX.Element | null;
}

interface IEventEmitter<TEvents> {
    addEventListener<K extends keyof TEvents>(event: K, callback: TEvents[K]): void;
    removeEventListener<K extends keyof TEvents>(event: K, callback: TEvents[K]): void;
}

interface IGridRowsEvents {
    onActiveRowsChanged: () => void;
    onRowClicked: (record: IRecord) => void;
}

interface IGridColumnsEvents {
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
    onColumnsChanged: (columns: IColumn[]) => void;
}

interface IGridCellsEvents {
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
}

interface IGridRuntimeEvents {
    onDataLoaded: () => void;
    onDestroyed: () => void;
}

interface IGridColumnHeaders {
    registerColumnMenuItemsHook(hook: (items: IContextualMenuItem[], header: IGridColumnHeader) => void, priority?: number): () => void;
    registerColumnHeaderAdornmentsHook(hook: (adornments: IColumnHeaderAdornment[], header: IGridColumnHeader) => void, priority?: number): () => void;
}

interface IGridColumns {
    readonly events: IEventEmitter<IGridColumnsEvents>;
    readonly headers: IGridColumnHeaders;
    registerColumnDefinitionsHook(hook: (columnDefs: IGridColDef[]) => void, priority?: number): () => void;
}

interface IGridCells {
    readonly events: IEventEmitter<IGridCellsEvents>;
    registerCellThemeHook(hook: (theme: IThemeBuilder, params: IGridCellHookParams) => void, priority?: number): () => void;
    registerCellEditableHook(hook: (result: { isEditable: boolean }, params: IGridCellHookParams) => void, priority?: number): () => void;
    registerCellLoadingHook(hook: (result: { isLoading: boolean }, params: IGridCellHookParams) => void, priority?: number): () => void;
    registerCellCommandsHook(hook: (result: IGridCellCommands, params: IGridCellHookParams) => void, priority?: number): () => void;
}

interface IGridRows extends IEventEmitter<IGridRowsEvents> {
    registerRowHeightHook(hook: (result: { height?: number }, params: { record: IRecord }) => void, priority?: number): () => void;
}

interface IGridSurfaces {
    registerSurfaceHook(hook: (surfaces: IGridSurface[]) => void, priority?: number): () => void;
}

/** AG Grid's own api. */
interface IGridApi {
    autoSizeAllColumns(): void;
    sizeColumnsToFit(): void;
    ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle'): void;
    getDisplayedRowCount(): number;
    flashCells(params?: { rowNodes?: any[]; columns?: string[] }): void;
    [method: string]: any;
}

/** The services that are only there once something registers them; declare your own here. */
interface IGridOptionalServiceMap {
    gridApi: IGridApi;
    gridRoot: HTMLElement;
}

interface IGridServiceMap extends IGridOptionalServiceMap {
    provider: IDataProvider;
    columns: IGridColumns;
    cells: IGridCells;
    rows: IGridRows;
    surfaces: IGridSurfaces;
    grid: IGridRuntime;
}

interface IGridServiceLocator {
    get<K extends keyof IGridServiceMap>(key: K): IGridServiceMap[K];
    find<K extends keyof IGridServiceMap>(key: K): IGridServiceMap[K] | undefined;
    register<K extends keyof IGridServiceMap>(key: K, resolve: () => IGridServiceMap[K]): void;
    whenAvailable<K extends keyof IGridServiceMap>(key: K, callback: (service: IGridServiceMap[K]) => void): void;
}

/** AG Grid's grid options, as a hook may set them. */
interface IAgGridOptions {
    [option: string]: any;
}

interface IGridRuntime {
    readonly events: IEventEmitter<IGridRuntimeEvents>;
    readonly services: IGridServiceLocator;
    /** A hook over the options AG Grid reads once, when it is created. */
    registerAgGridInitialOptions(hook: (result: { options: IAgGridOptions }) => void, priority?: number): () => void;
    /** A hook over the options AG Grid can be handed at any time. */
    registerAgGridOptions(hook: (result: { options: IAgGridOptions }) => void, priority?: number): () => void;
    /** Runs the option hooks again and hands AG Grid what changed. */
    refreshAgGridOptions(): void;
}

interface IGridModule {
    /** AG Grid modules the feature needs. */
    agGridModules?: any[];
    /** Registers what the module contributes to the grid. */
    onRegister?: (runtime: IGridRuntime) => void;
}

interface IGridModules {
    rowModel: IGridModule;
    license?: IGridModule;
    rowSelection?: IGridModule;
    cellSelection?: IGridModule;
    sorting?: IGridModule;
    filtering?: IGridModule;
    grouping?: IGridModule;
    aggregation?: IGridModule;
    clipboard?: IGridModule;
    custom?: IGridModule[];
}

declare const GRID_MODULE_PRIORITY: {
    rowModel: 10;
    rowSelection: 20;
    cellSelection: 30;
    sorting: 40;
    filtering: 50;
    grouping: 60;
    aggregation: 70;
    clipboard: 80;
};

declare function createClientSideRowModelModule(): IGridModule;
declare function createServerSideRowModelModule(): IGridModule;
declare function createRowSelectionModule(options: {
    mode: 'single' | 'multiple';
    components?: {
        onRenderCell?: (props: IGridCellParams) => JSX.Element;
        onRenderHeader?: (props: IColumnHeaderParams) => JSX.Element;
    };
}): IGridModule;
declare function createCellSelectionModule(options?: {
    suppressMultiRangeSelection?: boolean;
    enableRangeHandle?: boolean;
    enableFillHandle?: boolean;
    fillHandleDirection?: 'x' | 'y' | 'xy';
}): IGridModule;
declare function createClipboardModule(options?: {
    copyHeadersToClipboard?: boolean;
    suppressCutToClipboard?: boolean;
    suppressClipboardPaste?: boolean;
    [option: string]: any;
}): IGridModule;
declare function createSortingModule(options?: {
    labels?: Partial<Record<'sortTextAscending' | 'sortTextDescending' | 'sortDateAscending' | 'sortDateDescending' | 'sortNumberAscending' | 'sortNumberDescending' | 'sortTwoOptionsJoint' | 'clear' | 'menuSection', string>>;
    components?: { onRenderSortIcon?: (props: { descending: boolean }) => JSX.Element };
}): IGridModule;
declare function createFilteringModule(options?: {
    labels?: Partial<Record<'filterMenuFilterBy' | 'clear' | 'menuSection', string>>;
    components?: {
        onRenderFilterIcon?: (props: IIconProps) => JSX.Element;
        onRenderFilterCallout?: () => JSX.Element | null;
    };
}): IGridModule;
declare function createGroupingModule(options?: {
    labels?: Partial<Record<'group' | 'ungroup' | 'headerTitle' | 'menuSection' | 'expandLevel' | 'collapseLevel', string>>;
    components?: {
        onRenderGroupingIcon?: (props: IIconProps) => JSX.Element;
        onRenderGroupCell?: (props: IGridCellParams) => JSX.Element;
    };
    allowUserGrouping?: boolean;
    type?: 'nested' | 'flat';
    defaultExpandedLevel?: number;
    pinGroupedColumns?: boolean;
    maxGroupLoadsPerSelection?: number;
}): IGridModule;
declare function createAggregationModule(options?: {
    labels?: Partial<Record<'totalNone' | 'totalAverage' | 'totalMaximum' | 'totalMinimum' | 'totalSum' | 'totalCount' | 'totalCountColumn' | 'menuSection', string>>;
    allowUserAggregation?: boolean;
    components?: {
        onRenderTotalCell?: (props: IGridCellParams) => JSX.Element;
        onRenderAggregateCell?: (props: IGridCellParams) => JSX.Element;
    };
}): IGridModule;

/** Reads one of the grid's services, from inside something the grid draws. */
declare function useGridService<K extends keyof IGridServiceMap>(key: K): IGridServiceMap[K];

interface IGridLabels {
    noRecordsFound: string;
    valueNotEditable: string;
    recordSaveErrorTitle: string;
    recordSaveErrorDismiss: string;
}

interface IOverlayUiLoadingComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    onRenderSpinner: (props: ISpinnerProps) => JSX.Element;
    onRenderText: (props: ITextProps) => JSX.Element;
}

interface IOverlayUiLoadingProps {
    message?: string;
    components?: Partial<IOverlayUiLoadingComponents>;
}

interface IOverlayUiEmptyRecordsComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    onRenderIcon: (props: IIconProps) => JSX.Element;
    onRenderText: (props: ITextProps) => JSX.Element;
}

interface IOverlayUiEmptyRecordsProps {
    message: string;
    components?: Partial<IOverlayUiEmptyRecordsComponents>;
}

interface IRowUiLoadingProps {
    components?: Partial<{ onRenderShimmer: (props: IShimmerProps) => JSX.Element }>;
}

interface IRowUiErrorProps {
    message: string;
    components?: Partial<{ onRenderMessageBar: (props: IMessageBarProps) => JSX.Element }>;
}

/** The grid's own replaceable pieces. */
interface IGridComponents {
    onRenderLoadingOverlay: (props: IOverlayUiLoadingProps) => JSX.Element;
    onRenderEmptyRecordsOverlay: (props: IOverlayUiEmptyRecordsProps) => JSX.Element;
    onRenderRowLoading: (props: IRowUiLoadingProps) => JSX.Element;
    onRenderRowError: (props: IRowUiErrorProps) => JSX.Element;
}

interface IGridEditedCell {
    recordId: string;
    columnName: string;
}

interface IGridProps {
    /** Read once, at mount. */
    provider: IDataProvider;
    /** Read once, at mount. */
    modules: IGridModules;
    enableEditing?: boolean;
    enableAutoSave?: boolean;
    enableNavigation?: boolean;
    enableZebra?: boolean;
    enableOptionSetColors?: boolean;
    rowHeight?: number;
    maxVisibleRows?: number;
    height?: string;
    className?: string;
    components?: Partial<IGridComponents>;
    labels?: Partial<IGridLabels>;
    colDefs?: (IGridColDef & { colId: string })[];
    state?: any;
    onGridReady?: (runtime: IGridRuntime) => void;
    onDestroyed?: (runtime: IGridRuntime) => void;
    onDataLoaded?: () => void;
    onLoadingChanged?: (isLoading: boolean) => void;
    onSelectionChanged?: (selectedRecordIds: string[]) => void;
    onRecordValueChanged?: (record: IRecord, columnName: string, newValue: any) => void;
    onBeforeRecordSaved?: (record: IRecord) => void;
    onAfterRecordSaved?: (result: IRecordSaveOperationResult) => void;
    onError?: (message: string, details?: any) => void;
    onEditedCellChanged?: (cell: IGridEditedCell | undefined) => void;
    onCellDoubleClicked?: (record: IRecord, columnName: string) => void;
    onRowClicked?: (record: IRecord) => void;
    onFocusedCellChanged?: (record: IRecord | undefined, columnName: string | undefined) => void;
    onColumnsChanged?: (columns: IColumn[]) => void;
}

interface ICellControlProps {
    parameters: { Record: { raw: IRecord }; value: any; [key: string]: any };
    [key: string]: any;
}

interface ICellRendererComponents {
    control?: {
        onRenderControl?: (props: ICellControlProps, defaultRender: (props: ICellControlProps) => JSX.Element | null) => JSX.Element | null;
    };
}

interface IColumnHeaderRendererComponents {
    label?: { onRenderLabel?: (props: ITextProps & { name?: string }) => JSX.Element };
    container?: { onRenderContainer?: (props: IButtonProps) => JSX.Element };
}

type IGridCellComponent = (props: IGridCellParams & { components?: ICellRendererComponents }) => JSX.Element;
type IGridPartComponent = (props: { children?: React.ReactNode; [key: string]: any }) => JSX.Element;

declare const Grid: {
    Root: (props: IGridProps) => JSX.Element;
    Cell: {
        Renderer: IGridCellComponent;
        FieldRenderer: IGridCellComponent;
        EmptyRenderer: IGridCellComponent;
        Root: (props: IGridCellParams & { children?: React.ReactNode }) => JSX.Element;
        Theme: IGridPartComponent;
        Container: IGridPartComponent;
        [part: string]: any;
    };
    ColumnHeader: {
        Renderer: (props: IColumnHeaderParams & { components?: IColumnHeaderRendererComponents }) => JSX.Element;
        Ui: {
            Label: (props: ITextProps & { name?: string }) => JSX.Element;
            [part: string]: any;
        };
        [part: string]: any;
    };
    Overlay: {
        Ui: {
            Loading: (props: IOverlayUiLoadingProps) => JSX.Element;
            EmptyRecords: (props: IOverlayUiEmptyRecordsProps) => JSX.Element;
        };
    };
    Row: {
        Ui: {
            Loading: (props: IRowUiLoadingProps) => JSX.Element;
            Error: (props: IRowUiErrorProps) => JSX.Element;
        };
    };
};
`
