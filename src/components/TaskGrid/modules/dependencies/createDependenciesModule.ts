import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { IDependenciesModule } from "../interfaces";
import { DependenciesProvider, ITaskDependencyStrategy } from "./DependenciesProvider";
import { DependenciesCellRenderer } from "./cell-renderer";

/** Options for {@link createDependenciesModule}. */
export interface IDependenciesModuleOptions {
    /** Where the dependencies are read from. */
    strategy: ITaskDependencyStrategy;
    /** The locator the builder was handed. The provider reaches the task side through it. */
    services: ITaskGridServiceLocator;
}

/**
 * Builds the dependencies module: you supply where dependencies are read from, this brings the provider
 * the grid asks per task and the cell renderer that shows them.
 *
 * Assign it to a `modules` key — `modules.onGetDependenciesModule` on a shipped descriptor, or
 * `onGetModules` on a descriptor of your own. Which column *renders* dependencies is driven by the
 * `TaskDependencies` custom control on the column itself.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetDependenciesModule: ({ services }) => createDependenciesModule({
 *         strategy: new MemoryTaskDependencyStrategy({ dependencies: DEPENDENCIES, services }),
 *         services,
 *     }),
 * }
 * ```
 */
export const createDependenciesModule = (options: IDependenciesModuleOptions): IDependenciesModule => ({
    provider: new DependenciesProvider({ strategy: options.strategy, services: options.services }),
    components: { CellRenderer: DependenciesCellRenderer },
});
