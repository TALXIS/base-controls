import { ITaskGridFactoryParams } from "@controls/task-grid/interfaces";
import { ITaskGridFeature } from "../interfaces";
import { IProjectStrategy, ProjectData, ProjectProvider } from "./ProjectProvider";

/** Options for {@link createProjectModule}. */
export interface IProjectModuleOptions<TData extends ProjectData = ProjectData> {
    /** Returns where the project record and its dates are read from. Called once per mount. */
    onCreateStrategy: (params: ITaskGridFactoryParams) => IProjectStrategy<TData>;
}

/**
 * Builds the project module: you supply where the project comes from, this brings the provider that
 * holds it once the tasks have loaded.
 *
 * Only the Gantt reads it today — its project start and end markers. Registering it is what makes
 * those markers exist.
 *
 * Pass it as `features.project`. The grid registers it as `projectModule`.
 *
 * @example
 * ```ts
 * features={{
 *     project: createProjectModule({ onCreateStrategy: () => myProjectStrategy }),
 * }}
 * ```
 */
export const createProjectModule = <TData extends ProjectData = ProjectData>(options: IProjectModuleOptions<TData>): ITaskGridFeature => ({
    onInitialize: services => {
        const provider = new ProjectProvider({ strategy: options.onCreateStrategy({ services }), services });
        services.register('projectModule', () => ({ provider }));
    },
});
