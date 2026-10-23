import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const ROOT_CODE = `const fieldMapping: IFieldMapping = {
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
    taskView('all', 'All tasks', getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete')),
]

const getParentId = (task: IRawRecord): string | undefined => task.parentid?.[0]?.id.guid

const getDepth = (task: IRawRecord): number => {
    const parentId = getParentId(task)
    const parent = parentId && TASKS.find(candidate => candidate[TASK_METADATA.PrimaryIdAttribute] === parentId)
    return parent ? getDepth(parent) + 1 : 0
}

//every task with subtasks can be the root
const ROOT_OPTIONS = [
    { key: '', text: '(no root)' },
    ...TASKS
        .filter(task => TASKS.some(child => getParentId(child) === task[TASK_METADATA.PrimaryIdAttribute]))
        .map(task => ({ key: task[TASK_METADATA.PrimaryIdAttribute], text: \`\${'\\u00a0\\u00a0\\u00a0\\u00a0'.repeat(getDepth(task))}\${task.subject}\` })),
]

const GridExample = () => {
    const [rootTaskId, setRootTaskId] = React.useState('')
    const modules = React.useMemo(() => ({
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        editing: createEditingModule({ autoSave: true }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }), [])
    const datasetControlModules = React.useMemo(() => [
        createTaskDraggingModule(),
    ], [])

    const onLoad = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
        provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, records: TASKS, metadata: TASK_METADATA, columns: TASK_COLUMNS }) }),
        fieldMapping,
        rootTaskId: rootTaskId || undefined,
    })

    return <Stack tokens={{ childrenGap: 12 }}>
        <Dropdown label='Root task' styles={{ root: { maxWidth: 360 } }} options={ROOT_OPTIONS} selectedKey={rootTaskId} onChange={(_, option) => setRootTaskId(String(option?.key ?? ''))} />
        {/* the root is read on load */}
        <TaskDatasetControl key={rootTaskId} modules={datasetControlModules} enableCreation enableEditing enableDeletion onLoadViews={async () => VIEWS} stateKey='devRootTasks' height='600px' onLoad={onLoad}>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Ribbon />
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
    </Stack>
}
`

/** The task grid scoped to a root task picked from a dropdown, over memory tasks. */
export const RootTaskGrid = () => <GridExampleRunner seedCode={ROOT_CODE} />
