import { IPcfContext } from "@interfaces";
//types only: the map names every dependency by its contract, so registering a service can never pull an
//implementation into the bundle
import type { ILocalizationService, IServiceLocator } from "@utils";
import type { ITaskGridLabels } from "@controls/task-grid/labels";
import type { INativeColumns, ITaskGridDescriptor, ITaskGridParameters } from "@controls/task-grid/interfaces";
import type { ITaskGridRuntime } from "@controls/task-grid/runtime";
import type { IDatasetControlRuntime } from "@controls/dataset-control";
import type { ITaskDataProvider } from "@controls/task-grid/providers/task";
import type { ITaskExpansionProvider } from "@controls/task-grid/providers/expansion";
import type { ISavedQueryDataProvider } from "@controls/task-grid/providers/saved-query";
import type { IChecklistModule, ICustomColumnsModule, IDependenciesModule, IGanttModule, ILookupManyModule, IProjectModule, ITemplateModule, IUserQueryModule } from "@controls/task-grid/modules/interfaces";

/**
 * Every dependency the grid can hand out, keyed by name and typed by its contract.
 *
 * The first group is always there. The second is the modules the grid was given, each under its own
 * key — leave a module out and its key is absent, which is what `find` is for. What a module brings is
 * reached through the module itself (`find('templatesModule')?.provider`), so there is one entry per
 * feature rather than two.
 */
export interface ITaskGridServiceMap {
    /** The PCF context the grid renders in: navigation, formatting, dialogs. */
    pcfContext: IPcfContext;
    /** The task grid's settings, view actions and lifetime. */
    taskGrid: ITaskGridRuntime;
    /** The DatasetControl the task grid runs in: the provider shown, the views and the loading. */
    datasetControl: IDatasetControlRuntime;
    /** Resolves every UI label. */
    localizationService: ILocalizationService<ITaskGridLabels>;
    /** The descriptor this grid was built from. */
    descriptor: ITaskGridDescriptor;
    /** The grid's feature flags, as the descriptor resolved them. */
    gridParameters: ITaskGridParameters;
    /** The column roles the descriptor mapped, plus the grid's own path column. */
    nativeColumns: INativeColumns;
    /** The tasks of the view loaded last; replaced with every view, so reach it when used. */
    taskDataProvider: ITaskDataProvider;
    /** Which rows are expanded in the view; replaced with every view, like the task provider. */
    taskExpansion: ITaskExpansionProvider;
    /** The views the grid runs on. */
    savedQueryDataProvider: ISavedQueryDataProvider;
    /** The personal-views module, UI included. Present when it is registered. */
    userQueriesModule: IUserQueryModule;
    /** The templates module, UI included. Present when it is registered. */
    templatesModule: ITemplateModule;
    /** The custom-columns module, UI included. Present when it is registered. */
    customColumnsModule: ICustomColumnsModule;
    /** The lookup-many module. Present when it is registered. */
    lookupManyModule: ILookupManyModule;
    /** The dependencies module. Present when it is registered. */
    dependenciesModule: IDependenciesModule;
    /** The checklist module. Present when it is registered. */
    checklistModule: IChecklistModule;
    /** The Gantt module, timeline included. Present when it is registered. */
    ganttModule: IGanttModule;
    /** The project module. Present when it is registered. */
    projectModule: IProjectModule;
}

/** Where every strategy, provider and module reaches whatever the grid built. */
export interface ITaskGridServiceLocator extends IServiceLocator<ITaskGridServiceMap> {
}
