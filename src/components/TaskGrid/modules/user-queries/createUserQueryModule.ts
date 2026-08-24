import { IUserQueryStrategy } from "@components/TaskGrid/providers/saved-query";
import { IUserQueryModule } from "../interfaces";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
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
 * The provider it builds is registered as the grid's `userQueryDataProvider`, so anything else can
 * reach it through the services it was handed.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetUserQueriesModule: (services) => createUserQueryModule({
 *         strategy: new MemoryUserQueryStrategy({ userQueries }),
 *         enableQueryManager: true,
 *     }, services),
 * }
 * ```
 */
export const createUserQueryModule = (options: IUserQueryModuleOptions, services: ITaskGridServiceLocator): IUserQueryModule => {
    const provider = new UserQueryDataProvider(options.strategy);
    services.register('userQueryDataProvider', () => provider);
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
