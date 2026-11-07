import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

interface IGanttExample {
    /** Declarations above the component. */
    setup?: string
    /** The Gantt modules after the library module, as array items. */
    ganttModules: string
    /** The control modules, as array items. */
    controlModules?: string
    /** The `TaskDatasetControl` props beyond the ones every example sets. */
    controlProps?: string
}

const createGanttCode = (example: IGanttExample) => `import { createLoadTasks, createTaskDatabase } from './tasks'
${example.setup ?? ''}
const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()], [])${example.controlModules ? `
    const controlModules = React.useMemo(() => [${example.controlModules.trimEnd()}
    ], [])` : ''}
    const ganttModules = React.useMemo(() => [
        createLibraryModule(),${example.ganttModules}
    ], [])

    return <TaskDatasetControl${example.controlModules ? ' modules={controlModules}' : ''}${example.controlProps ?? ''} onLoad={loadTasks} height='520px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
                <TaskGantt.ZoomSlider />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Ribbon />
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGantt.Split>
                <TaskGrid modules={gridModules} />
                <TaskGantt modules={ganttModules} />
            </TaskGantt.Split>
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const PROJECT = `
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),`

const SHOWCASE_CODE = createGanttCode({
    controlProps: ' enableCreation enableEditing enableDeletion',
    controlModules: `${PROJECT}
        createTaskDraggingModule(),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    `,
    ganttModules: `
        createMemoryMarkersModule({ markers: [{ id: 'beta', text: 'Beta', date: dayjs('2025-12-01') }] }),
        createMemoryNonWorkingDaysModule({ nonWorkingDays: NON_WORKING_DAYS }),
        createBarDraggingModule(),
        //hold Ctrl and drag over a row to draw a task
        createTaskDrawingModule(),
        createTaskSelectionModule(),
        //point at a bar
        createTaskTooltipModule({ statusColumnName: 'statuscode' }),
        //drag from the end of one bar to another to link them
        createLinksModule(),`,
})

const BASIC_CODE = `import { createLoadTasks, createTaskDatabase } from './tasks'

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    //the Gantt needs the startDate and endDate tasks.ts maps
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    //the library module is required
    const ganttModules = React.useMemo(() => [createLibraryModule()], [])

    return <TaskDatasetControl onLoad={loadTasks} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <TaskGantt.ZoomSlider />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Ribbon />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* the grid, then the Gantt */}
            <TaskGantt.Split>
                <TaskGrid />
                <TaskGantt modules={ganttModules} />
            </TaskGantt.Split>
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const MODULES_CODE = createGanttCode({
    controlProps: ' enableEditing',
    controlModules: `
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    `,
    ganttModules: `
        //a feature left out is not there at all
        createBarDraggingModule(),
        createTaskTooltipModule({ statusColumnName: 'statuscode' }),
        createLinksModule(),`,
})

const EDITING_CODE = createGanttCode({
    controlProps: ' enableCreation enableEditing',
    ganttModules: `
        //needs enableEditing
        createBarDraggingModule({ enableMove: true, enableResize: true }),
        //needs enableCreation
        createTaskDrawingModule(),
        createTaskSelectionModule({ enableSelectionBox: true }),`,
})

const MARKERS_CODE = createGanttCode({
    setup: `
const RELEASES: IMarker[] = [
    { id: 'beta', text: 'Beta', date: dayjs('2025-12-01'), color: '#8764b8' },
    { id: 'launch', text: 'Launch', date: dayjs('2026-01-20'), color: '#107c10' },
]

//useMarker() returns the marker this chip draws
const LaunchChip = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { marker } = useMarker()
    if (marker.id !== 'launch') {
        return <div {...props} />
    }
    const days = marker.date.diff(dayjs().startOf('day'), 'day')
    return <div {...props}>{marker.text} · {days >= 0 ? 'in ' + days + ' days' : Math.abs(days) + ' days ago'}</div>
}
`,
    controlModules: PROJECT,
    ganttModules: `
        createMemoryMarkersModule({
            markers: RELEASES,
            today: { color: '#d13438' },
            project: { color: '#ca5010' },
            components: { chip: { onRenderChip: props => <LaunchChip {...props} /> } },
        }),`,
})

