import { IDataset, IDataProvider } from "@talxis/client-libraries";
import { IDatasetControl } from "../../utils/dataset-control";
import { IGridCustomizerStrategy } from "./components/grid/grid-customizer";
import { ICustomColumnsDataProvider, ICustomColumnsStrategy } from "./data-providers/custom-columns-data-provider/CustomColumnsDataProvider";
import { ISavedQueryDataProvider, ISavedQueryStrategy } from "./data-providers/saved-query-data-provider";
import { ITaskDataProviderStrategy, ITaskDataProvider } from "./data-providers/task-data-provider";
import { ILocalizationService, ITaskGridLabels } from "./labels";
import { ITaskGridState } from "./TaskGridDatasetControlFactory";

export interface IDatasetControlOptions {
    dataset: IDataset;
    state: ITaskGridState;
    savedQueryDataProvider: ISavedQueryDataProvider;
    taskGridDescriptor: ITaskGridDescriptor;
    localizationService: ILocalizationService<ITaskGridLabels>;
    customColumnsDataProvider?: ICustomColumnsDataProvider;
    onGetPcfContext: () => ComponentFramework.Context<any>;
}

export interface INativeColumns {
    parentId: string;
    subject: string;
    stackRank: string;
    stateCode: string;
    //this field value will be calculated automatically
    path: string;
    percentComplete?: string;
}

export interface ITaskGridParameters {
    height?: string;
    enableRowDragging?: boolean;
    enableEditColumns?: boolean;
    enableQuickFind?: boolean;
    enableViewSwitcher?: boolean;
    enableShowHierarchyToggle?: boolean;
    enableHideInactiveTasksToggle?: boolean;
    enableEditColumnsScopeSelector?: boolean;
}

export interface ITaskStrategyDeps {
    customColumnsDataProvider?: ICustomColumnsDataProvider;
}

export interface ITaskGridDescriptor {
    onGetNativeColumns: () => INativeColumns;
    onCreateSavedQueryStrategy: () => ISavedQueryStrategy;
    onCreateTaskStrategy: (deps: ITaskStrategyDeps) => ITaskDataProviderStrategy;
    onCreateUserQueryDataProvider: () => IDataProvider;
    onCreateCustomColumnsStrategy?: () => ICustomColumnsStrategy;
    onCreateTemplateDataProvider?: () => IDataProvider | undefined;
    onCreateGridCustomizerStrategy?: () => IGridCustomizerStrategy;
    onGetAgGridLicenseKey?: () => string;
    onGetControlId?: () => string;
    onLoadDependencies?: () => Promise<void>;
    onGetGridParameters?: () => ITaskGridParameters;
}

export interface ITaskGridDatasetControl extends IDatasetControl {
    getTemplateDataProvider: () => IDataProvider;
    getSavedQueryDataProvider: () => ISavedQueryDataProvider;
    getCustomColumnsDataProvider: () => ICustomColumnsDataProvider;
    createUserQueryDataProvider: () => IDataProvider;
    getNativeColumns: () => INativeColumns;
    getDataProvider: () => ITaskDataProvider;
    getLocalizationService: () => ILocalizationService<ITaskGridLabels>;
    getInactiveTasksVisibility: () => boolean;
    toggleFlatList: (enabled: boolean) => void;
    toggleHideInactiveTasks: (hide: boolean) => void;
    changeSavedQuery: (queryId: string) => void;
    getControlId: () => string;
    isRowDraggingEnabled: () => boolean;
    isShowHierarchyToggleVisible: () => boolean;
    isHideInactiveTasksToggleVisible: () => boolean;
    isEditColumnsScopeSelectorEnabled: () => boolean;
    isTemplatingEnabled: () => boolean;
}