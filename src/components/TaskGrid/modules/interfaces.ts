import { IEventEmitter } from "@talxis/client-libraries";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import type { IDataProvider } from "@talxis/client-libraries";
import type { ILookupManyDataProviderParameters } from "@components/TaskGrid/interfaces";
import { IDeletedUserQueriesResult, ISavedQuery } from "@components/TaskGrid/providers/saved-query";
import { ITaskDataProvider } from "@components/TaskGrid/providers/task";
import { ITemplateDataProvider } from "@components/TaskGrid/providers/template/TemplateDataProvider";
import { ICustomColumnsDataProvider } from "@components/TaskGrid/modules/custom-columns/CustomColumnsDataProvider";
import type { IChecklistProvider } from "@components/TaskGrid/modules/checklist/ChecklistProvider";
import type { IChecklistCellRendererProps } from "@components/TaskGrid/modules/checklist/cell-renderer/ChecklistCellRenderer";
import type { IDependenciesProvider } from "@components/TaskGrid/modules/dependencies/DependenciesProvider";
import type { IDependenciesCellRendererProps } from "@components/TaskGrid/modules/dependencies/cell-renderer/DependenciesCellRenderer";
import type { IEditColumnsProps } from "@components/DatasetControl/EditColumns/EditColumns";
import type { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid/grid-customizer/GridCustomizer";
import type { ICellProps } from "@components/Grid/cells/cell/Cell";
import type { ICommandBarItemProps } from "@legacy";
import type { IGanttServiceLocator } from "@components/TaskGrid/modules/gantt/services";
import type { IGanttMarkerProps, IGanttTaskTooltipProps } from "@components/TaskGrid/modules/gantt/gantt-timeline/context";
import type { IGanttViewProps } from "@components/TaskGrid/modules/gantt/gantt-view/GanttView";
import type { IProjectProvider } from "@components/TaskGrid/modules/project";

/** Lifecycle events for the personal-views operations. */
export interface IUserQueryDataProviderEvents {
    onBeforeUserQueryCreated: (queryName: string) => void;
    onAfterUserQueryCreated: (result: string | null) => void;
    onBeforeUserQueryUpdated: (queryId: string) => void;
    onAfterUserQueryUpdated: (result: string | null) => void;
    onBeforeUserQueriesDeleted: (queryIds: string[]) => void;
    onAfterUserQueriesDeleted: (result: IDeletedUserQueriesResult) => void;
    onError: (error: any, message: string) => void;
}

/** Parameters for {@link IUserQueryDataProvider.create}. */
export interface ICreateUserQueryParams {
    name: string;
    description?: string;
    /** The view being saved from — the new one inherits its metadata. */
    currentQuery: ISavedQuery;
    /** The grid whose current columns, filters and sorting are captured into the new view. */
    provider: ITaskDataProvider;
}

/**
 * An `IUserQueryStrategy` wrapped with everything the grid needs around it: the lifecycle events, error
 * handling, the cached list, and the capture of the grid's state into a view.
 */
export interface IUserQueryDataProvider {
    /** Lifecycle events. */
    events: IEventEmitter<IUserQueryDataProviderEvents>;
    /** The views loaded by the last `refresh`, minus any deleted since. */
    getQueries: () => ISavedQuery[];
    /** Whether an id is one of the user's own views, as opposed to a system one. */
    isUserQuery: (queryId: string) => boolean;
    /** Loads the views from the strategy and returns them. */
    refresh: () => Promise<ISavedQuery[]>;
    /** @returns The new view's id, or `null` if the user cancelled. */
    create: (params: ICreateUserQueryParams) => Promise<string | null>;
    /** Persists a view exactly as given — the view manager's inline name and description edits. */
    update: (query: ISavedQuery) => Promise<string | null>;
    /** Captures the grid's current columns, filters and sorting into an existing view. */
    updateFromGridState: (currentQuery: ISavedQuery, provider: ITaskDataProvider) => Promise<string | null>;
    /** Deletes views. Returns a per-view success/failure result. */
    delete: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>;
    /** Releases the event listeners. */
    destroy: () => void;
}

/** Props every user-queries dialog receives. */
export interface IUserQueryDialogProps {
    onDismiss: () => void;
}

/**
 * Every component the personal-views UI renders. Override either through
 * {@link IUserQueryModuleOptions.components}.
 */
export interface IUserQueryComponents {
    /** The *Manage views* dialog. */
    onRenderViewManager: (props: IUserQueryDialogProps) => JSX.Element;
    /** The *Save as new view* dialog. */
    onRenderCreateView: (props: IUserQueryDialogProps) => JSX.Element;
}

/**
 * What the user-queries module contributes: the personal-views implementation, the UI that drives it, and
 * which of the view commands are offered. Built by {@link createUserQueryModule}.
 */
export interface IUserQueryModule {
    /** The personal-views implementation. */
    provider: IUserQueryDataProvider;
    /** The module's UI. */
    components: IUserQueryComponents;
    /** Show *Manage views*. Defaults to `false`. */
    enableQueryManager?: boolean;
    /** Show *Save as new view*. Defaults to `false`. */
    enableSaveAsNewQuery?: boolean;
    /** Show *Save changes to current view*. Defaults to `false`. */
    enableSaveQueryChanges?: boolean;
}

/** Props the template picker receives. */
export interface ITemplateSelectorProps {
    /** Called with the chosen template's id. */
    onTemplateSelected: (templateId: string) => void;
}

/** Every component the templating UI renders. Override it through {@link ITemplateModuleOptions.components}. */
export interface ITemplateComponents {
    /** The template picker, rendered inside the *New* and per-row add-task submenus. */
    onRenderTemplateSelector: (props: ITemplateSelectorProps) => JSX.Element;
}

/** What the templates module contributes. Built by {@link createTemplateModule}. */
export interface ITemplateModule {
    /** Where templates are read from and captured to. Also the picker's data source. */
    provider: ITemplateDataProvider;
    /** The module's UI. */
    components: ITemplateComponents;
}

/**
 * Every component the custom-columns UI renders. Override it through
 * {@link ICustomColumnsModuleOptions.components}.
 */
export interface ICustomColumnsComponents {
    /** The Edit Columns panel, with the custom-column commands wired in. */
    onRenderEditColumns: (props: IEditColumnsProps) => JSX.Element;
}

/** What the custom-columns module contributes. Built by {@link createCustomColumnsModule}. */
export interface ICustomColumnsModule {
    /** The custom-columns implementation — where column definitions and values are stored. */
    provider: ICustomColumnsDataProvider;
    /** The module's UI. */
    components: ICustomColumnsComponents;
    /** Show the "Create Custom Column" command. Defaults to `false`. */
    enableCustomColumnCreation?: boolean;
    /** Show the per-column edit command. Defaults to `false`. */
    enableCustomColumnEditing?: boolean;
    /** Show the per-column delete command. Defaults to `false`. */
    enableCustomColumnDeletion?: boolean;
}

/** What the grid-customizer module contributes. Built by {@link createGridCustomizerModule}. */
export interface IGridCustomizerModule {
    /** Hooks into the grid's column definitions and row class rules. */
    strategy: IGridCustomizerStrategy;
}

/**
 * Every component the lookup-many module renders. Override it through
 * {@link ILookupManyModuleOptions.components}.
 *
 * Named for the module to leave `ILookupManyComponents` to the picker itself, whose members are its
 * react-select slots.
 */
export interface ILookupManyModuleComponents {
    /** The cell of any column carrying `metadata.LookupMany`. */
    onRenderCell: (props: ICellProps) => JSX.Element;
}

/** What the lookup-many module contributes. Built by {@link createLookupManyModule}. */
export interface ILookupManyModule {
    /**
     * Returns the candidate records for a lookup-many cell. Called once per cell rendered, since the
     * candidates may depend on the row. Return `undefined` for a column you do not serve and the grid
     * throws when that column renders.
     */
    createDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
    /** What the grid passes to `createDataProvider` alongside the cell's record and column. */
    services: ITaskGridServiceLocator;
    /** The module's UI. */
    components: ILookupManyModuleComponents;
}

/**
 * Every component the dependencies module renders. Override it through
 * {@link IDependenciesModuleOptions.components}.
 */
export interface IDependenciesComponents {
    /**
     * The cell of the grid's predecessors and successors columns. One member for both: `props.direction`
     * says which side the column shows.
     */
    onRenderCell: (props: IDependenciesCellRendererProps) => JSX.Element;
}

/** What the dependencies module contributes. Built by {@link createDependenciesModule}. */
export interface IDependenciesModule {
    /** The loaded dependencies, asked per task. */
    provider: IDependenciesProvider;
    /** The module's UI. */
    components: IDependenciesComponents;
}

/**
 * Every component the checklist module renders. Override it through
 * {@link IChecklistModuleOptions.components}.
 */
export interface IChecklistComponents {
    /** The cell of the grid's checklist column. */
    onRenderCell: (props: IChecklistCellRendererProps) => JSX.Element;
}

/** What the checklist module contributes. Built by {@link createChecklistModule}. */
export interface IChecklistModule {
    /** The loaded checklist items, asked per task. */
    provider: IChecklistProvider;
    /** The module's UI. */
    components: IChecklistComponents;
}

/**
 * Every component the Gantt module renders. Override any subset through
 * {@link IGanttModuleOptions.components}.
 */
export interface IGanttComponents {
    /** The whole view: the task grid beside the timeline. Replaces the plain grid. */
    onRenderView: (props: IGanttViewProps) => JSX.Element;
    /** The timeline's zoom control, rendered in the header left of the ribbon. */
    onRenderZoomSlider: () => JSX.Element;
    /** The Gantt's part of the gear callout, rendered after the grid's own toggles. */
    onRenderSettingsSection: () => JSX.Element;
    /** The callout shown while hovering a task bar. */
    onRenderTaskTooltip: (props: IGanttTaskTooltipProps) => JSX.Element;
    /** One timeline marker — today, a project boundary, a milestone, or one of your own. */
    onRenderMarker: (props: IGanttMarkerProps) => JSX.Element;
}

/** What the Gantt module contributes. Built by {@link createGanttModule}. */
export interface IGanttModule {
    /**
     * Everything the module holds, under its own names: its `provider`, `components`, `fieldMapping` and
     * `labels`. Built over the grid's locator, so it answers for the grid's services too.
     */
    services: IGanttServiceLocator;
    /**
     * The timeline's own ribbon commands — *Zoom to fit* and *Go to today*. The header appends them to
     * the grid's.
     *
     * Wired by `createGanttModule` rather than taken from it: the commands are what the module is for,
     * not something to configure. The ribbon itself stays one component, replaceable through
     * {@link ITaskGridComponents.onRenderCommandBar}.
     */
    onGetCommandBarItems: () => ICommandBarItemProps[];
}

/** What the project module contributes. Built by {@link createProjectModule}. */
export interface IProjectModule {
    /** The project the tasks belong to, and the dates it spans. */
    provider: IProjectProvider;
}

/**
 * The modules a grid runs with, one optional key per available feature. A key is filled by calling that
 * module's `create*Module` builder; omit it and neither the feature nor its UI exists.
 */
export interface ITaskGridModules {
    /** Personal views: *My views*, the save commands and the view manager. */
    userQueries?: IUserQueryModule;
    /** Task templates: capturing one from a task, and expanding one into tasks. */
    templates?: ITemplateModule;
    /** User-defined (dynamic) columns: creating, editing, deleting, and their values. */
    customColumns?: ICustomColumnsModule;
    /** Deep customization of the grid's own AG Grid instance: column definitions, row class rules, one-time init. */
    gridCustomizer?: IGridCustomizerModule;
    /** Candidate records for lookup-many (multi-value picker) columns. */
    lookupMany?: ILookupManyModule;
    /** Task dependencies: what each task waits on, and what waits on it. */
    dependencies?: IDependenciesModule;
    /** Task checklists: the items on each task, and whether they are done. */
    checklist?: IChecklistModule;
    /** The Gantt: a timeline beside the grid, with its own zoom, weekends and per-view state. */
    gantt?: IGanttModule;
    /** The project the tasks belong to. Read by the Gantt's project markers. */
    project?: IProjectModule;
}
