import { Dataset } from "@talxis/client-libraries";
import { GridCustomizer } from "./components/grid/grid-customizer/GridCustomizer";
import { TaskDataProvider } from "./providers/task";
import { ILocalizationService } from "@utils";
import { ITaskGridLabels } from "./labels";
import { ISavedQueryDataProvider, PATH_COLUMN_NAME, SavedQueryDataProvider } from "./providers/saved-query";
import { ITaskGridState, TaskGridState } from "./providers/state";
import { ITaskGridDatasetControl, ITaskGridDescriptor } from "./interfaces";
import { TaskGridDatasetControl } from "./TaskGridDatasetControl";
import { ITaskGridServiceLocator, ITaskGridServiceMap, ServiceLocator } from "./services";
import { ITaskGridModules } from "./modules/interfaces";

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


        const services = new ServiceLocator<ITaskGridServiceMap>();
        //first: it is what everything below reads the view to open on from, and what a module's slice is
        //reached through
        const taskGridState = new TaskGridState({ state: parameters.state });
        services.register('taskGridState', () => taskGridState);
        services.register('pcfContext', () => parameters.onGetPcfContext());
        services.register('localizationService', () => parameters.localizationService);
        services.register('descriptor', () => descriptor);

        await descriptor.onLoadDependencies?.();
        //both read what onLoadDependencies resolved, so they follow it rather than the block above
        services.register('gridParameters', () => descriptor.onGetGridParameters?.() ?? {});
        services.register('nativeColumns', () => ({ ...descriptor.onGetFieldMapping(), path: PATH_COLUMN_NAME }));

        //before the modules rather than with the grid: it resolves everything on demand, so it can exist
        //before any of it does - and a module's strategy is built below, which is what needs it there
        const gridCustomizer = new GridCustomizer({ services });
        services.register('gridCustomizer', () => gridCustomizer);

        //resolved once: onGetModules is never called again for this instance. Registering from what it
        //returned keeps the modules and the pieces they bring reachable from one place
        const modules = descriptor.onGetModules?.({ services }) ?? {};
        TaskGridDatasetControlFactory._registerModules(services, modules);
        await services.find('customColumnsModule')?.provider.refresh();

        const savedQueryDataProvider = new SavedQueryDataProvider({
            strategy: descriptor.onCreateSavedQueryStrategy({ services }),
            services: services,
        });
        //before the refresh, so anything the load reaches for can already resolve it
        services.register('savedQueryDataProvider', () => savedQueryDataProvider);
        await savedQueryDataProvider.refresh();

        const taskDataProvider = new TaskDataProvider({
            strategy: descriptor.onCreateTaskStrategy({ services }),
            services: services,
            onIsFlatListEnabled: () => TaskGridDatasetControlFactory._getIsFlatlistEnabled(taskGridState, savedQueryDataProvider),
        });
        services.register('taskDataProvider', () => taskDataProvider);

        const datasetControl = new TaskGridDatasetControl({
            dataset: new Dataset(taskDataProvider),
            state: parameters.state,
            services: services,
        });
        services.register('datasetControl', () => datasetControl);
        await services.find('projectModule')?.provider.refresh();
        await datasetControl.getDataset().refresh();
        const loadedTaskIds = taskDataProvider.getAllRecords().map(record => record.getRecordId());
        await services.find('dependenciesModule')?.provider.refresh(loadedTaskIds);
        await services.find('checklistModule')?.provider.refresh(loadedTaskIds);
        return datasetControl;
    }

    //registers each resolved module under its own key. A module the descriptor left out registers nothing, so its key
    //stays absent and `find` reports the feature as off.
    private static _registerModules(services: ITaskGridServiceLocator, modules: ITaskGridModules): void {
        const { userQueries, templates, customColumns, gridCustomizer, lookupMany, dependencies, checklist, gantt, project } = modules;
        userQueries && services.register('userQueriesModule', () => userQueries);
        templates && services.register('templatesModule', () => templates);
        customColumns && services.register('customColumnsModule', () => customColumns);
        gridCustomizer && services.register('gridCustomizerModule', () => gridCustomizer);
        lookupMany && services.register('lookupManyModule', () => lookupMany);
        dependencies && services.register('dependenciesModule', () => dependencies);
        checklist && services.register('checklistModule', () => checklist);
        project && services.register('projectModule', () => project);
        gantt && services.register('ganttModule', () => gantt);
    }

    //the state first, then the view: the state carries what the user last toggled in this session, and the
    //view only says what it was saved with. Everything else reads this through `taskDataProvider`
    private static _getIsFlatlistEnabled(taskGridState: TaskGridState, savedQueryDataProvider: ISavedQueryDataProvider): boolean {
        const currentQueryId = savedQueryDataProvider.getCurrentQuery().id;
        return taskGridState.getView()?.isFlatListEnabled ?? savedQueryDataProvider.getSavedQuery(currentQueryId).isFlatListEnabled ?? false;
    }

}