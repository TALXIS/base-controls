import { Operators } from '@talxis/client-libraries';
import type { IRawRecord } from '@talxis/client-libraries';
import { createCustomColumnsModule, createGridCustomizerModule, createLookupManyModule, createTemplateModule, createUserQueryModule, MemoryLookupManyDataProviderFactory, MemoryTaskGridDescriptor, MemoryTaskStrategy, MemoryTemplateDataProvider, MemoryUserQueryStrategy } from '@talxis/base-controls';
import { MemoryCustomColumnsStrategy } from './memoryCustomColumnsStrategy';
import type { IGridCustomizerStrategy, IMemoryEntitySource, IMemoryModules, IMemoryTaskGridDescriptorInitializeResult, IMemoryTaskStrategyContext, IMemoryTemplateSource, ISavedQuery } from '@talxis/base-controls';

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
/** The feature modules {@link createMemoryTaskGridDescriptor} knows how to register. */
export type MemoryTaskGridModuleName = 'userQueries' | 'templates' | 'customColumns' | 'lookupMany';

/**
 * What the docs grid registers when a story does not say otherwise. `customColumns` is absent because
 * nothing in-memory ships with the package.
 */
const DEFAULT_MODULES: MemoryTaskGridModuleName[] = ['userQueries', 'templates', 'lookupMany'];

/**
 * The in-memory data the module builders close over. Handed to a story that registers its own modules,
 * because the fixtures live in this file rather than in the snippet.
 */
export interface IMemoryModuleData {
    /** The personal views, as the last mount left them. */
    userQueries: ISavedQuery[];
    /** The template source: the template records, their columns, and the subtree each one expands into. */
    templates: IMemoryTemplateSource;
    /** The lookup-many candidate records, keyed by the column they belong to. */
    lookupSources: { [columnName: string]: IMemoryEntitySource };
}

interface ICreateMemoryTaskGridDescriptorOptions {
    /**
     * Which feature modules to register. Defaults to {@link DEFAULT_MODULES}; pass a single name to show
     * one module in isolation. `gridCustomizer` is separate, because it needs a strategy from the story.
     */
    modules?: MemoryTaskGridModuleName[];
    /**
     * Replaces the built-in module registration outright. Called on every mount with the fixture data, so
     * a live example can define its own `modules` and have an edit take effect.
     */
    onGetModuleOverrides?: (data: IMemoryModuleData) => IMemoryModules | undefined;
    /** Registered as the `gridCustomizer` module. Resolved once, on mount. */
    onGetGridCustomizerStrategy?: () => IGridCustomizerStrategy | undefined;
    /**
     * Replaces the hand-written fixture records, keeping the views, columns, templates and lookup
     * sources. The dev stories use it to mount a generated dataset.
     */
    onGetRecords?: () => Promise<IRawRecord[]>;
}

