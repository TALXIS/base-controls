import { IDependenciesModule } from "../interfaces";
import { DependenciesProvider, ITaskDependencyStrategy } from "./DependenciesProvider";
import { DependenciesCellRenderer } from "./cell-renderer";

/** Options for {@link createDependenciesModule}. */
export interface IDependenciesModuleOptions {
    /** Where the dependencies are read from. */
    strategy: ITaskDependencyStrategy;
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
 *     onGetDependenciesModule: () => createDependenciesModule({
 *         strategy: new MemoryTaskDependencyStrategy({ dependencies: DEPENDENCIES }),
 *     }),
 * }
 * ```
 */
export const createDependenciesModule = (options: IDependenciesModuleOptions): IDependenciesModule => ({
    provider: new DependenciesProvider(options.strategy),
    components: { CellRenderer: DependenciesCellRenderer },
});
