import { Operators } from '@talxis/client-libraries';
import type { IRawRecord } from '@talxis/client-libraries';
import { createChecklistModule, createDependenciesModule, createFilteringModule, createLookupManyModule, createSortingModule, createTemplateModule, createUserQueryModule, MemoryChecklistStrategy, MemoryLookupManyDataProviderFactory, MemoryTaskDependencyStrategy, MemoryTaskGridDescriptor, MemoryTaskStrategy, MemoryTemplateDataProvider, MemoryUserQueryStrategy } from '@talxis/base-controls';
import type { IChecklistItem, IMemoryEntitySource, IMemoryTaskGridDescriptorInitializeResult, IMemoryTaskStrategyContext, IMemoryTemplateSource, ISavedQuery, ITaskDependency, ITaskGridFeatures, ITaskGridModules, ITaskGridServiceLocator } from '@talxis/base-controls';

/**
 * `filtering.filterOperator` has no named enum in the ComponentFramework typings — the grid reads
 * `0` as OR and `1` as AND.
 */
const FILTER_OPERATOR_AND = 1;

/** Status codes that mark a task as finished, matching the `statuscode` option set in the fixtures. */
const COMPLETED_STATUS_CODE = 5;
const CANCELLED_STATUS_CODE = 6;

const HIGH_PRIORITY = '2';
const ACTIVE_STATE_CODE = '0';

/**
 * Builds the descriptor that drives the Task Grid story.
 *
 * The fixtures are pulled in through a dynamic `import()` inside `onInitialize`, which is exactly the
 * contract a real consumer uses: dependencies resolve asynchronously while the grid shows its own
 * loading state, and the ~1300 lines of sample records stay out of the story's initial chunk.
 */
/** The features {@link createMemoryTaskGridDescriptor} knows how to register. */
export type MemoryTaskGridFeatureName = 'userQueries' | 'templates' | 'lookupMany' | 'dependencies' | 'checklist';

/** What the docs grid registers when a story does not say otherwise. */
const DEFAULT_FEATURES: MemoryTaskGridFeatureName[] = ['userQueries', 'templates', 'lookupMany', 'dependencies', 'checklist'];

/**
 * The in-memory data the module builders close over, read as it is when a module is built. Handed to a
 * story that registers its own modules, because the fixtures live in this file rather than in the snippet.
 */
export interface IMemoryModuleData {
    /** The personal views, as the last mount left them. */
    userQueries: ISavedQuery[];
    /** The template source: the template records, their columns, and the subtree each one expands into. */
    templates: IMemoryTemplateSource;
    /** The lookup-many candidate records, keyed by the column they belong to. */
    lookupSources: { [columnName: string]: IMemoryEntitySource };
    /** The dependencies between the fixture tasks. */
    dependencies: ITaskDependency[];
    /** The checklist items on the fixture tasks, keyed by task id. */
    checklist: Record<string, IChecklistItem[]>;
}

interface ICreateMemoryTaskGridDescriptorOptions {
    /**
     * Which features to register. Defaults to {@link DEFAULT_FEATURES}; pass a single name to show
     * one module in isolation.
     */
    features?: MemoryTaskGridFeatureName[];
    /**
     * Replaces the hand-written fixture records, keeping the views, columns, templates and lookup
     * sources. The dev stories use it to mount a generated dataset.
     */
    onGetRecords?: () => Promise<IRawRecord[]>;
}