export const createMemoryTaskGridDescriptor = (options?: ICreateMemoryTaskGridDescriptorOptions) => {
    //the store. onInitialize is called again on every remount, but the seed below only ever runs once -
    //every later call just hands back whatever is currently in these variables, kept current by the
    //write-backs next to the modules and the task strategy below (onDestroy for records, events for
    //user queries) rather than by this function never running again
    let isSeeded = false;
    let lookupSources: { [columnName: string]: IMemoryEntitySource } = {};
    let templates: IMemoryTemplateSource;
    let userQueries: ISavedQuery[] = [];
    //the task records live here between mounts: the provider owns them while a grid is up, and hands
    //them back through the strategy's onDestroy when it is torn down - which is what makes a task the
    //user created survive switching a view or applying Edit columns
    let records: IRawRecord[] = [];
    let metadata: IMemoryTaskGridDescriptorInitializeResult['metadata'];
    let fieldMapping: IMemoryTaskGridDescriptorInitializeResult['fieldMapping'];
    let systemQueries: ISavedQuery[] = [];
    let gridParameters: IMemoryTaskGridDescriptorInitializeResult['gridParameters'];

    const enabledModules = options?.modules ?? DEFAULT_MODULES;
    const isEnabled = (name: MemoryTaskGridModuleName) => enabledModules.includes(name);

    //features are opt-in by registration: returning the module is what turns each one on, and what
    //puts its UI in the bundle - a grid that never registers one does not ship it. A builder that
    //returns undefined leaves its feature off, exactly like omitting the key
    const builtInModules: IMemoryModules = {
        onGetUserQueriesModule: () => {
            if (!isEnabled('userQueries')) {
                return undefined;
            }
            const strategy = new MemoryUserQueryStrategy({ userQueries });
            const module = createUserQueryModule({
                strategy,
                enableQueryManager: true,
                enableSaveAsNewQuery: true,
                enableSaveQueryChanges: true,
            });
            //write the strategy's current state back into the store on every mutation, instead of
            //relying on it mutating the array we handed it - an explicit contract survives the
            //strategy changing how it stores things internally; a shared reference would not
            const syncStore = async () => { userQueries = await strategy.onGetUserQueries(); };
            module.provider.events.addEventListener('onAfterUserQueryCreated', syncStore);
            module.provider.events.addEventListener('onAfterUserQueryUpdated', syncStore);
            module.provider.events.addEventListener('onAfterUserQueriesDeleted', syncStore);
            return module;
        },
        onGetTemplatesModule: context => {
            if (!isEnabled('templates')) {
                return undefined;
            }
            const provider = new MemoryTemplateDataProvider({ templates, onGetTaskDataProvider: context.onGetTaskDataProvider });
            //the provider keeps its own copy and writes into nothing it was handed, so the store is
            //updated from out here whenever it reports a capture - the same contract the user queries
            //above live with
            provider.templateEvents.addEventListener('onAfterTemplateCreated', () => { templates = provider.getTemplateSource(); });
            return createTemplateModule({ provider });
        },
        onGetCustomColumnsModule: () => !isEnabled('customColumns') ? undefined : createCustomColumnsModule({
            strategy: new MemoryCustomColumnsStrategy(),
            enableCustomColumnCreation: true,
            enableCustomColumnEditing: true,
            enableCustomColumnDeletion: true,
        }),
        onGetGridCustomizerModule: () => {
            const strategy = options?.onGetGridCustomizerStrategy?.();
            return strategy ? createGridCustomizerModule({ strategy }) : undefined;
        },
        onGetLookupManyModule: () => !isEnabled('lookupMany') ? undefined : createLookupManyModule({
            createDataProvider: ({ column }) => {
                const source = lookupSources[column.name];
                return source && MemoryLookupManyDataProviderFactory.create(source);
            },
        }),
    };

    //an example that defines its own modules wins outright; otherwise the built-in set above
    const buildModules = (): IMemoryModules => options?.onGetModuleOverrides?.({ userQueries, templates, lookupSources })
        ?? builtInModules;

    //task-level options belong to the strategy, so they are passed where it is built
    const onCreateTaskStrategy = ({ deps, metadata }: IMemoryTaskStrategyContext) => new MemoryTaskStrategy({
        //seeded from what the last mount ended with, not from the fixtures
        onInitialize: async provider => ({
            rawData: records,
            metadata: metadata,
            columns: provider.getColumns(),
        }),
        onDestroy: params => records = params.rawData,
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
    }, deps);

    const onInitialize = async (): Promise<IMemoryTaskGridDescriptorInitializeResult> => {
        if (!isSeeded) {
            const [
                {
                    PARENT_ID_COL,
                    STACK_RANK_COL,
                    STATE_CODE_COL,
                    SUBJECT_COL,
                    TASK_SOURCE,
                    TEMPLATE_SOURCE,
                    getQueryColumns,
                },
                { PEOPLE_SOURCE, TAGS_SOURCE },
            ] = await Promise.all([
                import('./memoryTaskData'),
                import('./memoryLookupManyData'),
            ]);

            const allTasks: ISavedQuery = {
                id: '00000000-0000-0000-0000-000000000000',
                name: 'All Tasks',
                isFlatListEnabled: false,
                columns: getQueryColumns('subject', 'statuscode', 'priority', 'scheduledend', 'estimatedeffort', 'percentcomplete', 'assignedto', 'tags'),
                quickFindColumns: [SUBJECT_COL],
            };

            const myOpenTasks: ISavedQuery = {
                id: 'uq-default-01-0000-0000-000000000000',
                name: 'My Open Tasks',
                isFlatListEnabled: false,
                columns: getQueryColumns('subject', 'statuscode', 'priority', 'scheduledend', 'estimatedeffort', 'percentcomplete', 'assignedto', 'tags'),
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
                columns: getQueryColumns('subject', 'priority', 'scheduledend', 'estimatedeffort', 'percentcomplete', 'assignedto', 'tags'),
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
                enableNavigation: true,
                enableTaskEditing: true,
                enableEditColumns: true,
                enableInlineCreation: true,
                enableRowDragging: true,
                enableQuickFind: true,
                enableTaskDeletion: true,
                enableViewSwitcher: true,
                enableSorting: true,
                enableFiltering: true,
            };
            isSeeded = true;
        }
        //every later call reads the current store - kept in sync by the write-backs above, not by this
        //function never running again. The strategy and the modules are part of what it resolves, so
        //they always see the data this call just returned
        return { records, metadata, fieldMapping, systemQueries, gridParameters, modules: buildModules(), onCreateTaskStrategy };
    };

    return new MemoryTaskGridDescriptor({
        height: '800px',
        onInitialize,
    });
};
