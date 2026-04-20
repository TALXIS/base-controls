import { IDataset, IDataProvider } from "@talxis/client-libraries";
import { IDatasetControl } from "../../utils/dataset-control";
import { IGridCustomizerStrategy } from "./components/grid/grid-customizer";
import { ICustomColumnsDataProvider, ICustomColumnsStrategy } from "./data-providers/custom-columns-data-provider/CustomColumnsDataProvider";
import { ISavedQueryDataProvider, ISavedQueryStrategy } from "./data-providers/saved-query-data-provider";
import { ITaskDataProviderStrategy, ITaskDataProvider } from "./data-providers/task-data-provider";
import { ILocalizationService, ITaskGridLabels } from "./labels";
import { ITaskGridState } from "./TaskGridDatasetControlFactory";

export interface ITaskGridDatasetControlParameters {
    dataset: IDataset;
    state: ITaskGridState;
    savedQueryDataProvider: ISavedQueryDataProvider;
    taskGridDescriptor: ITaskGridDescriptor;
    localizationService: ILocalizationService<ITaskGridLabels>;
    templateDataProvider?: IDataProvider;
    customColumnsDataProvider?: ICustomColumnsDataProvider;
    onGetPcfContext: () => ComponentFramework.Context<any>;
}

/** Maps functional column roles to the physical attribute (field) names in the consuming entity's schema. */
export interface INativeColumns {
    /** Lookup attribute pointing to the parent task — drives the tree hierarchy. */
    parentId: string;
    /** Display name / title attribute. Always pinned left; never hidden by the control. */
    subject: string;
    /** Numeric ordering attribute. Used for default sort and drag-and-drop reordering. */
    stackRank: string;
    /** Active/inactive status attribute. Used by the "Hide inactive tasks" filter. */
    stateCode: string;
    /** Virtual breadcrumb column. Its value is computed automatically from ancestor names and is never editable. */
    path: string;
    /** (Optional) Numeric completion percentage. When present, rendered with a progress-bar cell renderer. */
    percentComplete?: string;
}

/** Feature flags that control which UI elements are rendered in the grid header and ribbon. */
export interface ITaskGridParameters {
    /** Explicit CSS height for the grid container. When omitted the grid sizes to fit its parent. */
    height?: string;
    /** Show drag handles and allow rows to be dragged for reordering. Defaults to `true`. Automatically suppressed when flat-list mode is active or sorting by a non-stack-rank column. */
    enableRowDragging?: boolean;
    /** Show the *Edit Columns* button in the ribbon. Defaults to `true`. */
    enableEditColumns?: boolean;
    /** Show the search / quick-find input. Defaults to `true`. */
    enableQuickFind?: boolean;
    /** Show the view-switcher dropdown. Defaults to `true`. */
    enableViewSwitcher?: boolean;
    /** Show the *Show hierarchy* toggle. Defaults to `true`. */
    enableShowHierarchyToggle?: boolean;
    /** Show the *Hide inactive tasks* toggle. Defaults to `true`. */
    enableHideInactiveTasksToggle?: boolean;
    /** Show the personal/system scope selector inside the Edit Columns panel. Defaults to `true`. */
    enableEditColumnsScopeSelector?: boolean;
    /** Enable user queries. Defaults to `true`. */
    enableUserQueries?: boolean;
    /** Show the query manager. Defaults to `true`. */
    enableQueryManager?: boolean;
    /** Show the "Save as new" button in the query manager. Defaults to `true`. */
    enableSaveAsNewQuery?: boolean;
    /** Show the "Save changes" button in the query manager. Defaults to `true`. */
    enableSaveChangesToQuery?: boolean;
    enableCustomColumnCreation?: boolean;
    enableCustomColumnEditing?: boolean;
    enableCustomColumnDeletion?: boolean;
}

/** Available data providers injected into `ITaskDataProviderStrategy` at construction time. */
export interface ITaskStrategyDeps {
    /** Present when the consumer provided `onCreateCustomColumnsStrategy`. */
    customColumnsDataProvider?: ICustomColumnsDataProvider;
    /** Present when the consumer provided `onCreateTemplateDataProvider`. */
    templateDataProvider?: IDataProvider;
}

/**
 * Primary configuration entry point for `TaskGridDatasetControlFactory`.
 * Implement this interface to wire the TaskGrid to your business logic.
 */
