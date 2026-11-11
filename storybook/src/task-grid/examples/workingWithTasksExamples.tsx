import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice, withTasks } from './shared'

const PLAN_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

//moves tasks by dragging their rows
const controlModules = [createTaskDraggingModule()]

//Edit and Delete act on the selected rows; cells save each edit straight away
const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]

//each of these is off until you turn it on
const GridExample = () => <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={gridModules} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const NEW_TASK_CODE = `import { createTaskEditingModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//new tasks go last among their siblings; with editing, the newest opens its subject for typing
const GridExample = () => <TaskDatasetControl enableCreation enableEditing defaultCreatePosition='last' onLoad={loadTasks} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const INACTIVE_CODE = `import { createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskGridView, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

//a task whose statecode is not 0 is inactive
const VIEWS: ITaskGridView[] = [{
    id: 'open',
    name: 'Open tasks',
    resolve: provider => {
        //the condition Hide inactive tasks sets, so the view starts with it on
        provider.setFiltering({ filterOperator: Type.And.Value, filters: [], conditions: [{ attributeName: 'statecode', conditionOperator: Operators.Equal.Value, value: '0' }] })
        return { columns: [{ name: 'subject' }, { name: 'statuscode' }, { name: 'percentcomplete' }] }
    },
}]

const loadTasks = createLoadTasks(createTaskTable(), VIEWS)

const GridExample = () => <TaskDatasetControl modules={[createTaskDraggingModule()]} enableCreation enableEditing onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const KEEP_FINISHED_CODE = `import { createRowSelectionModule, DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { createTaskTable, fieldMapping, TASK_VIEWS } from './tasks'

const tasks = createTaskTable()
const COMPLETED = 5

//a completed task stays, and so do the tasks above it
class PlanStore extends MemoryTaskStore {
    public canDeleteTask(task: IRecord) {
        return Number(task.getValue('statuscode')) !== COMPLETED
    }
}

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new PlanStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping,
    views: TASK_VIEWS,
})

const GridExample = () => <TaskDatasetControl enableDeletion onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const EVENTS_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskDataProvider, ITaskRuntime, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { Stack, Text } from '@fluentui/react'
import { createLoadOffice } from './office'

const loadOffice = createLoadOffice()
const subjectOf = (record: IRecord) => record.getValue('subject')

const GridExample = () => {
    const [lines, setLines] = React.useState<string[]>([])
    const log = (line: string) => setLines(previous => [line, ...previous].slice(0, 6))

    const loadTasks = (taskRuntime: ITaskRuntime) => {
        //every mount has a new provider, and its listeners go with it
        taskRuntime.services.observe('provider', (provider: ITaskDataProvider) => {
            provider.taskEvents.addEventListener('onTasksCreated', records => log(\`onTasksCreated: \${records.map(subjectOf).join(', ')}\`))
            provider.taskEvents.addEventListener('onTasksUpdated', records => log(\`onTasksUpdated: \${records.map(subjectOf).join(', ')}\`))
            provider.taskEvents.addEventListener('onTaskMoved', ({ movingRecord, position, targetRecord }) => log(\`onTaskMoved: \${subjectOf(movingRecord)} \${position} \${subjectOf(targetRecord)}\`))
            provider.taskEvents.addEventListener('onTasksDeleted', taskIds => log(\`onTasksDeleted: \${taskIds.length} tasks\`))
        })
        return loadOffice(taskRuntime)
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <TaskDatasetControl modules={[createTaskDraggingModule()]} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='380px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Ribbon />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]} />
            </DatasetControl.Body>
        </TaskDatasetControl>
        <Stack>
            {lines.map((line, index) => <Text key={index} variant='small'>{line}</Text>)}
        </Stack>
    </Stack>
}
`

const FAILURE_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'

const tasks = createOfficeTable()

//a backend that refuses every new task
class OfflineStore extends MemoryTaskStore {
    public async createTask(): Promise<null> {
        await new Promise(resolve => setTimeout(resolve, 1000))
        throw new Error('The server is offline.')
    }
}

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new OfflineStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping: officeFieldMapping,
})

const GridExample = () => <TaskDatasetControl enableCreation onLoad={loadTasks} height='400px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const PlanTheTasksExample = () => <GridExampleRunner seedCode={withTasks(PLAN_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const NewTaskExample = () => <GridExampleRunner seedCode={withOffice(NEW_TASK_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const InactiveTasksExample = () => <GridExampleRunner seedCode={withTasks(INACTIVE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const KeepFinishedTasksExample = () => <GridExampleRunner seedCode={withTasks(KEEP_FINISHED_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TaskEventsExample = () => <GridExampleRunner seedCode={withOffice(EVENTS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const StoreFailureExample = () => <GridExampleRunner seedCode={withOffice(FAILURE_CODE)} tabs={TASK_EXAMPLE_TABS} />
