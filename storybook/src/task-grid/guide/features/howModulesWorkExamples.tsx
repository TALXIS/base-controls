import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS } from '../../examples/shared'
import { CHECKLISTS_FILE, withOfficePlan } from '../officePlanFiles'

const HOW_MODULES_WORK_CODE = `import { createFilteringModule, createMemoryTaskChecklistModule, createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createTaskDrawingModule, createTaskSelectionModule, createTaskTooltipModule, TaskGantt } from '@talxis/base-controls/gantt'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'
import { CHECKLISTS } from './checklists'

const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })
//new: the module's own table, kept outside the component like the tasks'
const checklists = new MemoryTable({ idKey: 'id', rows: CHECKLISTS })

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: a view shows a module's column when it names it
const views: ITaskGridView[] = [{ id: 'plan', name: 'Whole plan', resolve: () => ({ columns: [{ name: 'subject' }, { name: TASK_CHECKLIST_COLUMN_NAME }] }) }]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views,
})

//new: a task module: the checklists the tasks carry
const controlModules = [createTaskDraggingModule(), createMemoryTaskChecklistModule({ items: checklists })]

//new: a grid module: Filter By in each column's menu
const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' }), createFilteringModule()]

//new: a Gantt module: a tooltip on each bar
const ganttModules = [createLibraryModule(), createBarDraggingModule(), createTaskDrawingModule(), createTaskSelectionModule(), createTaskTooltipModule()]

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
        {/* new: a wider grid, for the new column */}
        <TaskGantt.Split defaultGanttSize={45}>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const HowModulesWorkExample = () => <GridExampleRunner seedCode={withOfficePlan(HOW_MODULES_WORK_CODE, CHECKLISTS_FILE)} tabs={TASK_EXAMPLE_TABS} />
