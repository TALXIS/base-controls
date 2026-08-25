import { CustomColumnsDataProvider, ICustomColumnsStrategy } from "./CustomColumnsDataProvider";
import { ICustomColumnsModule } from "../interfaces";
import { EditColumns } from "./edit-columns/EditColumns";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Options for {@link createCustomColumnsModule}. */
export interface ICustomColumnsModuleOptions {
    /**
     * Where column definitions and values are stored. Pass `TalxisCustomColumnsStrategy`, or your own.
     */
    strategy: ICustomColumnsStrategy;
    /** The locator the builder was handed. The provider reaches the task side through it. */
    services: ITaskGridServiceLocator;
    /** Show the "Create Custom Column" command. Defaults to `false`. */
    enableCustomColumnCreation?: boolean;
    /** Show the per-column edit command. Defaults to `false`. */
    enableCustomColumnEditing?: boolean;
    /** Show the per-column delete command. Defaults to `false`. */
    enableCustomColumnDeletion?: boolean;
}

/**
 * Builds the custom-columns module: you supply the strategy, this brings the UI.
 *
 * Assign it to a `modules` key — `modules.onGetCustomColumnsModule` on a shipped descriptor, or
 * `onGetModules` on a descriptor of your own. The grid registers it as `customColumnsModule`.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetCustomColumnsModule: ({ services, entityName }) => createCustomColumnsModule({
 *         strategy: new TalxisCustomColumnsStrategy({ entityName, services }),
 *         services,
 *         enableCustomColumnCreation: true,
 *     }),
 * }
 * ```
 */
export const createCustomColumnsModule = (options: ICustomColumnsModuleOptions): ICustomColumnsModule => {
    const provider = new CustomColumnsDataProvider({ strategy: options.strategy, services: options.services });
    return {
        provider: provider,
        components: { EditColumns },
        enableCustomColumnCreation: options.enableCustomColumnCreation,
        enableCustomColumnEditing: options.enableCustomColumnEditing,
        enableCustomColumnDeletion: options.enableCustomColumnDeletion,
    };
};
