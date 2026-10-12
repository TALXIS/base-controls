import * as React from "react";
import { useContextWithNullCheck, useDataProvider } from "@utils";
import type { IGrid } from "@controls/grid";
import { ITaskDataProvider } from "./providers/task";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";
import type { ITaskGridRuntime } from "./runtime";
import type { ITaskGridFeature, ITaskGridModules } from "./modules/interfaces";

export const TaskGridRuntimeContext = React.createContext<ITaskGridRuntime | null>(null);
TaskGridRuntimeContext.displayName = 'TaskGridRuntime';

/** The resolved component overrides: the defaults merged with `ITaskGridProps.components`. */
export const TaskGridComponentsContext = React.createContext<ITaskGridComponents>(TaskGridComponents);
TaskGridComponentsContext.displayName = 'TaskGridComponents';

/** What the task grid renders the shared grid with, from its own props. */
export interface ITaskGridGridOptions {
    gridProps: Partial<IGrid>;
    modules: ITaskGridModules;
    /** In the order they register. */
    features: ITaskGridFeature[];
}

export const GridOptionsContext = React.createContext<ITaskGridGridOptions | null>(null);
GridOptionsContext.displayName = 'TaskGridGridOptions';

/**
 * Returns the task grid's runtime: its services, settings and view actions.
 * @throws Outside a `TaskGrid`.
 */
export const useTaskGridRuntime = (): ITaskGridRuntime => {
    return useContextWithNullCheck(TaskGridRuntimeContext);
};

/**
 * Returns the localization service resolving every task grid label.
 * @throws Outside a `TaskGrid`.
 */
export const useTaskGridLabels = () => {
    return useTaskGridRuntime().services.get('localizationService');
};

/** Returns the resolved component overrides; the defaults outside a `TaskGrid`. */
export const useTaskGridComponents = () => {
    return React.useContext(TaskGridComponentsContext);
};

/**
 * Returns the tasks of the view shown.
 * @throws Outside a `TaskGrid`.
 */
export const useTaskDataProvider = (): ITaskDataProvider => {
    return useDataProvider() as ITaskDataProvider;
};

export const useGridOptions = () => {
    return useContextWithNullCheck(GridOptionsContext);
};
