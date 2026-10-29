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

//the control sets a view's columns; the task grid sets up the rest from its data
const taskView = (id: string, name: string, columns: IColumn[], data: ITaskViewData = {}): IDatasetControlView<ITaskViewData> => ({ id, name, resolve: () => ({ columns, data }) })

const VIEWS: IDatasetControlView<ITaskViewData>[] = [
    taskView('all', 'All tasks', ${data.getColumns}('subject', 'description', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes', 'percentcomplete').concat(LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, DEPENDENCY_COLUMNS), { quickFindColumns: ['subject', 'assignedto', 'tags', 'teams'] }),
    taskView('planning', 'Planning', ${data.getColumns}('subject', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes', 'estimatedeffort', 'actualeffort'), { sorting: [{ name: 'scheduledstart', sortDirection: 0 }] }),
    taskView('flat', 'Every task on its own', ${data.getColumns}('subject', 'statuscode').concat(LOOKUP_MANY_VIEW_COLUMNS.filter(column => column.name === 'assignedto')), { isFlatList: true, quickFindColumns: ['subject', 'description', 'assignedto'] }),
]

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
    const { marker } = useGanttMarker()
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
        gantt.services.whenAvailable('zooming', (zooming: any) => zooming.registerScaleLabel((result: { label: string }, cell: { date: Date, unit: string, row: number }) => {
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
    const { marker } = useGanttMarker()
    if (marker.id !== 'betaCutoff') {
        return <div {...props} />
    }
    return <div {...props} className={props.className + ' ' + betaCutoffStyles.line} style={{ ...props.style, backgroundColor: 'transparent' }} />
}

const GridExample = () => {
    const database = React.useMemo(() => new MemoryTaskDatabase({ records: ${data.tasks}, metadata: TASK_METADATA }), [])
    const modules = React.useMemo(() => [
        createRowSelectionModule({ mode: 'multiple' }),
        createTaskEditingModule(),
        createSortingModule(),
        createFilteringModule(),
    ], [])
    const datasetControlModules = React.useMemo(() => [
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: '${data.storageKey}.userViews' }),
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
        createTaskDraggingModule(),
        createIndexedDbCustomColumnsModule({
            databaseName: '${data.storageKey}.customColumns',
            columns: [{ displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }],
            enableCreation: true,
            enableDeletion: true,
        }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: LOOKUP_MANY_VALUES }),
        createMemoryTemplatesModule({ database, templates: TEMPLATES }),
        createMemoryChecklistModule({ items: CHECKLIST_ITEMS }),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    ], [database])
    const ganttModules = React.useMemo(() => [
        createGanttLibraryModule(),
        fiscalScaleModule,
        createMemoryGanttMarkersModule({
            markers: [{ id: 'betaCutoff', text: 'Beta cutoff', date: dayjs('2025-12-01'), color: '#8764b8' }],
            project: { color: '#ca5010' },
            components: {
                chip: { onRenderChip: props => <BetaCutoffChip {...props} /> },
                line: { onRenderContainer: props => <BetaCutoffLine {...props} /> },
            },
        }),
        createGanttTaskDraggingModule(),
        createGanttTaskCreateModule(),
        createGanttSelectionModule(),
        createGanttTooltipModule({
            statusColumnName: 'statuscode',
            onRender: () => <TaskTooltip>
                <TaskTooltip.Callout>
                    <TaskTooltip.Header />
                    <TaskTooltip.ProgressRow />
                    <TaskTooltip.FieldRows>
                        <TaskTooltip.FieldRow columnName='assignedto' />
                        <TaskTooltip.FieldRow columnName='priority' />
                    </TaskTooltip.FieldRows>
                    <TaskTooltip.DateRangeRow />
                </TaskTooltip.Callout>
            </TaskTooltip>,
        }),
        createGanttLinksModule(),
    ], [])

    const onLoad = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({ provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, database, columns: ${data.columns} }) }), fieldMapping })

    return <TaskDatasetControl modules={datasetControlModules} enableCreation enableEditing enableDeletion onLoadViews={async () => VIEWS} stateKey='${data.storageKey}' height='100%' onLoad={onLoad}>
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
