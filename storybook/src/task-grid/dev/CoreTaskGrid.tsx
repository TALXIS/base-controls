import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const CORE_CODE = `const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'scheduledstart',
    endDate: 'scheduledend',
    percentComplete: 'percentcomplete',
}

//the task grid reads isFlatList from a view's data
const taskView = (id: string, name: string, columns: IColumn[], data: ITaskViewData = {}, onResolve?: (provider: ITaskDataProvider) => void): ITaskGridView => ({
    id,
    name,
    resolve: provider => {
        onResolve?.(provider)
        return { columns, data }
    },
})

const VIEWS: ITaskGridView[] = [
    taskView('all', 'All tasks', getTaskColumns('subject', 'description', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete').concat(LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, DEPENDENCY_COLUMNS), {}, provider => provider.setQuickFindColumns(['subject', 'assignedto', 'tags', 'teams'])),
    taskView('planning', 'Planning', getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'estimatedeffort', 'actualeffort'), {}, provider => provider.setSorting([{ name: 'scheduledstart', sortDirection: 0 }])),
    taskView('flat', 'Every task on its own', getTaskColumns('subject', 'statuscode').concat(LOOKUP_MANY_VIEW_COLUMNS.filter(column => column.name === 'assignedto')), { isFlatList: true }, provider => provider.setQuickFindColumns(['subject', 'description', 'assignedto'])),
]

const GridExample = () => {
    const database = React.useMemo(() => new MemoryTaskDatabase({ records: TASKS, metadata: TASK_METADATA }), [])
    const modules = React.useMemo(() => [
        createRowSelectionModule({ mode: 'multiple' }),
        createTaskEditingModule(),
        createSortingModule(),
        createFilteringModule(),
    ], [])
    const datasetControlModules = React.useMemo(() => [
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'devTasks.userViews' }),
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
        createTaskDraggingModule(),
        createIndexedDbCustomColumnsModule({
            databaseName: 'devTasks.customColumns',
            columns: [{ displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }],
            enableCreation: true,
            enableDeletion: true,
        }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: LOOKUP_MANY_VALUES }),
        createMemoryTemplatesModule({ database, templates: TEMPLATES }),
        createMemoryTaskChecklistModule({ items: CHECKLIST_ITEMS }),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    ], [database])

    const onLoad = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => {
        return { store: new MemoryTaskStore({ taskRuntime, database, columns: TASK_COLUMNS }), fieldMapping, views: VIEWS }
    }

    return <TaskDatasetControl modules={datasetControlModules} enableCreation enableEditing enableDeletion stateKey='devTasks' height='100%' onLoad={onLoad}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Ribbon />
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Notifications />
        <DatasetControl.Body>
            <TaskGrid stateKey='taskGrid' modules={modules} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <TaskDatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </TaskDatasetControl>
}
`

/** Phase 1 of the task grid, as the code a consumer writes, over memory tasks. */
export const CoreTaskGrid = () => <GridExampleRunner seedCode={CORE_CODE} />
