import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'
import { PEOPLE_FILE, withOfficePlan } from '../officePlanFiles'

const COLOURS_BY_STATUS_CODE = `import { createTaskEditingModule, DatasetControl, IGrid, IPercentCompleteCellComponents, ITaskGridView, ITaskRuntime, TASK_GRID_PRIORITY, TaskDatasetControl, TaskGrid, useGridCell } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { ProgressIndicator } from '@fluentui/react'
import { createLibraryModule, IGanttModule, TaskGantt } from '@talxis/base-controls/gantt'
import { createLoadOffice, STATUS } from './office'

const views: ITaskGridView[] = [{ id: 'status', name: 'Status', resolve: () => ({ columns: [{ name: 'subject' }, { name: 'status' }, { name: 'done', visualSizeFactor: 110 }] }) }]
const loadOffice = createLoadOffice()
const loadTasks = (taskRuntime: ITaskRuntime) => ({ ...loadOffice(taskRuntime), views })

//new: a hue for each status that needs attention
const STATUS_HUES: { [status: number]: string } = { [STATUS.waiting]: '#c19c00', [STATUS.done]: '#107c10' }

//new: an option set's value comes back as a string
const getStatusHue = (task: IRecord): string | undefined => STATUS_HUES[Number(task.getValue('status'))]

//new: drawn inside a cell, so useGridCell() returns the cell and its task
const StatusProgress = (props: React.ComponentProps<typeof ProgressIndicator>) => {
    const hue = getStatusHue(useGridCell().getRecord())
    return <ProgressIndicator {...props} styles={{ ...props.styles, progressBar: hue && { backgroundColor: hue } }} />
}

//new: the slot that draws the bar of a % done cell
const doneCell: IPercentCompleteCellComponents = { progress: { onRender: props => <StatusProgress {...props} /> } }

//new: called on every mount of the grid, before it loads
const onSetup = (grid: IGrid) => {
    //new: after the task grid's own hook, which gives % done its cell
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const done = columnDefs.find(colDef => colDef.colId === 'done')
        if (done) {
            done.cellRendererParams = { ...done.cellRendererParams, components: doneCell }
        }
    }, TASK_GRID_PRIORITY.tree + 1)
    //new: runs for every cell, and again when its task changes
    grid.services.get('cells').hooks.theme.add((builder, { record }) => {
        const hue = getStatusHue(record)
        if (hue) {
            builder.tint(hue)
        }
    })
}

//new: a Gantt module of your own, named in types.ts, that colours each bar by its status
const statusBarsModule: IGanttModule = {
    name: 'statusBars',
    onLoad: gantt => {
        //new: the tasks come with the chart; the hook runs for each, and again when it changes
        gantt.services.observe('tasks', chartTasks => chartTasks.hooks.task.add((task, { record }) => {
            task.color = getStatusHue(record)
        }))
    },
}

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split defaultGanttSize={30}>
            <TaskGrid onSetup={onSetup} modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), statusBarsModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const PEOPLE_IN_CELLS_CODE = `import { createMemoryLookupManyModule, DatasetControl, ILookupManyUiPillProps, IMemoryLookupManyValues, ITaskGridView, ITaskRuntime, LookupManyUiPill, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { Persona, PersonaSize } from '@fluentui/react'
import { createLoadOffice, OFFICE_TASKS } from './office'
import { ASSIGNMENTS, PEOPLE, PERSON_COLUMNS, PERSON_METADATA } from './people'

const views: ITaskGridView[] = [{ id: 'people', name: 'People', resolve: () => ({ columns: [{ name: 'subject' }, { name: 'assignedto' }, { name: 'due' }] }) }]
const loadOffice = createLoadOffice()
const loadTasks = (taskRuntime: ITaskRuntime) => ({ ...loadOffice(taskRuntime), views })

const sources = { person: { records: new MemoryTable({ idKey: 'personid', rows: PEOPLE }), metadata: PERSON_METADATA, columns: PERSON_COLUMNS } }
const columns = { assignedto: { displayName: 'Assigned to', entityName: 'person' } }
const values = new MemoryTable<IMemoryLookupManyValues>({
    idKey: 'taskId',
    rows: OFFICE_TASKS.map(task => ({ taskId: task.taskid, values: { assignedto: ASSIGNMENTS[task.taskid] ?? [] } })),
})

//new: a person as a chip with their initials and first name; the pill around it still opens them
const onRenderPill = (props: ILookupManyUiPillProps) => {
    const person = PEOPLE.find(row => row.personid === props.reference.id.guid)
    return <LookupManyUiPill {...props} components={{
        onRenderLabel: () => <Persona text={props.reference.name.split(' ')[0]} imageInitials={person?.initials} size={PersonaSize.size24} />,
    }} />
}

//new: the cell draws who fits with the slot, and the +N lists the rest with it too
const lookupManyModule = createMemoryLookupManyModule({ sources, columns, values, components: { cell: { onRenderPill } } })

const GridExample = () => <TaskDatasetControl modules={[lookupManyModule]} onLoad={loadTasks} height='420px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const A_TOOLTIP_OF_YOUR_OWN_CODE = `import { createTaskEditingModule, DatasetControl, RecordCardFieldRow, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createTaskTooltipModule, TaskGantt, TaskTooltip, useTaskTooltip } from '@talxis/base-controls/gantt'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//new: a part of your own reads the task under the pointer
const HoursLeftRow = () => {
    const { record } = useTaskTooltip()
    const hoursLeft = Math.round(Number(record.getValue('effort')) * (100 - Number(record.getValue('done'))) / 100)
    return <RecordCardFieldRow label='Hours left' iconName='Clock'>{hoursLeft} h</RecordCardFieldRow>
}

const tooltipModule = createTaskTooltipModule({
    statusColumnName: 'status',
    components: {
        //new: the whole tooltip, of the library's parts and yours, in your order
        onRender: () => <TaskTooltip.Callout>
            <TaskTooltip.Header />
            <TaskTooltip.FieldRows>
                <TaskTooltip.FieldRow columnName='priority' iconName='Flag' />
                <HoursLeftRow />
            </TaskTooltip.FieldRows>
            <TaskTooltip.DateRangeRow />
        </TaskTooltip.Callout>,
    },
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='420px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule(), tooltipModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const CONTENT_ON_THE_BARS_CODE = `import { createTaskEditingModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { getIconClassName } from '@fluentui/react'
import { createBarDraggingModule, createLibraryModule, IGanttModule, TaskGantt } from '@talxis/base-controls/gantt'
import { createLoadOffice, PRIORITY } from './office'

const loadTasks = createLoadOffice()

const barContentModule: IGanttModule = {
    name: 'barContent',
    onLoad: gantt => {
        //new: what the templates read; DHTMLX keeps any field you set on a task
        gantt.services.observe('tasks', chartTasks => chartTasks.hooks.task.add((task, { record }) => {
            task.due = record.getFormattedValue('due')
            task.isHighPriority = Number(record.getValue('priority')) === PRIORITY.high
        }))
        //new: DHTMLX's chart before it is drawn; its templates return HTML
        gantt.hooks.chartConfig.add(chart => {
            //new: inside a bar, how far along its task is
            chart.templates.task_text = (start, end, task) => task.progress ? Math.round(task.progress * 100) + '%' : ''
            //new: beside it, the day it is due, flagged on high-priority work
            chart.templates.rightside_text = (start, end, task) => task.isHighPriority ? '<b class="high-priority"><i class="' + getIconClassName('Flag') + '"></i> ' + task.due + '</b>' : task.due
        })
        //new: styles nest under the chart, so this class counts only inside it
        gantt.theme.hooks.styles.add((result, theme) => result.styles.push({ '.high-priority': { color: theme.palette.redDark } }))
    },
}

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='420px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), createBarDraggingModule(), barContentModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const ganttModuleTypes = (moduleName: string): IGridExampleFile => ({
    name: 'types.ts',
    code: `//not run on this page: names the Gantt module, whose onLoad returns nothing
declare module '@talxis/base-controls/gantt' {
    interface IGanttModuleMap {
        ${moduleName}: void
    }
}

export { }
`,
})

export const ColoursByStatusExample = () => <GridExampleRunner seedCode={withOffice(COLOURS_BY_STATUS_CODE, ganttModuleTypes('statusBars'))} tabs={TASK_EXAMPLE_TABS} />
export const PeopleInCellsExample = () => <GridExampleRunner seedCode={withOfficePlan(PEOPLE_IN_CELLS_CODE, PEOPLE_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const ATooltipOfYourOwnExample = () => <GridExampleRunner seedCode={withOffice(A_TOOLTIP_OF_YOUR_OWN_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const ContentOnTheBarsExample = () => <GridExampleRunner seedCode={withOffice(CONTENT_ON_THE_BARS_CODE, ganttModuleTypes('barContent'))} tabs={TASK_EXAMPLE_TABS} />
