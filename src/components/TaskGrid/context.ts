import * as React from "react";
import { ITaskDataProvider } from "./providers/task";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { ITaskGridLabels } from "./labels";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";
import { ILocalizationService, useContextWithNullCheck } from "@utils";

/** The PCF context the grid was rendered with. */
export const PcfContext = React.createContext<ComponentFramework.Context<any> | null>(null);
PcfContext.displayName = 'PcfContext';

/** The control instance backing the current mount. */
export const DatasetControlContext = React.createContext<ITaskGridDatasetControl | null>(null);
DatasetControlContext.displayName = 'DatasetControl';

/** The task data provider backing the current mount. */
export const TaskDataProviderContext = React.createContext<ITaskDataProvider | null>(null);
TaskDataProviderContext.displayName = 'TaskDataProvider';

/** The resolved component overrides — the defaults merged with `ITaskGridProps.components`. */
export const TaskGridComponentsContext = React.createContext<ITaskGridComponents>(TaskGridComponents);
TaskGridComponentsContext.displayName = 'TaskGridComponents';

/** The descriptor the grid was rendered with. */
export const TaskGridDescriptorContext = React.createContext<ITaskGridDescriptor | null>(null);
TaskGridDescriptorContext.displayName = 'TaskGridDescriptor';

/** DOM id of the grid's root element, for portals and scroll containers. */
export const RootElementIdContext = React.createContext<string>('');
RootElementIdContext.displayName = 'RootElementId';

/** The localization service resolving every UI label. */
export const LocalizationServiceContext = React.createContext<ILocalizationService<ITaskGridLabels> | null>(null);
LocalizationServiceContext.displayName = 'LocalizationService';

/** The AG Grid license key from `ITaskGridParameters`, or `null` when none was supplied. */
export const AgGridLicenseKeyContext = React.createContext<string | null>(null);
AgGridLicenseKeyContext.displayName = 'AgGridLicenseKey';

/**
 * Returns the descriptor the grid was rendered with.
 * @throws Outside a `TaskGrid`.
 */
export const useTaskGridDescriptor = () => {
    return useContextWithNullCheck(TaskGridDescriptorContext);
}

/**
 * Returns the localization service resolving every UI label. Exported publicly as `useTaskGridLabels`.
 * @throws Outside a `TaskGrid`.
 */
export const useLocalizationService = () => {
    return useContextWithNullCheck(LocalizationServiceContext);
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
 * `useTaskGridDatasetControl` — the way into `getModules`, the saved queries and the selection.
 * @throws Outside a `TaskGrid`.
 */
export const useDatasetControl = () => {
    return useContextWithNullCheck(DatasetControlContext);
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
    return useContextWithNullCheck(TaskDataProviderContext);
}

/**
 * Returns the PCF context the grid was rendered with. Not re-exported from the package root — the
 * `@utils` hook of the same name owns that name.
 * @throws Outside a `TaskGrid`.
 */
export const usePcfContext = () => {
    return useContextWithNullCheck(PcfContext);
}

/** Returns the AG Grid license key, or `null` when none was supplied. */
export const useAgGridLicenseKey = () => {
    return React.useContext(AgGridLicenseKeyContext);
}
