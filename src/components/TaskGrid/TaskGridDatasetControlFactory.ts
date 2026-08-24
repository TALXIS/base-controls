import { Dataset } from "@talxis/client-libraries";
import { ITaskDataProvider, TaskDataProvider } from "./providers/task";
import { ILocalizationService } from "@utils";
import { ITaskGridLabels } from "./labels";
import { ISavedQuery, ISavedQueryDataProvider, PATH_COLUMN_NAME, SavedQueryDataProvider } from "./providers/saved-query";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { TaskGridDatasetControl } from "./TaskGridDatasetControl";
import { ServiceLocator } from "./services";

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
        const descriptor = parameters.taskGridDescriptor;
        let savedQueryDataProvider: ISavedQueryDataProvider;
        let taskDataProvider: ITaskDataProvider;
        let datasetControl: ITaskGridDatasetControl;

        //registered before anything is built: a resolver runs when a service is asked for, not now, so
        //what is built in which order below stops mattering
        const services = new ServiceLocator();
        services.register('pcfContext', () => parameters.onGetPcfContext());
        services.register('localizationService', () => parameters.localizationService);
        services.register('descriptor', () => descriptor);
        services.register('gridParameters', () => descriptor.onGetGridParameters?.() ?? {});
        services.register('nativeColumns', () => ({ ...descriptor.onGetFieldMapping(), path: PATH_COLUMN_NAME }));
        services.register('savedQueryDataProvider', () => savedQueryDataProvider);
        services.register('taskDataProvider', () => taskDataProvider);
        services.register('datasetControl', () => datasetControl);

        await descriptor.onLoadDependencies?.();
        //resolved once and threaded from here: onGetModules is never called again for this instance.
        //Each builder registers what its module brings, so the services below can reach it
        const modules = descriptor.onGetModules?.(services) ?? {};
        await services.find('customColumnsDataProvider')?.refresh();

        savedQueryDataProvider = new SavedQueryDataProvider(descriptor.onCreateSavedQueryStrategy(), {
            services: services,
            preferredQuery: parameters.state.savedQuery,
        });
        await savedQueryDataProvider.refresh();

        taskDataProvider = new TaskDataProvider({
            strategy: descriptor.onCreateTaskStrategy(services),
            services: services,
            onIsFlatListEnabled: () => TaskGridDatasetControlFactory._getIsFlatlistEnabled(parameters, savedQueryDataProvider),
        });

        datasetControl = new TaskGridDatasetControl({
            dataset: new Dataset(taskDataProvider),
            state: parameters.state,
            modules: modules,
            services: services,
        });
        return datasetControl;
    }

    private static _getIsFlatlistEnabled(parameters: ITaskGridDatasetControlFactoryParameters, savedQueryDataProvider: ISavedQueryDataProvider): boolean {
        const currentQueryId = savedQueryDataProvider.getCurrentQuery().id;
        return parameters.state.savedQuery?.isFlatListEnabled ?? savedQueryDataProvider.getSavedQuery(currentQueryId).isFlatListEnabled ?? false;
    }

}