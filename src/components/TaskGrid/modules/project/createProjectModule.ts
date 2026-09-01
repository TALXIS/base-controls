import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { IProjectModule } from "../interfaces";
import { IProjectStrategy, ProjectProvider } from "./ProjectProvider";

/** Options for {@link createProjectModule}. */
export interface IProjectModuleOptions {
    /** Where the project record and its dates are read from. */
    strategy: IProjectStrategy;
    /** The locator the builder was handed. The provider reaches the task side through it. */
    services: ITaskGridServiceLocator;
    /**
     * The task columns whose edits move the project dates — the Gantt's start and end date columns,
     * usually. A save touching one of them refreshes the project dates.
     */
    dateColumnNames?: string[];
}

/**
 * Builds the project module: you supply where the project comes from, this brings the provider that
 * keeps it current as the tasks change.
 *
 * Only the Gantt reads it today — its project start and end markers. Registering it is what makes
 * those markers exist.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetProjectModule: ({ services }) => createProjectModule({
 *         strategy: myProjectStrategy,
 *         dateColumnNames: ['scheduledstart', 'scheduledend'],
 *         services,
 *     }),
 * }
 * ```
 */
export const createProjectModule = (options: IProjectModuleOptions): IProjectModule => ({
    provider: new ProjectProvider({
        strategy: options.strategy,
        services: options.services,
        dateColumnNames: options.dateColumnNames,
    }),
});
