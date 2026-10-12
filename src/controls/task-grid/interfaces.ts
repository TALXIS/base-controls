import { IColumn, IRecord } from "@talxis/client-libraries";
import { ISavedQueryStrategy } from "./providers/saved-query";
import { ITaskDataProviderStrategy } from "./providers/task";
import { ITaskGridServiceLocator } from "./services";

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

/** Feature flags that control which task operations and header UI the grid offers. */
export interface ITaskGridParameters {
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
}

/** Identifies the lookup-many cell whose candidate records are being requested. */
export interface ILookupManyDataProviderParameters {
    /** The task record the cell belongs to. Use it to scope the candidate query to the row. */
    record: IRecord;
    /** The lookup-many column definition, including its `metadata` and `controls` bindings. */
    column: IColumn;
    /** Where the task side and the other modules are reached. */
    services: ITaskGridServiceLocator;
}

/**
 * What every factory the grid calls on a descriptor receives.
 *
 * One shape for all of them, so a consumer never has to remember which callback takes the locator where.
 * A descriptor of your own may hand its builders more than this — the shipped ones add their loaded
 * context — but `services` is always there.
 */
export interface ITaskGridFactoryParams {
    /** Where every provider, module and grid service is reached. Resolve in methods, never in a constructor. */
    services: ITaskGridServiceLocator;
}

/** Where a task grid's tasks and views come from; implement it to wire the grid to your data. */
export interface ITaskGridDescriptor {
    /** Returns the mapping of logical column roles to physical schema attribute names. */
    onGetFieldMapping: () => IFieldMapping;
    /**
     * Returns the strategy responsible for loading system views. Personal views come from the
     * user-queries module instead.
     */
    onCreateSavedQueryStrategy: (params: ITaskGridFactoryParams) => ISavedQueryStrategy;
    /** Returns the strategy behind every task operation; called once per view loaded. */
    onCreateTaskStrategy: (params: ITaskGridFactoryParams) => ITaskDataProviderStrategy;
    /** Awaited once per mount, before anything else is read. Use for lazy loading or authentication. */
    onLoadDependencies?: () => Promise<void>;
    /** Returns UI feature flags. Every flag defaults to `false` when omitted. */
    onGetGridParameters?: () => ITaskGridParameters;
}
