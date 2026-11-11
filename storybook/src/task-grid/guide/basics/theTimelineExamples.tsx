import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'

const THE_TIMELINE_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createTaskDrawingModule, createTaskSelectionModule, TaskGantt } from '@talxis/base-controls/gantt'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'

const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })

//new: the dates the bars span, and how far each bar is filled
const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: one view, with only the columns that fit beside the chart
const views: ITaskGridView[] = [{ id: 'timeline', name: 'Timeline', resolve: () => ({ columns: [{ name: 'subject' }, { name: 'start', visualSizeFactor: 100 }, { name: 'due', visualSizeFactor: 100 }] }) }]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views,
})

const controlModules = [createTaskDraggingModule()]

const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' })]

//new: the chart's modules, one feature each
const ganttModules = [
    //new: draws the chart with the free build of DHTMLX Gantt
    createLibraryModule(),
    //new: drag a bar to move its task, or one of its ends to change that date
    createBarDraggingModule(),
    //new: Ctrl+drag along a row to draw a new task
    createTaskDrawingModule(),
    //new: click a bar to select its task, double-click it to open the task
    createTaskSelectionModule(),
]

//new: the chart fills the height the control is given
const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* new: zooms the timeline in and out */}
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: the grid, then the chart, row for row; the chart takes 35% of the width */}
        <TaskGantt.Split defaultGanttSize={35}>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const TheTimelineExample = () => <GridExampleRunner seedCode={withOffice(THE_TIMELINE_CODE)} tabs={TASK_EXAMPLE_TABS} />
