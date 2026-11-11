import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS } from '../../examples/shared'
import { DEPENDENCIES_FILE, withOfficePlan } from '../officePlanFiles'

const DEPENDENCIES_AND_LINKS_CODE = `import { createMemoryDependenciesModule, createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createLinksModule, createTaskDrawingModule, createTaskSelectionModule, TaskGantt } from '@talxis/base-controls/gantt'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'
import { DEPENDENCIES } from './dependencies'

const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })
//new: deleting a task deletes its dependencies from this table too
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: how many tasks each task waits on, and how many wait on it
const views: ITaskGridView[] = [
    { id: 'plan', name: 'Whole plan', resolve: () => ({ columns: [{ name: 'subject' }, { name: PREDECESSORS_COLUMN_NAME }, { name: SUCCESSORS_COLUMN_NAME }] }) },
]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views,
})

//new: a task module holds the dependencies
const controlModules = [createTaskDraggingModule(), createMemoryDependenciesModule({ dependencies })]

const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' })]

//new: a Gantt module: the dependencies as links the user draws and deletes
const ganttModules = [createLibraryModule(), createBarDraggingModule(), createTaskDrawingModule(), createTaskSelectionModule(), createLinksModule()]

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split defaultGanttSize={35}>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const DependenciesAndLinksExample = () => <GridExampleRunner seedCode={withOfficePlan(DEPENDENCIES_AND_LINKS_CODE, DEPENDENCIES_FILE)} tabs={TASK_EXAMPLE_TABS} />
