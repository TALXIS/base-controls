import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

const ownTaskFiles = (code: string, ...extraFiles: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, ...extraFiles]

const GET_STARTED_OVERVIEW = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const ganttModules = [
    createLibraryModule(),
    //drag a bar to move its task, or one of its ends to change that date
    createBarDraggingModule(),
    createTaskTooltipModule({ statusColumnName: 'statuscode' }),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* the Gantt adds Zoom to fit and Go to today */}
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            {/* a dropped bar saves as an edit in the grid does */}
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const GET_STARTED_BASIC = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

//tasks.ts maps startDate and endDate, which the Gantt reads
const tasks = createTaskTable()

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Body>
        {/* the grid first, then the Gantt */}
        <TaskGantt.Split>
            <TaskGrid />
            {/* the library module draws the chart; every other feature is a module of its own */}
            <TaskGantt modules={[createLibraryModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const GET_STARTED_LOOK = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* the slider without its zoom out and zoom in buttons */}
            <TaskGantt.ZoomSlider components={{ onRenderZoomButton: () => null }} />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const DATES_STATES = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'

//TASK_METADATA, TASK_COLUMNS and getTaskColumns come from the sample tasks, with date-only dates
const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    //only a start: a milestone
    { mem_taskid: 'kickoff', subject: 'Kick-off', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02' },
    //a bar from the start of the first day to the end of the last
    { mem_taskid: 'brief', subject: 'Write the brief', stackrank: '0|200000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-06' },
    //the same day on both: a one-day bar
    { mem_taskid: 'review', subject: 'Design review', stackrank: '0|300000:', statecode: 0, scheduledstart: '2026-03-09', scheduledend: '2026-03-09' },
    //only an end: a milestone
    { mem_taskid: 'signoff', subject: 'Sign-off', stackrank: '0|400000:', statecode: 0, scheduledend: '2026-03-13' },
    //no dates: an empty row
    { mem_taskid: 'venue', subject: 'Book the venue', stackrank: '0|500000:', statecode: 0 },
    //an end before the start: an empty row too
    { mem_taskid: 'catering', subject: 'Order catering', stackrank: '0|600000:', statecode: 0, scheduledstart: '2026-03-12', scheduledend: '2026-03-10' },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend') }) }],
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='340px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule(), createTaskTooltipModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const DATES_DATE_TIME = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'

//DATE_TIME_TASK_COLUMNS are the sample columns with a time of day on both dates
const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    { mem_taskid: 'stage', subject: 'Set up the stage', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-10T08:00:00', scheduledend: '2026-03-10T12:30:00' },
    { mem_taskid: 'rehearsal', subject: 'Rehearsal', stackrank: '0|200000:', statecode: 0, scheduledstart: '2026-03-10T13:30:00', scheduledend: '2026-03-10T17:00:00' },
    //the same moment on both: a milestone
    { mem_taskid: 'doors', subject: 'Doors open', stackrank: '0|300000:', statecode: 0, scheduledstart: '2026-03-11T09:00:00', scheduledend: '2026-03-11T09:00:00' },
    { mem_taskid: 'talks', subject: 'Talks', stackrank: '0|400000:', statecode: 0, scheduledstart: '2026-03-11T09:30:00', scheduledend: '2026-03-11T16:00:00' },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: DATE_TIME_TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getDateTimeTaskColumns('subject', 'scheduledstart', 'scheduledend') }) }],
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='300px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* zooms down to hours, since the dates hold a time of day */}
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), createTaskTooltipModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const DATES_MIXED = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'

//the start holds a time of day, the end only a date
const withStartTime = (column: IColumn): IColumn => column.name === 'scheduledstart' ? { ...column, dataType: 'DateAndTime.DateAndTime' } : column

const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    //from Monday 13:00 to the end of Tuesday
    { mem_taskid: 'pack', subject: 'Pack the equipment', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-09T13:00:00', scheduledend: '2026-03-10' },
    { mem_taskid: 'drive', subject: 'Drive to the venue', stackrank: '0|200000:', statecode: 0, scheduledstart: '2026-03-11T07:00:00', scheduledend: '2026-03-11' },
    { mem_taskid: 'unpack', subject: 'Unpack', stackrank: '0|300000:', statecode: 0, scheduledstart: '2026-03-11T15:00:00', scheduledend: '2026-03-12' },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS.map(withStartTime) }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend').map(withStartTime) }) }],
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='280px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule(), createTaskTooltipModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const DATES_DURATION = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule } from '@talxis/base-controls/gantt'

