import { Dataset } from "@talxis/client-libraries";
import { ITaskDataProvider, TaskDataProvider } from "./providers/task";
import { ILocalizationService } from "@utils";
import { ITaskGridLabels } from "./labels";
import { ISavedQuery, ISavedQueryDataProvider, PATH_COLUMN_NAME, SavedQueryDataProvider } from "./providers/saved-query";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { TaskGridDatasetControl } from "./TaskGridDatasetControl";

/**
 * The slice of grid state that outlives a remount. The `TaskGrid` component owns it and hands the same
 * object to every control it builds.
 */
export interface ITaskGridState {
    /** The view to load with — set when the user switches views, so the next control opens on it. */
    savedQuery?: Partial<ISavedQuery> & { id: string; linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[] };
}

interface ITaskGridDatasetControlFactoryParameters {
    state: ITaskGridState;
    taskGridDescriptor: ITaskGridDescriptor;
    localizationService: ILocalizationService<ITaskGridLabels>;
    onGetPcfContext: () => ComponentFramework.Context<any>;
}

/** Builds a ready-to-use {@link ITaskGridDatasetControl} from a descriptor. */
export class TaskGridDatasetControlFactory {
    /**
     * Loads the descriptor's dependencies, resolves its modules, then builds the data providers, the
     * dataset and the control over them.
     */
    public static async createInstance(parameters: ITaskGridDatasetControlFactoryParameters): Promise<ITaskGridDatasetControl> {
        let taskDataProvider: ITaskDataProvider;
        await parameters.taskGridDescriptor.onLoadDependencies?.();
        //resolved once and threaded from here: onGetModules is never called again for this instance
        const modules = parameters.taskGridDescriptor.onGetModules?.() ?? {};

        const customColumnsDataProvider = modules.customColumns?.provider;
        await customColumnsDataProvider?.refresh();

        const savedQueryStrategy = parameters.taskGridDescriptor.onCreateSavedQueryStrategy();
        const savedQueryDataProvider = new SavedQueryDataProvider(savedQueryStrategy, {
            userQueryProvider: modules.userQueries?.provider,
            localizationService: parameters.localizationService,
            nativeColumns: { ...parameters.taskGridDescriptor.onGetFieldMapping(), path: PATH_COLUMN_NAME },
            customColumnsDataProvider: customColumnsDataProvider,
            preferredQuery: parameters.state.savedQuery,
        })
        await savedQueryDataProvider.refresh();

        const taskStrategy = parameters.taskGridDescriptor.onCreateTaskStrategy({
            savedQueryDataProvider: savedQueryDataProvider,
            templateDataProvider: modules.templates?.provider,
            customColumnsDataProvider: customColumnsDataProvider,
            enableTaskEditing: parameters.taskGridDescriptor.onGetGridParameters?.()?.enableTaskEditing ?? false,
            enableInlineCreation: parameters.taskGridDescriptor.onGetGridParameters?.()?.enableInlineCreation ?? false,
        })

        taskDataProvider = new TaskDataProvider({
            localizationService: parameters.localizationService,
            nativeColumns: { ...parameters.taskGridDescriptor.onGetFieldMapping(), path: PATH_COLUMN_NAME },
            strategy: taskStrategy,
            savedQueryDataProvider: savedQueryDataProvider,
            customColumnsDataProvider: customColumnsDataProvider,
            onIsFlatListEnabled: () => TaskGridDatasetControlFactory._getIsFlatlistEnabled(parameters, savedQueryDataProvider)
        });

        const dataset = new Dataset(taskDataProvider);

        return new TaskGridDatasetControl({
            dataset,
            state: parameters.state,
            taskGridDescriptor: parameters.taskGridDescriptor,
            localizationService: parameters.localizationService,
            savedQueryDataProvider: savedQueryDataProvider,
            modules: modules,
            onGetPcfContext: () => parameters.onGetPcfContext(),
        });
    }

    private static _getIsFlatlistEnabled(parameters: ITaskGridDatasetControlFactoryParameters, savedQueryDataProvider: ISavedQueryDataProvider): boolean {
        const currentQueryId = savedQueryDataProvider.getCurrentQuery().id;
        return parameters.state.savedQuery?.isFlatListEnabled ?? savedQueryDataProvider.getSavedQuery(currentQueryId).isFlatListEnabled ?? false;
    }

}