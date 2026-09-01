import { LocalizationService, ServiceLocator } from "@utils";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { IGanttComponents, IGanttModule } from "../interfaces";
import { GanttManager } from "./gantt-manager";
import { GanttViewState } from "./gantt-view-state";
import { IGanttFieldMapping, IGanttServiceLocator, IGanttServiceMap } from "./services";
import { getGanttCommandBarItems } from "./getGanttCommandBarItems";
import { GANTT_LABELS, IGanttLabels } from "./labels";
import { GanttComponents } from "./moduleComponents";
import { IGanttMarkersModule } from "./modules/markers";
import { IGanttSelectionBoxModule } from "./modules/selection-box";
import { IGanttTaskCreateModule } from "./modules/task-create";
import { IGanttTaskTooltipModule } from "./modules/task-tooltip";

/** The Gantt's own modules, one optional key per feature. Filled by that module's builder. */
export interface IGanttModules {
    /** The timeline's markers: today, the project's boundaries, and whatever a strategy returns. */
    markers?: IGanttMarkersModule;
    /** Creating a task by dragging across empty timeline space. */
    taskCreate?: IGanttTaskCreateModule;
    /** Selecting tasks by dragging a band over them. */
    selectionBox?: IGanttSelectionBoxModule;
    /** What a bar says when the pointer is on it. */
    taskTooltip?: IGanttTaskTooltipModule;
}

/** Options for {@link createGanttModule}. */
export interface IGanttModuleOptions {
    /** The task columns the timeline draws from. See {@link IGanttFieldMapping}. */
    fieldMapping: IGanttFieldMapping;
    /** The locator the builder was handed. The module builds its own over it. */
    services: ITaskGridServiceLocator;
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
 * beside the grid, the zoom and weekend controls in the header, and the state that keeps them per view.
 *
 * Assign it to a `modules` key — `modules.onGetGanttModule` on a shipped descriptor, or `onGetModules`
 * on a descriptor of your own. Registering it is what replaces the plain grid with the split view.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetGanttModule: ({ services }) => createGanttModule({
 *         fieldMapping: { startDate: 'scheduledstart', endDate: 'scheduledend' },
 *         services,
 *     }),
 * }
 * ```
 */
export const createGanttModule = (options: IGanttModuleOptions): IGanttModule => {
    //the module's own locator: what it registers here is what everything inside it reaches, with the
    //grid's own locator as the one key that crosses over
    const services = new ServiceLocator<IGanttServiceMap>();
    const components: IGanttComponents = { ...GanttComponents, ...options.components };
    const labels = new LocalizationService<IGanttLabels>({ ...GANTT_LABELS, ...options.labels });

    services.register('taskGridServices', () => options.services);
    services.register('fieldMapping', () => options.fieldMapping);
    services.register('labels', () => labels);
    services.register('components', () => components);


    //before the manager, because the columns it registers read the field mapping through it - and the
    //header reads the view state on its first render, long before there is a chart
    const viewState = new GanttViewState({ services });
    services.register('ganttViewState', () => viewState);

    //also before the manager: which modules are registered decides which chart plugins it enables
    registerGanttModules(services, options.onGetModules?.({ services }) ?? {});
    //nothing reaches the manager, so it is not a service: constructing it is the point. Its constructor
    //puts this module's columns on the views and starts waiting for a grid and a container
    new GanttManager({ services });

    return {
        services: services,
        onGetCommandBarItems: () => getGanttCommandBarItems({ services }),
    };
};

//registers each resolved module under its own key. A module the caller left out registers nothing, so its
//key stays absent and `find` reports the feature as off
const registerGanttModules = (services: IGanttServiceLocator, modules: IGanttModules): void => {
    const { markers, taskCreate, selectionBox, taskTooltip } = modules;
    markers && services.register('markersModule', () => markers);
    taskCreate && services.register('taskCreateModule', () => taskCreate);
    selectionBox && services.register('selectionBoxModule', () => selectionBox);
    taskTooltip && services.register('taskTooltipModule', () => taskTooltip);
};