//durations are minutes, and a day here holds 8 hours: 5 days are 2400
const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    { mem_taskid: 'brief', subject: 'Write the brief', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-06', scheduleddurationminutes: 2400 },
    { mem_taskid: 'review', subject: 'Design review', stackrank: '0|200000:', statecode: 0, scheduledstart: '2026-03-09', scheduledend: '2026-03-09', scheduleddurationminutes: 480 },
    { mem_taskid: 'build', subject: 'Build the site', stackrank: '0|300000:', statecode: 0, scheduledstart: '2026-03-10', scheduledend: '2026-03-12', scheduleddurationminutes: 1440 },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    //with duration mapped, every date the Gantt saves writes the duration too
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend', duration: 'scheduleddurationminutes' },
    hoursPerDay: 8,
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes') }) }],
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='260px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const DATES_SUMMARY = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule } from '@talxis/base-controls/gantt'

//the parent lookup of the subtasks
const campaign = [{ id: { guid: 'campaign' }, etn: TASK_METADATA.LogicalName, name: 'Launch campaign' }]

const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    //the parent's own dates, which end before its last subtask does
    { mem_taskid: 'campaign', subject: 'Launch campaign', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-13' },
    { mem_taskid: 'copy', subject: 'Write the copy', parentid: campaign, stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-06' },
    { mem_taskid: 'visuals', subject: 'Design the visuals', parentid: campaign, stackrank: '0|200000:', statecode: 0, scheduledstart: '2026-03-09', scheduledend: '2026-03-13' },
    { mem_taskid: 'publish', subject: 'Publish', parentid: campaign, stackrank: '0|300000:', statecode: 0, scheduledstart: '2026-03-16', scheduledend: '2026-03-17' },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend') }) }],
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='260px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const ZOOM_OVERVIEW = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createRowSelectionModule } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* the Gantt adds Zoom to fit and Go to today */}
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            {/* Zoom to fit fits the selected tasks, or every task when none is */}
            <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
            <TaskGantt modules={[createLibraryModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const ZOOM_FROM_CODE = withTasks(`import { DefaultButton } from '@fluentui/react'
import { DatasetControl, TaskDatasetControl, TaskGrid, useDatasetControl } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const RangeButtons = () => {
    const datasetControl = useDatasetControl()
    //the Gantt is a part of the DatasetControl while it is drawn
    const zoomToRange = (start: string, end: string) => {
        datasetControl.parts.find('gantt')?.services.find('zooming')?.zoomToRange({ start: dayjs(start).toDate(), end: dayjs(end).toDate() })
    }
    return <>
        <DefaultButton text='December 2025' onClick={() => zoomToRange('2025-12-01', '2026-01-01')} />
        <DefaultButton text='First half of 2026' onClick={() => zoomToRange('2026-01-01', '2026-07-01')} />
    </>
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <RangeButtons />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const ZOOM_SCALE_LABELS = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IGanttModule, TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//fiscal years start in July
const fiscalScaleModule: IGanttModule = {
    name: 'fiscalScale',
    onLoad: gantt => {
        //zooming comes with the chart; what observe's callback returns runs when it goes
        gantt.services.observe('zooming', zooming => zooming.hooks.scaleLabel.add((result, { date, unit }) => {
            const fiscalMonth = (date.getMonth() + 6) % 12
            if (unit === 'quarter') {
                const fiscalYear = date.getMonth() >= 6 ? date.getFullYear() + 1 : date.getFullYear()
                result.label = 'FY' + String(fiscalYear).slice(2) + ' Q' + (Math.floor(fiscalMonth / 3) + 1)
            }
            //result.label starts as the built-in label
            if (unit === 'month') {
                result.label += ' · P' + (fiscalMonth + 1)
            }
        }))
        return {}
    },
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), fiscalScaleModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const ZOOM_STATE = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* each stateKey names where its component keeps its state in each view */}
        <TaskGantt.Split stateKey='split'>
            <TaskGrid />
            <TaskGantt stateKey='gantt' modules={[createLibraryModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const ZOOM_LIMITS = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

//the sample tasks run from September 2025 to June 2026
const tasks = createTaskTable()

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            {/* scrolls from July 2025 to September 2026 at most, or further to fit a task */}
            <TaskGantt timelineLimits={{ start: dayjs('2025-07-01'), end: dayjs('2026-09-30') }} modules={[createLibraryModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MODULES_OVERVIEW = withTasks(`import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid, createMemoryDependenciesModule, createMemoryProjectModule, createRowSelectionModule, createTaskEditingModule } from '@talxis/base-controls'
import {
    TaskGantt, createBarDraggingModule, createLibraryModule, createLinksModule, createMemoryMarkersModule, createMemoryNonWorkingDaysModule, createTaskDrawingModule,
    createTaskSelectionModule, createTaskTooltipModule,
} from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

//DEPENDENCIES and NON_WORKING_DAYS are sample data of these docs
const tasks = createTaskTable()
const projects = new MemoryTable({ idKey: 'id', rows: [{ id: 'website', name: 'Website Redesign', startDate: '2025-10-01', endDate: '2026-01-31' }] })
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })
const markers = new MemoryTable({ idKey: 'id', rows: [{ id: 'beta', text: 'Beta', date: '2025-12-01' }] })
const nonWorkingDays = new MemoryTable({ idKey: 'id', rows: NON_WORKING_DAYS })

//task modules, which some Gantt modules read
const controlModules = [
    createMemoryProjectModule({ projects, projectId: 'website' }),
    createMemoryDependenciesModule({ dependencies }),
]

//a feature left out is not there at all
const ganttModules = [
    createLibraryModule(),
    createMemoryMarkersModule({ markers }),
    createMemoryNonWorkingDaysModule({ nonWorkingDays }),
    createBarDraggingModule(),
    createTaskDrawingModule(),
    createTaskSelectionModule(),
    createTaskTooltipModule({ statusColumnName: 'statuscode' }),
    createLinksModule(),
]

const GridExample = () => <TaskDatasetControl modules={controlModules} onLoad={createLoadTasks(tasks)} enableCreation enableEditing height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MODULES_PRO = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='420px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            {/* with a PRO licence, pass libraryModule from pro.ts in its place */}
            <TaskGantt modules={[createLibraryModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`, {
    name: 'pro.ts',
    code: `import { createProLibraryModule } from '@talxis/base-controls/gantt'
//your licensed DHTMLX Gantt PRO package, under the name you installed it as
import { Gantt } from 'dhtmlx-gantt-pro'
//the PRO build's stylesheet, which createProLibraryModule leaves to you
import 'dhtmlx-gantt-pro/codebase/dhtmlxgantt.css'

export const libraryModule = createProLibraryModule({ Gantt })
`,
})

const EDITING_OVERVIEW = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createRowSelectionModule, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createTaskDrawingModule, createTaskSelectionModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const ganttModules = [
    createLibraryModule(),
    //drag a bar to move it, or one of its ends to change that date
    createBarDraggingModule(),
    //Ctrl+drag along a row draws a new task; Alt+drag along an empty row draws that task's dates
    createTaskDrawingModule(),
    //click, Ctrl+click, Shift+click and Shift+drag select tasks
    createTaskSelectionModule(),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableCreation enableEditing height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            {/* bar dragging needs the editing module, selection the grid's row selection */}
            <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const EDITING_MOVE_ONLY = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            {/* bars move, but their ends stay where they are */}
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule({ enableResize: false })]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const EDITING_SNAPPING = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'

//DATE_TIME_TASKS are the sample tasks with a time of day on both dates
const tasks = new MemoryTable({ idKey: TASK_METADATA.PrimaryIdAttribute, rows: DATE_TIME_TASKS })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: DATE_TIME_TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getDateTimeTaskColumns('subject', 'scheduledstart', 'scheduledend') }) }],
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            {/* the tooltip follows the dragged bar with the dates it would get */}
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule(), createTaskTooltipModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const EDITING_DRAW_TASKS = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createTaskDrawingModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//enableCreation lets the user draw new tasks
const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableCreation height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), createTaskDrawingModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const EDITING_DRAW_DATES = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createTaskDrawingModule } from '@talxis/base-controls/gantt'

const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    { mem_taskid: 'date', subject: 'Choose the date', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-03' },
    //no dates yet, so their rows are empty
    { mem_taskid: 'venue', subject: 'Book the venue', stackrank: '0|200000:', statecode: 0 },
    { mem_taskid: 'catering', subject: 'Order catering', stackrank: '0|300000:', statecode: 0 },
    { mem_taskid: 'invitations', subject: 'Send the invitations', stackrank: '0|400000:', statecode: 0, scheduledstart: '2026-03-09', scheduledend: '2026-03-13' },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend') }) }],
})

//drawn dates save as edits in the grid do, so they need enableEditing and the editing module
const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableCreation enableEditing height='300px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            {/* New adds a task without dates */}
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createTaskDrawingModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const EDITING_SELECTION = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createRowSelectionModule } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createTaskSelectionModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//Edit and Delete act on what is selected, in the grid or on the chart
const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing enableDeletion height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
            <TaskGantt modules={[createLibraryModule(), createTaskSelectionModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const EDITING_PREVIEW = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createTaskDrawingModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const ganttModules = [
    createLibraryModule(),
    createTaskDrawingModule({
        components: {
            preview: {
                //the span drawn so far
                onRenderSpan: props => <div {...props} style={{ ...props.style, backgroundColor: '#107c10' }} />,
                //what the callout beside the pointer says
                onRenderText: props => <div {...props}>New task · {props.children}</div>,
            },
        },
    }),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableCreation height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const LINKS_OVERVIEW = withTasks(`import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid, createMemoryDependenciesModule } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createLinksModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

//DEPENDENCIES are the sample tasks' dependencies; links drawn and deleted are kept in the table
const tasks = createTaskTable()
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

//the links module draws what the dependencies module holds
const GridExample = () => <TaskDatasetControl modules={[createMemoryDependenciesModule({ dependencies })]} onLoad={createLoadTasks(tasks)} enableEditing height='520px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), createLinksModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const LINKS_MILESTONES = ownTaskFiles(`import { DatasetControl, ITaskDependency, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createMemoryDependenciesModule } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createLinksModule } from '@talxis/base-controls/gantt'

const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    { mem_taskid: 'build', subject: 'Build the site', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-13' },
    { mem_taskid: 'test', subject: 'Test the site', stackrank: '0|200000:', statecode: 0, scheduledstart: '2026-03-16', scheduledend: '2026-03-20' },
    //milestones: only an end, and only a start
    { mem_taskid: 'signoff', subject: 'Sign-off', stackrank: '0|300000:', statecode: 0, scheduledend: '2026-03-23' },
    { mem_taskid: 'live', subject: 'Go live', stackrank: '0|400000:', statecode: 0, scheduledstart: '2026-03-24' },
] })

const dependencies = new MemoryTable<ITaskDependency>({ idKey: 'id', rows: [
    { id: 'build-test', predecessorTaskId: 'build', successorTaskId: 'test', type: 'finishToStart' },
    { id: 'test-signoff', predecessorTaskId: 'test', successorTaskId: 'signoff', type: 'finishToStart' },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend') }) }],
})

const GridExample = () => <TaskDatasetControl modules={[createMemoryDependenciesModule({ dependencies })]} onLoad={loadTasks} enableEditing height='280px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), createLinksModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const LINKS_TOOLTIP = withTasks(`import { DatasetControl, MemoryTable, RecordCardFieldRow, TaskDatasetControl, TaskGrid, createMemoryDependenciesModule } from '@talxis/base-controls'
import { LinkTooltip, TaskGantt, createLibraryModule, createLinksModule, useLinkTooltip } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

//a part of your own: how long the successor waits after its predecessor ends
const SlackRow = () => {
    const { gantt, dependency, predecessor, successor } = useLinkTooltip()
    const schedule = gantt.services.get('schedule')
    const predecessorSpan = predecessor && schedule.getSpan(predecessor)
    const successorSpan = successor && schedule.getSpan(successor)
    if (dependency.type !== 'finishToStart' || !predecessorSpan || !successorSpan) {
        return null
    }
    //span ends are exclusive, so a task starting the day after its predecessor ends waits 0 days
    const days = dayjs(successorSpan.start).diff(predecessorSpan.end, 'day')
    return <RecordCardFieldRow label='Slack' iconName='Clock'>{days >= 0 ? days + ' days' : 'Overlaps by ' + -days + ' days'}</RecordCardFieldRow>
}

const ganttModules = [
    createLibraryModule(),
    createLinksModule({
        components: {
            tooltip: {
                //leave onRender out for the default tooltip
                onRender: () => <LinkTooltip.Callout>
                    <LinkTooltip.Header />
                    <LinkTooltip.FieldRows>
                        <LinkTooltip.PredecessorRow />
                        <LinkTooltip.SuccessorRow />
                        <SlackRow />
                    </LinkTooltip.FieldRows>
                </LinkTooltip.Callout>,
            },
        },
    }),
]

const GridExample = () => <TaskDatasetControl modules={[createMemoryDependenciesModule({ dependencies })]} onLoad={createLoadTasks(tasks)} enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MARKERS_RELEASES = withTasks(`import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IMemoryMarker, TaskGantt, createLibraryModule, createMemoryMarkersModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//dates are ISO strings in the table; the module hands them out as Dayjs
const RELEASES: IMemoryMarker[] = [
    { id: 'beta', text: 'Beta', date: '2025-12-01', color: '#8764b8' },
    { id: 'launch', text: 'Launch', date: '2026-04-01', color: '#107c10', lineStyle: 'solid' },
]
const releases = new MemoryTable({ idKey: 'id', rows: RELEASES })

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            {/* today is marked too */}
            <TaskGantt modules={[createLibraryModule(), createMemoryMarkersModule({ markers: releases })]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MARKERS_TODAY_PROJECT = withTasks(`import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid, createMemoryProjectModule } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createMarkersModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
//the project whose start and end are marked
const projects = new MemoryTable({ idKey: 'id', rows: [{ id: 'website', name: 'Website Redesign', startDate: '2025-10-01', endDate: '2026-01-31' }] })

const ganttModules = [
    createLibraryModule(),
    //no store: today and the project's start and end only
    createMarkersModule({
        today: { color: '#107c10', lineStyle: 'solid' },
        project: { color: '#ca5010' },
    }),
]

const GridExample = () => <TaskDatasetControl modules={[createMemoryProjectModule({ projects, projectId: 'website' })]} onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            {/* Go to today scrolls to today's marker */}
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MARKERS_STORE = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IMarker, IMarkersStore, TaskGantt, createLibraryModule, createMarkersModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//a store of your own; releasesStore.ts loads markers from a server instead
class SprintReviewsStore implements IMarkersStore {
    //runs on every mount, and again on the module's reload()
    public async loadMarkers(): Promise<IMarker[]> {
        const firstReview = dayjs('2025-09-12')
        //a review every other Friday
        return Array.from({ length: 21 }, (_, index) => ({ id: 'review' + index, text: 'Review ' + (index + 1), date: firstReview.add(index * 2, 'week'), color: '#0078d4' }))
    }
}

const ganttModules = [
    createLibraryModule(),
    //called on every mount with the task runtime
    createMarkersModule({ createStore: () => new SprintReviewsStore() }),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`, {
    name: 'releasesStore.ts',
    code: `import type { ITaskRuntime } from '@talxis/base-controls'
import type { IMarker, IMarkersStore } from '@talxis/base-controls/gantt'

//createMarkersModule({ createStore: taskRuntime => new ReleasesStore(taskRuntime) })
export class ReleasesStore implements IMarkersStore {
    private _taskRuntime: ITaskRuntime

    constructor(taskRuntime: ITaskRuntime) {
        this._taskRuntime = taskRuntime
    }

    public async loadMarkers(): Promise<IMarker[]> {
        //the view's project, such as from the Project module
        const projectId = this._taskRuntime.services.get('datasetControl').modules.find('project')?.getId()
        const response = await fetch('/api/projects/' + projectId + '/releases')
        const releases: { id: string, name: string, date: string }[] = await response.json()
        return releases.map(release => ({ id: release.id, text: release.name, date: dayjs(release.date) }))
    }
}
`,
})

const MARKERS_RELOAD = withTasks(`import { DefaultButton } from '@fluentui/react'
import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid, useDatasetControl } from '@talxis/base-controls'
import { IMemoryMarker, TaskGantt, createLibraryModule, createMemoryMarkersModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
const releases = new MemoryTable<IMemoryMarker>({ idKey: 'id', rows: [{ id: 'beta', text: 'Beta', date: '2025-12-01', color: '#8764b8' }] })

const AddReleaseButton = () => {
    const datasetControl = useDatasetControl()
    const addRelease = async () => {
        releases.insert([{ id: 'hotfix', text: 'Hotfix', date: '2026-02-16', color: '#d13438' }])
        //the module is reached by its name; reload() reads the store again and redraws the markers
        await datasetControl.parts.find('gantt')?.modules.get('markers').reload()
    }
    return <DefaultButton text='Add a hotfix release' iconProps={{ iconName: 'Add' }} onClick={addRelease} />
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <AddReleaseButton />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), createMemoryMarkersModule({ markers: releases })]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MARKERS_CHIP = withTasks(`import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IMemoryMarker, TaskGantt, createLibraryModule, createMemoryMarkersModule, useMarker } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
const RELEASES: IMemoryMarker[] = [
    { id: 'beta', text: 'Beta', date: '2025-12-01', color: '#8764b8' },
    { id: 'launch', text: 'Launch', date: '2026-04-01', color: '#107c10' },
]
const releases = new MemoryTable({ idKey: 'id', rows: RELEASES })

//useMarker() returns the marker this slot draws
const CountdownChip = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { marker } = useMarker()
    const days = marker.date.startOf('day').diff(dayjs().startOf('day'), 'day')
    return <div {...props}>{marker.text} · {days >= 0 ? 'in ' + days + ' days' : -days + ' days ago'}</div>
}

const ganttModules = [
    createLibraryModule(),
    createMemoryMarkersModule({
        markers: releases,
        today: { enableMarker: false },
        components: {
            chip: { onRenderChip: props => <CountdownChip {...props} /> },
        },
    }),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const NON_WORKING_HOLIDAYS = withTasks(`import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { IMemoryNonWorkingDay, TaskGantt, createBarDraggingModule, createLibraryModule, createMemoryNonWorkingDaysModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//weekends come on their own; dates are ISO strings in the table
const HOLIDAYS: IMemoryNonWorkingDay[] = [
    //endDate is the last day, included
    { id: 'christmas', date: '2025-12-24', endDate: '2025-12-26', description: 'Christmas holidays', recurrence: 'FREQ=YEARLY' },
    { id: 'newYearsDay', date: '2026-01-01', description: "New Year's Day", recurrence: 'FREQ=YEARLY' },
    //every month's first Friday
    { id: 'teamDay', date: '2025-10-03', description: 'Team day', recurrence: 'FREQ=MONTHLY;BYDAY=1FR' },
]
const holidays = new MemoryTable({ idKey: 'id', rows: HOLIDAYS })

const ganttModules = [
    createLibraryModule(),
    createMemoryNonWorkingDaysModule({ nonWorkingDays: holidays }),
    createBarDraggingModule(),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* holds Hide non-working days */}
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const NON_WORKING_WEEKENDS = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createNonWorkingDaysModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            {/* no store: Saturdays and Sundays only */}
            <TaskGantt modules={[createLibraryModule(), createNonWorkingDaysModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const NON_WORKING_DROP = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createNonWorkingDaysModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const ganttModules = [
    createLibraryModule(),
    //bars may start and end on a weekend; durations still leave weekends out
    createNonWorkingDaysModule({ enableDropOnNonWorkingDays: true }),
    createBarDraggingModule(),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const NON_WORKING_DURATION = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createNonWorkingDaysModule } from '@talxis/base-controls/gantt'

//durations in minutes of 8-hour working days: Monday to Friday is 2400
const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    { mem_taskid: 'brief', subject: 'Write the brief', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-06', scheduleddurationminutes: 2400 },
    //two weeks over a weekend: ten working days
    { mem_taskid: 'build', subject: 'Build the site', stackrank: '0|200000:', statecode: 0, scheduledstart: '2026-03-09', scheduledend: '2026-03-20', scheduleddurationminutes: 4800 },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend', duration: 'scheduleddurationminutes' },
    hoursPerDay: 8,
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes') }) }],
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='240px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createNonWorkingDaysModule(), createBarDraggingModule()]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const NON_WORKING_STORE = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { INonWorkingDay, INonWorkingDaysStore, TaskGantt, createLibraryModule, createNonWorkingDaysModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//a store of your own; calendarStore.ts loads the days from a server instead
class CompanyCalendarStore implements INonWorkingDaysStore {
    //runs on every mount, and again on the module's reload()
    public async loadNonWorkingDays(): Promise<INonWorkingDay[]> {
        return [
            { id: 'offsite', date: dayjs('2025-11-12'), endDate: dayjs('2025-11-14'), description: 'Company offsite' },
            //Good Friday, worked out for every year
            { id: 'goodFriday', date: dayjs('2025-01-01'), description: 'Good Friday', recurrence: 'FREQ=YEARLY;BYEASTER=-2' },
            //every month's last Friday
            { id: 'releaseFreeze', date: dayjs('2025-09-01'), description: 'Release freeze', recurrence: 'FREQ=MONTHLY;BYDAY=-1FR' },
        ]
    }
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            {/* weekends are added to the store's days */}
            <TaskGantt modules={[createLibraryModule(), createNonWorkingDaysModule({ createStore: () => new CompanyCalendarStore() })]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`, {
    name: 'calendarStore.ts',
    code: `import type { INonWorkingDay, INonWorkingDaysStore } from '@talxis/base-controls/gantt'

//createNonWorkingDaysModule({ createStore: () => new CalendarStore('/api/calendar') })
export class CalendarStore implements INonWorkingDaysStore {
    private _url: string

    constructor(url: string) {
        this._url = url
    }

    public async loadNonWorkingDays(): Promise<INonWorkingDay[]> {
        const response = await fetch(this._url)
        const days: { id: string, start: string, end?: string, name: string, rule?: string }[] = await response.json()
        return days.map(day => ({ id: day.id, date: dayjs(day.start), endDate: day.end ? dayjs(day.end) : undefined, description: day.name, recurrence: day.rule }))
    }
}
`,
})

const NON_WORKING_TOOLTIP = withTasks(`import { Icon } from '@fluentui/react'
import { DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createMemoryNonWorkingDaysModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

//NON_WORKING_DAYS are common holidays, sample data of these docs
const tasks = createTaskTable()
const holidays = new MemoryTable({ idKey: 'id', rows: NON_WORKING_DAYS })

const ganttModules = [
    createLibraryModule(),
    createMemoryNonWorkingDaysModule({
        nonWorkingDays: holidays,
        components: {
            tooltip: {
                //one line for each day that covers the date, weekends included
                onRenderDescription: ({ day, ...props }) => <span {...props}><Icon iconName={day.id === 'weekend' ? 'CalendarWeek' : 'Vacation'} /> {day.description}</span>,
            },
        },
    }),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const TOOLTIP_DEFAULT = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { TaskGantt, createBarDraggingModule, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const ganttModules = [
    createLibraryModule(),
    //the header shows the Status option as a pill in its colour
    createTaskTooltipModule({ statusColumnName: 'statuscode' }),
    createBarDraggingModule(),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const TOOLTIP_COMPOSE = withTasks(`import { DatasetControl, ITaskGridView, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, TaskTooltip, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
//a view with every column the tooltip below reads
const VIEWS: ITaskGridView[] = [{ id: 'all', name: 'All tasks', resolve: () => ({ columns: getTaskColumns('subject', 'statuscode', 'priority', 'estimatedeffort', 'scheduledstart', 'scheduledend', 'percentcomplete') }) }]

const ganttModules = [
    createLibraryModule(),
    createTaskTooltipModule({
        statusColumnName: 'statuscode',
        components: {
            //the parts in your order; leave onRender out for the default tooltip
            onRender: () => <TaskTooltip.Callout>
                <TaskTooltip.Header />
                <TaskTooltip.ProgressRow />
                <TaskTooltip.FieldRows>
                    <TaskTooltip.FieldRow columnName='priority' iconName='Flag' />
                    <TaskTooltip.FieldRow columnName='estimatedeffort' iconName='Clock' />
                </TaskTooltip.FieldRows>
                <TaskTooltip.DateRangeRow />
            </TaskTooltip.Callout>,
        },
    }),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks, VIEWS)} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const TOOLTIP_MILESTONES = ownTaskFiles(`import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, TaskTooltip, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'

const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    { mem_taskid: 'build', subject: 'Build the site', stackrank: '0|100000:', statecode: 0, scheduledstart: '2026-03-02', scheduledend: '2026-03-13' },
    //milestones: only an end, and only a start
    { mem_taskid: 'signoff', subject: 'Sign-off', stackrank: '0|200000:', statecode: 0, scheduledend: '2026-03-13' },
    { mem_taskid: 'live', subject: 'Go live', stackrank: '0|300000:', statecode: 0, scheduledstart: '2026-03-16' },
] })

const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend' },
    views: [{ id: 'dates', name: 'Dates', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend') }) }],
})

const ganttModules = [
    createLibraryModule(),
    createTaskTooltipModule({
        components: {
            onRender: () => <TaskTooltip.Callout>
                <TaskTooltip.Header />
                <TaskTooltip.FieldRows>
                    {/* a milestone shows only the date it has, and no duration */}
                    <TaskTooltip.StartDateRow />
                    <TaskTooltip.EndDateRow />
                    <TaskTooltip.DurationRow />
                </TaskTooltip.FieldRows>
            </TaskTooltip.Callout>,
        },
    }),
]

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='240px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const TOOLTIP_OWN_PART = withTasks(`import { DatasetControl, ITaskGridView, RecordCardFieldRow, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, TaskTooltip, createLibraryModule, createTaskTooltipModule, useTaskTooltip } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
//a view with the two columns the part below reads
const VIEWS: ITaskGridView[] = [{ id: 'effort', name: 'Effort', resolve: () => ({ columns: getTaskColumns('subject', 'estimatedeffort', 'actualeffort', 'scheduledstart', 'scheduledend') }) }]

//a part of your own reads the task with useTaskTooltip()
const EffortRow = () => {
    const { record } = useTaskTooltip()
    const estimated = Number(record.getValue('estimatedeffort'))
    const actual = Number(record.getValue('actualeffort'))
    if (!estimated) {
        return null
    }
    return <RecordCardFieldRow label='Effort' iconName='Clock'>{actual + ' of ' + estimated + ' h' + (actual > estimated ? ', over' : '')}</RecordCardFieldRow>
}

const ganttModules = [
    createLibraryModule(),
    createTaskTooltipModule({
        components: {
            onRender: () => <TaskTooltip.Callout>
                <TaskTooltip.Header />
                <TaskTooltip.FieldRows>
                    <EffortRow />
                </TaskTooltip.FieldRows>
                <TaskTooltip.DateRangeRow />
            </TaskTooltip.Callout>,
        },
    }),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks, VIEWS)} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const TOOLTIP_SLOTS = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { TaskGantt, createLibraryModule, createTaskTooltipModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

const ganttModules = [
    createLibraryModule(),
    createTaskTooltipModule({
        statusColumnName: 'statuscode',
        //the default tooltip's slots, by the part they belong to
        components: {
            progress: { onRenderText: () => null },
            dateRange: { onRenderDuration: () => null },
        },
    }),
]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MODULE_STATUS_COLOURS = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { IGanttModule, TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//bars take the colour of their Status option
const statusColoursModule: IGanttModule = {
    //unique among the Gantt's modules; types.ts adds it to IGanttModuleMap
    name: 'statusColours',
    //runs on every mount, before the chart is drawn
    onLoad: gantt => {
        //the tasks service comes with the chart, so observe it; the hook goes with the service
        gantt.services.observe('tasks', chartTasks => chartTasks.hooks.task.add((task, { record }) => {
            const options = gantt.getTaskRuntime().getProvider().getColumnsMap()['statuscode']?.metadata?.OptionSet ?? []
            task.color = options.find(option => String(option.Value) === String(record.getValue('statuscode')))?.Color
        }))
        //what onLoad returns is the module, reached by its name
        return {}
    },
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), statusColoursModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`, {
    name: 'types.ts',
    code: `//a module file, so the block below adds to the library's own types
export {}

declare module '@talxis/base-controls/gantt' {
    //each module's name, and what its onLoad returns
    interface IGanttModuleMap {
        statusColours: {}
    }
}
`,
})

const MODULE_CRITICAL = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { IGanttModule, TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//bars of critical tasks get a class name, and the class a style
const criticalTasksModule: IGanttModule = {
    name: 'criticalTasks',
    onLoad: gantt => {
        gantt.services.observe('tasks', chartTasks => chartTasks.hooks.taskClass.add((classNames, { record }) => {
            if (Number(record.getValue('priority')) === 3) {
                classNames.push('critical-task')
            }
        }))
        //styles nest under the chart, so the class counts only inside it
        gantt.theme.hooks.styles.add((result, theme) => result.styles.push({
            '.critical-task': { boxShadow: '0 0 0 2px ' + theme.palette.red },
        }))
        return {}
    },
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), criticalTasksModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MODULE_SIDE_TEXT = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { IGanttModule, TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//each bar's progress written to its right
const progressTextModule: IGanttModule = {
    name: 'progressText',
    onLoad: gantt => {
        //DHTMLX's own config and templates, set before the chart is drawn
        gantt.hooks.chartConfig.add(chart => {
            //returns HTML, so it writes only a number
            chart.templates.rightside_text = (start, end, task) => task.progress > 0 ? Math.round(task.progress * 100) + '%' : ''
        })
        return {}
    },
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), progressTextModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MODULE_REVIEW_DAYS = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IGanttModule, TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//every other Friday is a sprint review, shaded on the timeline and on its scale
const reviewDaysModule: IGanttModule = {
    name: 'reviewDays',
    onLoad: gantt => {
        gantt.services.observe('timeline', timeline => {
            const addReviewDayClass = (classNames: string[], { date }: { date: Date }) => {
                const isReviewDay = date.getDay() === 5 && dayjs(date).diff(dayjs('2025-09-05'), 'week') % 2 === 0
                //only while columns are days: a wider cell may start on a Friday too
                if (isReviewDay && gantt.services.find('zooming')?.isDayScaleVisible()) {
                    classNames.push('review-day')
                }
            }
            const removers = [timeline.hooks.cellClass.add(addReviewDayClass), timeline.hooks.scaleCellClass.add(addReviewDayClass)]
            return () => removers.forEach(remove => remove())
        })
        gantt.theme.hooks.styles.add((result, theme) => result.styles.push({
            '.review-day': { backgroundColor: theme.palette.themeLighter },
        }))
        return {}
    },
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), reviewDaysModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MODULE_SNAPPING = withTasks(`import { DatasetControl, TaskDatasetControl, TaskGrid, createTaskEditingModule } from '@talxis/base-controls'
import { IGanttModule, TaskGantt, createBarDraggingModule, createLibraryModule, createTaskDrawingModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//moved and drawn bars start on the nearest Monday, keeping their length
const mondayStartsModule: IGanttModule = {
    name: 'mondayStarts',
    onLoad: gantt => {
        //the schedule service is there from the start
        gantt.services.get('schedule').hooks.snap.add((result, { change }) => {
            //change is 'move', 'span' for a drawn task, or the edge being dragged
            if (change !== 'move' && change !== 'span') {
                return
            }
            const start = dayjs(result.span.start)
            const daysSinceMonday = (start.day() + 6) % 7
            const shift = daysSinceMonday <= 3 ? -daysSinceMonday : 7 - daysSinceMonday
            result.span = { start: start.add(shift, 'day').toDate(), end: dayjs(result.span.end).add(shift, 'day').toDate() }
        })
        return {}
    },
}

const ganttModules = [createLibraryModule(), mondayStartsModule, createBarDraggingModule(), createTaskDrawingModule()]

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} enableCreation enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const MODULE_SURFACE = withTasks(`import { ContextualMenu } from '@fluentui/react'
import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IGanttModule, TaskGantt, createLibraryModule, useGantt, useGanttService } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//a menu of your own for the bar the user right-clicks
const TaskMenu = () => {
    const gantt = useGantt()
    //undefined until the chart is drawn, and rendered again once it is
    const chart = useGanttService('chart')
    const [menu, setMenu] = React.useState<{ taskId: string, x: number, y: number }>()

    React.useEffect(() => {
        if (!chart) {
            return
        }
        const eventId = chart.attachEvent('onContextMenu', (taskId, linkId, event) => {
            if (taskId) {
                event.preventDefault()
                setMenu({ taskId: String(taskId), x: event.clientX, y: event.clientY })
            }
            return true
        })
        return () => chart.detachEvent(eventId)
    }, [chart])

    const record = menu && gantt.services.get('tasks').getRecord(menu.taskId)
    if (!menu || !record) {
        return null
    }
    return <ContextualMenu target={{ x: menu.x, y: menu.y }} onDismiss={() => setMenu(undefined)} items={[
        { key: 'show', text: 'Show on timeline', iconProps: { iconName: 'Timeline' }, onClick: () => gantt.services.get('zooming').showTask(record) },
        { key: 'open', text: 'Open', iconProps: { iconName: 'OpenInNewWindow' }, onClick: () => { gantt.getTaskRuntime().tasks.open([menu.taskId]) } },
    ]} />
}

const taskMenuModule: IGanttModule = {
    name: 'taskMenu',
    onLoad: gantt => {
        //what a module draws over the chart, from the moment the chart is drawn
        gantt.surfaces.hooks.surfaces.add(surfaces => surfaces.push({ key: 'taskMenu', onRender: () => <TaskMenu /> }))
        return {}
    },
}

const GridExample = () => <TaskDatasetControl onLoad={createLoadTasks(tasks)} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={[createLibraryModule(), taskMenuModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`)

const runner = (files: IGridExampleFile[]) => () => <GridExampleRunner seedCode={files} tabs={TASK_EXAMPLE_TABS} />

export const GanttShowcaseExample = runner(GET_STARTED_OVERVIEW)
export const GanttBasicExample = runner(GET_STARTED_BASIC)
export const GanttLookExample = runner(GET_STARTED_LOOK)

export const GanttDateStatesExample = runner(DATES_STATES)
export const GanttDateTimeExample = runner(DATES_DATE_TIME)
export const GanttMixedDatesExample = runner(DATES_MIXED)
export const GanttDurationExample = runner(DATES_DURATION)
export const GanttSummaryExample = runner(DATES_SUMMARY)

export const GanttZoomExample = runner(ZOOM_OVERVIEW)
export const GanttZoomFromCodeExample = runner(ZOOM_FROM_CODE)
export const GanttScaleLabelsExample = runner(ZOOM_SCALE_LABELS)
export const GanttZoomStateExample = runner(ZOOM_STATE)
export const GanttTimelineLimitsExample = runner(ZOOM_LIMITS)

export const GanttModulesExample = runner(MODULES_OVERVIEW)
export const GanttProLibraryExample = runner(MODULES_PRO)

export const GanttEditingExample = runner(EDITING_OVERVIEW)
export const GanttMoveOnlyExample = runner(EDITING_MOVE_ONLY)
export const GanttSnappingExample = runner(EDITING_SNAPPING)
export const GanttDrawTasksExample = runner(EDITING_DRAW_TASKS)
export const GanttDrawDatesExample = runner(EDITING_DRAW_DATES)
export const GanttSelectionExample = runner(EDITING_SELECTION)
export const GanttDrawingPreviewExample = runner(EDITING_PREVIEW)

export const GanttLinksExample = runner(LINKS_OVERVIEW)
export const GanttMilestoneLinksExample = runner(LINKS_MILESTONES)
export const GanttLinkTooltipExample = runner(LINKS_TOOLTIP)

export const GanttMarkersExample = runner(MARKERS_RELEASES)
export const GanttTodayAndProjectExample = runner(MARKERS_TODAY_PROJECT)
export const GanttMarkersStoreExample = runner(MARKERS_STORE)
export const GanttMarkersReloadExample = runner(MARKERS_RELOAD)
export const GanttMarkerChipExample = runner(MARKERS_CHIP)

export const GanttNonWorkingDaysExample = runner(NON_WORKING_HOLIDAYS)
export const GanttWeekendsExample = runner(NON_WORKING_WEEKENDS)
export const GanttDropOnWeekendsExample = runner(NON_WORKING_DROP)
export const GanttWorkingDurationExample = runner(NON_WORKING_DURATION)
export const GanttNonWorkingDaysStoreExample = runner(NON_WORKING_STORE)
export const GanttNonWorkingDayTooltipExample = runner(NON_WORKING_TOOLTIP)

export const GanttTooltipExample = runner(TOOLTIP_DEFAULT)
export const GanttComposedTooltipExample = runner(TOOLTIP_COMPOSE)
export const GanttMilestoneTooltipExample = runner(TOOLTIP_MILESTONES)
export const GanttTooltipPartExample = runner(TOOLTIP_OWN_PART)
export const GanttTooltipSlotsExample = runner(TOOLTIP_SLOTS)

export const GanttOwnModuleExample = runner(MODULE_STATUS_COLOURS)
export const GanttClassHookExample = runner(MODULE_CRITICAL)
export const GanttChartConfigExample = runner(MODULE_SIDE_TEXT)
export const GanttCellClassExample = runner(MODULE_REVIEW_DAYS)
export const GanttSnapHookExample = runner(MODULE_SNAPPING)
export const GanttSurfaceExample = runner(MODULE_SURFACE)
