import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice } from '../examples/shared'

const SMALLEST_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRawRecord } from '@talxis/client-libraries'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'

//the rows live outside the control, so every change survives a remount
const tasks = new MemoryTable<IRawRecord>({ idKey: 'taskid', rows: OFFICE_TASKS })

//the columns that make the tree: each task's parent, its name and its place among its siblings
const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

//called on every mount: where the tasks are kept, and which columns make the tree
const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
})

//the control loads the tasks, and the grid in its body draws them
const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const PLANNER_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRawRecord } from '@talxis/client-libraries'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'

const tasks = new MemoryTable<IRawRecord>({ idKey: 'taskid', rows: OFFICE_TASKS })
const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

//new: the views the view switcher offers
const COLUMNS = [{ name: 'subject' }, { name: 'owner' }, { name: 'start' }, { name: 'due' }]
const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Plan', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'due',
        name: 'By due date',
        resolve: provider => {
            provider.setSorting([{ name: 'due', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
]

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views: VIEWS,
})

//new: moves tasks by dragging their rows
const controlModules = [createTaskDraggingModule()]

//new: Edit and Delete act on the selected rows, and a double-clicked cell saves its edit at once
const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]

//new: what the user may change, each off until you turn it on
const GridExample = () => <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* New, Edit and Delete */}
            <TaskDatasetControl.Ribbon />
            <DatasetControl.QuickFind />
            {/* Show hierarchy and Hide inactive tasks */}
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={gridModules} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const SmallestTaskGridExample = () => <GridExampleRunner seedCode={withOffice(SMALLEST_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const PlannerTaskGridExample = () => <GridExampleRunner seedCode={withOffice(PLANNER_CODE)} tabs={TASK_EXAMPLE_TABS} />
