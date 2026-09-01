//types only: the map names every dependency by its contract, so registering a service can never pull an
//implementation into the bundle
import type { ILocalizationService, IServiceLocator } from "@utils";
import type { ITaskGridLabels } from "@components/TaskGrid/labels";
import type { INativeColumns, ITaskGridDatasetControl, ITaskGridDescriptor, ITaskGridParameters } from "@components/TaskGrid/interfaces";
import type { ITaskDataProvider } from "@components/TaskGrid/providers/task";
import type { ISavedQueryDataProvider } from "@components/TaskGrid/providers/saved-query";
import type { IChecklistModule, ICustomColumnsModule, IDependenciesModule, IGanttModule, IGridCustomizerModule, ILookupManyModule, IProjectModule, ITemplateModule, IUserQueryModule } from "@components/TaskGrid/modules/interfaces";
import type { GridApi, IGridCustomizer } from "@components/TaskGrid/components/grid/grid-customizer/GridCustomizer";
import type { ITaskGridComponents } from "@components/TaskGrid/components/components";

/**
 * Every dependency the grid can hand out, keyed by name and typed by its contract.
 *
 * The first group is always there. The second is the modules the descriptor resolved, each under its own
 * key — leave a module out and its key is absent, which is what `find` is for. What a module brings is
 * reached through the module itself (`find('templatesModule')?.provider`), so there is one entry per
 * feature rather than two.
 */
export interface ITaskGridServiceMap {
    /** The PCF context the grid renders in: navigation, formatting, dialogs. */
    pcfContext: ComponentFramework.Context<any>;
    /** Resolves every UI label. */
    localizationService: ILocalizationService<ITaskGridLabels>;
    /** The descriptor this grid was built from. */
    descriptor: ITaskGridDescriptor;
    /** The grid's feature flags, as the descriptor resolved them. */
    gridParameters: ITaskGridParameters;
    /** The column roles the descriptor mapped, plus the grid's own path column. */
    nativeColumns: INativeColumns;
    /** The control instance backing the current mount. */
    datasetControl: ITaskGridDatasetControl;
    /** The replaceable parts of the grid's UI, as the caller's `components` prop resolved them. */
    components: ITaskGridComponents;
    /**
     * The grid's own AG Grid configuration: column definitions, row class rules, cell components.
     * Registered with the modules, so it is there before the grid is.
     */
    gridCustomizer: IGridCustomizer;
    /**
     * The raw AG Grid api. Registered the moment AG Grid hands one over, which is after everything else —
     * so wait for it with `whenAvailable` rather than resolving it in a constructor.
     */
    gridApi: GridApi;
    /** The grid's data layer: the tasks, the hierarchy, and every task operation. */
    taskDataProvider: ITaskDataProvider;
    /** The views the grid runs on. */
    savedQueryDataProvider: ISavedQueryDataProvider;
    /** The personal-views module, UI included. Present when it is registered. */
    userQueriesModule: IUserQueryModule;
    /** The templates module, UI included. Present when it is registered. */
    templatesModule: ITemplateModule;
    /** The custom-columns module, UI included. Present when it is registered. */
    customColumnsModule: ICustomColumnsModule;
    /** The grid-customizer module. Present when it is registered. */
    gridCustomizerModule: IGridCustomizerModule;
    /** The lookup-many module. Present when it is registered. */
    lookupManyModule: ILookupManyModule;
    /** The dependencies module, cell renderer included. Present when it is registered. */
    dependenciesModule: IDependenciesModule;
    /** The checklist module, cell renderer included. Present when it is registered. */
    checklistModule: IChecklistModule;
    /** The Gantt module, timeline included. Present when it is registered. */
    ganttModule: IGanttModule;
    /** The project module. Present when it is registered. */
    projectModule: IProjectModule;
}

/** Where every strategy, provider and module reaches whatever the grid built. */
export interface ITaskGridServiceLocator extends IServiceLocator<ITaskGridServiceMap> {
}
