import { CustomColumnsDataProvider, ICustomColumnsStrategy } from "./CustomColumnsDataProvider";
import { ICustomColumnsModule } from "../interfaces";
import { CommandBar } from "./command-bar/CommandBar";
import { OptionCommandBar } from "./option-command-bar/OptionCommandBar";
import { SortableItemCommandBar } from "./sortable-item-command-bar/SortableItemCommandBar";

/** Options for {@link createCustomColumnsModule}. */
export interface ICustomColumnsModuleOptions {
    /**
     * The custom-columns implementation — where column definitions and values are stored. This is the
     * only thing that differs between backends: pass `DataverseCustomColumnsStrategy`, or your own.
     */
    strategy: ICustomColumnsStrategy;
    /** Show the "Create Custom Column" command. Defaults to `false`. */
    enableCustomColumnCreation?: boolean;
    /** Show the per-column edit command. Defaults to `false`. */
    enableCustomColumnEditing?: boolean;
    /** Show the per-column delete command. Defaults to `false`. */
    enableCustomColumnDeletion?: boolean;
}

/**
 * Everything the custom-columns feature needs, in one call: you supply the strategy, this brings the UI.
 *
 * Return it from the descriptor's `onGetModules` to switch custom columns on. Importing this function is
 * what puts the Edit Columns overrides in your bundle, so a grid that never registers the module does
 * not carry them.
 *
 * ```ts
 * onGetModules: () => ({
 *     customColumns: createCustomColumnsModule({
 *         strategy: new DataverseCustomColumnsStrategy({ ... }),
 *         enableCustomColumnCreation: true,
 *     }),
 * })
 * ```
 */
export const createCustomColumnsModule = (options: ICustomColumnsModuleOptions): ICustomColumnsModule => ({
    provider: new CustomColumnsDataProvider(options.strategy),
    //the only place the overrides are named: a consumer never imports or knows about them
    components: {
        CommandBar,
        SortableItemCommandBar,
        OptionCommandBar,
    },
    enableCustomColumnCreation: options.enableCustomColumnCreation,
    enableCustomColumnEditing: options.enableCustomColumnEditing,
    enableCustomColumnDeletion: options.enableCustomColumnDeletion,
});
