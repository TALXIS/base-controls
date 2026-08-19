import { IColumn, IDataset, IDataProvider, IRecord } from "@talxis/client-libraries";
import { IDatasetControl } from "@utils/dataset-control";
import { IGridCustomizerStrategy } from "./components/grid/grid-customizer";
import { ICustomColumnsDataProvider, ICustomColumnsStrategy } from "./providers/custom-columns/CustomColumnsDataProvider";
import { ISavedQueryDataProvider, ISavedQueryStrategy, IUserQueryStrategy } from "./providers/saved-query";
import { ITaskDataProviderStrategy, ITaskDataProvider } from "./providers/task";
import { ITemplateDataProvider } from "./providers/template";
import { ITaskGridLabels } from "./labels";
import { ITaskGridState } from "./TaskGridDatasetControlFactory";
import { ILocalizationService } from "@utils";

export interface ITaskGridDatasetControlParameters {
    dataset: IDataset;
    state: ITaskGridState;
    savedQueryDataProvider: ISavedQueryDataProvider;
    taskGridDescriptor: ITaskGridDescriptor;
    localizationService: ILocalizationService<ITaskGridLabels>;
    templateDataProvider?: ITemplateDataProvider;
    customColumnsDataProvider?: ICustomColumnsDataProvider;
    onGetPcfContext: () => ComponentFramework.Context<any>;
}

/** Maps functional column roles to the physical attribute (field) names in the consuming entity's schema. */
export interface IFieldMapping {
    /** Lookup attribute pointing to the parent task — drives the tree hierarchy. */
    parentId: string;
    /** Display name / title attribute. Always pinned left; never hidden by the control. */
    subject: string;
    /** Numeric ordering attribute. Used for default sort and drag-and-drop reordering. */
    stackRank: string;
    /** Active/inactive status attribute. Used by the "Hide inactive tasks" filter. */
    stateCode: string;
}

export interface INativeColumns extends IFieldMapping {
    path: string;
}

/** Feature flags that control which UI elements are rendered in the grid header and ribbon. */
export interface ITaskGridParameters {
    agGridLicenseKey?: string;
    /** Show drag handles and allow rows to be dragged for reordering. Defaults to `false`. Automatically suppressed when flat-list mode is active or sorting by a non-stack-rank column. */
    enableRowDragging?: boolean;
    /** Show the *Edit Columns* button in the ribbon. Defaults to `false`. */
    enableEditColumns?: boolean;
    /** Enable editing of tasks directly in the grid. Defaults to `false`. */
    enableTaskEditing?: boolean;
    /** Enable creation of new tasks. Defaults to `false`. */
    enableTaskCreation?: boolean;
    /** Enable deletion of tasks. Defaults to `false`. */
    enableTaskDeletion?: boolean;
    /** Show the search / quick-find input. Defaults to `false`. */
    enableQuickFind?: boolean;
    /** Show the view-switcher dropdown. Defaults to `false`. */
    enableViewSwitcher?: boolean;
    /** Show the *Show hierarchy* toggle. Defaults to `false`. */
    enableShowHierarchyToggle?: boolean;
    /** Show the *Hide inactive tasks* toggle. Defaults to `false`. */
    enableHideInactiveTasksToggle?: boolean;
    /** Show the personal/system scope selector inside the Edit Columns panel. Defaults to `false`. */
    enableEditColumnsScopeSelector?: boolean;
    /** Show the query manager. Defaults to `false`. Only effective when the user-queries feature is on — the getter ANDs the two. */
    enableQueryManager?: boolean;
    /** Show the "Save as new" button in the query manager. Defaults to `false`. Only effective when the user-queries feature is on. */
    enableSaveAsNewQuery?: boolean;
    /** Show the "Save changes" button in the query manager. Defaults to `false`. Only effective when the user-queries feature is on. */
    enableSaveQueryChanges?: boolean;
    /** Enable creation of custom columns. Defaults to `false`. Only effective when a custom-columns strategy was supplied. */
    enableCustomColumnCreation?: boolean;
    /** Enable editing of custom columns. Defaults to `false`. Only effective when a custom-columns strategy was supplied. */
    enableCustomColumnEditing?: boolean;
    /** Enable deletion of custom columns. Defaults to `false`. Only effective when a custom-columns strategy was supplied. */
    enableCustomColumnDeletion?: boolean;
    /** Enable inline creation of tasks. Defaults to `false`. */
    enableInlineCreation?: boolean;
    /** Enable navigation within the grid. Defaults to `false`. */
    enableNavigation?: boolean;
    /** Enable column sorting in the grid. Defaults to `false`. */
    enableSorting?: boolean;
    /** Enable column filtering in the grid. Defaults to `false`. */
    enableFiltering?: boolean;
    /** Override the default row height in pixels. Uses the AG Grid default when omitted. */
    rowHeight?: number;
}

