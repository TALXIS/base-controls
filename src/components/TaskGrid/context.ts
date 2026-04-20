import * as React from "react";
import { ITaskDataProvider } from "./data-providers/task-data-provider";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { ITaskGridLabels, LocalizationService } from "./labels";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";

export const PcfContext = React.createContext<ComponentFramework.Context<any> | null>(null);
PcfContext.displayName = 'PcfContext';

export const DatasetControlContext = React.createContext<ITaskGridDatasetControl | null>(null);
DatasetControlContext.displayName = 'DatasetControl';

export const TaskDataProviderContext = React.createContext<ITaskDataProvider | null>(null);
TaskDataProviderContext.displayName = 'TaskDataProvider';

export const TaskGridComponentsContext = React.createContext<ITaskGridComponents>(TaskGridComponents);
TaskGridComponentsContext.displayName = 'TaskGridComponents';

export const TaskGridDescriptorContext = React.createContext<ITaskGridDescriptor | null>(null);
TaskGridDescriptorContext.displayName = 'TaskGridDescriptor';

export const RootElementIdContext = React.createContext<string>('');
RootElementIdContext.displayName = 'RootElementId';

export const LocalizationServiceContext = React.createContext<LocalizationService<ITaskGridLabels> | null>(null);
LocalizationServiceContext.displayName = 'LocalizationService';

export const AgGridLicenseKeyContext = React.createContext<string | null>(null);
AgGridLicenseKeyContext.displayName = 'AgGridLicenseKey';

const useContextWithNullCheck = <T>(ctx: React.Context<T | null>): T => {
    const value = React.useContext(ctx);
    if (value == null) {
        throw new Error(`Context "${ctx.displayName ?? 'unknown'}" is not provided.`);
    }
    return value;
}

export const useTaskGridDescriptor = () => {
    return useContextWithNullCheck(TaskGridDescriptorContext);
}

export const useLocalizationService = () => {
    return useContextWithNullCheck(LocalizationServiceContext);
}

export const useRootElementId = () => {
    return React.useContext(RootElementIdContext);
}

export const useDatasetControl = () => {
    return useContextWithNullCheck(DatasetControlContext);
}

export const useTaskGridComponents = () => {
    return React.useContext(TaskGridComponentsContext);
}

export const useTaskDataProvider = () => {
    return useContextWithNullCheck(TaskDataProviderContext);
}

export const usePcfContext = () => {
    return useContextWithNullCheck(PcfContext);
}

export const useAgGridLicenseKey = () => {
    return React.useContext(AgGridLicenseKeyContext);
}