export interface ITaskGridDescriptor {
    /** Returns the mapping of logical column roles to physical schema attribute names. */
    onGetNativeColumns: () => INativeColumns;
    /** Returns the strategy responsible for loading system/user views and persisting view changes. */
    onCreateSavedQueryStrategy: () => ISavedQueryStrategy;
    /** Returns the strategy that handles all task CRUD, move, template and record-save operations. */
    onCreateTaskStrategy: (deps: ITaskStrategyDeps) => ITaskDataProviderStrategy;
    /** Returns an `IDataProvider` that drives the user-query creation/update dialog. */
    onCreateUserQueryDataProvider: () => IDataProvider;
    /** (Optional) Returns the strategy for managing dynamic (user-defined) columns. When provided, the custom-columns feature is enabled. */
    onCreateCustomColumnsStrategy?: () => ICustomColumnsStrategy | undefined;
    /** (Optional) Returns an `IDataProvider` for task templates. When provided, the template-based task creation feature is enabled. */
    onCreateTemplateDataProvider?: () => IDataProvider | undefined;
    /** (Optional) Returns a strategy for deep customization of AG Grid column definitions, renderers, editors, and row class rules. */
    onCreateGridCustomizerStrategy?: () => IGridCustomizerStrategy | undefined;
    /** (Optional) Returns the AG Grid Enterprise license key. */
    onGetAgGridLicenseKey?: () => string;
    /** (Optional) Returns a stable DOM/control identifier. Auto-generated as a UUID when omitted. */
    onGetControlId?: () => string;
    /** (Optional) Async hook called before any data provider is created. Use for lazy loading or authentication. */
    onLoadDependencies?: () => Promise<void>;
    /** (Optional) Returns UI feature flags. All flags default to `true` when omitted. */
    onGetGridParameters?: () => ITaskGridParameters;
}

/** Runtime interface for the TaskGrid control returned by `TaskGridDatasetControlFactory.createInstance`. */
export interface ITaskGridDatasetControl extends IDatasetControl {
    /**
     * Returns the template `IDataProvider`.
     * @throws If templating was not enabled (no `onCreateTemplateDataProvider` in the descriptor).
     */
    getTemplateDataProvider: () => IDataProvider;
    /** Returns the saved-query data provider managing system and user views. */
    getSavedQueryDataProvider: () => ISavedQueryDataProvider;
    /**
     * Returns the custom-columns data provider.
     * @throws If custom columns were not enabled (no `onCreateCustomColumnsStrategy` in the descriptor).
     */
    getCustomColumnsDataProvider: () => ICustomColumnsDataProvider;
    /** Creates a fresh `IDataProvider` for the user-query creation/update dialog. */
    createUserQueryDataProvider: () => IDataProvider;
    /** Returns the native column name mapping supplied by the descriptor. */
    getNativeColumns: () => INativeColumns;
    /** Returns the underlying `ITaskDataProvider` that backs the AG Grid data layer. */
    getDataProvider: () => ITaskDataProvider;
    /** Returns the localization service used to resolve all UI label strings. */
    getLocalizationService: () => ILocalizationService<ITaskGridLabels>;
    /** Returns `true` when inactive tasks (stateCode = 1) are currently visible in the grid. */
    getInactiveTasksVisibility: () => boolean;
    /** Switches between hierarchical (tree) and flat-list view modes. Triggers a column re-sort. */
    toggleFlatList: (enabled: boolean) => void;
    /** Adds or removes the `stateCode = 0` filter to show/hide inactive tasks. */
    toggleHideInactiveTasks: (hide: boolean) => void;
    /**
     * Switches the active saved view and triggers a full control remount so the new view's
     * columns, filters, and sorting are applied from a clean state.
     */
    changeSavedQuery: (queryId: string) => void;
    /** Returns the stable control identifier string. */
    getControlId: () => string;
    /** Whether row drag-and-drop reordering is enabled (from `ITaskGridParameters.enableRowDragging`). */
    isRowDraggingEnabled: () => boolean;
    /** Whether the *Show hierarchy* toggle is visible (from `ITaskGridParameters.enableShowHierarchyToggle`). */
    isShowHierarchyToggleVisible: () => boolean;
    /** Whether the *Hide inactive tasks* toggle is visible (from `ITaskGridParameters.enableHideInactiveTasksToggle`). */
    isHideInactiveTasksToggleVisible: () => boolean;
    /** Whether the scope selector is shown inside the Edit Columns panel (from `ITaskGridParameters.enableEditColumnsScopeSelector`). */
    isEditColumnsScopeSelectorEnabled: () => boolean;
    /** Returns `true` when a template data provider was supplied through the descriptor. */
    isTemplatingEnabled: () => boolean;
    /** Returns `true` when a custom columns strategy was supplied through the descriptor. */
    isCustomColumnsEnabled: () => boolean;
    /** Whether the view manager is enabled (from `ITaskGridParameters.enableQueryManager`). */
    isViewManagerEnabled: () => boolean;
    /** Whether the "Save as new" button is enabled (from `ITaskGridParameters.enableSaveAsNewQuery`). */
    isSaveQueryAsNewEnabled: () => boolean;
    /** Whether the "Save changes" button is enabled (from `ITaskGridParameters.enableSaveChangesToQuery`). */
    isSaveQueryChangesEnabled: () => boolean;
    /** Whether custom column creation is enabled (from `ITaskGridParameters.enableCustomColumnCreation`). */
    isCustomColumnCreationEnabled: () => boolean;
    /** Whether custom column editing is enabled (from `ITaskGridParameters.enableCustomColumnEditing`). */
    isCustomColumnEditingEnabled: () => boolean;
    /** Whether custom column deletion is enabled (from `ITaskGridParameters.enableCustomColumnDeletion`). */   
    isCustomColumnDeletionEnabled: () => boolean;
    /** Whether user queries are enabled (from `ITaskGridParameters.enableUserQueries`). */
    isUserQueriesFeatureEnabled: () => boolean;
}