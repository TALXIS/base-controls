import { Operators } from '@talxis/client-libraries';
import { MemoryLookupManyDataProviderFactory, MemoryTaskGridDescriptor, MemoryTaskStrategy, MemoryTemplateDataProvider, MemoryUserQueryStrategy } from '@talxis/base-controls';
import type { IGridCustomizerStrategy, IMemoryTaskGridDescriptorParams, ISavedQuery } from '@talxis/base-controls';

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
    /** Resolved when the grid builds its customizer, i.e. on every mount. */
    onCreateGridCustomizerStrategy?: () => IGridCustomizerStrategy | undefined;
}

export const createMemoryTaskGridDescriptor = (options?: ICreateMemoryTaskGridDescriptorOptions) => new MemoryTaskGridDescriptor({
    height: '600px',
    onInitialize: async (): Promise<IMemoryTaskGridDescriptorParams> => {
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

        //resolved here rather than inside the callbacks below: those run on every remount, and the
        //views and templates the user creates live in these two - rebuilding them would wipe the lot
        const userQueries = [myOpenTasks, highPriority];
        const templates = structuredClone(TEMPLATE_SOURCE);

        return {
            //cloned per descriptor: the strategy writes into this array, so sharing the module-level
            //fixtures would let the grids on different doc pages fight over one dataset
            records: structuredClone(TASK_SOURCE.records),
            metadata: TASK_SOURCE.metadata,
            fieldMapping: {
                subject: SUBJECT_COL,
                parentId: PARENT_ID_COL,
                stackRank: STACK_RANK_COL,
                stateCode: STATE_CODE_COL,
            },
            systemQueries: [allTasks],
            //features are opt-in by implementation: supplying the strategy is what turns each one on,
            //which is also what lets a consumer who does not use them tree-shake the code away
            onCreateUserQueryStrategy: () => new MemoryUserQueryStrategy({ userQueries }),
            onCreateLookupManyDataProvider: ({ column }) => {
                const source = { assignedto: PEOPLE_SOURCE, tags: TAGS_SOURCE }[column.name];
                return source && MemoryLookupManyDataProviderFactory.create(source);
            },
            onCreateTemplateDataProvider: () => new MemoryTemplateDataProvider({ templates }),
            //task-level options belong to the strategy, so they are passed where it is built
            onCreateTaskStrategy: ({ deps, records, metadata }) => new MemoryTaskStrategy({
                onInitialize: async () => ({
                    records: records,
                    metadata: metadata,
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
                     */
                    onIsRecordActive: record => record.statuscode !== COMPLETED_STATUS_CODE
                        && record.statuscode !== CANCELLED_STATUS_CODE,
                    onOpenDatasetItems: async (entityReferences, isTaskEntity, { isTaskEditingEnabled }) => {
                        const target = isTaskEntity ? 'task(s)' : 'related record(s)';
                        const mode = isTaskEditingEnabled ? 'edit' : 'read-only';
                        //a demo has nowhere to navigate to, so surface the intent without blocking the UI
                        console.info(`[TaskGrid] open ${target} in ${mode} mode:`, entityReferences.map(reference => reference.name).join(', '));
                        return null;
                    },
                }),
            }, deps),
            gridParameters: {
                enableTaskCreation: true,
                enableHideInactiveTasksToggle: true,
                enableShowHierarchyToggle: true,
                enableNavigation: true,
                enableTaskEditing: true,
                enableEditColumns: true,
                enableInlineCreation: true,
                enableQueryManager: true,
                enableRowDragging: true,
                enableQuickFind: true,
                enableSaveAsNewQuery: true,
                enableSaveQueryChanges: true,
                enableTaskDeletion: true,
                enableViewSwitcher: true,
                enableSorting: true,
                enableFiltering: true,
            },
            onCreateGridCustomizerStrategy: options?.onCreateGridCustomizerStrategy,
        };
    },
});
