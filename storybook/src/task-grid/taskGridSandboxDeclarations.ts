/**
 * Ambient declarations handed to the Monaco editor of the live TaskGrid examples, so the snippet gets
 * IntelliSense for everything the sandbox injects. Hand-written on purpose — the same approach the
 * Form examples take — because the library's real `.d.ts` is not loaded into the editor.
 */
export const taskGridSandboxDeclarations = `
declare const React: typeof import('react');

interface IOptionSetOption {
    Value: number;
    Label: string;
    Color?: string;
}

interface ITaskGridColumn {
    name: string;
    displayName?: string;
    dataType?: string;
    isHidden?: boolean;
    metadata?: { OptionSet?: IOptionSetOption[]; [key: string]: any };
}

interface ITaskGridRecord {
    getRecordId(): string;
    getValue(columnName: string): any;
    getFormattedValue(columnName: string): string;
    setValue(columnName: string, value: any): void;
    /** The reference other records use to point at this one. */
    getNamedReference(): ITaskGridEntityReference;
    /** Whether the record is active - a closed task is not. */
    isActive(): boolean;
    /** Expressions that override how this record's columns behave. */
    expressions: ITaskGridRecordExpressions;
    /** Persists the record through the descriptor's strategy. The grid auto-saves, so call it after setValue. */
    save(): Promise<any>;
}

/** What a lookup column's value holds: one entry per referenced record. */
interface ITaskGridEntityReference {
    id: { guid: string };
    name?: string;
    etn?: string;
    /** Whatever the strategy attached to the reference — an image url, a colour, anything. */
    rawData?: Record<string, any>;
}

/** Props every cell renderer and cell editor receives. */
interface ITaskGridCellProps {
    /** The column the cell belongs to, including its metadata. */
    baseColumn?: ITaskGridColumn;
    /** The record behind the row. */
    record: ITaskGridRecord;
    /** \`value.value\` is the raw value; \`value.loading\` is true while it resolves. */
    value: { value: any; loading: boolean; error: boolean; [key: string]: any };
    /** True when the component is rendered as the cell's editor rather than its renderer. */
    isCellEditor: boolean;
    /** The AG Grid api. \`stopEditing()\` closes an editor once it has committed. */
    api?: { stopEditing(): void; refreshCells(params?: any): void; [key: string]: any };
    [key: string]: any;
}

/** One button of the ribbon's command bar, as the grid hands it over. */
interface ITaskGridCommandBarItem {
    key: string;
    text?: string;
    disabled?: boolean;
    iconProps?: { iconName?: string };
    onClick?: (event?: any) => void;
    /** Present when the item renders its own button, e.g. the one that owns the Edit columns panel. */
    onRender?: (item: ITaskGridCommandBarItem) => JSX.Element;
    subMenuProps?: {
        items?: ITaskGridCommandBarItem[];
        /** Present when the submenu is a panel of its own, e.g. the settings callout or the template picker. */
        onRenderMenuList?: (...args: any[]) => JSX.Element;
    };
    [key: string]: any;
}

interface ITaskGridCommandBarProps {
    items?: ITaskGridCommandBarItem[];
    farItems?: ITaskGridCommandBarItem[];
    [key: string]: any;
}

interface ITaskGridComponents {
    /** Wraps the renderer of every data column. Call \`defaultRender(props)\` to keep the grid's own cell. */
    onRenderCellRenderer: (props: ITaskGridCellProps, defaultRender: (props: ITaskGridCellProps) => JSX.Element) => JSX.Element;
    /** Wraps the editor of every editable data column. */
    onRenderCellEditor: (props: ITaskGridCellProps, defaultRender: (props: ITaskGridCellProps) => JSX.Element) => JSX.Element;
    onRenderSkeleton: (props: any) => JSX.Element;
    /** Replaces the ribbon's command bar outright — there is no defaultRender to delegate to. */
    onRenderCommandBar: (props: ITaskGridCommandBarProps) => JSX.Element;
}

/** The grid. \`descriptor\` is supplied by the sandbox. */
declare const TaskGrid: (props: {
    descriptor: any;
    components?: Partial<ITaskGridComponents>;
    labels?: Record<string, string>;
}) => JSX.Element;

/** The in-memory descriptor backing this example. Kept outside the snippet so edits do not reload the data. */
declare const descriptor: any;

/** What a record lets an expression read and override. */
interface ITaskGridRecordExpressions {
    /** Custom validator for a column. Return \`{ error: true, errorMessage }\` to mark the value invalid. */
    setValidationExpression(columnName: string, validator: () => { error: boolean; errorMessage: string }): void;
    setValueExpression(columnName: string, expression: () => any): void;
    setFormattedValueExpression(columnName: string, expression: (defaultFormattedValue: string | null) => string | null): void;
    setDisabledExpression(columnName: string, expression: () => boolean): void;
    ui: {
        /** Cell colours. Return undefined to leave the cell alone. */
        setCustomFormattingExpression(columnName: string, expression: (cellTheme: any) => { backgroundColor?: string; textColor?: string; className?: string } | undefined): void;
        setNotificationsExpression(columnName: string, expression: () => any[]): void;
        setLoadingExpression(columnName: string, expression: () => boolean): void;
        [key: string]: any;
    };
    [key: string]: any;
}

/** Deep customization of the AG Grid instance, returned from the descriptor. */
interface IGridCustomizerStrategy {
    /** Called once when the grid is ready. Register expression decorators and set grid options here. */
    onInitialize: (params: { customizer: IGridCustomizer; services: ITaskGridServices }) => void;
    /** The computed ag-grid column definitions. Return them changed. */
    onGetColumnDefinitions?: (columnDefs: any[]) => any[];
    /** The grid's own row class rules. Return them extended or overridden. */
    onGetRowClassRules?: (rules: Record<string, (params: any) => boolean>) => Record<string, (params: any) => boolean>;
}

interface IGridCustomizer {
    /** The raw ag-grid \`GridApi\`. */
    getGridApi(): { setGridOption(key: string, value: any): void; refreshCells(params?: any): void; [key: string]: any };
    /** The provider backing the grid: records, the tree, provider events. */
    getTaskDataProvider(): {
        addEventListener(event: 'onRecordLoaded', listener: (record: ITaskGridRecord) => void): void;
        addEventListener(event: 'onBeforeRecordSaved', listener: () => void): void;
        /** Fires per record once a save settles. \`fields\` are the columns that were written. */
        addEventListener(event: 'onAfterRecordSaved', listener: (result: { success: boolean; recordId: string; fields: string[] }) => void): void;
        /** The rows the tree currently shows. */
        getRecords(): ITaskGridRecord[];
        /** Every loaded record, tree filtering and paging aside. */
        getAllRecords(): ITaskGridRecord[];
        getRecordsMap(): Record<string, ITaskGridRecord>;
        getMetadata(): { PrimaryIdAttribute: string; LogicalName?: string; [key: string]: any };
        getEntityName(): string;
        /** Applies fresh raw records in place. Each one replaces that record's raw data, so merge first. */
        updateTaskData(records: Record<string, any>[]): void;
        setLoading(loading: boolean): void;
        requestRender(): void;
/** The task hierarchy the grid built from the loaded data. */
        getRecordTree(): {
            /** What the grid renders: filter, quick find and flat-list mode applied. */
            view: {
                getChildren(parentRecordId?: string | null): ITaskGridRecord[];
                hasChildren(recordId: string): boolean;
                getPosition(recordId: string): number;
                isMatching(recordId: string): boolean;
                getCount(): number;
                getOrderedIds(): string[];
                isFlat(): boolean;
            };
            /** What is actually there: every loaded record, no filtering, no scoping. */
            structure: {
                getChildren(parentRecordId?: string | null): ITaskGridRecord[];
                getParent(recordId: string): ITaskGridRecord | null;
                getAncestorIds(recordId: string): string[];
                getAncestors(recordId: string): ITaskGridRecord[];
                getDescendants(recordId: string): ITaskGridRecord[];
                hasChildren(recordId: string): boolean;
                getSiblings(recordId: string, options?: { exclude?: string }): ITaskGridRecord[];
                getNeighbours(recordId: string, options?: { exclude?: string }): { previous?: ITaskGridRecord; next?: ITaskGridRecord };
            };
        };
        [key: string]: any;
    };
    /** The runtime control. */
    getDatasetControl(): { [key: string]: any };
    /** Runs the registrator only when the column is part of the active view. Safe to call unconditionally. */
    registerExpressionDecorator(columnName: string, registrator: () => void): void;
}

/** Reaches the control that owns the grid this component renders in. */
declare const useTaskGridDatasetControl: () => {
    /** The candidate records a lookup-many cell's picker offers. Called once per cell. */
    createLookupManyDataProvider(params: { record: ITaskGridRecord; column: ITaskGridColumn }): {
        refresh(): Promise<any>;
        getRecords(): ITaskGridRecord[];
        [key: string]: any;
    };
    [key: string]: any;
};
/** The PCF context the docs provide. */

/** Reaches the provider backing the grid this component renders in. */
declare const useTaskDataProvider: () => {
    getRecords(): ITaskGridRecord[];
    getRecordsMap(): Record<string, ITaskGridRecord>;
    getSelectedRecordIds(): string[];
    clearSelectedRecordIds(): void;
    /** Saves the given records, or every dirty record when called with no argument. */
    save(records?: ITaskGridRecord[]): Promise<any[]>;
    getColumns(): ITaskGridColumn[];
    refresh(): Promise<any>;
    [key: string]: any;
};

//Material UI components available in the sandbox
declare const Chip: typeof import('@mui/material').Chip;
declare const Stack: typeof import('@mui/material').Stack;
declare const Autocomplete: typeof import('@mui/material').Autocomplete;
declare const Avatar: typeof import('@mui/material').Avatar;
declare const AvatarGroup: typeof import('@mui/material').AvatarGroup;
declare const LinearProgress: typeof import('@mui/material').LinearProgress;
declare const Rating: typeof import('@mui/material').Rating;
declare const Slider: typeof import('@mui/material').Slider;
declare const Snackbar: typeof import('@mui/material').Snackbar;
declare const Alert: typeof import('@mui/material').Alert;
declare const Button: typeof import('@mui/material').Button;
//Material icons for the commands the ribbon ships with
declare const AddIcon: typeof import('@mui/icons-material/Add').default;
declare const DoneAllIcon: typeof import('@mui/icons-material/DoneAll').default;
declare const DeleteIcon: typeof import('@mui/icons-material/Delete').default;
declare const EditIcon: typeof import('@mui/icons-material/Edit').default;
declare const PlaylistAddIcon: typeof import('@mui/icons-material/PlaylistAdd').default;
declare const SettingsIcon: typeof import('@mui/icons-material/Settings').default;
declare const ViewColumnIcon: typeof import('@mui/icons-material/ViewColumn').default;
declare const Menu: typeof import('@mui/material').Menu;
declare const Popover: typeof import('@mui/material').Popover;
declare const MenuItem: typeof import('@mui/material').MenuItem;
declare const TextField: typeof import('@mui/material').TextField;
declare const Tooltip: typeof import('@mui/material').Tooltip;
declare const Typography: typeof import('@mui/material').Typography;

//─── Modules ──────────────────────────────────────────────────────────────────

/** The fixture data this example's modules are built from. */
interface IModuleData {
    /** The personal views, as the last mount left them. */
    userQueries: any[];
    /** The templates, and the subtree each one expands into. */
    templates: any;
    /** The lookup-many candidate records, keyed by column name. */
    lookupSources: Record<string, any>;
    /** The dependencies between the fixture tasks. */
    dependencies: any[];
}

/** Where every service the grid was built with is reached: the providers, the labels, the PCF context. */
interface ITaskGridServices {
    /** @throws When nothing registered that service. */
    get(key: string): any;
    /** Undefined when the module that would register it is not registered. */
    find(key: string): any;
    register(key: string, resolve: () => any): void;
    /** Runs the callback as soon as that service exists - now, or when something registers it. */
    whenAvailable(key: string, callback: (service: any) => void): void;
}

/** What every factory the grid calls is handed. One shape, so \`services\` is always in the same place. */
interface ITaskGridFactoryParams {
    services: ITaskGridServices;
}

/** Define this to choose which modules the grid runs with. Called on every mount. */
declare type GetModules = (data: IModuleData) => {
    onGetUserQueriesModule?: (params: ITaskGridFactoryParams) => any;
    onGetTemplatesModule?: (params: ITaskGridFactoryParams) => any;
    onGetGridCustomizerModule?: (params: ITaskGridFactoryParams) => any;
    onGetLookupManyModule?: (params: ITaskGridFactoryParams) => any;
    onGetDependenciesModule?: (params: ITaskGridFactoryParams) => any;
};

/** Personal views. Bring the strategy; the module brings the commands and dialogs. */
declare const createUserQueryModule: (options: {
    strategy: any;
    services: ITaskGridServices;
    enableQueryManager?: boolean;
    enableSaveAsNewQuery?: boolean;
    enableSaveQueryChanges?: boolean;
}) => any;
/** Task templates. Bring the provider; the module brings the picker. */
declare const createTemplateModule: (options: { provider: any }) => any;
/** Direct access to AG Grid. Bring the customizer strategy. */
declare const createGridCustomizerModule: (options: { strategy: IGridCustomizerStrategy; services: ITaskGridServices }) => any;
/** Task dependencies. Bring the strategy and the services your builder was handed. */
declare const createDependenciesModule: (options: { strategy: any; services: ITaskGridServices }) => any;
/** Lookup-many pickers. Return the candidates for each column. */
declare const createLookupManyModule: (options: {
    createDataProvider: (parameters: { record: ITaskGridRecord; column: ITaskGridColumn; services: ITaskGridServices }) => any;
    services: ITaskGridServices;
}) => any;

/** The grid's services, inside a live example. */
declare const useTaskGridServices: () => ITaskGridServices;

/** Stores personal views in an array you hand it. */
declare const MemoryUserQueryStrategy: new (params: { userQueries: any[], services: ITaskGridServices }) => any;
/** Serves templates from an in-memory source, and captures new ones into it. */
declare const MemoryTemplateDataProvider: new (params: { templates: any, services: ITaskGridServices }) => any;
/** Turns records you hold into a lookup-many picker's candidate provider. */
declare const MemoryLookupManyDataProviderFactory: { create(params: { source: any, services: ITaskGridServices }): any };
/** Serves task dependencies from an array you hold. */
declare const MemoryTaskDependencyStrategy: new (params: { dependencies: any[], services: ITaskGridServices }) => any;
`.trim()
