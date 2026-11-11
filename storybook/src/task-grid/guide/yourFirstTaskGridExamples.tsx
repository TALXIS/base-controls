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

export const SmallestTaskGridExample = () => <GridExampleRunner seedCode={withOffice(SMALLEST_CODE)} tabs={TASK_EXAMPLE_TABS} />
