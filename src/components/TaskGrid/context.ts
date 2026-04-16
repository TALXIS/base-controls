import * as React from "react";
import { ITaskDataProvider } from "./data-providers/task-data-provider";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { ITaskGridLabels, LocalizationService } from "./labels";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";

export const PcfContext = React.createContext<ComponentFramework.Context<any>>(null as any);
export const DatasetControlContext = React.createContext<ITaskGridDatasetControl>(null as any);
export const TaskDataProviderContext = React.createContext<ITaskDataProvider>(null as any);
export const TaskGridComponentsContext = React.createContext<ITaskGridComponents>(TaskGridComponents);
export const TaskGridDescriptorContext = React.createContext<ITaskGridDescriptor>(null as any);
export const RootElementIdContext = React.createContext<string>('');
export const LocalizationServiceContext = React.createContext<LocalizationService<ITaskGridLabels>>(null as any);
export const AgGridLicenseKeyContext = React.createContext<string | null>(null);

export const useTaskGridDescriptor = () => {
    return React.useContext(TaskGridDescriptorContext);
}

export const useLocalizationService = () => {
    return React.useContext(LocalizationServiceContext);
}

export const useRootElementId = () => {
    return React.useContext(RootElementIdContext);
}

export const useDatasetControl = () => {
    return React.useContext(DatasetControlContext);
}

export const useTaskGridComponents = () => {
    return React.useContext(TaskGridComponentsContext);
}

export const useTaskDataProvider = () => {
    return React.useContext(TaskDataProviderContext);
}

export const usePcfContext = () => {
    return React.useContext(PcfContext);
}

export const useAgGridLicenseKey = () => {
    return React.useContext(AgGridLicenseKeyContext);
}