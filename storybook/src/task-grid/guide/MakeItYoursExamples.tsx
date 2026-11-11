import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from '../examples/shared'

const STATUS_CODE = `import { DatasetControl, IGrid, ITaskGridComponents, TaskDatasetControl, TaskGrid, createTaskEditingModule, useGridCell } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { IProgressIndicatorProps, mergeStyleSets } from '@fluentui/react'
import { IGanttModule, TaskGantt, createLibraryModule } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

//the day the plan is reported on; dayjs() in your app
const STATUS_DATE = dayjs('2026-01-12')

//a hue for each Status that needs attention: 3 Waiting, 5 Completed, 6 Cancelled
const STATUS_HUES: { [status: number]: string } = { 3: '#ca5010', 5: '#107c10', 6: '#a4262c' }

const getStatusHue = (task: IRecord): string | undefined => STATUS_HUES[Number(task.getValue('statuscode'))]

const isOverdue = (task: IRecord) => {
    const due = task.getValue('scheduledend')
    return !!due && dayjs(due).isBefore(STATUS_DATE, 'day') && Number(task.getValue('percentcomplete')) < 100
}

const styles = mergeStyleSets({
    subject: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
    subjectText: { minWidth: 0, overflow: 'hidden' },
    badge: { flexShrink: 0, padding: '0 6px', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#fff', backgroundColor: '#d13438' },
    progress: { display: 'flex', alignItems: 'center', gap: 8, width: '100%' },
    track: { flexGrow: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 4 },
})

//drawn inside the cell, so it reads the cell's task and theme
const ProgressBar = (props: IProgressIndicatorProps) => {
    const cell = useGridCell()
    const { palette } = cell.getTheme().get()
    const percent = Math.round((props.percentComplete ?? 0) * 100)
    return <div className={styles.progress}>
        <div className={styles.track} style={{ backgroundColor: palette.neutralLighter }}>
            <div className={styles.fill} style={{ width: percent + '%', backgroundColor: getStatusHue(cell.getRecord()) ?? palette.themePrimary }} />
        </div>
        <span>{percent}%</span>
    </div>
}

const components: ITaskGridComponents = {
    treeCell: {
        //the subject as the grid draws it, with a badge after it on a late task
        columnControl: {
            onRender: (props, defaultRender) => <div className={styles.subject}>
                <div className={styles.subjectText}>{defaultRender(props)}</div>
                {isOverdue(props.parameters.Record.raw) && <span className={styles.badge}>Overdue</span>}
            </div>,
        },
    },
    //the bar the % Complete column draws, while the cell is not being edited
    percentComplete: { progress: { onRender: props => <ProgressBar {...props} /> } },
}

//runs for every cell, and again when its task changes
const onSetup = (grid: IGrid) => grid.services.get('cells').hooks.theme.add((builder, { record }) => {
    const hue = getStatusHue(record)
    if (hue) {
        builder.tint(hue)
    }
})

//a Gantt module: each bar takes the hue of its task's status
const statusBarsModule: IGanttModule = {
    name: 'statusBars',
    onLoad: gantt => {
        //the tasks service comes with the chart; the hook runs for each task, and again when it changes
        gantt.services.observe('tasks', chartTasks => chartTasks.hooks.task.add((task, { record }) => {
            task.color = getStatusHue(record)
        }))
        return {}
    },
}

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableEditing height='520px'>
    <DatasetControl.Body>
        <TaskGantt.Split defaultGanttSize={40}>
            <TaskGrid components={components} onSetup={onSetup} modules={[createTaskEditingModule()]} />
            <TaskGantt modules={[createLibraryModule(), statusBarsModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const PEOPLE_CODE = `import { DatasetControl, ILookupManyColumn, ILookupManyUiPillProps, LookupManyUiPill, MemoryTable, TaskDatasetControl, TaskGrid, createMemoryLookupManyModule } from '@talxis/base-controls'
import { Persona, PersonaSize, mergeStyleSets } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'
import { createTeamValues } from './team'

//the people column; the picker draws people with their pictures
const COLUMNS: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Team', entityName: 'mem_person', appearance: { type: 'people' } },
}

const loadTasks = createLoadTasks(createTaskTable(), [{
    id: 'team',
    name: 'Team',
    resolve: () => ({ columns: [...getTaskColumns('subject', 'scheduledend'), { name: 'assignedto', dataType: 'Lookup.Simple', visualSizeFactor: 300 }] }),
}])

