/**
 * Ambient declarations handed to the Monaco editor of the live TaskGrid examples, on top of the Grid
 * sandbox's own. Hand-written on purpose — the same approach the Form examples take — because the
 * library's real `.d.ts` is not loaded into the editor.
 */
export const taskGridSandboxDeclarations = `
/** The task hierarchy the grid built from the loaded data. */
interface ITaskRecordTree {
    /** What the grid renders: filter, quick find and flat-list mode applied. */
    view: {
        getChildren(parentRecordId?: string | null): IRecord[];
        hasChildren(recordId: string): boolean;
        isMatching(recordId: string): boolean;
        getCount(): number;
        getOrderedIds(): string[];
        isFlat(): boolean;
    };
    /** What is actually there: every loaded record, no filtering, no scoping. */
    structure: {
        getChildren(parentRecordId?: string | null): IRecord[];
        getParent(recordId: string): IRecord | null;
        getAncestorIds(recordId: string): string[];
        getAncestors(recordId: string): IRecord[];
        getDescendants(recordId: string): IRecord[];
        hasChildren(recordId: string): boolean;
    };
}

/** The provider backing the task grid: the tasks, the hierarchy, and every task operation. */
interface ITaskDataProvider extends IDataProvider {
    /** The rows the tree currently shows. */
    getRecords(): IRecord[];
    /** Every loaded record, tree filtering aside. */
    getAllRecords(): IRecord[];
    getRecordTree(): ITaskRecordTree;
    /** Applies fresh raw records in place. Each one replaces that record's raw data, so merge first. */
    updateTaskData(records: Record<string, any>[]): void;
    createTask(parentTaskId?: string): Promise<any>;
    deleteTasks(taskIds: string[]): Promise<any>;
    isFlatListEnabled(): boolean;
    [key: string]: any;
}

/** Where everything the task grid was built with is reached. */
interface ITaskGridServiceMap {
    /** The task grid's settings, view actions and lifetime. */
    taskGrid: ITaskGridRuntime;
    /** The DatasetControl the task grid runs in. */
    datasetControl: IDatasetControlRuntime;
    /** The tasks of the view shown; every view brings its own, so reach it when used. */
    taskDataProvider: ITaskDataProvider;
    /** Which rows are expanded. */
    taskExpansion: { setExpanded(recordId: string, expanded: boolean): void; toggle(recordId: string): void; expandAll(): void; collapseAll(): void };
    /** The column roles the descriptor mapped: subject, parentId, stackRank, stateCode. */
    nativeColumns: { subject: string; parentId: string; stackRank: string; stateCode: string; path: string };
    localizationService: { getLocalizedString(key: string): string };
    userQueriesModule: { provider: any; [key: string]: any };
    templatesModule: { provider: any; [key: string]: any };
    lookupManyModule: { createDataProvider(parameters: { record: IRecord; column: IColumn; services: ITaskGridServiceLocator }): IDataProvider | undefined };
    dependenciesModule: { provider: any };
    checklistModule: { provider: any };
    [key: string]: any;
}

type ITaskGridServiceLocator = IServiceLocator<ITaskGridServiceMap>;

/** The task grid's services, settings and view actions. */
interface ITaskGridRuntime {
    readonly services: ITaskGridServiceLocator;
    readonly events: { addEventListener(event: 'onDestroyed', listener: () => void): void; removeEventListener(event: 'onDestroyed', listener: () => void): void };
    isTaskCreatingEnabled(): boolean;
    isTaskEditingEnabled(): boolean;
    isTaskDeletingEnabled(): boolean;
    isFlatListEnabled(): boolean;
    toggleFlatList(enabled: boolean): void;
    getInactiveTasksVisibility(): boolean;
    toggleHideInactiveTasks(hide: boolean): void;
    /** Loads another view, asking first when there are unsaved changes. */
    switchView(viewId: string): Promise<void>;
    /** Loads the views again, then the view shown. */
    reloadViews(): Promise<void>;
    [key: string]: any;
}

/** The task grid's services, from inside a module the grid registers. */
interface IGridServiceMap {
    taskGrid: ITaskGridServiceLocator;
}

/** What every factory a feature calls is handed. */
interface ITaskGridFactoryParams {
    services: ITaskGridServiceLocator;
}

/** A task grid feature: what it registers once per mount, and what it adds to the grid. */
interface ITaskGridFeature extends IGridModule {
    /** Registers the feature's own services, once per mount, before the first view loads. */
    onInitialize?: (services: ITaskGridServiceLocator) => void;
}

/** The grid modules that work with a task grid. */
interface ITaskGridModules {
    license?: IGridModule;
    rowSelection?: IGridModule;
    cellSelection?: IGridModule;
    editing?: IGridModule;
    sorting?: IGridModule;
    filtering?: IGridModule;
    aggregation?: IGridModule;
    clipboard?: IGridModule;
    legacyClientApiCompatibility?: IGridModule;
    /** Your own grid modules. */
    custom?: IGridModule[];
}

/** The task grid's own features; a feature is on because its key is filled. */
interface ITaskGridFeatures {
    userQueries?: ITaskGridFeature;
    templates?: ITaskGridFeature;
    customColumns?: ITaskGridFeature;
    lookupMany?: ITaskGridFeature;
    dependencies?: ITaskGridFeature;
    checklist?: ITaskGridFeature;
    gantt?: ITaskGridFeature;
    project?: ITaskGridFeature;
    /** Your own features, after the task grid's. */
    custom?: ITaskGridFeature[];
}

/** The replaceable parts of the task grid: the DatasetControl's, the grid's and the command bar. */
interface ITaskGridComponents extends IGridComponents {
    errorMessage?: Partial<IErrorMessageBarComponents>;
    skeleton?: { onRenderSkeleton?: (props: any) => JSX.Element | null };
    /** The command bar in the header; its \`items\` are the task grid's commands. */
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

type ITaskGridProps = Omit<IGrid, 'modules' | 'stateKey' | 'height' | 'labels' | 'components' | 'onError' | 'onOpenRecord' | 'onDestroyed'> & {
    descriptor: any;
    /** Grid modules; rows are selectable, and editable while the descriptor allows task editing, unless you say otherwise. */
    modules?: ITaskGridModules;
    features?: ITaskGridFeatures;
    /** The key the task grid keeps its state under, per view, in the state store. */
    stateKey?: string;
    height?: string;
    components?: Partial<ITaskGridComponents>;
    labels?: Record<string, string>;
    /** Called once, after the first view loaded. */
    onReady?: (runtime: ITaskGridRuntime) => void;
    /** Called before the task grid goes, while every provider still holds its data. */
    onDestroyed?: (runtime: ITaskGridRuntime) => void;
    [handler: string]: any;
};

/** The grid. \`descriptor\` is supplied by the sandbox. */
declare const TaskGrid: (props: ITaskGridProps) => JSX.Element;

/** The in-memory descriptor backing this example. Kept outside the snippet so edits do not reload the data. */
declare const descriptor: any;

/** What \`TaskGrid\` runs with here when a snippet passes no \`modules\` of its own. */
declare const defaultModules: ITaskGridModules;
/** What \`TaskGrid\` runs with here when a snippet passes no \`features\` of its own. */
declare const defaultFeatures: ITaskGridFeatures;

/** The fixture data this example's features are built from, read as it is when a feature is built. */
declare const data: {
    /** The personal views, as the last mount left them. */
    userQueries: any[];
    /** The templates, and the subtree each one expands into. */
    templates: any;
    /** The lookup-many candidate records, keyed by column name. */
    lookupSources: Record<string, any>;
    /** The dependencies between the fixture tasks. */
    dependencies: any[];
    /** The checklist items on the fixture tasks, keyed by task id. */
    checklist: Record<string, any[]>;
};

/** The column holding each row's add-task command and the expand-all header. */
declare const ADD_TASK_COLUMN_NAME: string;
/** The control a column names to draw its value as a progress bar. */
declare const PERCENT_COMPLETE_CONTROL_NAME: string;
/** When the task tree's column hook runs; register yours after it to have the last word. */
declare const TASK_TREE_PRIORITY: number;

/** The task grid's runtime, from anything it draws. */
declare const useTaskGridRuntime: () => ITaskGridRuntime;
/** The tasks of the view shown, from anything the task grid draws. */
declare const useTaskDataProvider: () => ITaskDataProvider;
/** The task grid's strings. */
declare const useTaskGridLabels: () => { getLocalizedString(key: string): string };

/** Personal views. Bring the strategy; the module brings the commands and dialogs. */
declare const createUserQueryModule: (options: {
    onCreateStrategy: (params: ITaskGridFactoryParams) => any;
    enableQueryManager?: boolean;
    enableSaveAsNewQuery?: boolean;
    enableSaveQueryChanges?: boolean;
}) => ITaskGridFeature;
/** Task templates. Bring the provider; the module brings the picker. */
declare const createTemplateModule: (options: { onCreateProvider: (params: ITaskGridFactoryParams) => any }) => ITaskGridFeature;
/** Task dependencies, and the predecessors and successors columns. */
declare const createDependenciesModule: (options: { onCreateStrategy: (params: ITaskGridFactoryParams) => any }) => ITaskGridFeature;
/** Task checklists, and the checklist column. */
declare const createChecklistModule: (options: { onCreateStrategy: (params: ITaskGridFactoryParams) => any }) => ITaskGridFeature;
/** Lookup-many pickers. Return the candidates for each column. */
declare const createLookupManyModule: (options: {
    createDataProvider: (parameters: { record: IRecord; column: IColumn; services: ITaskGridServiceLocator }) => IDataProvider | undefined;
}) => ITaskGridFeature;

/** Stores personal views in an array you hand it. */
declare const MemoryUserQueryStrategy: new (params: { userQueries: any[], services: ITaskGridServiceLocator }) => any;
/** Serves templates from an in-memory source, and captures new ones into it. */
declare const MemoryTemplateDataProvider: new (params: { templates: any, services: ITaskGridServiceLocator }) => any;
/** Turns records you hold into a lookup-many picker's candidate provider. */
declare const MemoryLookupManyDataProviderFactory: { create(params: { source: any, services: ITaskGridServiceLocator }): IDataProvider };
/** Serves task dependencies from an array you hold. */
declare const MemoryTaskDependencyStrategy: new (params: { dependencies: any[], services: ITaskGridServiceLocator }) => any;
/** Serves task checklists from a map you hold. */
declare const MemoryChecklistStrategy: new (params: { items: Record<string, any[]>, services: ITaskGridServiceLocator }) => any;

//Material UI components available in the sandbox, in place of Fluent's of the same name
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
declare const Menu: typeof import('@mui/material').Menu;
declare const Popover: typeof import('@mui/material').Popover;
declare const MenuItem: typeof import('@mui/material').MenuItem;
declare const TextField: typeof import('@mui/material').TextField;
declare const Tooltip: typeof import('@mui/material').Tooltip;
declare const Typography: typeof import('@mui/material').Typography;
//Material icons for the commands the ribbon ships with
declare const AddIcon: typeof import('@mui/icons-material/Add').default;
declare const DoneAllIcon: typeof import('@mui/icons-material/DoneAll').default;
declare const DeleteIcon: typeof import('@mui/icons-material/Delete').default;
declare const EditIcon: typeof import('@mui/icons-material/Edit').default;
declare const PlaylistAddIcon: typeof import('@mui/icons-material/PlaylistAdd').default;
declare const SettingsIcon: typeof import('@mui/icons-material/Settings').default;
declare const ViewColumnIcon: typeof import('@mui/icons-material/ViewColumn').default;
`.trim()
