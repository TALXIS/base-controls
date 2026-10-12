import { IEventEmitter } from "@talxis/client-libraries";
import type { ITaskGridServiceLocator } from "@controls/task-grid/services";
import type { IDataProvider } from "@talxis/client-libraries";
import type { IGridModule, IGridModules } from "@controls/grid";
import type { ITaskTreeServiceMap } from "@controls/task-grid/module";
import type { ILookupManyDataProviderParameters } from "@controls/task-grid/interfaces";
import { IDeletedUserQueriesResult, ISavedQuery } from "@controls/task-grid/providers/saved-query";
import { ITaskDataProvider } from "@controls/task-grid/providers/task";
import { ITemplateDataProvider } from "@controls/task-grid/providers/template/TemplateDataProvider";
import { ICustomColumnsDataProvider } from "@controls/task-grid/modules/custom-columns/CustomColumnsDataProvider";
import type { IChecklistProvider } from "@controls/task-grid/modules/checklist/ChecklistProvider";
import type { IDependenciesProvider } from "@controls/task-grid/modules/dependencies/DependenciesProvider";
import type { ICommandBarItemProps } from "@fluentui/react";
import type { IEditColumnsComponents } from "@controls/dataset-control";
import type { IGanttServiceLocator } from "@controls/task-grid/modules/gantt/services";
import type { IProjectProvider, ProjectData } from "@controls/task-grid/modules/project";

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
    /** The column editor's pieces, with the custom-column commands wired in. */
    editColumns: IEditColumnsComponents;
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

/** What the lookup-many module contributes. Built by {@link createLookupManyModule}. */
export interface ILookupManyModule {
    /**
     * Returns the candidate records for a lookup-many cell. Called once per cell rendered, since the
     * candidates may depend on the row. Return `undefined` for a column you do not serve and the grid
     * throws when that column renders.
     */
    createDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
}

/** What the dependencies module contributes. Built by {@link createDependenciesModule}. */
export interface IDependenciesModule {
    /** The loaded dependencies, asked per task. */
    provider: IDependenciesProvider;
}

/** What the checklist module contributes. Built by {@link createChecklistModule}. */
export interface IChecklistModule {
    /** The loaded checklist items, asked per task. */
    provider: IChecklistProvider;
}

/**
 * Every component the Gantt module renders. Override any subset through
 * {@link IGanttModuleOptions.components}.
 */
export interface IGanttComponents {
    /** The whole view: the task grid beside the timeline. Replaces the plain grid. */
    onRenderView: () => JSX.Element;
    /** The timeline's zoom control, rendered in the header left of the ribbon. */
    onRenderZoomSlider: () => JSX.Element;
    /** The Gantt's part of the gear callout, rendered after the grid's own toggles. */
    onRenderSettingsSection: () => JSX.Element;
}

/** What the Gantt module contributes. Built by {@link createGanttModule}. */
export interface IGanttModule {
    /** Everything the module holds for the view shown, under its own names; every view has its own chart. */
    readonly services: IGanttServiceLocator;
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
export interface IProjectModule<TData extends ProjectData = ProjectData> {
    /** The project the tasks belong to, and the dates it spans. */
    provider: IProjectProvider<TData>;
}

/** A task grid feature: what it registers once per mount, and what it adds to the grid. */
export interface ITaskGridFeature extends IGridModule<ITaskTreeServiceMap> {
    /** Registers the feature's own services, once per mount, before the first view loads. */
    onInitialize?(services: ITaskGridServiceLocator): void;
}

/** The grid modules that work with a task grid; the row model and grouping are the task tree's own. */
export type ITaskGridModules = Pick<IGridModules, 'license' | 'rowSelection' | 'cellSelection' | 'editing' | 'sorting' | 'filtering' | 'aggregation' | 'clipboard' | 'legacyClientApiCompatibility' | 'custom'>;

/** The task grid's own features; a feature is on because its key is filled. */
export interface ITaskGridFeatures {
    /** Personal views: *My views*, the save commands and the view manager. */
    userQueries?: ITaskGridFeature;
    /** Task templates: capturing one from a task, and expanding one into tasks. */
    templates?: ITaskGridFeature;
    /** User-defined (dynamic) columns: creating, editing, deleting, and their values. */
    customColumns?: ITaskGridFeature;
    /** The picker of lookup-many (multi-value) columns. */
    lookupMany?: ITaskGridFeature;
    /** Task dependencies: what each task waits on, and what waits on it. */
    dependencies?: ITaskGridFeature;
    /** Task checklists: the items on each task, and whether they are done. */
    checklist?: ITaskGridFeature;
    /** The Gantt: a timeline beside the grid, with its own zoom, weekends and per-view state. */
    gantt?: ITaskGridFeature;
    /** The project the tasks belong to. Read by the Gantt's project markers. */
    project?: ITaskGridFeature;
    /** The caller's own features, after the task grid's. */
    custom?: ITaskGridFeature[];
}
