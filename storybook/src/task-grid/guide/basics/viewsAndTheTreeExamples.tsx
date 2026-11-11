import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'

const VIEWS_AND_THE_TREE_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, PATH_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'

const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

//new: each view sets the tasks up as it opens, and returns the columns it shows
const views: ITaskGridView[] = [
    { id: 'plan', name: 'Whole plan', resolve: () => ({ columns: [{ name: 'subject' }, { name: 'owner' }, { name: 'status' }, { name: 'start' }, { name: 'due' }, { name: 'done' }] }) },
    {
        id: 'effort',
        name: 'By effort',
        resolve: provider => {
            //new: orders the tasks under each parent, the most hours first
            provider.setSorting([{ name: 'effort', sortDirection: 1 }])
            return { columns: [{ name: 'subject' }, { name: 'effort' }, { name: 'owner' }, { name: 'due' }] }
        },
    },
    //new: every task on its own row, with the tasks above it in the Path column
    { id: 'list', name: 'Every task', resolve: () => ({ columns: [{ name: 'subject' }, { name: PATH_COLUMN_NAME }, { name: 'status' }, { name: 'due' }], data: { isFlatList: true } }) },
]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    //new: the views come with the store
    views,
})

const controlModules = [createTaskDraggingModule()]

const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' })]

//new: stateKey keeps the view and what is open when the control mounts again
const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion stateKey='officeMove'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* new: switches between the views */}
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
            {/* new: searches the names of the tasks */}
            <DatasetControl.QuickFind />
            {/* new: Show hierarchy and Hide inactive tasks */}
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={gridModules} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const ViewsAndTheTreeExample = () => <GridExampleRunner seedCode={withOffice(VIEWS_AND_THE_TREE_CODE)} tabs={TASK_EXAMPLE_TABS} />
