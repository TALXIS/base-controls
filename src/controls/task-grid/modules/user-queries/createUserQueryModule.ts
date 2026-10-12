import { IUserQueryStrategy } from "@controls/task-grid/providers/saved-query";
import { ITaskGridFactoryParams } from "@controls/task-grid/interfaces";
import { ITaskGridFeature, IUserQueryComponents } from "../interfaces";
import { UserQueryComponents } from "./moduleComponents";
import { UserQueryDataProvider } from "./UserQueryDataProvider";

/** Options for {@link createUserQueryModule}. */
export interface IUserQueryModuleOptions {
    /**
     * Returns where the views are stored and how they are named, deleted and updated:
     * `MemoryUserQueryStrategy`, `TalxisUserQueryStrategy`, or your own. Called once per mount.
     */
    onCreateStrategy: (params: ITaskGridFactoryParams) => IUserQueryStrategy;
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
 * Pass it as `features.userQueries`. The grid registers it as `userQueriesModule`.
 *
 * @example
 * ```ts
 * features={{
 *     userQueries: createUserQueryModule({
 *         onCreateStrategy: ({ services }) => new MemoryUserQueryStrategy({ userQueries, services }),
 *         enableQueryManager: true,
 *     }),
 * }}
 * ```
 */
export const createUserQueryModule = (options: IUserQueryModuleOptions): ITaskGridFeature => ({
    onInitialize: services => {
        const provider = new UserQueryDataProvider({ strategy: options.onCreateStrategy({ services }), services });
        services.register('userQueriesModule', () => ({
            provider: provider,
            components: { ...UserQueryComponents, ...options.components },
            enableQueryManager: options.enableQueryManager,
            enableSaveAsNewQuery: options.enableSaveAsNewQuery,
            enableSaveQueryChanges: options.enableSaveQueryChanges,
        }));
    },
});
