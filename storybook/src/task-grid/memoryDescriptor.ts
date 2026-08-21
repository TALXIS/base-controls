import { Operators } from '@talxis/client-libraries';
import type { IRawRecord } from '@talxis/client-libraries';
import { createGridCustomizerModule, createLookupManyModule, createTemplateModule, createUserQueryModule, MemoryLookupManyDataProviderFactory, MemoryTaskGridDescriptor, MemoryTaskStrategy, MemoryTemplateDataProvider, MemoryUserQueryStrategy } from '@talxis/base-controls';
import type { IGridCustomizerStrategy, IMemoryEntitySource, IMemoryTaskGridDescriptorInitializeResult, IMemoryTemplateSource, ISavedQuery } from '@talxis/base-controls';

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
interface ICreateMemoryTaskGridDescriptorOptions {
    /** Registered as the `gridCustomizer` module. Resolved once, on mount. */
    onCreateGridCustomizerStrategy?: () => IGridCustomizerStrategy | undefined;
    /**
     * Replaces the hand-written fixture records, keeping the views, columns, templates and lookup
     * sources. The dev stories use it to mount a generated dataset.
     */
    onGetRecords?: () => Promise<IRawRecord[]>;
}

export const createMemoryTaskGridDescriptor = (options?: ICreateMemoryTaskGridDescriptorOptions) => {
    //resolved by onInitialize and read by the feature hooks below. The grid resolves the data before it
    //builds any strategy, and holding these out here is what makes the views and templates the user
    //creates survive a remount - the hooks run again on every one of them
    let lookupSources: { [columnName: string]: IMemoryEntitySource } = {};
    let templates: IMemoryTemplateSource;
    let userQueries: ISavedQuery[] = [];
    //the task records live here between mounts: the provider owns them while a grid is up, and hands
    //them back through the strategy's onDestroy when it is torn down - which is what makes a task the
    //user created survive switching a view or applying Edit columns
    let records: IRawRecord[] = [];

    const onInitialize = async (): Promise<IMemoryTaskGridDescriptorInitializeResult> => {
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

        return {
            //cloned per descriptor: sharing the module-level fixtures would let the grids on different
            //doc pages fight over one dataset. A generated dataset is already private to this call.
            records: records = await options?.onGetRecords?.() ?? structuredClone(TASK_SOURCE.records),
            metadata: TASK_SOURCE.metadata,
            fieldMapping: {
                subject: SUBJECT_COL,
                parentId: PARENT_ID_COL,
                stackRank: STACK_RANK_COL,
                stateCode: STATE_CODE_COL,
            },
            systemQueries: [allTasks],
            gridParameters: {
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
            },
        };
    };

    return new MemoryTaskGridDescriptor({
        height: '800px',
        onInitialize,
        //features are opt-in by implementation: supplying the strategy is what turns each one on, which
        //is also what lets a consumer who does not use them tree-shake the code away
        //
        //personal views go one step further: importing createUserQueryModule is what brings the view
        //manager and the save dialogs, so a grid that never registers the module does not ship them
        modules: {
            onGetUserQueriesModule: () => createUserQueryModule({
                strategy: new MemoryUserQueryStrategy({ userQueries }),
                enableQueryManager: true,
                enableSaveAsNewQuery: true,
                enableSaveQueryChanges: true,
            }),
            onGetTemplatesModule: () => createTemplateModule({
                provider: new MemoryTemplateDataProvider({ templates }),
            }),
            onGetGridCustomizerModule: () => {
                const strategy = options?.onCreateGridCustomizerStrategy?.();
                return strategy ? createGridCustomizerModule({ strategy }) : undefined;
            },
            onGetLookupManyModule: () => createLookupManyModule({
                createDataProvider: ({ column }) => {
                    const source = lookupSources[column.name];
                    return source && MemoryLookupManyDataProviderFactory.create(source);
                },
            }),
        },
        //task-level options belong to the strategy, so they are passed where it is built
        onCreateTaskStrategy: ({ deps, metadata }) => new MemoryTaskStrategy({
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
        }, deps),
    });
};
