import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withOffice, withTasks } from '../examples/shared'

const TOOLBAR_CODE = `import { createRowSelectionModule, DatasetControl, TaskDatasetControl, TaskGrid, useTaskRuntime } from '@talxis/base-controls'
import { DefaultButton, Stack, Text } from '@fluentui/react'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//drawn inside the control, so useTaskRuntime() returns the runtime of this mount
const PlanToolbar = () => {
    const taskRuntime = useTaskRuntime()
    const [activity, setActivity] = React.useState('No changes yet')

    //the provider is there once onLoad has returned; its events report every change, whoever made it
    React.useEffect(() => taskRuntime.services.observe('provider', provider => {
        const removers = [
            provider.taskEvents.addEventListener('onTasksCreated', records => setActivity('Created ' + records.map(task => task.getValue('subject')).join(', '))),
            provider.taskEvents.addEventListener('onTasksDeleted', taskIds => setActivity('Deleted ' + taskIds.length + ' task(s)')),
        ]
        return () => removers.forEach(remove => remove())
    }), [taskRuntime])

    const addReview = async () => {
        const [taskId] = taskRuntime.getProvider().getSelectedRecordIds()
        //last under the selected task; resolves the task, or null when it was not created
        await taskRuntime.tasks.create(taskId, { position: 'last', data: { subject: 'Review', owner: 'Jana' } })
    }

    const markDone = async () => {
        const provider = taskRuntime.getProvider()
        const tasks = provider.getSelectedRecordIds().map(taskId => provider.getRecordsMap()[taskId])
        //your own work behind the loading overlay, its failure shown in a dialog
        await taskRuntime.execute(async () => {
            for (const task of tasks) {
                task.setValue('done', 100)
                await task.save()
            }
        }, { loading: { message: 'Marking the tasks done...' }, error: { title: 'The tasks could not be marked done.', rethrow: false } })
    }

    return <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 8 }}>
        <DefaultButton text='Add a review' onClick={addReview} />
        <DefaultButton text='Mark done' onClick={markDone} />
        <Text variant='small'>{activity}</Text>
    </Stack>
}

const GridExample = () => <TaskDatasetControl enableCreation enableDeletion onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <PlanToolbar />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const COMMANDS_CODE = `import { createRowSelectionModule, DatasetControl, IDatasetControl, ITaskRuntime, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//a ribbon command shows what it throws, and a task action has shown its failure already
const runQuietly = async (action: () => Promise<unknown>) => {
    try {
        await action()
    }
    catch { }
}

//called on every mount, before its modules load
const onSetup = (control: IDatasetControl<ITaskViewData>) => {
    //the ribbon runs this hook on every load, such as when the selection changes
    control.parts.observe('ribbon', ribbon => ribbon.hooks.commands.add(commands => {
        const taskRuntime: ITaskRuntime = control.modules.get('taskRuntime')
        const provider = taskRuntime.getProvider()
        const [taskId] = provider.getSelectedRecordIds()
        if (!taskId) {
            return
        }
        const { structure } = provider.getRecordTree()
        const { previous, next } = structure.getNeighbours(taskId)
        commands.push(
            //create resolves null instead of throwing, so it needs no runQuietly
            { id: 'insertAbove', label: 'Insert above', iconName: 'Add', onExecute: async () => { await taskRuntime.tasks.create(structure.getParent(taskId)?.getRecordId(), { position: { before: taskId } }) } },
            { id: 'moveUp', label: 'Move up', iconName: 'Up', disabled: !previous, onExecute: () => runQuietly(() => taskRuntime.tasks.move(taskId, previous!.getRecordId(), 'above')) },
            { id: 'moveDown', label: 'Move down', iconName: 'Down', disabled: !next, onExecute: () => runQuietly(() => taskRuntime.tasks.move(taskId, next!.getRecordId(), 'below')) },
        )
    }))
}

const GridExample = () => <TaskDatasetControl enableCreation onSetup={onSetup} onLoad={loadTasks} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'single' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const TASK_MODULE_CODE = `import { createTaskEditingModule, DatasetControl, IDatasetControlModule, ITaskRuntime, TASK_COMMANDS_COLUMN_KEY, TASK_GRID_PRIORITY, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//adds Duplicate to the row commands of every active task
const duplicateModule: IDatasetControlModule<'duplicate'> = {
    //unique among the control's modules; types.ts names it
    name: 'duplicate',
    //runs on every mount, before the tasks load
    onLoad: datasetControl => {
        const taskRuntime: ITaskRuntime = datasetControl.modules.get('taskRuntime')
        //the grid is a part of the control while TaskGrid is drawn; the hook goes with it
        datasetControl.parts.observe('grid', grid => grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
            const taskId = record.getRecordId()
            if (columnName !== TASK_COMMANDS_COLUMN_KEY || !taskRuntime.isCreationEnabled() || !taskRuntime.getProvider().isRecordActive(taskId)) {
                return
            }
            //after the row's +, which turns into a menu of both
            result.items.push({ key: 'duplicate', text: 'Duplicate', iconProps: { iconName: 'Copy' }, onClick: () => {
                const { structure } = taskRuntime.getProvider().getRecordTree()
                const { next } = structure.getNeighbours(taskId)
                //right after the task, under the same parent, with its values
                taskRuntime.tasks.create(structure.getParent(taskId)?.getRecordId(), {
                    position: next ? { before: next.getRecordId() } : 'last',
                    data: { subject: record.getValue('subject') + ' (copy)', owner: record.getValue('owner'), start: record.getValue('start'), due: record.getValue('due') },
                })
            } })
        }, TASK_GRID_PRIORITY.tree + 1))
    },
}

const GridExample = () => <TaskDatasetControl modules={[duplicateModule]} enableCreation enableEditing onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const TASK_MODULE_TYPES: IGridExampleFile = {
    name: 'types.ts',
    code: `//not run on this page: names the module, and what its onLoad returns, so modules.get is typed
declare module '@talxis/base-controls' {
    interface IDatasetControlModuleMap {
        duplicate: void
    }
}

export { }
`,
}

const GRID_MODULE_CODE = `import { createTaskEditingModule, DatasetControl, IGridModule, ITaskDataProvider, TASK_GRID_PRIORITY, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//each project's deadline, by the id of its top-level task
const DEADLINES: { [projectId: string]: string } = { move: '2026-03-20', party: '2026-04-08' }

//tints the due date of an active task that ends after its project's deadline
const lateDueDatesModule: IGridModule<'lateDueDates'> = {
    name: 'lateDueDates',
    onLoad: grid => {
        //in a task grid, the grid's provider is the task provider
        const provider = grid.services.get('provider') as ITaskDataProvider
        grid.services.get('cells').hooks.theme.add((builder, { record, columnName }) => {
            const taskId = record.getRecordId()
            //a project is a top-level task, the first of the task's ancestors
            const deadline = DEADLINES[provider.getRecordTree().structure.getAncestorIds(taskId)[0]]
            const due = record.getValue('due')
            if (columnName === 'due' && deadline && due && dayjs(due).isAfter(deadline, 'day') && provider.isRecordActive(taskId)) {
                builder.tint('#d13438', 'strong')
            }
        //after the task grid's own cell hooks
        }, TASK_GRID_PRIORITY.tree + 1)
    },
}

const GridExample = () => <TaskDatasetControl enableEditing onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule(), lateDueDatesModule]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const GRID_MODULE_TYPES: IGridExampleFile = {
    name: 'types.ts',
    code: `//not run on this page: names the grid module, whose onLoad returns nothing
declare module '@talxis/base-controls' {
    interface IGridModuleMap {
        lateDueDates: void
    }
}

export { }
`,
}

const GANTT_MODULE_CODE = `import { ContextualMenu } from '@fluentui/react'
import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IGanttModule, TaskGantt, createLibraryModule, useGantt, useGanttService } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

//a menu for the bar the user right-clicks, drawn over the chart
const TaskMenu = () => {
    const gantt = useGantt()
    //DHTMLX's own chart: undefined until it is drawn, and rendered again once it is
    const chart = useGanttService('chart')
    const [menu, setMenu] = React.useState<{ taskId: string, x: number, y: number }>()

    React.useEffect(() => {
        if (!chart) {
            return
        }
        const eventId = chart.attachEvent('onContextMenu', (taskId, linkId, event) => {
            if (taskId) {
                event.preventDefault()
                setMenu({ taskId: String(taskId), x: event.clientX, y: event.clientY })
            }
            return true
        })
        return () => chart.detachEvent(eventId)
    }, [chart])

    const record = menu && gantt.services.get('tasks').getRecord(menu.taskId)
    if (!menu || !record) {
        return null
    }
    return <ContextualMenu target={{ x: menu.x, y: menu.y }} onDismiss={() => setMenu(undefined)} items={[
        //the zooming service zooms to a bar, or to the day of a milestone
        { key: 'show', text: 'Show on timeline', iconProps: { iconName: 'Timeline' }, onClick: () => gantt.services.get('zooming').showTask(record) },
        //a task action through the task runtime; create resolves null instead of throwing
        { key: 'subtask', text: 'Add a subtask', iconProps: { iconName: 'Add' }, onClick: () => { gantt.getTaskRuntime().tasks.create(menu.taskId, { position: 'last' }) } },
    ]} />
}

const taskMenuModule: IGanttModule = {
    //unique among the Gantt's modules; types.ts names it
    name: 'taskMenu',
    //runs on every mount, before the chart is drawn
    onLoad: gantt => {
        //drawn over the chart from the moment the chart is drawn
        gantt.surfaces.hooks.surfaces.add(surfaces => surfaces.push({ key: 'taskMenu', onRender: () => <TaskMenu /> }))
        return {}
    },
}

const GridExample = () => <TaskDatasetControl enableCreation onLoad={loadTasks} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), taskMenuModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const GANTT_MODULE_TYPES: IGridExampleFile = {
    name: 'types.ts',
    code: `//not run on this page: names the Gantt module, and what its onLoad returns
declare module '@talxis/base-controls/gantt' {
    interface IGanttModuleMap {
        taskMenu: {}
    }
}

export { }
`,
}

export const PlanToolbarExample = () => <GridExampleRunner seedCode={withOffice(TOOLBAR_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const RibbonCommandsExample = () => <GridExampleRunner seedCode={withOffice(COMMANDS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TaskModuleExample = () => <GridExampleRunner seedCode={withOffice(TASK_MODULE_CODE, TASK_MODULE_TYPES)} tabs={TASK_EXAMPLE_TABS} />
export const GridModuleExample = () => <GridExampleRunner seedCode={withOffice(GRID_MODULE_CODE, GRID_MODULE_TYPES)} tabs={TASK_EXAMPLE_TABS} />
export const GanttModuleExample = () => <GridExampleRunner seedCode={withTasks(GANTT_MODULE_CODE, GANTT_MODULE_TYPES)} tabs={TASK_EXAMPLE_TABS} />
