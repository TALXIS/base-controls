import { LocalizationService, ServiceLocator } from "@utils";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { ITaskDataProvider } from "@controls/task-grid/providers/task";
import { registerGanttColumns } from "./gantt-columns";
import { IGanttComponents, ITaskGridFeature } from "../interfaces";
import { GanttGrid } from "./gantt-grid";
import { GanttManager } from "./gantt-manager";
import { GanttViewState } from "./gantt-view-state";
import { IGanttFieldMapping, IGanttServiceLocator, IGanttServiceMap } from "./services";
import { getGanttCommandBarItems } from "./getGanttCommandBarItems";
import { GANTT_LABELS, IGanttLabels } from "./labels";
import { GanttComponents } from "./moduleComponents";
import { IGanttMarkersModule } from "./modules/markers";
import { IGanttSelectionBoxModule } from "./modules/selection-box";
import { IGanttTaskCreateModule } from "./modules/task-create";
import { IGanttTaskDraggingModule } from "./modules/task-dragging";
import { IGanttWeekendsModule } from "./modules/weekends";
import { IGanttTaskTooltipModule } from "./modules/task-tooltip";

/** The Gantt's own modules, one optional key per feature. Filled by that module's builder. */
export interface IGanttModules {
    /** The timeline's markers: today, the project's boundaries, and whatever a strategy returns. */
    markers?: IGanttMarkersModule;
    /** Creating a task by dragging across empty timeline space. */
    taskCreate?: IGanttTaskCreateModule;
    /** Selecting tasks by dragging a band over them. */
    selectionBox?: IGanttSelectionBoxModule;
    /** Moving a task by dragging its bar, and changing its duration by dragging the bar's ends. */
    taskDragging?: IGanttTaskDraggingModule;
    /** What a bar says when the pointer is on it. */
    taskTooltip?: IGanttTaskTooltipModule;
    /** Dropping weekends from the scale, and the toggle that puts them back. */
    weekends?: IGanttWeekendsModule;
}

/** Options for {@link createGanttModule}. */
export interface IGanttModuleOptions {
    /** The task columns the timeline draws from. See {@link IGanttFieldMapping}. */
    fieldMapping: IGanttFieldMapping;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<IGanttComponents>;
    /** Overrides for any subset of the Gantt's own strings. See {@link IGanttLabels}. */
    labels?: Partial<IGanttLabels>;
    /**
     * The Gantt's own modules, each from its `createGantt*Module` builder. Omit a key and neither that
     * feature nor its UI exists.
     *
     * Called with the Gantt's locator rather than the grid's: a module of the Gantt's extends the Gantt.
     */
    onGetModules?: (params: { services: IGanttServiceLocator }) => IGanttModules;
}

/**
 * Builds the Gantt module: you supply which columns carry the task dates, this brings the timeline
 * beside the grid, the zoom controls in the header, and the state that keeps them per view.
 *
 * Pass it as `features.gantt`. The grid registers it as `ganttModule`, and registering it is what replaces
 * the plain grid with the split view.
 *
 * @example
 * ```ts
 * features={{
 *     gantt: createGanttModule({
 *         fieldMapping: { startDate: 'scheduledstart', endDate: 'scheduledend' },
 *     }),
 * }}
 * ```
 */
export const createGanttModule = (options: IGanttModuleOptions): ITaskGridFeature => ({
    onInitialize: taskGridServices => initializeGantt(options, taskGridServices),
    onRegister: runtime => {
        new GanttGrid({ runtime, ganttServices: runtime.services.get('taskGrid').get('ganttModule').services });
    },
});

const initializeGantt = (options: IGanttModuleOptions, taskGridServices: ITaskGridServiceLocator): void => {
    const components: IGanttComponents = { ...GanttComponents, ...options.components };
    const labels = new LocalizationService<IGanttLabels>({ ...GANTT_LABELS, ...options.labels });
    //every view draws its own chart, so it gets its own locator, gone with the view's tasks
    const viewServices = new Map<ITaskDataProvider, { services: IGanttServiceLocator; destroy: () => void }>();

    const createViewServices = (provider: ITaskDataProvider): IGanttServiceLocator => {
        //what is registered here is what everything inside the module reaches, with the grid's own locator as
        //the one key that crosses over
        const services = new ServiceLocator<IGanttServiceMap>();
        services.register('taskGridServices', () => taskGridServices);
        services.register('fieldMapping', () => options.fieldMapping);
        services.register('labels', () => labels);
        services.register('components', () => components);
        const viewState = new GanttViewState({ services });
        services.register('ganttViewState', () => viewState);
        //before the manager: which modules are registered decides which chart plugins it enables
        registerGanttModules(services, options.onGetModules?.({ services }) ?? {});
        const manager = new GanttManager({ services });
        provider.addEventListener('onDestroyed', () => destroyViewServices(provider));
        viewServices.set(provider, { services, destroy: () => manager.destroy() });
        return services;
    };

    const destroyViewServices = (provider: ITaskDataProvider): void => {
        viewServices.get(provider)?.destroy();
        viewServices.delete(provider);
    };

    const getViewServices = (): IGanttServiceLocator => {
        const provider = taskGridServices.get('taskDataProvider');
        return viewServices.get(provider)?.services ?? createViewServices(provider);
    };

    //before the task grid's services go, which the charts still reach while they are torn down
    taskGridServices.get('taskGrid').events.addEventListener('onDestroyed', () => [...viewServices.keys()].forEach(destroyViewServices));

    registerGanttColumns(taskGridServices, options.fieldMapping);
    taskGridServices.register('ganttModule', () => ({
        get services() {
            return getViewServices();
        },
        onGetCommandBarItems: () => getGanttCommandBarItems({ services: getViewServices() }),
    }));
};

//registers each resolved module under its own key. A module the caller left out registers nothing, so its
//key stays absent and `find` reports the feature as off
const registerGanttModules = (services: IGanttServiceLocator, modules: IGanttModules): void => {
    const { markers, taskCreate, selectionBox, taskDragging, taskTooltip, weekends } = modules;
    markers && services.register('markersModule', () => markers);
    taskCreate && services.register('taskCreateModule', () => taskCreate);
    selectionBox && services.register('selectionBoxModule', () => selectionBox);
    taskDragging && services.register('taskDraggingModule', () => taskDragging);
    taskTooltip && services.register('taskTooltipModule', () => taskTooltip);
    weekends && services.register('weekendsModule', () => weekends);
};