//LOOKUP_MANY_SOURCES holds the people; team.ts what each task's Team column holds
const values = new MemoryTable({ idKey: 'taskId', rows: createTeamValues() })

const styles = mergeStyleSets({
    //room for a 24px picture, rounded like the picture
    chip: { '&&': { height: 24, paddingLeft: 0, borderRadius: 12 } },
})

//one person as a chip: picture and first name; the pill around it still opens the person
const onRenderPill = (props: ILookupManyUiPillProps) => <LookupManyUiPill {...props} className={styles.chip} components={{
    //a person carries the people table's picture in its data
    onRenderLabel: () => <Persona text={props.reference.name?.split(' ')[0]} imageUrl={(props.reference as { data?: { imageurl?: string } }).data?.imageurl} size={PersonaSize.size24} />,
}} />

//the module counts who does not fit in +N, and lists them with the same slot when it is pointed at
const lookupManyModule = createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: COLUMNS, values, components: { cell: { onRenderPill } } })

const GridExample = () => <TaskDatasetControl modules={[lookupManyModule]} onLoad={loadTasks} height='480px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const TEAM_FILE: IGridExampleFile = {
    name: 'team.ts',
    code: `import type { IMemoryLookupManyValues } from '@talxis/base-controls'

const ID = TASK_METADATA.PrimaryIdAttribute
//LOOKUP_MANY_VALUES holds each sample task's one assignee
const assignees = new Map(LOOKUP_MANY_VALUES.map(row => [row.taskId, row.values.assignedto ?? []]))

//the people on a task and on everything under it
const getTeam = (taskId: string): ComponentFramework.EntityReference[] => [
    ...assignees.get(taskId) ?? [],
    ...TASKS.filter(task => task.parentid?.[0]?.id.guid === taskId).flatMap(subtask => getTeam(subtask[ID])),
]

//each person once, so a project lists its whole team
export const createTeamValues = (): IMemoryLookupManyValues[] => TASKS.map(task => {
    const team = new Map(getTeam(task[ID]).map(person => [person.id.guid, person]))
    return { taskId: task[ID], values: { assignedto: [...team.values()] } }
})
`,
}

const TOOLTIP_CODE = `import { DatasetControl, MemoryTable, RecordCardFieldRow, TaskDatasetControl, TaskGrid, createMemoryDependenciesModule, createMemoryLookupManyModule, createRowSelectionModule } from '@talxis/base-controls'
import { Persona, PersonaSize, Text } from '@fluentui/react'
import { TaskGantt, TaskTooltip, createLibraryModule, createLinksModule, createTaskSelectionModule, createTaskTooltipModule, useTaskTooltip } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

//the task modules the tooltip reads: the assignees and the dependencies
const controlModules = [
    createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: { assignedto: LOOKUP_MANY_COLUMNS.assignedto }, values: new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES }) }),
    createMemoryDependenciesModule({ dependencies: new MemoryTable({ idKey: 'id', rows: DEPENDENCIES }) }),
]

//a task's values reach the tooltip when the view loads their columns
const loadTasks = createLoadTasks(createTaskTable(), [{
    id: 'all',
    name: 'All tasks',
    resolve: () => ({ columns: [...getTaskColumns('subject', 'statuscode', 'percentcomplete'), { name: 'assignedto', dataType: 'Lookup.Simple' }] }),
}])

//a part of your own reads the task under the pointer with useTaskTooltip()
const OwnerRow = () => {
    const { record } = useTaskTooltip()
    const [owner] = record.getValue('assignedto') ?? []
    if (!owner) {
        return null
    }
    return <RecordCardFieldRow label='Owner' iconName='Contact'>
        <Persona text={owner.name} imageUrl={owner.data?.imageurl} size={PersonaSize.size24} />
    </RecordCardFieldRow>
}

//the dependencies module, reached through the task runtime the tooltip's gantt holds
const DependencyRow = () => {
    const { record, gantt } = useTaskTooltip()
    const dependencies = gantt.getTaskRuntime().services.get('datasetControl').modules.get('dependencies')
    const waitsOn = dependencies.getPredecessors(record.getRecordId()).length
    const blocks = dependencies.getSuccessors(record.getRecordId()).length
    return <RecordCardFieldRow label='Dependencies' iconName='Link'>{\`Waits on \${waitsOn}, blocks \${blocks}\`}</RecordCardFieldRow>
}

const ganttModules = [
    createLibraryModule(),
    //a double-click on a bar opens the task, which the tooltip tells the user
    createTaskSelectionModule(),
    createLinksModule(),
    createTaskTooltipModule({
        //the header shows this option set as a pill in its colour
        statusColumnName: 'statuscode',
        components: {
            //the whole tooltip: the library's parts and yours, in your order
            onRender: () => <TaskTooltip.Callout>
                <TaskTooltip.Header />
                <TaskTooltip.ProgressRow />
                <TaskTooltip.FieldRows>
                    <OwnerRow />
                    <DependencyRow />
                </TaskTooltip.FieldRows>
                <TaskTooltip.DateRangeRow />
                <Text variant='small'>Double-click the bar to open the task</Text>
            </TaskTooltip.Callout>,
        },
    }),
]

const GridExample = () => <TaskDatasetControl modules={controlModules} onLoad={loadTasks} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const BAR_CONTENT_CODE = `import { DatasetControl, TaskDatasetControl, TaskGrid, createMemoryDependenciesModule, createRowSelectionModule } from '@talxis/base-controls'
import { getIconClassName } from '@fluentui/react'
import { IGanttModule, TaskGantt, createLibraryModule, createLinksModule, createTaskSelectionModule } from '@talxis/base-controls/gantt'
import { dependencies, loadLaunch } from './launch'

