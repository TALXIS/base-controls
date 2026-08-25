import { Dataset } from "@talxis/client-libraries";
import { ITaskDataProvider, TaskDataProvider } from "./providers/task";
import { ILocalizationService } from "@utils";
import { ITaskGridLabels } from "./labels";
import { ISavedQuery, ISavedQueryDataProvider, PATH_COLUMN_NAME, SavedQueryDataProvider } from "./providers/saved-query";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { TaskGridDatasetControl } from "./TaskGridDatasetControl";
import { ITaskGridServiceLocator, ServiceLocator } from "./services";
import { ITaskGridModules } from "./modules/interfaces";

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
        //resolved once: onGetModules is never called again for this instance. Registering from what it
        //returned keeps the modules and the pieces they bring reachable from one place
        const modules = descriptor.onGetModules?.(services) ?? {};
        TaskGridDatasetControlFactory._registerModules(services, modules);
        await services.find('customColumnsModule')?.provider.refresh();

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
            services: services,
        });
        //awaited here rather than left to the component: what loads after it needs the tasks that came
        //back, and the grid's own skeleton already covers everything this method awaits. After the
        //control, never before it - its constructor is what puts the view's columns, filtering and
        //sorting on the provider, and the task strategy reads them as it loads
        await datasetControl.getDataset().refresh();
        await services.find('dependenciesModule')?.provider.refresh(
            taskDataProvider.getAllRecords().map(record => record.getRecordId()),
        );
        return datasetControl;
    }

    /**
     * Registers each resolved module under its own key. A module the descriptor left out registers
     * nothing, so its key stays absent and `find` reports the feature as off.
     */
    private static _registerModules(services: ITaskGridServiceLocator, modules: ITaskGridModules): void {
        const { userQueries, templates, customColumns, gridCustomizer, lookupMany, dependencies } = modules;
        userQueries && services.register('userQueriesModule', () => userQueries);
        templates && services.register('templatesModule', () => templates);
        customColumns && services.register('customColumnsModule', () => customColumns);
        gridCustomizer && services.register('gridCustomizerModule', () => gridCustomizer);
        lookupMany && services.register('lookupManyModule', () => lookupMany);
        dependencies && services.register('dependenciesModule', () => dependencies);
    }

    private static _getIsFlatlistEnabled(parameters: ITaskGridDatasetControlFactoryParameters, savedQueryDataProvider: ISavedQueryDataProvider): boolean {
        const currentQueryId = savedQueryDataProvider.getCurrentQuery().id;
        return parameters.state.savedQuery?.isFlatListEnabled ?? savedQueryDataProvider.getSavedQuery(currentQueryId).isFlatListEnabled ?? false;
    }

}