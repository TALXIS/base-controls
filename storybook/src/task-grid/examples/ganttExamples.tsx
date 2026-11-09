import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

//what each package entry exports that these examples use
const ENTRY_EXPORTS: [string, string[]][] = [
    ['@talxis/base-controls', ['DatasetControl', 'TaskDatasetControl', 'TaskGrid', 'createRowSelectionModule', 'createTaskEditingModule', 'createMemoryProjectModule', 'createMemoryDependenciesModule']],
    ['@talxis/base-controls/gantt', ['IGanttModule', 'IMarker', 'INonWorkingDay', 'TaskGantt', 'TaskTooltip', 'useMarker', 'createLibraryModule', 'createMemoryMarkersModule', 'createMemoryNonWorkingDaysModule', 'createBarDraggingModule', 'createTaskDrawingModule', 'createTaskSelectionModule', 'createTaskTooltipModule', 'createLinksModule']],
]

//puts an import line for every entry the code uses on top of it
const withImports = (code: string) => ENTRY_EXPORTS
    .map(([entry, names]) => [entry, names.filter(name => new RegExp(`\\b${name}\\b`).test(code))] as const)
    .filter(([, names]) => names.length > 0)
    .map(([entry, names]) => `import { ${names.join(', ')} } from '${entry}'\n`)
    .join('') + code

interface IGanttExample {
    /** Declarations above the component. */
    setup?: string
    /** The parts at the start and the end of the header, as JSX. */
    header?: { start?: string, end?: string }
    /** The `TaskDatasetControl` props beyond `onLoad` and `height`. */
    controlProps?: string
    /** The control modules, as array items. */
    controlModules?: string
    /** The `TaskGrid` modules, as one line of array items. */
    gridModules?: string
    /** The Gantt modules after the library module, as array items. */
    ganttModules: string
}

const createHeaderRegion = (region: 'Start' | 'End', parts?: string) => parts ? `
            <DatasetControl.Header.${region}>
                ${parts}
            </DatasetControl.Header.${region}>` : ''

const createHeader = (header?: IGanttExample['header']) => header ? `
        <DatasetControl.Header>${createHeaderRegion('Start', header.start)}${createHeaderRegion('End', header.end)}
        </DatasetControl.Header>` : ''

const createGanttCode = (example: IGanttExample) => withImports(`import { createLoadTasks, createTaskDatabase } from './tasks'
${example.setup ?? ''}
const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])${example.controlModules ? `
    const controlModules = [${example.controlModules}
    ]` : ''}
    const ganttModules = [
        createLibraryModule(),${example.ganttModules}
    ]

    return <TaskDatasetControl${example.controlModules ? ' modules={controlModules}' : ''}${example.controlProps ?? ''} onLoad={createLoadTasks(database)} height='520px'>${createHeader(example.header)}
        <DatasetControl.Body>
            <TaskGantt.Split>
                <TaskGrid${example.gridModules ? ` modules={[${example.gridModules}]}` : ''} />
                <TaskGantt modules={ganttModules} />
            </TaskGantt.Split>
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`)

const PROJECT = `
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),`

const SHOWCASE_CODE = createGanttCode({
    header: { start: '<TaskGantt.ZoomSlider />', end: '<TaskDatasetControl.Ribbon />' },
    controlProps: ' enableEditing',
    gridModules: 'createTaskEditingModule()',
    ganttModules: `
        createBarDraggingModule(),`,
})

const BASIC_CODE = withImports(`import { createLoadTasks, createTaskDatabase } from './tasks'

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])

    //the Gantt needs the startDate and endDate tasks.ts maps
    return <TaskDatasetControl onLoad={createLoadTasks(database)} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <TaskGantt.ZoomSlider />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* the grid, then the Gantt */}
            <TaskGantt.Split>
                <TaskGrid />
                {/* the library module is required */}
                <TaskGantt modules={[createLibraryModule()]} />
            </TaskGantt.Split>
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`)

