import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { IProjectModule } from "../interfaces";
import { IProjectStrategy, ProjectData, ProjectProvider } from "./ProjectProvider";

/** Options for {@link createProjectModule}. */
export interface IProjectModuleOptions<TData extends ProjectData = ProjectData> {
    /** Where the project record and its dates are read from. */
    strategy: IProjectStrategy<TData>;
    /** The locator the builder was handed. The provider reaches the task side through it. */
    services: ITaskGridServiceLocator;
}

/**
 * Builds the project module: you supply where the project comes from, this brings the provider that
 * holds it once the tasks have loaded.
 *
 * Only the Gantt reads it today — its project start and end markers. Registering it is what makes
 * those markers exist.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetProjectModule: ({ services }) => createProjectModule({
 *         strategy: myProjectStrategy,
 *         services,
 *     }),
 * }
 * ```
 */
export const createProjectModule = <TData extends ProjectData = ProjectData>(options: IProjectModuleOptions<TData>): IProjectModule<TData> => ({
    provider: new ProjectProvider({
        strategy: options.strategy,
        services: options.services,
    }),
});
