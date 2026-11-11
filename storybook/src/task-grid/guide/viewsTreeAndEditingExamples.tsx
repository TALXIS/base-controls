import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withTasks } from '../examples/shared'

const VIEWS_CODE = `import { createFilteringModule, createSortingModule, DatasetControl, ITaskGridView, PATH_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

//a view lists the columns it shows; the mapped columns load anyway
const COLUMNS = [{ name: 'subject' }, { name: 'statuscode' }, { name: 'priority' }, { name: 'scheduledstart' }, { name: 'scheduledend' }]

//each view sets the task provider up as it opens
const VIEWS: ITaskGridView[] = [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'planning',
        name: 'Planning',
        resolve: provider => {
            //orders the subtasks under each parent
            provider.setSorting([{ name: 'scheduledstart', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
    {
        id: 'design',
        name: 'Design work',
        resolve: provider => {
            //searches the subject; the matches keep their ancestors, in italics
            provider.setSearchQuery('design')
            return { columns: COLUMNS }
        },
    },
    {
        id: 'open',
        name: 'Open tasks',
        resolve: provider => {
            //the condition Hide inactive tasks sets, so the view starts with it on
            provider.setFiltering({ filterOperator: Type.And.Value, filters: [], conditions: [{ attributeName: 'statecode', conditionOperator: Operators.Equal.Value, value: '0' }] })
            return { columns: COLUMNS }
        },
    },
    {
        id: 'flat',
        name: 'Every task on its own',
        //the matching tasks without the tree, each with the names of its ancestors
        resolve: () => ({ columns: [{ name: 'subject' }, { name: PATH_COLUMN_NAME }, { name: 'statuscode' }, { name: 'scheduledstart' }], data: { isFlatList: true } }),
    },
]

//the views come with the store
const loadTasks = createLoadTasks(createTaskTable(), VIEWS)

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
            {/* Show hierarchy and Hide inactive tasks */}
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createSortingModule(), createFilteringModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const PLAN_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { createTaskTable, fieldMapping, TASK_VIEWS } from './tasks'

const tasks = createTaskTable()
const COMPLETED = 5

//a completed task cannot be deleted, and neither can the tasks above it
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

//moves tasks by dragging their rows
const controlModules = [createTaskDraggingModule()]

//Edit and Delete act on the selected rows, and a double-clicked cell saves its edit at once
const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]

//each enable prop is off until you turn it on; new tasks go last among their siblings
const GridExample = () => <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion defaultCreatePosition='last' onLoad={loadTasks} height='520px'>
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

export const TaskViewsExample = () => <GridExampleRunner seedCode={withTasks(VIEWS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const PlanTheTasksExample = () => <GridExampleRunner seedCode={withTasks(PLAN_CODE)} tabs={TASK_EXAMPLE_TABS} />
