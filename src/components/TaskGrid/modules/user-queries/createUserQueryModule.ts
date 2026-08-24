import { IUserQueryStrategy } from "@components/TaskGrid/providers/saved-query";
import { IUserQueryModule } from "../interfaces";
import { UserQueryDataProvider } from "./UserQueryDataProvider";
import { CreateViewDialog } from "./create-view-dialog";
import { ViewManagerDialog } from "./view-manager";

/** Options for {@link createUserQueryModule}. */
export interface IUserQueryModuleOptions {
    /**
     * Where the views are stored and how they are named, deleted and updated. Pass
     * `MemoryUserQueryStrategy`, `TalxisUserQueryStrategy`, or your own.
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
 * Builds the personal-views module: you supply the strategy, this brings the UI.
 *
 * Assign it to a `modules` key — `modules.onGetUserQueriesModule` on a shipped descriptor, or
 * `onGetModules` on a descriptor of your own.
 *
 * The grid registers it as `userQueriesModule`, so anything else reaches the module — and the provider
 * it built — through the services it was handed.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetUserQueriesModule: () => createUserQueryModule({
 *         strategy: new MemoryUserQueryStrategy({ userQueries }),
 *         enableQueryManager: true,
 *     }),
 * }
 * ```
 */
export const createUserQueryModule = (options: IUserQueryModuleOptions): IUserQueryModule => {
    const provider = new UserQueryDataProvider(options.strategy);
    return {
        provider: provider,
        components: {
            ViewManager: ViewManagerDialog,
            CreateView: CreateViewDialog,
        },
        enableQueryManager: options.enableQueryManager,
        enableSaveAsNewQuery: options.enableSaveAsNewQuery,
        enableSaveQueryChanges: options.enableSaveQueryChanges,
    };
};