/** Available data providers injected into `ITaskDataProviderStrategy` at construction time. */
export interface ITaskStrategyDeps {
    enableInlineCreation: boolean;
    enableTaskEditing: boolean;
    /** The system and user views the grid loaded — their columns are the strategy's column catalogue. */
    savedQueryDataProvider: ISavedQueryDataProvider;
    /** Present when the consumer provided `onCreateCustomColumnsStrategy`. */
    customColumnsDataProvider?: ICustomColumnsDataProvider;
    /** Present when the consumer provided `onCreateTemplateDataProvider`. */
    templateDataProvider?: ITemplateDataProvider;
}

/** Identifies the lookup-many cell whose candidate records are being requested. */
export interface ILookupManyDataProviderParameters {
    /** The task record the cell belongs to. Use it to scope the candidate query to the row. */
    record: IRecord;
    /** The lookup-many column definition, including its `metadata` and `controls` bindings. */
    column: IColumn;
}

/**
 * Primary configuration entry point for `TaskGridDatasetControlFactory`.
 * Implement this interface to wire the TaskGrid to your business logic.
 */
export interface ITaskGridDescriptor {
    /** Returns the mapping of logical column roles to physical schema attribute names. */
    onGetFieldMapping: () => IFieldMapping;
    /**
     * Returns the strategy responsible for loading system views. Personal views are optional and come
     * from its `onCreateUserQueryStrategy`, which also supplies the dialog's data provider — omit that
     * and the user-queries feature is off.
     */
    onCreateSavedQueryStrategy: () => ISavedQueryStrategy;
    /** Returns the strategy that handles all task CRUD, move, template and record-save operations. */
    onCreateTaskStrategy: (deps: ITaskStrategyDeps) => ITaskDataProviderStrategy;
    /** (Optional) Returns the container height as a CSS string. Falls back to a default stretch when omitted. */
    onGetHeight?: () => string | undefined;
    /**
     * (Optional) Returns the personal-views implementation. When it returns a strategy, the
     * user-queries feature is enabled: *My views*, the save commands and the view manager appear.
     *
     * Called alongside `onCreateSavedQueryStrategy`, when the grid builds its saved-query provider.
     */
    onCreateUserQueryStrategy?: () => IUserQueryStrategy | undefined;
    /** (Optional) Returns the strategy for managing dynamic (user-defined) columns. When provided, the custom-columns feature is enabled. */
    onCreateCustomColumnsStrategy?: () => ICustomColumnsStrategy | undefined;
    /** (Optional) Returns an `ITemplateDataProvider` for task templates. When provided, the template-based task creation feature is enabled. */
    onCreateTemplateDataProvider?: () => ITemplateDataProvider | undefined;
    /**
     * (Optional) Returns the `IDataProvider` supplying candidate records for a lookup-many column —
     * the picker's options. Needed only when columns carry `metadata.LookupMany`. Omit it, or return
     * `undefined` for a column you do not serve, and the grid throws when that column is rendered.
     *
     * Unlike the other factories here, this is called **once per lookup-many cell** rather than once
     * per control, because the candidate query may depend on the row (e.g. a FetchXML template
     * referencing the current task). Keep it cheap and side-effect free.
     */
    onCreateLookupManyDataProvider?: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
    /** (Optional) Returns a strategy for deep customization of AG Grid column definitions, renderers, editors, and row class rules. */
    onCreateGridCustomizerStrategy?: () => IGridCustomizerStrategy | undefined;
    /** (Optional) Returns a stable DOM/control identifier. Auto-generated as a UUID when omitted. */
    onGetControlId?: () => string;
    /** (Optional) Async hook called before any data provider is created. Use for lazy loading or authentication. */
    onLoadDependencies?: () => Promise<void>;
    /** (Optional) Returns UI feature flags. Every flag defaults to `false` when omitted. */
    onGetGridParameters?: () => ITaskGridParameters;
}

