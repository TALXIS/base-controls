import { IColumn, IDataset, IDataProvider, IRecord } from "@talxis/client-libraries";
import { IDatasetControl } from "@utils/dataset-control";
import { ICustomColumnsDataProvider } from "./modules/custom-columns/CustomColumnsDataProvider";
import { ISavedQueryDataProvider, ISavedQueryStrategy } from "./providers/saved-query";
import { ITaskDataProviderStrategy, ITaskDataProvider } from "./providers/task";
import { ITaskGridModules } from "./modules/interfaces";
import { ITaskGridLabels } from "./labels";
import { ITaskGridState } from "./TaskGridDatasetControlFactory";
import { ILocalizationService } from "@utils";
import { ITaskGridServiceLocator } from "./services";

/** What {@link TaskGridDatasetControlFactory} hands the control it builds. */
export interface ITaskGridDatasetControlParameters {
    dataset: IDataset;
    state: ITaskGridState;
    /** The feature modules, already resolved by the factory. */
    modules: ITaskGridModules;
    /** Where everything else is reached — the descriptor, the providers, the PCF context, the labels. */
    services: ITaskGridServiceLocator;
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

/** The field mapping plus the synthetic hierarchy path column the grid adds. */
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
     * Returns the strategy responsible for loading system views. Personal views come from the
     * user-queries module instead.
     */
    onCreateSavedQueryStrategy: () => ISavedQueryStrategy;
    /** Returns the strategy that handles all task CRUD, move, template and record-save operations. */
    onCreateTaskStrategy: (services: ITaskGridServiceLocator) => ITaskDataProviderStrategy;
    /** Returns the container height as a CSS string. Falls back to a default stretch when omitted. */
    onGetHeight?: () => string | undefined;
    /**
     * Returns the feature modules this grid runs with. A module is on because it is present, so omitting
     * a key leaves both the feature and its UI out.
     *
     * Called once per mount, after `onLoadDependencies`. Everything it returns is rebuilt on the next
     * mount, so nothing that must outlive a remount belongs in a module.
     *
     * ```ts
     * onGetModules: () => ({ userQueries: createUserQueryModule({ strategy }) })
     * ```
     *
     * The shipped descriptors expose this as a `modules` key of builders — see {@link IMemoryModules}
     * and {@link IDataverseModules}.
     */
    onGetModules?: (services: ITaskGridServiceLocator) => ITaskGridModules;
    /** Returns a stable DOM/control identifier. Auto-generated as a UUID when omitted. */
    onGetControlId?: () => string;
    /** Called before any data provider is created. Use for lazy loading or authentication. */
    onLoadDependencies?: () => Promise<void>;
    /** Returns UI feature flags. Every flag defaults to `false` when omitted. */
    onGetGridParameters?: () => ITaskGridParameters;
}

/** Runtime interface for the TaskGrid control returned by `TaskGridDatasetControlFactory.createInstance`. */
export interface ITaskGridDatasetControl extends IDatasetControl {
    /**
     * Creates the `IDataProvider` supplying the candidate records of a lookup-many cell — its picker's
     * options. Called once per cell, because the candidates may depend on the row.
     * @throws If no `lookupMany` module is registered, or it returned nothing for this column.
     */
    createLookupManyDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider;
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
    /**
     * The feature modules the descriptor contributed, resolved once when this control was built. A missing
     * key means that feature is off — there is no separate flag.
     *
     * Use this where the feature is optional to the caller. Where the caller only exists *because* the
     * module does, prefer {@link getModule}.
     */
    getModules: () => ITaskGridModules;
    /** Everything the grid was built with: the providers, the descriptor, the PCF context, the labels. */
    getServices: () => ITaskGridServiceLocator;
    /**
     * Returns a registered module by key, non-optional.
     * @throws If that module is not registered.
     */
    getModule: <TKey extends keyof ITaskGridModules>(key: TKey) => NonNullable<ITaskGridModules[TKey]>;
    /** Returns `true` when the user-queries module is registered. */
    isUserQueriesEnabled: () => boolean;
    /** Whether inline task creation is enabled (from `ITaskGridParameters.enableInlineCreation`). */
    isInlineCreateEnabled: () => boolean;
}