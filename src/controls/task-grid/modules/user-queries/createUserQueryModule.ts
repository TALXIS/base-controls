import { IUserQueryStrategy } from "@components/TaskGrid/providers/saved-query";
import { IUserQueryComponents, IUserQueryModule } from "../interfaces";
import { UserQueryComponents } from "./moduleComponents";
import { UserQueryDataProvider } from "./UserQueryDataProvider";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Options for {@link createUserQueryModule}. */
export interface IUserQueryModuleOptions {
    /**
     * Where the views are stored and how they are named, deleted and updated. Pass
     * `MemoryUserQueryStrategy`, `TalxisUserQueryStrategy`, or your own.
     */
    strategy: IUserQueryStrategy;
    /** The locator the builder was handed. The provider reaches the task side through it. */
    services: ITaskGridServiceLocator;
    /** Show *Manage views*. Defaults to `false`. */
    enableQueryManager?: boolean;
    /** Show *Save as new view*. Defaults to `false`. */
    enableSaveAsNewQuery?: boolean;
    /** Show *Save changes to current view*. Defaults to `false`. */
    enableSaveQueryChanges?: boolean;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<IUserQueryComponents>;
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
 *     onGetUserQueriesModule: ({ services }) => createUserQueryModule({
 *         strategy: new MemoryUserQueryStrategy({ userQueries, services }),
 *         services,
 *         enableQueryManager: true,
 *     }),
 * }
 * ```
 */
export const createUserQueryModule = (options: IUserQueryModuleOptions): IUserQueryModule => {
    const provider = new UserQueryDataProvider({ strategy: options.strategy, services: options.services });
    return {
        provider: provider,
        components: { ...UserQueryComponents, ...options.components },
        enableQueryManager: options.enableQueryManager,
        enableSaveAsNewQuery: options.enableSaveAsNewQuery,
        enableSaveQueryChanges: options.enableSaveQueryChanges,
    };
};