/** Runtime interface for the TaskGrid control returned by `TaskGridDatasetControlFactory.createInstance`. */
export interface ITaskGridDatasetControl extends IDatasetControl {
    /**
     * Returns the template `ITemplateDataProvider`.
     * @throws If templating was not enabled (no `onCreateTemplateDataProvider` in the descriptor).
     */
    getTemplateDataProvider: () => ITemplateDataProvider;
    /** Returns the saved-query data provider managing system and user views. */
    getSavedQueryDataProvider: () => ISavedQueryDataProvider;
    /**
     * Returns the custom-columns data provider.
     * @throws If custom columns were not enabled (no `onCreateCustomColumnsStrategy` in the descriptor).
     */
    getCustomColumnsDataProvider: () => ICustomColumnsDataProvider;
    /**
     * Creates the `IDataProvider` supplying the candidate records of a lookup-many cell — its picker's
     * options. Called once per cell, because the candidates may depend on the row.
     * @throws If the descriptor does not implement `onCreateLookupManyDataProvider`, or returned nothing for this column.
     */
    createLookupManyDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider;
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
    /** Returns `true` when inline creation of tasks is enabled. */
    isTaskCreatingEnabled: () => boolean;
    /** Returns `true` when inline editing of tasks is enabled. */
    isTaskEditingEnabled: () => boolean;
    /** Returns `true` when task deletion is enabled. */
    isTaskDeletingEnabled: () => boolean;
    /** Whether the view-switcher dropdown is visible (from `ITaskGridParameters.enableViewSwitcher`). */
    isViewSwitcherEnabled: () => boolean;
    /** Whether grid navigation is enabled (from `ITaskGridParameters.enableNavigation`). */
    isNavigationEnabled: () => boolean;
    /** Returns `true` when a custom columns strategy was supplied through the descriptor. */
    isCustomColumnsEnabled: () => boolean;
    /** Whether the view manager is enabled: user queries are on **and** `ITaskGridParameters.enableQueryManager`. */
    isViewManagerEnabled: () => boolean;
    /** Whether the "Save as new" button is enabled: user queries are on **and** `ITaskGridParameters.enableSaveAsNewQuery`. */
    isSaveQueryAsNewEnabled: () => boolean;
    /** Whether the "Save changes" button is enabled: user queries are on **and** `ITaskGridParameters.enableSaveQueryChanges`. */
    isSaveQueryChangesEnabled: () => boolean;
    /** Whether custom column creation is enabled: a custom-columns strategy was supplied **and** `ITaskGridParameters.enableCustomColumnCreation`. */
    isCustomColumnCreationEnabled: () => boolean;
    /** Whether custom column editing is enabled: a custom-columns strategy was supplied **and** `ITaskGridParameters.enableCustomColumnEditing`. */
    isCustomColumnEditingEnabled: () => boolean;
    /** Whether custom column deletion is enabled: a custom-columns strategy was supplied **and** `ITaskGridParameters.enableCustomColumnDeletion`. */
    isCustomColumnDeletionEnabled: () => boolean;
    /** Returns `true` when the saved-query strategy supplied a user-query strategy through `onCreateUserQueryStrategy`. */
    isUserQueriesEnabled: () => boolean;
    /** Whether inline task creation is enabled (from `ITaskGridParameters.enableInlineCreation`). */
    isInlineCreateEnabled: () => boolean;
}