const NON_WORKING_DAYS_CODE = createGanttCode({
    controlProps: ' enableEditing',
    setup: `
const COMPANY_DAYS: INonWorkingDay[] = [
    ...NON_WORKING_DAYS,
    //every month's first Friday
    { id: 'teamDay', date: dayjs('2025-10-03'), description: 'Team day', recurrence: 'FREQ=MONTHLY;BYDAY=1FR' },
    //endDate is the last day, included
    { id: 'hackathon', date: dayjs('2025-11-24'), endDate: dayjs('2025-11-26'), description: 'Hackathon' },
]
`,
    ganttModules: `
        createMemoryNonWorkingDaysModule({ nonWorkingDays: COMPANY_DAYS, enableWeekends: true }),
        createBarDraggingModule(),`,
})

const TOOLTIP_CODE = createGanttCode({
    controlProps: ' enableEditing',
    ganttModules: `
        createBarDraggingModule(),
        createTaskTooltipModule({
            statusColumnName: 'statuscode',
            //leave onRender out for the default tooltip
            components: {
                onRender: () => <TaskTooltip.Callout>
                    <TaskTooltip.Header />
                    <TaskTooltip.ProgressRow />
                    <TaskTooltip.FieldRows>
                        <TaskTooltip.FieldRow columnName='priority' iconName='Flag' />
                        <TaskTooltip.FieldRow columnName='estimatedeffort' iconName='Clock' />
                        {/* add a FieldRow for description */}
                    </TaskTooltip.FieldRows>
                    <TaskTooltip.DateRangeRow />
                </TaskTooltip.Callout>,
            },
        }),`,
})

const LINKS_CODE = createGanttCode({
    controlProps: ' enableEditing',
    controlModules: `
        //the links module draws what this module holds
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    `,
    ganttModules: `
        createBarDraggingModule(),
        createLinksModule(),`,
})

const OWN_MODULE_CODE = createGanttCode({
    controlProps: ' enableEditing',
    setup: `
//fiscal years start in July; zoom out until the scale shows quarters
const fiscalScaleModule: IGanttModule = {
    name: 'fiscalScale',
    onLoad: gantt => {
        gantt.services.observe('zooming', (zooming: any) => zooming.hooks.scaleLabel.add((result: { label: string }, cell: { date: Date, unit: string }) => {
            if (cell.unit === 'quarter') {
                const month = cell.date.getMonth()
                const fiscalYear = month >= 6 ? cell.date.getFullYear() + 1 : cell.date.getFullYear()
                result.label = 'FY' + String(fiscalYear).slice(2) + ' Q' + (Math.floor(((month + 6) % 12) / 3) + 1)
            }
        }))
        return {}
    },
}

//critical tasks are drawn red
const criticalTasksModule: IGanttModule = {
    //unique among the Gantt's modules
    name: 'criticalTasks',
    //runs on every mount, before the chart is drawn
    onLoad: gantt => {
        //the tasks service comes with the chart, so observe it
        gantt.services.observe('tasks', (tasks: any) => tasks.hooks.task.add((task: any, { record }: { record: IRecord }) => {
            if (Number(record.getValue('priority')) === 3) {
                task.color = '#d13438'
            }
        }))
        return {}
    },
}
`,
    ganttModules: `
        fiscalScaleModule,
        criticalTasksModule,`,
})

const PRO_LIBRARY_FILE: IGridExampleFile = {
    name: 'pro.ts',
    code: `//with a DHTMLX Gantt PRO licence, use this library module instead of createLibraryModule() in GridExample.tsx
import { Gantt } from 'dhtmlx-gantt-pro'
import 'dhtmlx-gantt-pro/codebase/dhtmlxgantt.css'

export const libraryModule = createProLibraryModule({ Gantt })
`,
}

export const GanttShowcaseExample = () => <GridExampleRunner seedCode={withTasks(SHOWCASE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const GanttBasicExample = () => <GridExampleRunner seedCode={withTasks(BASIC_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const GanttModulesExample = () => <GridExampleRunner seedCode={[...withTasks(MODULES_CODE), PRO_LIBRARY_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const GanttEditingExample = () => <GridExampleRunner seedCode={withTasks(EDITING_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const GanttMarkersExample = () => <GridExampleRunner seedCode={withTasks(MARKERS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const GanttNonWorkingDaysExample = () => <GridExampleRunner seedCode={withTasks(NON_WORKING_DAYS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const GanttTooltipExample = () => <GridExampleRunner seedCode={withTasks(TOOLTIP_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const GanttLinksExample = () => <GridExampleRunner seedCode={withTasks(LINKS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const GanttOwnModuleExample = () => <GridExampleRunner seedCode={withTasks(OWN_MODULE_CODE)} tabs={TASK_EXAMPLE_TABS} />
