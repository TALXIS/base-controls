import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS } from '../../examples/shared'
import { CALENDAR_FILE, withOfficePlan } from '../officePlanFiles'

const DATES_ON_THE_TIMELINE_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createMemoryMarkersModule, createMemoryNonWorkingDaysModule, createTaskDrawingModule, createTaskSelectionModule, createTaskTooltipModule, TaskGantt } from '@talxis/base-controls/gantt'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'
import { HOLIDAYS, MILESTONES } from './calendar'

const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })
//new: the Gantt modules keep their days in tables of their own
const milestones = new MemoryTable({ idKey: 'id', rows: MILESTONES })
const holidays = new MemoryTable({ idKey: 'id', rows: HOLIDAYS })

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: only Task and Due, so the grid fits beside a wider chart
const views: ITaskGridView[] = [{ id: 'timeline', name: 'Timeline', resolve: () => ({ columns: [
    { name: 'subject' },
    { name: 'due', visualSizeFactor: 100 },
    //new: the tooltip reads the status, so the view loads it
    { name: 'status', isHidden: true },
] }) }]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views,
})

const controlModules = [createTaskDraggingModule()]

const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' })]

const ganttModules = [
    createLibraryModule(),
    createBarDraggingModule(),
    createTaskDrawingModule(),
    createTaskSelectionModule(),
    //new: today, and the plan's milestones
    createMemoryMarkersModule({ markers: milestones }),
    //new: weekends and the holidays, shaded and kept clear of the bars' ends
    createMemoryNonWorkingDaysModule({ nonWorkingDays: holidays }),
    //new: a tooltip on each bar, with the task's status as a pill
    createTaskTooltipModule({ statusColumnName: 'status' }),
]

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
            {/* new: the non-working days module adds Hide non-working days here */}
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: a wider chart, for the days around each date */}
        <TaskGantt.Split defaultGanttSize={45}>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const DatesOnTheTimelineExample = () => <GridExampleRunner seedCode={withOfficePlan(DATES_ON_THE_TIMELINE_CODE, CALENDAR_FILE)} tabs={TASK_EXAMPLE_TABS} />