const MODULES_CODE = createGanttCode({
    header: { start: '<TaskGantt.ZoomSlider />', end: `<TaskDatasetControl.Ribbon />
                <TaskDatasetControl.Settings />` },
    controlProps: ' enableCreation enableEditing',
    controlModules: `${PROJECT}
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),`,
    gridModules: `createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()`,
    ganttModules: `
        //a feature left out is not there at all
        createMemoryMarkersModule({ markers: [{ id: 'beta', text: 'Beta', date: dayjs('2025-12-01') }] }),
        createMemoryNonWorkingDaysModule({ nonWorkingDays: NON_WORKING_DAYS }),
        createBarDraggingModule(),
        //Ctrl+drag over a row draws a new task
        createTaskDrawingModule(),
        createTaskSelectionModule(),
        createTaskTooltipModule({ statusColumnName: 'statuscode' }),
        createLinksModule(),`,
})

const EDITING_CODE = createGanttCode({
    header: { end: '<TaskDatasetControl.Ribbon />' },
    controlProps: ' enableCreation enableEditing',
    gridModules: `createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()`,
    ganttModules: `
        //needs enableEditing
        createBarDraggingModule(),
        //Ctrl+drag over a row draws a new task with enableCreation
        createTaskDrawingModule(),
        createTaskSelectionModule(),`,
})

const MARKERS_CODE = createGanttCode({
    setup: `
const RELEASES: IMarker[] = [
    { id: 'beta', text: 'Beta', date: dayjs('2025-12-01'), color: '#8764b8' },
    { id: 'launch', text: 'Launch', date: dayjs('2026-04-01'), color: '#107c10' },
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
    controlModules: `
        //its start and end are marked too${PROJECT}`,
    ganttModules: `
        createMemoryMarkersModule({
            markers: RELEASES,
            components: { chip: { onRenderChip: props => <LaunchChip {...props} /> } },
        }),`,
})

const NON_WORKING_DAYS_CODE = createGanttCode({
    setup: `
const HOLIDAYS: INonWorkingDay[] = [
    //endDate is the last day, included
    { id: 'christmas', date: dayjs('2025-12-24'), endDate: dayjs('2025-12-26'), description: 'Christmas holidays', recurrence: 'FREQ=YEARLY' },
    { id: 'newYearsDay', date: dayjs('2026-01-01'), description: "New Year's Day", recurrence: 'FREQ=YEARLY' },
    //every month's first Friday
    { id: 'teamDay', date: dayjs('2025-10-03'), description: 'Team day', recurrence: 'FREQ=MONTHLY;BYDAY=1FR' },
]
`,
    header: { start: '<TaskGantt.ZoomSlider />', end: '<TaskDatasetControl.Settings />' },
    controlProps: ' enableEditing',
    gridModules: 'createTaskEditingModule()',
    ganttModules: `
        createMemoryNonWorkingDaysModule({ nonWorkingDays: HOLIDAYS }),
        createBarDraggingModule(),`,
})

const TOOLTIP_CODE = createGanttCode({
    controlProps: ' enableEditing',
    gridModules: 'createTaskEditingModule()',
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
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),`,
    ganttModules: `
        createLinksModule(),`,
})

const OWN_MODULE_CODE = createGanttCode({
    header: { start: '<TaskGantt.ZoomSlider />' },
    controlProps: ' enableEditing',
    gridModules: 'createTaskEditingModule()',
    setup: `
//fiscal years start in July; zoom out until the scale shows quarters
const fiscalScaleModule: IGanttModule = {
    name: 'fiscalScale',
    onLoad: gantt => {
        gantt.services.observe('zooming', zooming => zooming.hooks.scaleLabel.add((result, { date, unit }) => {
            if (unit === 'quarter') {
                const month = date.getMonth()
                const fiscalYear = month >= 6 ? date.getFullYear() + 1 : date.getFullYear()
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
        gantt.services.observe('tasks', tasks => tasks.hooks.task.add((task, { record }) => {
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
import { createProLibraryModule } from '@talxis/base-controls/gantt'
import { Gantt } from 'dhtmlx-gantt-pro'
import 'dhtmlx-gantt-pro/codebase/dhtmlxgantt.css'

export const libraryModule = createProLibraryModule({ Gantt })
`,
}

const OWN_MODULE_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `//a module file, so the block below adds to the Gantt's own types
export {}

declare module '@talxis/base-controls/gantt' {
    //each module's name and what its onLoad returns
    interface IGanttModuleMap {
        fiscalScale: {}
        criticalTasks: {}
    }
}
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
export const GanttOwnModuleExample = () => <GridExampleRunner seedCode={[...withTasks(OWN_MODULE_CODE), OWN_MODULE_TYPES_FILE]} tabs={TASK_EXAMPLE_TABS} />
