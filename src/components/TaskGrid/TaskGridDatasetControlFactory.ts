import { Dataset } from "@talxis/client-libraries";
import { ITaskDataProvider, TaskDataProvider } from "./data-providers/task-data-provider";
import { ILocalizationService, ITaskGridLabels } from "./labels";
import { ISavedQuery, ISavedQueryDataProvider, SavedQueryDataProvider } from "./data-providers/saved-query-data-provider";
import { RecordTree } from "./data-providers/task-data-provider/record-tree";
import { CustomColumnsDataProvider } from "./data-providers/custom-columns-data-provider/CustomColumnsDataProvider";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { TaskGridDatasetControl } from "./TaskGridDatasetControl";

export interface ITaskGridState {
    savedQuery?: Partial<ISavedQuery> & { id: string; linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[] };
}

interface ITaskGridDatasetControlFactoryParameters {
    state: ITaskGridState;
    taskGridDescriptor: ITaskGridDescriptor;
    localizationService: ILocalizationService<ITaskGridLabels>;
    onGetPcfContext: () => ComponentFramework.Context<any>;
}

export class TaskGridDatasetControlFactory {
    //makes sure the instance is created after the dependencies are loaded, and handles creation of data providers and dataset
    public static async createInstance(parameters: ITaskGridDatasetControlFactoryParameters): Promise<ITaskGridDatasetControl> {
        let taskDataProvider: ITaskDataProvider;
        await parameters.taskGridDescriptor.onLoadDependencies?.();

        const customColumnsStrategy = parameters.taskGridDescriptor.onCreateCustomColumnsStrategy?.();
        let customColumnsDataProvider: CustomColumnsDataProvider | undefined;
        if (customColumnsStrategy) {
            customColumnsDataProvider = new CustomColumnsDataProvider(customColumnsStrategy);
        }
        await customColumnsDataProvider?.refresh();

        const savedQueryStrategy = parameters.taskGridDescriptor.onCreateSavedQueryStrategy();
        const savedQueryDataProvider = new SavedQueryDataProvider(savedQueryStrategy, {
            nativeColumns: parameters.taskGridDescriptor.onGetNativeColumns(),
            customColumnsDataProvider: customColumnsDataProvider,
            preferredQuery: parameters.state.savedQuery,
        })
        const templateDataProvider = parameters.taskGridDescriptor.onCreateTemplateDataProvider?.();
        await savedQueryDataProvider.refresh();

        const taskStrategy = parameters.taskGridDescriptor.onCreateTaskStrategy({
            templateDataProvider: templateDataProvider,
            customColumnsDataProvider: customColumnsDataProvider,
        })

        taskDataProvider = new TaskDataProvider({
            localizationService: parameters.localizationService,
            nativeColumns: parameters.taskGridDescriptor.onGetNativeColumns(),
            strategy: taskStrategy,
            onIsFlatListEnabled: () => TaskGridDatasetControlFactory._getIsFlatlistEnabled(parameters, savedQueryDataProvider)
        });

        const dataset = new Dataset(taskDataProvider);

        return new TaskGridDatasetControl({
            dataset,
            state: parameters.state,
            taskGridDescriptor: parameters.taskGridDescriptor,
            templateDataProvider: templateDataProvider,
            localizationService: parameters.localizationService,
            savedQueryDataProvider: savedQueryDataProvider,
            customColumnsDataProvider: customColumnsDataProvider,
            onGetPcfContext: () => parameters.onGetPcfContext(),
        });
    }

    private static _getIsFlatlistEnabled(parameters: ITaskGridDatasetControlFactoryParameters, savedQueryDataProvider: ISavedQueryDataProvider): boolean {
        const currentQueryId = savedQueryDataProvider.getCurrentQuery().id;
        return parameters.state.savedQuery?.isFlatListEnabled ?? savedQueryDataProvider.getSavedQuery(currentQueryId).isFlatListEnabled ?? false;
    }

}