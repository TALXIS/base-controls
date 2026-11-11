import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

interface IGanttStoryData {
    /** Where the story keeps its state, views and columns. */
    storageKey: string;
    tasks: string;
    columns: string;
    getColumns: string;
}

const createGanttCode = (data: IGanttStoryData) => `const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'scheduledstart',
    endDate: 'scheduledend',
    duration: 'scheduleddurationminutes',
    percentComplete: 'percentcomplete',
}

//the task grid reads isFlatList from a view's data
const taskView = (id: string, name: string, columns: IColumn[], data: ITaskViewData = {}, onResolve?: (provider: ITaskDataProvider) => void): ITaskGridView => ({
    id,
    name,
    resolve: provider => {
        onResolve?.(provider)
        return { columns, data }
    },
})

const VIEWS: ITaskGridView[] = [
    taskView('all', 'All tasks', ${data.getColumns}('subject', 'description', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes', 'percentcomplete').concat(LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, DEPENDENCY_COLUMNS), {}, provider => provider.setQuickFindColumns(['subject', 'assignedto', 'tags', 'teams'])),
    taskView('planning', 'Planning', ${data.getColumns}('subject', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes', 'estimatedeffort', 'actualeffort'), {}, provider => provider.setSorting([{ name: 'scheduledstart', sortDirection: 0 }])),
    taskView('flat', 'Every task on its own', ${data.getColumns}('subject', 'statuscode').concat(LOOKUP_MANY_VIEW_COLUMNS.filter(column => column.name === 'assignedto')), { isFlatList: true }, provider => provider.setQuickFindColumns(['subject', 'description', 'assignedto'])),
]

const ONE_DATE_TASKS = [
    { subject: 'Kick-off workshop', scheduledstart: '2025-09-15' },
    { subject: 'Security audit due', scheduledend: '2025-12-19' },
    { subject: 'Customer advisory board', scheduledstart: '2026-02-09' },
    { subject: 'Vendor contract renewal', scheduledend: '2026-03-31' },
]

//each one-date task goes right after every other epic
const withOneDateTasks = (tasks: IRawRecord[]): IRawRecord[] => {
    const epics = tasks.filter(task => !task.parentid)
    return tasks.concat(ONE_DATE_TASKS.map((task, index) => ({
        [TASK_METADATA.PrimaryIdAttribute]: '99000000-0000-0000-0000-00000000000' + index,
        parentid: null,
        stackrank: epics[index * 2].stackrank + 'i',
        statecode: 0,
        statuscode: 1,
        percentcomplete: 0,
        ...task,
    })))
}

const betaCutoffStyles = mergeStyleSets({
    chip: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3,
        padding: '2px 4px 2px 3px',
        borderRadius: 999,
        color: '#ffffff',
        fontSize: 12,
        fontWeight: FontWeights.semibold,
        whiteSpace: 'nowrap',
        background: 'linear-gradient(135deg, #a07bd6, #5c2e91)',
        boxShadow: '0 2px 8px rgba(92, 46, 145, 0.35)',
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        fontSize: 10,
        background: 'rgba(255, 255, 255, 0.22)',
    },
    countdown: {
        padding: '0 7px',
        borderRadius: 999,
        fontSize: 11,
        lineHeight: '16px',
        color: '#5c2e91',
        background: 'rgba(255, 255, 255, 0.92)',
    },
    line: {
        backgroundImage: 'repeating-linear-gradient(to bottom, #8764b8 0 6px, transparent 6px 11px)',
    },
})

const BetaCutoffChip = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { marker } = useMarker()
    if (marker.id !== 'betaCutoff') {
        return <div {...props} />
    }
    const days = marker.date.startOf('day').diff(dayjs().startOf('day'), 'day')
    const countdown = days === 0 ? 'today' : days > 0 ? 'in ' + days + 'd' : Math.abs(days) + 'd ago'
    return <div className={betaCutoffStyles.chip}>
        <span className={betaCutoffStyles.icon}><Icon iconName='Rocket' /></span>
        {marker.text}
        <span className={betaCutoffStyles.countdown}>{countdown}</span>
    </div>
}

const weekOfYear = (date: Date) => {
    const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7))
    return Math.ceil(((+thursday - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)
}

//fiscal quarters from July and week numbers, through the zoom's scale label hook
const fiscalScaleModule = {
    name: 'fiscalScale',
    onLoad: (gantt: any) => {
        gantt.services.observe('zooming', (zooming: any) => zooming.hooks.scaleLabel.add((result: { label: string }, cell: { date: Date, unit: string, row: number }) => {
            if (cell.unit === 'quarter') {
                const fiscalYear = cell.date.getMonth() >= 6 ? cell.date.getFullYear() + 1 : cell.date.getFullYear()
                result.label = 'FY' + String(fiscalYear).slice(2) + ' Q' + (Math.floor(((cell.date.getMonth() + 6) % 12) / 3) + 1)
            }
            if (cell.unit === 'week' && cell.row === 1) {
                result.label = 'W' + weekOfYear(cell.date) + ' · ' + result.label
            }
        }))
        return {}
    },
}

const BetaCutoffLine = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { marker } = useMarker()
    if (marker.id !== 'betaCutoff') {
        return <div {...props} />
    }
    return <div {...props} className={props.className + ' ' + betaCutoffStyles.line} style={{ ...props.style, backgroundColor: 'transparent' }} />
}

const GridExample = () => {
    const taskTable = React.useMemo(() => new MemoryTable({ idKey: TASK_METADATA.PrimaryIdAttribute, rows: withOneDateTasks(${data.tasks}) }), [])
    const templates = React.useMemo(() => new MemoryTable({ idKey: 'id', rows: TEMPLATES }), [])
    const lookupManyValues = React.useMemo(() => new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES }), [])
    const checklistItems = React.useMemo(() => new MemoryTable({ idKey: 'id', rows: CHECKLIST_ITEMS }), [])
    const dependencies = React.useMemo(() => new MemoryTable({ idKey: 'id', rows: DEPENDENCIES }), [])
    const modules = React.useMemo(() => [
        createRowSelectionModule({ mode: 'multiple' }),
        createTaskEditingModule(),
        createSortingModule(),
        createFilteringModule(),
    ], [])
    const datasetControlModules = React.useMemo(() => [
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: '${data.storageKey}.userViews' }),
        createMemoryProjectModule({ projects: new MemoryTable({ idKey: 'id', rows: [{ id: 'website', name: 'Website Redesign', startDate: '2025-10-01', endDate: '2026-01-31' }] }), projectId: 'website' }),
        createTaskDraggingModule(),
        createMemoryCustomColumnsModule({
            columns: new MemoryTable<ICustomColumnRow>({ idKey: 'name', rows: [{ name: 'risk', displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }] }),
            values: new MemoryTable<ICustomColumnValuesRow>({ idKey: 'taskId' }),
            enableCreation: true,
            enableDeletion: true,
        }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: lookupManyValues }),
        createMemoryTemplatesModule({ tasks: taskTable, templates }),
        createMemoryTaskChecklistModule({ items: checklistItems }),
        createMemoryDependenciesModule({ dependencies }),
    ], [taskTable])
    const ganttModules = React.useMemo(() => [
        createLibraryModule(),
        fiscalScaleModule,
        createMemoryMarkersModule({
            markers: new MemoryTable({ idKey: 'id', rows: [{ id: 'betaCutoff', text: 'Beta cutoff', date: '2025-12-01', color: '#8764b8' }] }),
            project: { color: '#ca5010' },
            components: {
                chip: { onRenderChip: props => <BetaCutoffChip {...props} /> },
                line: { onRender: props => <BetaCutoffLine {...props} /> },
            },
        }),
        createBarDraggingModule(),
        createTaskDrawingModule(),
        createTaskSelectionModule(),
        createTaskTooltipModule({
            statusColumnName: 'statuscode',
            components: {
                onRender: () => <TaskTooltip.Callout>
                    <TaskTooltip.Header />
                    <TaskTooltip.ProgressRow />
                    <TaskTooltip.FieldRows>
                        <TaskTooltip.FieldRow columnName='assignedto' />
                        <TaskTooltip.FieldRow columnName='priority' />
                    </TaskTooltip.FieldRows>
                    <TaskTooltip.DateRangeRow />
                </TaskTooltip.Callout>,
            },
        }),
        createLinksModule(),
    ], [])

    const onLoad = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => {
        return { store: new MemoryTaskStore({ taskRuntime, tasks: taskTable, metadata: TASK_METADATA, columns: ${data.columns} }), fieldMapping, views: VIEWS }
    }

    return <TaskDatasetControl modules={datasetControlModules} enableCreation enableEditing enableDeletion stateKey='${data.storageKey}' height='100%' onLoad={onLoad}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
                <TaskGantt.ZoomSlider />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Ribbon />
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Notifications />
        <DatasetControl.Body>
            <TaskGantt.Split stateKey='ganttSplit'>
                <TaskGrid stateKey='taskGrid' modules={modules} />
                <TaskGantt stateKey='gantt' modules={ganttModules} />
            </TaskGantt.Split>
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <TaskDatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </TaskDatasetControl>
}
`

const DATE_ONLY_CODE = createGanttCode({ storageKey: 'devGanttTasks', tasks: 'TASKS', columns: 'TASK_COLUMNS', getColumns: 'getTaskColumns' })
const DATE_TIME_CODE = createGanttCode({ storageKey: 'devGanttDateTimeTasks', tasks: 'DATE_TIME_TASKS', columns: 'DATE_TIME_TASK_COLUMNS', getColumns: 'getDateTimeTaskColumns' })

/** The task grid with the Gantt beside it, over memory tasks with date-only dates. */
export const GanttTaskGrid = () => <GridExampleRunner seedCode={DATE_ONLY_CODE} />

/** The task grid with the Gantt beside it, over memory tasks with a time of day. */
export const GanttDateTimeTaskGrid = () => <GridExampleRunner seedCode={DATE_TIME_CODE} />
