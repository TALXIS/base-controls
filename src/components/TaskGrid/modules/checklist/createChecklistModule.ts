import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { IChecklistModule } from "../interfaces";
import { ChecklistProvider, IChecklistStrategy } from "./ChecklistProvider";
import { ChecklistCellRenderer } from "./cell-renderer";

/** Options for {@link createChecklistModule}. */
export interface IChecklistModuleOptions {
    /** Where the checklist items are read from. */
    strategy: IChecklistStrategy;
    /** The locator the builder was handed. The provider reaches the task side through it. */
    services: ITaskGridServiceLocator;
}

/**
 * Builds the checklist module: you supply where checklist items are read from, this brings the provider
 * the grid asks per task and the cell renderer that shows them.
 *
 * Assign it to a `modules` key — `modules.onGetChecklistModule` on a shipped descriptor, or `onGetModules`
 * on a descriptor of your own. Registering it is what creates the grid's checklist column.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetChecklistModule: ({ services }) => createChecklistModule({
 *         strategy: new MemoryChecklistStrategy({ items: CHECKLIST_ITEMS, services }),
 *         services,
 *     }),
 * }
 * ```
 */
export const createChecklistModule = (options: IChecklistModuleOptions): IChecklistModule => ({
    provider: new ChecklistProvider({ strategy: options.strategy, services: options.services }),
    components: { CellRenderer: ChecklistCellRenderer },
});
