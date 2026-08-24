import { IEventEmitter } from "@talxis/client-libraries";
import type { IDataProvider } from "@talxis/client-libraries";
import type { ILookupManyDataProviderParameters } from "@components/TaskGrid/interfaces";
import { IDeletedUserQueriesResult, ISavedQuery } from "@components/TaskGrid/providers/saved-query";
import { ITaskDataProvider } from "@components/TaskGrid/providers/task";
import { ITemplateDataProvider } from "@components/TaskGrid/providers/template/TemplateDataProvider";
import { ICustomColumnsDataProvider } from "@components/TaskGrid/modules/custom-columns/CustomColumnsDataProvider";
import type { IEditColumnsProps } from "@components/DatasetControl/EditColumns/EditColumns";
import type { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid/grid-customizer/GridCustomizer";
import type { ICellProps } from "@components/Grid/cells/cell/Cell";

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

/** Every component the personal-views UI needs. */
export interface IUserQueryComponents {
    /** The *Manage views* dialog. */
    ViewManager: React.ComponentType<IUserQueryDialogProps>;
    /** The *Save as new view* dialog. */
    CreateView: React.ComponentType<IUserQueryDialogProps>;
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

/** Every component the templating UI needs. */
export interface ITemplateComponents {
    /** The template picker, rendered inside the *New* and per-row add-task submenus. */
    TemplateSelector: React.ComponentType<ITemplateSelectorProps>;
}

/** What the templates module contributes. Built by {@link createTemplateModule}. */
export interface ITemplateModule {
    /** Where templates are read from and captured to. Also the picker's data source. */
    provider: ITemplateDataProvider;
    /** The module's UI. */
    components: ITemplateComponents;
}

/** The Edit Columns panel, with the custom-column commands wired in. A drop-in for the plain panel. */
export interface ICustomColumnsComponents {
    EditColumns: React.ComponentType<IEditColumnsProps>;
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
    /** Hooks into the grid's core behaviour: column definitions, row class rules, one-time init. */
    strategy: IGridCustomizerStrategy;
}

/** Every component the lookup-many module needs. */
export interface ILookupManyComponents {
    /** The cell renderer `GridCustomizer` assigns to any column carrying `metadata.LookupMany`. */
    CellRenderer: React.ComponentType<ICellProps>;
}

/** What the lookup-many module contributes. Built by {@link createLookupManyModule}. */
export interface ILookupManyModule {
    /**
     * Returns the candidate records for a lookup-many cell. Called once per cell rendered, since the
     * candidates may depend on the row. Return `undefined` for a column you do not serve and the grid
     * throws when that column renders.
     */
    createDataProvider: (parameters: ILookupManyDataProviderParameters) => IDataProvider | undefined;
    /** The module's UI. */
    components: ILookupManyComponents;
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
}
