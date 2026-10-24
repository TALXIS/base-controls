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

//the control sets a view's columns; the task grid sets up the rest from its data
const taskView = (id: string, name: string, columns: IColumn[], data: ITaskViewData = {}): IDatasetControlView<ITaskViewData> => ({ id, name, resolve: () => ({ columns, data }) })

const VIEWS: IDatasetControlView<ITaskViewData>[] = [
    taskView('all', 'All tasks', getTaskColumns('subject', 'description', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete').concat(LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, DEPENDENCY_COLUMNS)),
    taskView('planning', 'Planning', getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'estimatedeffort', 'actualeffort'), { sorting: [{ name: 'scheduledstart', sortDirection: 0 }] }),
    taskView('flat', 'Every task on its own', getTaskColumns('subject', 'statuscode').concat(LOOKUP_MANY_VIEW_COLUMNS.filter(column => column.name === 'assignedto')), { isFlatList: true, quickFindColumns: ['subject', 'description'] }),
]

//pale red at 0%, pale amber halfway, pale green when done
const PROGRESS_STOPS = [{ at: 0, color: [253, 231, 233] }, { at: 50, color: [255, 244, 206] }, { at: 100, color: [223, 246, 221] }]

const getProgressColor = (percent: number): string => {
    const clamped = Math.min(100, Math.max(0, percent))
    const upper = PROGRESS_STOPS.findIndex(stop => stop.at >= clamped)
    const from = PROGRESS_STOPS[Math.max(0, upper - 1)]
    const to = PROGRESS_STOPS[upper]
    const ratio = to.at === from.at ? 0 : (clamped - from.at) / (to.at - from.at)
    return '#' + from.color.map((channel, index) => Math.round(channel + (to.color[index] - channel) * ratio).toString(16).padStart(2, '0')).join('')
}

const progressThemeModule: IGridModule = {
    onRegister: grid => {
        grid.services.get('cells').registerCellTheme((theme, { record }) => {
            const percent = record.getValue('percentcomplete')
            if (percent != null) {
                theme.colors.background = getProgressColor(Number(percent))
            }
        })
    },
}

const GridExample = () => {
    const modules = React.useMemo(() => ({
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        editing: createEditingModule({ autoSave: true }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
        custom: [progressThemeModule],
    }), [])
    const datasetControlModules = React.useMemo(() => [
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'devTasks.userViews', onGetViewData: datasetControl => datasetControl.parts.get('taskRuntime').getCurrentViewData() }),
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
        createTaskDraggingModule(),
        createIndexedDbCustomColumnsModule({
            databaseName: 'devTasks.customColumns',
            columns: [{ displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }],
            enableCreation: true,
            enableDeletion: true,
        }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: LOOKUP_MANY_VALUES }),
        createMemoryTemplatesModule({ templates: TEMPLATES }),
        createMemoryChecklistModule({ items: CHECKLIST_ITEMS }),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    ], [])

    const onLoad = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({ provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, records: TASKS, metadata: TASK_METADATA, columns: TASK_COLUMNS }) }), fieldMapping })

    return <TaskDatasetControl modules={datasetControlModules} enableCreation enableEditing enableDeletion onLoadViews={async () => VIEWS} stateKey='devTasks' height='100%' onLoad={onLoad}>
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
