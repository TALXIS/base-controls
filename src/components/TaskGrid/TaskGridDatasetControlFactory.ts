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

interface ITaskGridDatasetControlFactoryOptions {
    state: ITaskGridState;
    taskGridDescriptor: ITaskGridDescriptor;
    localizationService: ILocalizationService<ITaskGridLabels>;
    onGetPcfContext: () => ComponentFramework.Context<any>;
}

export class TaskGridDatasetControlFactory {
    //makes sure the instance is created after the dependencies are loaded, and handles creation of data providers and dataset
    public static async createInstance(options: ITaskGridDatasetControlFactoryOptions): Promise<ITaskGridDatasetControl> {
        let taskDataProvider: ITaskDataProvider;
        await options.taskGridDescriptor.onLoadDependencies?.();
        const taskTree = new RecordTree({
            onGetTaskDataProvider: () => taskDataProvider,
        });

        const customColumnsStrategy = options.taskGridDescriptor.onCreateCustomColumnsStrategy?.();
        let customColumnsDataProvider: CustomColumnsDataProvider | undefined;
        if (customColumnsStrategy) {
            customColumnsDataProvider = new CustomColumnsDataProvider(customColumnsStrategy);
        }
        await customColumnsDataProvider?.refresh();

        const savedQueryStrategy = options.taskGridDescriptor.onCreateSavedQueryStrategy();
        const savedQueryDataProvider = new SavedQueryDataProvider(savedQueryStrategy, {
            nativeColumns: options.taskGridDescriptor.onGetNativeColumns(),
            customColumnsDataProvider: customColumnsDataProvider,
            preferredQuery: options.state.savedQuery,
        })
        await savedQueryDataProvider.refresh();

        const taskStrategy = options.taskGridDescriptor.onCreateTaskStrategy({
            taskTree: taskTree,
            customColumnsDataProvider: customColumnsDataProvider,
        })

        taskDataProvider = new TaskDataProvider({
            localizationService: options.localizationService,
            nativeColumns: options.taskGridDescriptor.onGetNativeColumns(),
            taskTree: taskTree,
            strategy: taskStrategy,
            onIsFlatListEnabled: () => TaskGridDatasetControlFactory._getIsFlatlistEnabled(options, savedQueryDataProvider)
        });

        const dataset = new Dataset(taskDataProvider);

        return new TaskGridDatasetControl({
            dataset,
            state: options.state,
            taskGridDescriptor: options.taskGridDescriptor,
            localizationService: options.localizationService,
            savedQueryDataProvider: savedQueryDataProvider,
            customColumnsDataProvider: customColumnsDataProvider,
            onGetPcfContext: () => options.onGetPcfContext(),
        });
    }

    //needs to be here since we also need to pass this as dependency of provider (it changes the way data is structured)
    private static _getIsFlatlistEnabled(options: ITaskGridDatasetControlFactoryOptions, savedQueryDataProvider: ISavedQueryDataProvider): boolean {
        const currentQueryId = savedQueryDataProvider.getCurrentQuery().id;
        return options.state.savedQuery?.isFlatListEnabled ?? savedQueryDataProvider.getSavedQuery(currentQueryId).isFlatListEnabled ?? false;
    }

}