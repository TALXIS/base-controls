import * as React from "react";
import { ITaskDataProvider } from "./providers/task";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { ITaskGridLabels } from "./labels";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";
import { ILocalizationService, useContextWithNullCheck } from "@utils";
import { ITaskGridServiceLocator } from "./services";

/** Where every service the grid was built with is reached. */
export const ServicesContext = React.createContext<ITaskGridServiceLocator | null>(null);
ServicesContext.displayName = 'TaskGridServices';

/** The resolved component overrides — the defaults merged with `ITaskGridProps.components`. */
export const TaskGridComponentsContext = React.createContext<ITaskGridComponents>(TaskGridComponents);
TaskGridComponentsContext.displayName = 'TaskGridComponents';

/** DOM id of the grid's root element, for portals and scroll containers. */
export const RootElementIdContext = React.createContext<string>('');
RootElementIdContext.displayName = 'RootElementId';

/** The AG Grid license key from `ITaskGridParameters`, or `null` when none was supplied. */
export const AgGridLicenseKeyContext = React.createContext<string | null>(null);
AgGridLicenseKeyContext.displayName = 'AgGridLicenseKey';

/**
 * Returns the grid's service locator — every provider, the descriptor, the PCF context, the labels.
 * Exported publicly as `useTaskGridServices`.
 * @throws Outside a `TaskGrid`.
 */
export const useServices = () => {
    return useContextWithNullCheck(ServicesContext);
}

/**
 * Returns the descriptor the grid was rendered with.
 * @throws Outside a `TaskGrid`.
 */
export const useTaskGridDescriptor = () => {
    return useServices().get('descriptor');
}

/**
 * Returns the localization service resolving every UI label. Exported publicly as `useTaskGridLabels`.
 * @throws Outside a `TaskGrid`.
 */
export const useLocalizationService = () => {
    return useServices().get('localizationService');
}

/**
 * Returns the DOM id of the grid's root element. Exported publicly as `useTaskGridRootElementId`.
 * Empty string outside a `TaskGrid`.
 */
export const useRootElementId = () => {
    return React.useContext(RootElementIdContext);
}

/**
 * Returns the control instance backing the current mount. Exported publicly as
 * `useTaskGridDatasetControl` — the way into the commands, the selection and the grid's feature flags.
 * @throws Outside a `TaskGrid`.
 */
export const useDatasetControl = () => {
    return useServices().get('datasetControl');
}

/** Returns the resolved component overrides. Falls back to the defaults outside a `TaskGrid`. */
export const useTaskGridComponents = () => {
    return React.useContext(TaskGridComponentsContext);
}

/**
 * Returns the task data provider backing the current mount.
 * @throws Outside a `TaskGrid`.
 */
export const useTaskDataProvider = () => {
    return useServices().get('taskDataProvider');
}

/** Returns the AG Grid license key, or `null` when none was supplied. */
export const useAgGridLicenseKey = () => {
    return React.useContext(AgGridLicenseKeyContext);
}
