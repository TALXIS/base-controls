import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'

const TASK_MODULE_CODE = `import { createTaskEditingModule, DatasetControl, IDatasetControlModule, ITaskRuntime, TASK_COMMANDS_COLUMN_KEY, TASK_GRID_PRIORITY, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//new: a task module that offers Duplicate beside the + of every active task
const duplicateModule: IDatasetControlModule<'duplicate'> = {
    //new: unique among the control's modules; types.ts names it
    name: 'duplicate',
    //new: runs on every mount, before the tasks load
    onLoad: datasetControl => {
        const taskRuntime: ITaskRuntime = datasetControl.modules.get('taskRuntime')
        //new: the grid is a part of the control while TaskGrid is drawn, and the hook goes with it
        datasetControl.parts.observe('grid', grid => grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
            const taskId = record.getRecordId()
            if (columnName !== TASK_COMMANDS_COLUMN_KEY || !taskRuntime.isCreationEnabled() || !taskRuntime.getProvider().isRecordActive(taskId)) {
                return
            }
            //new: after the row's +, which turns the two into a menu
            result.items.push({ key: 'duplicate', text: 'Duplicate', iconProps: { iconName: 'Copy' }, onClick: () => {
                const { structure } = taskRuntime.getProvider().getRecordTree()
                const { next } = structure.getNeighbours(taskId)
                //new: right after the task, under the same parent, with its dates and effort
                taskRuntime.tasks.create(structure.getParent(taskId)?.getRecordId(), {
                    position: next ? { before: next.getRecordId() } : 'last',
                    data: { subject: record.getValue('subject') + ' (copy)', start: record.getValue('start'), due: record.getValue('due'), effort: record.getValue('effort') },
                })
            } })
        }, TASK_GRID_PRIORITY.tree + 1))
    },
}

const GridExample = () => <TaskDatasetControl modules={[duplicateModule]} onLoad={loadTasks} enableCreation enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const TASK_MODULE_TYPES: IGridExampleFile = {
    name: 'types.ts',
    code: `//not run on this page: names the module and what its onLoad returns, so modules.get is typed
declare module '@talxis/base-controls' {
    interface IDatasetControlModuleMap {
        duplicate: void
    }
}

export { }
`,
}

const GRID_MODULE_CODE = `import { createTaskEditingModule, DatasetControl, IGridModule, ITaskDataProvider, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//new: the old lease runs out on 27 March, so the move has to be done by then
const MOVE_DEADLINE = '2026-03-27'

//new: a grid module that turns the due date red on any task of the move that ends later
const lateDueDatesModule: IGridModule<'lateDueDates'> = {
    name: 'lateDueDates',
    onLoad: grid => {
        //new: in a task grid, the grid's provider is the task provider
        const provider = grid.services.get('provider') as ITaskDataProvider
        grid.services.get('cells').hooks.theme.add((builder, { record, columnName }) => {
            //new: the ids from the top-level task down to the task itself
            const isInMove = provider.getRecordTree().structure.getAncestorIds(record.getRecordId()).includes('move')
            if (columnName === 'due' && isInMove && dayjs(record.getValue('due')).isAfter(MOVE_DEADLINE, 'day')) {
                builder.tint('#d13438', 'strong')
            }
        })
    },
}

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='480px'>
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
import { createTaskEditingModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLibraryModule, IGanttModule, TaskGantt, useGantt, useGanttService } from '@talxis/base-controls/gantt'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//new: a menu for the bar the user right-clicks, drawn over the chart
const TaskMenu = () => {
    const gantt = useGantt()
    //new: DHTMLX's own chart, undefined until it is drawn
    const chart = useGanttService('chart')
    const [menu, setMenu] = React.useState<{ taskId: string, x: number, y: number }>()

    React.useEffect(() => {
        if (!chart) {
            return
        }
        const eventId = chart.attachEvent('onContextMenu', (taskId, linkId, event) => {
            if (taskId) {
                event.preventDefault()
                //new: DHTMLX types the event as a plain Event
                const { clientX, clientY } = event as MouseEvent
                setMenu({ taskId: String(taskId), x: clientX, y: clientY })
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
        //new: the zooming service zooms the timeline to the task's bar
        { key: 'show', text: 'Show on timeline', iconProps: { iconName: 'Timeline' }, onClick: () => gantt.services.get('zooming').showTask(record) },
        //new: a task action through the task runtime, as the row's + does
        { key: 'subtask', text: 'Add a subtask', iconProps: { iconName: 'Add' }, onClick: () => { gantt.getTaskRuntime().tasks.create(menu.taskId, { position: 'last' }) } },
    ]} />
}

const taskMenuModule: IGanttModule<'taskMenu'> = {
    //new: unique among the Gantt's modules; types.ts names it
    name: 'taskMenu',
    //new: runs on every mount, before the chart is drawn
    onLoad: gantt => {
        //new: drawn over the chart from the moment the chart is drawn
        gantt.surfaces.hooks.surfaces.add(surfaces => surfaces.push({ key: 'taskMenu', onRender: () => <TaskMenu /> }))
    },
}

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableCreation enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), taskMenuModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const GANTT_MODULE_TYPES: IGridExampleFile = {
    name: 'types.ts',
    code: `//not run on this page: names the Gantt module, whose onLoad returns nothing
declare module '@talxis/base-controls/gantt' {
    interface IGanttModuleMap {
        taskMenu: void
    }
}

export { }
`,
}

export const TaskModuleExample = () => <GridExampleRunner seedCode={withOffice(TASK_MODULE_CODE, TASK_MODULE_TYPES)} tabs={TASK_EXAMPLE_TABS} />
export const GridModuleExample = () => <GridExampleRunner seedCode={withOffice(GRID_MODULE_CODE, GRID_MODULE_TYPES)} tabs={TASK_EXAMPLE_TABS} />
export const GanttModuleExample = () => <GridExampleRunner seedCode={withOffice(GANTT_MODULE_CODE, GANTT_MODULE_TYPES)} tabs={TASK_EXAMPLE_TABS} />
