import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const GANTT_CODE = `const fieldMapping: IFieldMapping = {
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
    taskView('all', 'All tasks', getTaskColumns('subject', 'description', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete').concat(LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, DEPENDENCY_COLUMNS), { quickFindColumns: ['subject', 'assignedto', 'tags', 'teams'] }),
    taskView('planning', 'Planning', getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'estimatedeffort', 'actualeffort'), { sorting: [{ name: 'scheduledstart', sortDirection: 0 }] }),
    taskView('flat', 'Every task on its own', getTaskColumns('subject', 'statuscode').concat(LOOKUP_MANY_VIEW_COLUMNS.filter(column => column.name === 'assignedto')), { isFlatList: true, quickFindColumns: ['subject', 'description', 'assignedto'] }),
]

const GridExample = () => {
    const modules = React.useMemo(() => ({
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        editing: createEditingModule({ autoSave: true }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }), [])
    const datasetControlModules = React.useMemo(() => [
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'devGanttTasks.userViews', onGetViewData: datasetControl => datasetControl.parts.get('taskRuntime').getCurrentViewData() }),
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
        createTaskDraggingModule(),
        createIndexedDbCustomColumnsModule({
            databaseName: 'devGanttTasks.customColumns',
            columns: [{ displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }],
            enableCreation: true,
            enableDeletion: true,
        }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: LOOKUP_MANY_VALUES }),
        createMemoryTemplatesModule({ templates: TEMPLATES }),
        createMemoryChecklistModule({ items: CHECKLIST_ITEMS }),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    ], [])
    const ganttModules = React.useMemo(() => [
        createMemoryGanttMarkersModule({ markers: [{ id: 'betaCutoff', text: 'Beta cutoff', date: dayjs('2025-12-01'), color: '#8764b8', isMilestone: true }] }),
        createGanttWeekendsModule(),
        createGanttTaskDraggingModule(),
        createGanttTaskCreateModule(),
        createGanttSelectionModule(),
        createGanttTooltipModule({
            statusColumnName: 'statuscode',
            onRender: () => <TaskTooltip>
                <TaskTooltip.Callout>
                    <TaskTooltip.Header />
                    <TaskTooltip.ProgressRow />
                    <TaskTooltip.FieldRows>
                        <TaskTooltip.FieldRow columnName='assignedto' />
                        <TaskTooltip.FieldRow columnName='priority' />
                    </TaskTooltip.FieldRows>
                    <TaskTooltip.DateRangeRow />
                </TaskTooltip.Callout>
            </TaskTooltip>,
        }),
        createGanttLinksModule(),
    ], [])

    const onLoad = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({ provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, records: TASKS, metadata: TASK_METADATA, columns: TASK_COLUMNS }) }), fieldMapping })

    return <TaskDatasetControl modules={datasetControlModules} enableCreation enableEditing enableDeletion onLoadViews={async () => VIEWS} stateKey='devGanttTasks' height='100%' onLoad={onLoad}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
                <TaskGantt.ZoomSlider />
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
            <TaskGantt.Split stateKey='ganttSplit'>
                <TaskGrid stateKey='taskGrid' modules={modules} />
                <TaskGantt stateKey='gantt' modules={ganttModules} />
            </TaskGantt.Split>
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <TaskDatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </TaskDatasetControl>
}
`

/** The task grid with the Gantt beside it, over memory tasks. */
export const GanttTaskGrid = () => <GridExampleRunner seedCode={GANTT_CODE} />
