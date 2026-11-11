import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'

const FIRST_TASK_GRID_CODE = `import { DatasetControl, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'

//where the tasks are kept: a table of the rows in office.ts, made once outside the control
const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })

//the columns that hold each task's parent, its name and its place among its siblings
const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

//runs on every mount: a new store over the same table, and the field mapping
const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
})

//the control holds the tasks, and the grid in its body draws them as a tree
const GridExample = () => <TaskDatasetControl onLoad={loadTasks}>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const YourFirstTaskGridExample = () => <GridExampleRunner seedCode={withOffice(FIRST_TASK_GRID_CODE)} tabs={TASK_EXAMPLE_TABS} />
