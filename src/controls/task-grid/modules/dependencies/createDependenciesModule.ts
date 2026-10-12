import { ColDef } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITaskGridFactoryParams } from "@controls/task-grid/interfaces";
import { TASK_TREE_PRIORITY } from "@controls/task-grid/module";
import { ITaskGridFeature } from "../interfaces";
import { DependenciesProvider, ITaskDependencyStrategy, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME } from "./DependenciesProvider";
import { DependenciesCell } from "./dependencies-cell";

/** Options for {@link createDependenciesModule}. */
export interface IDependenciesModuleOptions {
    /** Returns where the dependencies are read from. Called once per mount. */
    onCreateStrategy: (params: ITaskGridFactoryParams) => ITaskDependencyStrategy;
}

const DEPENDENCY_COLUMN_NAMES = new Set([PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME]);

const onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
    for (const colDef of columnDefs.filter(colDef => DEPENDENCY_COLUMN_NAMES.has(colDef.colId!))) {
        colDef.cellRenderer = DependenciesCell;
        colDef.editable = false;
        colDef.context = { ...colDef.context, isLocked: true };
    }
};

/**
 * Builds the dependencies module: you supply where dependencies are read from, this brings the provider
 * the grid asks per task and the predecessors and successors columns that show them.
 *
 * Pass it as `features.dependencies`. The grid registers it as `dependenciesModule`.
 *
 * @example
 * ```ts
 * features={{
 *     dependencies: createDependenciesModule({
 *         onCreateStrategy: ({ services }) => new MemoryTaskDependencyStrategy({ dependencies: DEPENDENCIES, services }),
 *     }),
 * }}
 * ```
 */
export const createDependenciesModule = (options: IDependenciesModuleOptions): ITaskGridFeature => ({
    onInitialize: services => {
        const provider = new DependenciesProvider({ strategy: options.onCreateStrategy({ services }), services });
        services.register('dependenciesModule', () => ({ provider }));
    },
    onRegister: runtime => {
        runtime.services.get('columns').registerColumnDefinitions(onColumnDefinitions, TASK_TREE_PRIORITY + 1);
    },
});
