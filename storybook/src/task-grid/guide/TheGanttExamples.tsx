import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withTasks } from '../examples/shared'

const PLAN_CODE = `import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid, createMemoryDependenciesModule, createMemoryProjectModule, createRowSelectionModule, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createLinksModule, createMemoryMarkersModule, createMemoryNonWorkingDaysModule, createTaskDrawingModule, createTaskSelectionModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

//DEPENDENCIES and NON_WORKING_DAYS are sample data of these docs
const tasks = createTaskTable()
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })
const projects = new MemoryTable({ idKey: 'id', rows: [{ id: 'website', name: 'Website Redesign', startDate: '2025-10-01', endDate: '2026-01-31' }] })
const releases = new MemoryTable({ idKey: 'id', rows: [{ id: 'beta', text: 'Beta', date: '2025-12-01' }] })
const holidays = new MemoryTable({ idKey: 'id', rows: NON_WORKING_DAYS })

//task modules the Gantt reads: the links draw the dependencies, the markers the project's dates
const controlModules = [createMemoryDependenciesModule({ dependencies }), createMemoryProjectModule({ projects, projectId: 'website' })]

//one feature a line: delete a line and the feature is gone
const ganttModules = [
    //the free build of DHTMLX Gantt, which draws the chart; pro.ts holds the PRO one
    createLibraryModule(),
    //drag a bar to move its task, or one of its ends to change that date
    createBarDraggingModule(),
    //Ctrl+drag along a row draws a new task; Alt+drag along an empty row draws its dates
    createTaskDrawingModule(),
    //click, Ctrl+click and Shift+drag select bars; a double-click opens the task
    createTaskSelectionModule(),
    //what a bar says when the pointer rests on it
    createTaskTooltipModule({ statusColumnName: 'statuscode' }),
    //today, the project's start and end, and the releases
    createMemoryMarkersModule({ markers: releases }),
    //weekends and holidays, shaded and left out of durations
    createMemoryNonWorkingDaysModule({ nonWorkingDays: holidays }),
    //the dependencies as arrows; drag from the end of a bar to another bar to add one
    createLinksModule(),
]

const GridExample = () => <TaskDatasetControl modules={controlModules} onLoad={createLoadTasks(tasks)} enableCreation enableEditing height='560px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* the Gantt adds Zoom to fit and Go to today */}
            <TaskDatasetControl.Ribbon />
            {/* the non-working days module adds Hide non-working days */}
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* the grid first, then the chart */}
        <TaskGantt.Split>
            {/* a dropped bar saves as an edit in the grid does */}
            <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const PRO_FILE = {
    name: 'pro.ts',
    code: `import { createProLibraryModule } from '@talxis/base-controls/gantt'
//not run on this page: your licensed DHTMLX Gantt PRO package, under the name you installed it as
import { Gantt } from 'dhtmlx-gantt-pro'
//the PRO build's stylesheet, which createProLibraryModule leaves to you
import 'dhtmlx-gantt-pro/codebase/dhtmlxgantt.css'

//pass it to TaskGantt in place of createLibraryModule()
export const libraryModule = createProLibraryModule({ Gantt })
`,
}

const DATES_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createTaskDrawingModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'

//TASK_METADATA, TASK_COLUMNS and getTaskColumns are the sample tasks, with date-only dates
const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    //only a start: a milestone on that day
    { mem_taskid: 'kickoff', subject: 'Kick-off', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02' },
    //a bar from the start of the first day to the end of the last
    { mem_taskid: 'brief', subject: 'Write the brief', stackrank: '0|200000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-06' },
    //the same day on both: a one-day bar
    { mem_taskid: 'review', subject: 'Design review', stackrank: '0|300000:', statecode: 0, scheduledstart: '2026-03-09', scheduledend: '2026-03-09' },
    //only a date-only end: a milestone at the end of that day
    { mem_taskid: 'signoff', subject: 'Sign-off', stackrank: '0|400000:', statecode: 0, scheduledend: '2026-03-13' },
    //no dates: an empty row
    { mem_taskid: 'venue', subject: 'Book the venue', stackrank: '0|500000:', statecode: 0 },
    //an end before the start: an empty row too
    { mem_taskid: 'catering', subject: 'Order catering', stackrank: '0|600000:', statecode: 0, scheduledstart: '2026-03-12', scheduledend: '2026-03-10' },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    //the Gantt reads startDate and endDate
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend') }) }],
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='340px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule(), createTaskDrawingModule(), createTaskTooltipModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const GanttPlanExample = () => <GridExampleRunner seedCode={withTasks(PLAN_CODE, PRO_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const GanttDatesExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: DATES_CODE }]} tabs={TASK_EXAMPLE_TABS} />
