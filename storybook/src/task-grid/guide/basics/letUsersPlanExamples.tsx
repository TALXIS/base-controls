import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'

const LET_USERS_PLAN_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'

const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
})

//new: a module of the control: moving a task by dragging its row
const controlModules = [createTaskDraggingModule()]

//new: modules of the grid: editing in the cells, and selecting rows for Edit and Delete
const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' })]

//new: what the user may change
const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion>
    {/* new: New, Edit and Delete */}
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

export const LetUsersPlanExample = () => <GridExampleRunner seedCode={withOffice(LET_USERS_PLAN_CODE)} tabs={TASK_EXAMPLE_TABS} />