export const createMemoryTaskGridDescriptor = (options?: ICreateMemoryTaskGridDescriptorOptions) => {
    //the store: seeded once, then read back from the providers as they go
    let isSeeded = false;
    let lookupSources: { [columnName: string]: IMemoryEntitySource } = {};
    let dependencies: ITaskDependency[] = [];
    let checklist: Record<string, IChecklistItem[]> = {};
    let templates: IMemoryTemplateSource;
    let userQueries: ISavedQuery[] = [];
    let records: IRawRecord[] = [];
    let metadata: IMemoryTaskGridDescriptorInitializeResult['metadata'];
    let fieldMapping: IMemoryTaskGridDescriptorInitializeResult['fieldMapping'];
    let systemQueries: ISavedQuery[] = [];
    let gridParameters: IMemoryTaskGridDescriptorInitializeResult['gridParameters'];

    const enabledFeatures = options?.features ?? DEFAULT_FEATURES;
    const isEnabled = (name: MemoryTaskGridFeatureName) => enabledFeatures.includes(name);

    const data: IMemoryModuleData = {
        get userQueries() { return userQueries; },
        get templates() { return templates; },
        get lookupSources() { return lookupSources; },
        get dependencies() { return dependencies; },
        get checklist() { return checklist; },
    };

    const modules: ITaskGridModules = {
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    };

    //a feature left out is a feature, and its UI, left out
    const features: ITaskGridFeatures = {
        userQueries: !isEnabled('userQueries') ? undefined : createUserQueryModule({
            onCreateStrategy: ({ services }) => new MemoryUserQueryStrategy({ userQueries, services }),
            enableQueryManager: true,
            enableSaveAsNewQuery: true,
            enableSaveQueryChanges: true,
        }),
        templates: !isEnabled('templates') ? undefined : createTemplateModule({
            onCreateProvider: ({ services }) => new MemoryTemplateDataProvider({ templates, services }),
        }),
        dependencies: !isEnabled('dependencies') ? undefined : createDependenciesModule({
            onCreateStrategy: ({ services }) => new MemoryTaskDependencyStrategy({ dependencies, services }),
        }),
        checklist: !isEnabled('checklist') ? undefined : createChecklistModule({
            onCreateStrategy: ({ services }) => new MemoryChecklistStrategy({ items: checklist, services }),
        }),
        lookupMany: !isEnabled('lookupMany') ? undefined : createLookupManyModule({
            createDataProvider: ({ column, services }) => {
                const source = lookupSources[column.name];
                return source && MemoryLookupManyDataProviderFactory.create({ source, services });
            },
        }),
    };

    //the task grids this store already listens to
    const keptGrids = new WeakSet<ITaskGridServiceLocator>();

    /**
     * Reads every feature back into the store when the task grid goes, which is the one place this sandbox
     * keeps anything; the tasks are read back by the strategy, since every view has its own.
     *
     * Subscribed through the locator rather than the grid's `onDestroyed` prop, because a descriptor has no
     * say over the props the example passes to `<TaskGrid />`.
     */
    const keepSession = (services: ITaskGridServiceLocator) => {
        if (keptGrids.has(services)) {
            return;
        }
        keptGrids.add(services);
        services.get('taskGrid').events.addEventListener('onDestroyed', () => {
            userQueries = services.find('userQueriesModule')?.provider.getQueries() ?? userQueries;
            dependencies = services.find('dependenciesModule')?.provider.getDependencies() ?? dependencies;
            const templateProvider = services.find('templatesModule')?.provider as MemoryTemplateDataProvider | undefined;
            templates = templateProvider?.getTemplateSource() ?? templates;
        });
    };

    //task-level options belong to the strategy, so they are passed where it is built
    const onCreateTaskStrategy = ({ services, metadata }: IMemoryTaskStrategyContext) => {
        keepSession(services);
        return new MemoryTaskStrategy({
            //seeded from what the last view ended with, not from the fixtures
            onInitialize: async provider => ({
                rawData: records,
                metadata: metadata,
                columns: provider.getColumns(),
            }),
            onDestroy: provider => records = provider.getRawData(),
            //new rows should look like a real task rather than a row of empty cells
            onGetNewTaskDefaults: () => ({
                statuscode: 1,
                priority: 1,
                percentcomplete: 0,
                actualeffort: 0,
            }),
            /**
             * The fixtures keep `statecode` and `statuscode` in sync, but only `statuscode`
             * is editable in the grid — so derive activity from it to keep styling correct
             * after an edit.
             *
             * Read through the record instance the hook is handed, and compare loosely: the dataset
             * layer normalises option-set values to strings, so the status arrives as `'5'`.
             */
            onIsRecordActive: ({ record }) => record.getValue('statuscode') != COMPLETED_STATUS_CODE
                && record.getValue('statuscode') != CANCELLED_STATUS_CODE,
            onOpenDatasetItems: async ({ entityReferences, isTaskEntity, isTaskEditingEnabled }) => {
                const target = isTaskEntity ? 'task(s)' : 'related record(s)';
                const mode = isTaskEditingEnabled ? 'edit' : 'read-only';
                //a demo has nowhere to navigate to, so surface the intent without blocking the UI
                console.info(`[TaskGrid] open ${target} in ${mode} mode:`, entityReferences.map(reference => reference.name).join(', '));
                return null;
            },
                services: services,
        });
    };

    const onInitialize = async (): Promise<IMemoryTaskGridDescriptorInitializeResult> => {
        if (!isSeeded) {
            const [
                {
                    PREDECESSORS_COL,
                    SUCCESSORS_COL,
                    PARENT_ID_COL,
                    STACK_RANK_COL,
                    STATE_CODE_COL,
                    SUBJECT_COL,
                    CHECKLIST_COL,
                    CHECKLIST_ITEMS,
                    TASK_DEPENDENCIES,
                    TASK_SOURCE,
                    TEMPLATE_SOURCE,
                    getQueryColumns,
                },
                { PEOPLE_SOURCE, TAGS_SOURCE },
            ] = await Promise.all([
                import('./memoryTaskData'),
                import('./memoryLookupManyData'),
            ]);

            //a demo without the lookupMany module has no picker for these columns, so they are not part
            //of its views - nor of what Edit columns can add back
            const getColumns = (...names: string[]) => getQueryColumns(...names)
                .filter(column => isEnabled('lookupMany') || !column.metadata?.LookupMany)
                //the same for the dependency columns: without the module they have no renderer to show
                .filter(column => isEnabled('dependencies')
                    || (column.name !== PREDECESSORS_COL && column.name !== SUCCESSORS_COL))
                //and the checklist column, which has no renderer without its module either
                .filter(column => isEnabled('checklist') || column.name !== CHECKLIST_COL);

            const allTasks: ISavedQuery = {
                id: '00000000-0000-0000-0000-000000000000',
                name: 'All Tasks',
                isFlatListEnabled: false,
                columns: getColumns('subject', 'statuscode', 'priority', 'scheduledend', 'estimatedeffort', 'percentcomplete', 'assignedto', 'tags', PREDECESSORS_COL, SUCCESSORS_COL, CHECKLIST_COL),
                quickFindColumns: [SUBJECT_COL],
            };

            const myOpenTasks: ISavedQuery = {
                id: 'uq-default-01-0000-0000-000000000000',
                name: 'My Open Tasks',
                isFlatListEnabled: false,
                columns: getColumns('subject', 'statuscode', 'priority', 'scheduledend', 'estimatedeffort', 'percentcomplete', 'assignedto', 'tags', PREDECESSORS_COL, SUCCESSORS_COL, CHECKLIST_COL),
                filtering: {
                    filterOperator: FILTER_OPERATOR_AND,
                    conditions: [{
                        attributeName: STATE_CODE_COL,
                        conditionOperator: Operators.GetValueFromName('eq'),
                        value: ACTIVE_STATE_CODE,
                    }],
                },
                quickFindColumns: [SUBJECT_COL],
            };

            const highPriority: ISavedQuery = {
                id: 'uq-default-02-0000-0000-000000000000',
                name: 'High Priority',
                isFlatListEnabled: false,
                columns: getColumns('subject', 'priority', 'scheduledend', 'estimatedeffort', 'percentcomplete', 'assignedto', 'tags', PREDECESSORS_COL, SUCCESSORS_COL, CHECKLIST_COL),
                filtering: {
                    filterOperator: FILTER_OPERATOR_AND,
                    conditions: [{
                        attributeName: 'priority',
                        conditionOperator: Operators.GetValueFromName('eq'),
                        value: HIGH_PRIORITY,
                    }],
                },
                quickFindColumns: [SUBJECT_COL],
            };

            userQueries = [myOpenTasks, highPriority];
            templates = structuredClone(TEMPLATE_SOURCE);
            dependencies = structuredClone(TASK_DEPENDENCIES);
            checklist = structuredClone(CHECKLIST_ITEMS);
            lookupSources = { assignedto: PEOPLE_SOURCE, tags: TAGS_SOURCE };
            //cloned per descriptor: sharing the module-level fixtures would let the grids on different
            //doc pages fight over one dataset. A generated dataset is already private to this call.
            records = await options?.onGetRecords?.() ?? structuredClone(TASK_SOURCE.records);
            metadata = TASK_SOURCE.metadata;
            fieldMapping = {
                subject: SUBJECT_COL,
                parentId: PARENT_ID_COL,
                stackRank: STACK_RANK_COL,
                stateCode: STATE_CODE_COL,
            };
            systemQueries = [allTasks];
            gridParameters = {
                enableTaskCreation: true,
                enableHideInactiveTasksToggle: true,
                enableShowHierarchyToggle: true,
                enableTaskEditing: true,
                enableEditColumns: true,
                enableInlineCreation: true,
                enableRowDragging: true,
                enableQuickFind: true,
                enableTaskDeletion: true,
                enableViewSwitcher: true,
            };
            isSeeded = true;
        }
        //every later call reads the current store - kept in sync by the write-backs above, not by this
        //function never running again
        return { records, metadata, fieldMapping, systemQueries, gridParameters, onCreateTaskStrategy };
    };

    const descriptor = new MemoryTaskGridDescriptor({ onInitialize });
    return { descriptor, modules, features, data };
};
