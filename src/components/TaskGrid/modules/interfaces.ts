import { IUserQueryStrategy } from "@components/TaskGrid/providers/saved-query";

/**
 * The contract between the grid and its optional feature modules.
 *
 * **This file must never import a component.** It is what lets the grid describe a feature it does not
 * ship: core declares the shape, the module implements it, and the static dependency arrow points one way
 * only — module to core. A value import here would put a module's UI into the graph of every file that
 * touches `ITaskGridDescriptor`, which is exactly what registering features this way is meant to avoid.
 */

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
    /** The personal-views implementation. This is the swap point. */
    strategy: IUserQueryStrategy;
    /** The module's UI. */
    components: IUserQueryComponents;
    /** Show *Manage views*. Defaults to `false`. */
    enableQueryManager?: boolean;
    /** Show *Save as new view*. Defaults to `false`. */
    enableSaveAsNewQuery?: boolean;
    /** Show *Save changes to current view*. Defaults to `false`. */
    enableSaveQueryChanges?: boolean;
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
}
