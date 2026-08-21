import { IUserQueryStrategy } from "@components/TaskGrid/providers/saved-query";
import { IUserQueryModule } from "../interfaces";
import { CreateViewDialog } from "./create-view-dialog";
import { ViewManagerDialog } from "./view-manager";

/** Options for {@link createUserQueryModule}. */
export interface IUserQueryModuleOptions {
    /**
     * The personal-views implementation — where the views are stored and how they are named, deleted and
     * updated. This is the only thing that differs between backends: pass `MemoryUserQueryStrategy`,
     * `DataverseUserQueryStrategy`, or your own.
     */
    strategy: IUserQueryStrategy;
    /** Show *Manage views*. Defaults to `false`. */
    enableQueryManager?: boolean;
    /** Show *Save as new view*. Defaults to `false`. */
    enableSaveAsNewQuery?: boolean;
    /** Show *Save changes to current view*. Defaults to `false`. */
    enableSaveQueryChanges?: boolean;
}

/**
 * Everything the personal-views feature needs, in one call: you supply the strategy, this brings the UI.
 *
 * Return it from the descriptor's `onGetModules` to switch personal views on. Importing this function is
 * what puts the dialogs in your bundle, so a grid that never registers the module does not carry them.
 *
 * ```ts
 * onGetModules: () => ({
 *     userQueries: createUserQueryModule({
 *         strategy: new MemoryUserQueryStrategy({ userQueries }),
 *         enableQueryManager: true,
 *     }),
 * })
 * ```
 */
export const createUserQueryModule = (options: IUserQueryModuleOptions): IUserQueryModule => ({
    strategy: options.strategy,
    //the only place the dialogs are named: a consumer never imports or knows about them
    components: {
        ViewManager: ViewManagerDialog,
        CreateView: CreateViewDialog,
    },
    enableQueryManager: options.enableQueryManager,
    enableSaveAsNewQuery: options.enableSaveAsNewQuery,
    enableSaveQueryChanges: options.enableSaveQueryChanges,
});
