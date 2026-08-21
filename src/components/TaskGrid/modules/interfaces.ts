import { IEventEmitter } from "@talxis/client-libraries";
import { IDeletedUserQueriesResult, ISavedQuery } from "@components/TaskGrid/providers/saved-query";
import { ITaskDataProvider } from "@components/TaskGrid/providers/task";
//the types-only file, never the providers/template barrel - that one also exports the
//TemplateDataProviderBase mixin, a value
import { ITemplateDataProvider } from "@components/TaskGrid/providers/template/TemplateDataProvider";
//the types-only file, never the providers/custom-columns barrel - that one also exports the
//CustomColumnsDataProvider class, a value
import { ICustomColumnsDataProvider } from "@components/TaskGrid/modules/custom-columns/CustomColumnsDataProvider";
import { ICommandBarProps } from "@legacy";
import { IOptionCommandBarProps, ISortableItemCommandBarProps } from "@components/DatasetControl/EditColumns/components";

/**
 * The contract between the grid and its optional feature modules.
 *
 * **This file must never import a component.** It is what lets the grid describe a feature it does not
 * ship: core declares the shape, the module implements it, and the static dependency arrow points one way
 * only — module to core. A value import here would put a module's UI into the graph of every file that
 * touches `ITaskGridDescriptor`, which is exactly what registering features this way is meant to avoid.
 */

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
 *
 * Deliberately **not** an `IDataProvider` — none of that surface applies to a handful of saved views.
 */
export interface IUserQueryDataProvider {
    /** Lifecycle events. Never fires when the module is not registered, because there is no provider. */
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

/** Every component the personal-views UI needs. Whatever renders it retrieves what it needs from here. */
export interface IUserQueryComponents {
    /** The *Manage views* dialog. */
    ViewManager: React.ComponentType<IUserQueryDialogProps>;
    /** The *Save as new view* dialog. */
    CreateView: React.ComponentType<IUserQueryDialogProps>;
}

/**
 * What the user-queries module contributes: the personal-views implementation, the UI that drives it, and
 * which of the view commands are offered.
 *
 * Built by `createUserQueryModule()` — never written by hand.
 */
export interface IUserQueryModule {
    /** The personal-views implementation, wrapped by `createUserQueryModule`. */
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

/** What the templates module contributes. Built by `createTemplateModule()` — never written by hand. */
export interface ITemplateModule {
    /** Where templates are read from and captured to. Also the picker's data source. */
    provider: ITemplateDataProvider;
    /** The module's UI. */
    components: ITemplateComponents;
}

/**
 * The three extension points the generic Edit Columns panel accepts, overridden for custom columns.
 * Typed as plain function components — the same shape `IComponents` in the base panel requires — not
 * `React.ComponentType`, which also admits class components the panel does not accept.
 */
export interface ICustomColumnsComponents {
    CommandBar: (props: ICommandBarProps) => JSX.Element;
    SortableItemCommandBar: (props: ISortableItemCommandBarProps) => JSX.Element;
    OptionCommandBar: (props: IOptionCommandBarProps) => JSX.Element;
}

/** What the custom-columns module contributes. Built by `createCustomColumnsModule()` — never written by hand. */
export interface ICustomColumnsModule {
    /** The custom-columns implementation. This is the swap point. */
    provider: ICustomColumnsDataProvider;
    /** The module's UI: the three overrides the generic Edit Columns panel accepts. */
    components: ICustomColumnsComponents;
    /** Show the "Create Custom Column" command. Defaults to `false`. */
    enableCustomColumnCreation?: boolean;
    /** Show the per-column edit command. Defaults to `false`. */
    enableCustomColumnEditing?: boolean;
    /** Show the per-column delete command. Defaults to `false`. */
    enableCustomColumnDeletion?: boolean;
}

/**
 * The modules a grid runs with, one optional key per available feature.
 *
 * A key is filled by importing that module's create method and calling it, which is also what puts its code
 * in your bundle — omit the key and neither the feature nor its UI exists.
 */
export interface ITaskGridModules {
    /** Personal views: *My views*, the save commands and the view manager. */
    userQueries?: IUserQueryModule;
    /** Task templates: capturing one from a task, and expanding one into tasks. */
    templates?: ITemplateModule;
    /** User-defined (dynamic) columns: creating, editing, deleting, and their values. */
    customColumns?: ICustomColumnsModule;
}