const barContentModule: IGanttModule = {
    name: 'barContent',
    onLoad: gantt => {
        const provider = gantt.getTaskRuntime().getProvider()
        const dependencyModule = gantt.getTaskRuntime().services.get('datasetControl').modules.get('dependencies')
        let chain = new Set<string>()

        //the selected task, every task it waits on and every task that waits on it, all the way along
        const updateChain = () => {
            const [taskId, ...others] = provider.getSelectedRecordIds()
            chain = new Set(taskId && !others.length ? [taskId] : [])
            const walk = (id: string, getNext: (id: string) => string[]) => getNext(id).filter(next => !chain.has(next)).forEach(next => {
                chain.add(next)
                walk(next, getNext)
            })
            if (chain.size) {
                walk(taskId, id => dependencyModule.getPredecessors(id).map(dependency => dependency.predecessorTaskId))
                walk(taskId, id => dependencyModule.getSuccessors(id).map(dependency => dependency.successorTaskId))
            }
            gantt.render()
        }
        //a new selection, or a link drawn or deleted
        const removers = [provider.addEventListener('onRecordsSelected', updateChain), dependencyModule.events.addEventListener('onDependenciesChanged', updateChain)]
        gantt.events.addEventListener('onDestroyed', () => removers.forEach(remove => remove()))

        gantt.services.observe('tasks', chartTasks => {
            const removeTaskHook = chartTasks.hooks.task.add((task, { record }) => {
                //what the templates below read: DHTMLX keeps any field you set on a task
                task.isCritical = Number(record.getValue('priority')) === 3
                if (task.type === 'milestone') {
                    task.color = '#8764b8'
                }
            })
            //class names on each bar, for the styles below
            const removeClassHook = chartTasks.hooks.taskClass.add((classNames, { record }) => {
                if (chain.size) {
                    classNames.push(chain.has(record.getRecordId()) ? 'in-chain' : 'off-chain')
                }
            })
            return () => [removeTaskHook, removeClassHook].forEach(remove => remove())
        })

        //DHTMLX's templates return HTML, so the task's own text is escaped
        gantt.hooks.chartConfig.add(chart => {
            const getLinkClass = chart.templates.link_class
            //inside a bar: how far along it is
            chart.templates.task_text = (start, end, task) => task.type !== 'milestone' && task.progress ? Math.round(task.progress * 100) + '%' : ''
            //beside it: a milestone's name and day, or a flag on critical work
            chart.templates.rightside_text = (start, end, task) => {
                if (task.type === 'milestone') {
                    return '<b>' + task.text.replace(/[&<>"']/g, character => '&#' + character.charCodeAt(0) + ';') + '</b> ' + dayjs(start).format('D MMM')
                }
                return task.isCritical ? '<i class="' + getIconClassName('Flag') + '"></i> Critical' : ''
            }
            //a link keeps the links module's class, and joins the chain when both its tasks are in it
            chart.templates.link_class = link => getLinkClass(link) + (chain.has(String(link.source)) && chain.has(String(link.target)) ? ' in-chain' : '')
        //priority 1: after the links module's own config, whose link class it keeps
        }, 1)

        //styles nest under the chart, so these class names count only inside it
        gantt.theme.hooks.styles.add((result, theme) => result.styles.push({
            '.off-chain': { opacity: 0.3 },
            '.gantt_task_link.in-chain': { '--dhx-gantt-link-background': theme.palette.themePrimary },
        }))
        return {}
    },
}

const GridExample = () => <TaskDatasetControl modules={[createMemoryDependenciesModule({ dependencies })]} onLoad={loadLaunch} enableEditing height='360px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={[createRowSelectionModule({ mode: 'single' })]} />
            <TaskGantt modules={[createLibraryModule(), createTaskSelectionModule(), createLinksModule(), barContentModule]} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const LAUNCH_FILE: IGridExampleFile = {
    name: 'launch.ts',
    code: `import { ITaskDependency, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore } from '@talxis/base-controls'

//a website launch: the build and the content meet at Go live; priority 3 is Critical
const tasks = new MemoryTable({ idKey: 'mem_taskid', rows: [
    { mem_taskid: 'brief', subject: 'Write the brief', stackrank: '0|100000:', statecode: 0, priority: 1, percentcomplete: 100, scheduledstart: '2026-03-02', scheduledend: '2026-03-06' },
    { mem_taskid: 'design', subject: 'Design the pages', stackrank: '0|200000:', statecode: 0, priority: 1, percentcomplete: 80, scheduledstart: '2026-03-09', scheduledend: '2026-03-20' },
    //only an end: a milestone
    { mem_taskid: 'signoff', subject: 'Design sign-off', stackrank: '0|300000:', statecode: 0, priority: 1, scheduledend: '2026-03-20' },
    { mem_taskid: 'build', subject: 'Build the site', stackrank: '0|400000:', statecode: 0, priority: 3, percentcomplete: 30, scheduledstart: '2026-03-23', scheduledend: '2026-04-10' },
    { mem_taskid: 'test', subject: 'Test on every browser', stackrank: '0|500000:', statecode: 0, priority: 3, percentcomplete: 0, scheduledstart: '2026-04-13', scheduledend: '2026-04-17' },
    { mem_taskid: 'copy', subject: 'Write the copy', stackrank: '0|600000:', statecode: 0, priority: 1, percentcomplete: 50, scheduledstart: '2026-03-16', scheduledend: '2026-04-03' },
    { mem_taskid: 'redirects', subject: 'Map the redirects', stackrank: '0|700000:', statecode: 0, priority: 1, percentcomplete: 0, scheduledstart: '2026-04-06', scheduledend: '2026-04-14' },
    { mem_taskid: 'golive', subject: 'Go live', stackrank: '0|800000:', statecode: 0, priority: 3, scheduledend: '2026-04-20' },
] })

const link = (predecessorTaskId: string, successorTaskId: string): ITaskDependency => ({ id: predecessorTaskId + '-' + successorTaskId, predecessorTaskId, successorTaskId, type: 'finishToStart' })

export const dependencies = new MemoryTable<ITaskDependency>({ idKey: 'id', rows: [
    link('brief', 'design'), link('design', 'signoff'), link('signoff', 'build'), link('build', 'test'), link('test', 'golive'),
    link('copy', 'redirects'), link('redirects', 'golive'),
] })

export const loadLaunch = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'scheduledstart', endDate: 'scheduledend', percentComplete: 'percentcomplete' },
    views: [{ id: 'launch', name: 'Launch', resolve: () => ({ columns: getTaskColumns('subject', 'priority', 'percentcomplete') }) }],
})
`,
}

const withOwnFiles = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, ...files]

export const StatusDrivenRowsExample = () => <GridExampleRunner seedCode={withTasks(STATUS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const PeopleInCellsExample = () => <GridExampleRunner seedCode={withTasks(PEOPLE_CODE, TEAM_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const OwnTooltipExample = () => <GridExampleRunner seedCode={withTasks(TOOLTIP_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BarContentExample = () => <GridExampleRunner seedCode={withOwnFiles(BAR_CONTENT_CODE, LAUNCH_FILE)} tabs={TASK_EXAMPLE_TABS} />
