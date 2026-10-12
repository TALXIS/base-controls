import { CustomColumnsDataProvider, ICustomColumnsStrategy } from "./CustomColumnsDataProvider";
import { ITaskGridFactoryParams } from "@controls/task-grid/interfaces";
import { ICustomColumnsComponents, ITaskGridFeature } from "../interfaces";
import { CustomColumnsComponents } from "./moduleComponents";

/** Options for {@link createCustomColumnsModule}. */
export interface ICustomColumnsModuleOptions {
    /**
     * Returns where column definitions and values are stored: `TalxisCustomColumnsStrategy`, or your
     * own. Called once per mount.
     */
    onCreateStrategy: (params: ITaskGridFactoryParams) => ICustomColumnsStrategy;
    /** Show the "Create Custom Column" command. Defaults to `false`. */
    enableCustomColumnCreation?: boolean;
    /** Show the per-column edit command. Defaults to `false`. */
    enableCustomColumnEditing?: boolean;
    /** Show the per-column delete command. Defaults to `false`. */
    enableCustomColumnDeletion?: boolean;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<ICustomColumnsComponents>;
}

/**
 * Builds the custom-columns module: you supply the strategy, this brings the UI.
 *
 * Pass it as `features.customColumns`. The grid registers it as `customColumnsModule`.
 *
 * @example
 * ```ts
 * features={{
 *     customColumns: createCustomColumnsModule({
 *         onCreateStrategy: ({ services }) => new TalxisCustomColumnsStrategy({ entityName, services }),
 *         enableCustomColumnCreation: true,
 *     }),
 * }}
 * ```
 */
export const createCustomColumnsModule = (options: ICustomColumnsModuleOptions): ITaskGridFeature => ({
    onInitialize: services => {
        const provider = new CustomColumnsDataProvider({ strategy: options.onCreateStrategy({ services }), services });
        services.register('customColumnsModule', () => ({
            provider: provider,
            components: { ...CustomColumnsComponents, ...options.components },
            enableCustomColumnCreation: options.enableCustomColumnCreation,
            enableCustomColumnEditing: options.enableCustomColumnEditing,
            enableCustomColumnDeletion: options.enableCustomColumnDeletion,
        }));
    },
});
