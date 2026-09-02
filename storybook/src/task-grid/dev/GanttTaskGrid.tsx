import React from 'react'
import { Stack, Text, initializeIcons } from '@fluentui/react'
import {
    Marker,
    MemoryChecklistStrategy,
    MemoryGanttMarkersStrategy,
    MemoryLookupManyDataProviderFactory,
    MemoryProjectStrategy,
    MemoryTaskDependencyStrategy,
    MemoryTaskGridDescriptor,
    MemoryTaskStrategy,
    MemoryTemplateDataProvider,
    MemoryUserQueryStrategy,
    TaskGrid,
    MilestoneMarker,
    createChecklistModule,
    createDependenciesModule,
    createGanttMarkersModule,
    createGanttModule,
    createGanttSelectionBoxModule,
    createGanttTaskCreateModule,
    createGanttTaskDraggingModule,
    createGanttTaskTooltipModule,
    createGanttWeekendsModule,
    createLookupManyModule,
    createProjectModule,
    createTemplateModule,
    createUserQueryModule,
} from '@talxis/base-controls'
import type { IChecklistItem, IMemoryEntitySource, IMemoryTemplateSource, ISavedQuery, ITaskDependency, ITaskGridServiceLocator } from '@talxis/base-controls'
import { IRawRecord } from '@talxis/client-libraries'
import {
    CHECKLIST_COL,
    CHECKLIST_ITEMS,
    PARENT_ID_COL,
    PERCENT_COMPLETE_COL,
    PREDECESSORS_COL,
    STACK_RANK_COL,
    STATE_CODE_COL,
    SUBJECT_COL,
    SUCCESSORS_COL,
    TASK_DEPENDENCIES,
    TASK_SOURCE,
    TEMPLATE_SOURCE,
    getQueryColumns,
} from '../memoryTaskData'
import { PEOPLE_SOURCE, TAGS_SOURCE } from '../memoryLookupManyData'
import { generateTasks } from './generateTasks'

//the TaskGrid renders Fluent icons but, unlike Form, nothing in its tree registers them
initializeIcons()

const START_DATE_COL = 'scheduledstart'
const END_DATE_COL = 'scheduledend'
const STATUS_CODE_COL = 'statuscode'

const ALL_TASKS: ISavedQuery = {
    id: '00000000-0000-0000-0000-00000000dev1',
    name: 'All Tasks',
    isFlatListEnabled: false,
    columns: getQueryColumns(
        SUBJECT_COL, START_DATE_COL, END_DATE_COL, PERCENT_COMPLETE_COL,
        'assignedto', 'tags', PREDECESSORS_COL, SUCCESSORS_COL, CHECKLIST_COL,
    ),
    quickFindColumns: [SUBJECT_COL],
}

//a second view, so the switcher has somewhere to switch to - and with different columns, which is what
//makes a view change worth watching
const SCHEDULE: ISavedQuery = {
    id: '00000000-0000-0000-0000-00000000dev2',
    name: 'Schedule',
    isFlatListEnabled: false,
    columns: getQueryColumns(SUBJECT_COL, START_DATE_COL, END_DATE_COL),
    quickFindColumns: [SUBJECT_COL],
}

/** The dates the tasks span, so the project markers have somewhere to sit. */
const getTaskDates = (records: IRawRecord[]) => {
    const times = (columnName: string) => records
        .map(record => record[columnName])
        .filter((value): value is string => typeof value === 'string')
        .map(value => new Date(value).getTime())
    const starts = times(START_DATE_COL)
    const ends = times(END_DATE_COL)
    return {
        startDate: starts.length ? new Date(Math.min(...starts)) : undefined,
        endDate: ends.length ? new Date(Math.max(...ends)) : undefined,
    }
}

export interface IGanttTaskGridProps {
    /** How many tasks to generate. Omitted renders the hand-written fixtures instead. */
    count?: number;
    /** Fixed by default, so two runs of a generated dataset draw the same tasks. */
    seed?: number;
    /** What the descriptor is given. Defaults to a fixed height, which is what the fixture story wants. */
    height?: string;
}

/**
 * The memory Task Grid with the gantt module registered — the timeline beside the grid.
 *
 * Scratch story: the fixtures already carry start, end and percent-complete columns, so the module only
 * has to be told which ones they are. The project module supplies the span the project markers sit at, and
 * the Gantt's own markers module draws them — plus today, and one milestone of its own.
 *
 * `count` swaps the fixtures for a generated dataset, through the same generator the large-dataset story
 * uses so the two are comparable. Generation sits inside `onInitialize`, behind the grid's own loading
 * state, which keeps the reported time the dataset's rather than the grid's.
 */
export const GanttTaskGrid = (props: IGanttTaskGridProps = {}) => {
    const { count, seed, height = '700px' } = props
    const [generatedInMs, setGeneratedInMs] = React.useState<number>()

    const descriptor = React.useMemo(() => {
        //the sandbox's store. `onInitialize` runs again on every remount - a view switch, applying Edit
        //columns, saving a personal view - and hands back whatever is in here, which `keepSession` reads
        //off the providers just before each control is torn down
        let records: IRawRecord[] = []
        let userQueries: ISavedQuery[] = []
        let dependencies: ITaskDependency[] = structuredClone(TASK_DEPENDENCIES)
        let checklist: Record<string, IChecklistItem[]> = structuredClone(CHECKLIST_ITEMS)
        let templates: IMemoryTemplateSource = structuredClone(TEMPLATE_SOURCE)
        const lookupSources: { [columnName: string]: IMemoryEntitySource } = { assignedto: PEOPLE_SOURCE, tags: TAGS_SOURCE }

        const keepSession = (services: ITaskGridServiceLocator) => {
            services.whenAvailable('datasetControl', datasetControl => {
                datasetControl.events.addEventListener('onBeforeDestroy', () => {
                    records = services.get('taskDataProvider').getRawData()
                    userQueries = services.find('userQueriesModule')?.provider.getQueries() ?? userQueries
                    dependencies = services.find('dependenciesModule')?.provider.getDependencies() ?? dependencies
                    const templateProvider = services.find('templatesModule')?.provider as MemoryTemplateDataProvider | undefined
                    templates = templateProvider?.getTemplateSource() ?? templates
                })
            })
        }

        return new MemoryTaskGridDescriptor({
        height,
        onInitialize: async () => {
            const startedAt = performance.now()
            if (!records.length) {
                records = count === undefined
                    ? structuredClone(TASK_SOURCE.records)
                    : generateTasks({ count, seed })
            }
            setGeneratedInMs(performance.now() - startedAt)

            return {
                records,
                metadata: TASK_SOURCE.metadata,
                fieldMapping: {
                    subject: SUBJECT_COL,
                    parentId: PARENT_ID_COL,
                    stackRank: STACK_RANK_COL,
                    stateCode: STATE_CODE_COL,
                },
                systemQueries: [ALL_TASKS, SCHEDULE],
                gridParameters: {
                    enableTaskCreation: true,
                    enableTaskEditing: true,
                    enableTaskDeletion: true,
                    enableInlineCreation: true,
                    enableShowHierarchyToggle: true,
                    enableHideInactiveTasksToggle: true,
                    enableQuickFind: true,
                    enableViewSwitcher: true,
                    enableEditColumns: true,
                    enableSorting: true,
                    enableFiltering: true,
                    enableNavigation: true,
                    enableRowDragging: true,
                },
                onCreateTaskStrategy: ({ services, metadata }) => {
                    keepSession(services)
                    return new MemoryTaskStrategy({
                        //seeded from what the last mount ended with, not from the fixtures
                        onInitialize: async provider => ({ rawData: records, metadata, columns: provider.getColumns() }),
                        services,
                    })
                },
                //every module this sandbox can back with in-memory data. Custom columns is the one that is
                //missing: no in-memory strategy ships for it, and the grid customizer needs a strategy of
                //its own to be worth registering
                modules: {
                    onGetUserQueriesModule: ({ services }) => createUserQueryModule({
                        strategy: new MemoryUserQueryStrategy({ userQueries, services }),
                        services,
                        enableQueryManager: true,
                        enableSaveAsNewQuery: true,
                        enableSaveQueryChanges: true,
                    }),
                    onGetTemplatesModule: ({ services }) => createTemplateModule({
                        provider: new MemoryTemplateDataProvider({ templates, services }),
                    }),
                    onGetDependenciesModule: ({ services }) => createDependenciesModule({
                        strategy: new MemoryTaskDependencyStrategy({ dependencies, services }),
                        services,
                    }),
                    onGetChecklistModule: ({ services }) => createChecklistModule({
                        strategy: new MemoryChecklistStrategy({ items: checklist, services }),
                        services,
                    }),
                    onGetLookupManyModule: ({ services }) => createLookupManyModule({
                        createDataProvider: ({ column, services }) => {
                            const source = lookupSources[column.name]
                            return source && MemoryLookupManyDataProviderFactory.create({ source, services })
                        },
                        services,
                    }),
                    onGetGanttModule: ({ services }) => createGanttModule({
                        fieldMapping: {
                            startDate: START_DATE_COL,
                            endDate: END_DATE_COL,
                            percentComplete: PERCENT_COMPLETE_COL,
                            statusCode: STATUS_CODE_COL,
                        },
                        services,
                        onGetModules: ({ services }) => ({
                            markers: createGanttMarkersModule({
                                services,
                                todayMarker: { enabled: true },
                                projectMarkers: { enabled: true },
                                strategy: new MemoryGanttMarkersStrategy({
                                    services,
                                    markers: [{
                                        text: 'Beta cutoff',
                                        start_date: new Date(2026, 0, 15),
                                        color: 'rgb(136, 23, 152)',
                                    }],
                                }),
                                //what a marker looks like is decided here: ours are diamonds, the grid's
                                //own stay chips
                                components: {
                                    onRenderMarker: (props) => props.id.toString().startsWith('custom')
                                        ? <MilestoneMarker {...props} />
                                        : <Marker {...props} />,
                                },
                            }),
                            taskCreate: createGanttTaskCreateModule({ services }),
                            taskDragging: createGanttTaskDraggingModule({ services }),
                            selectionBox: createGanttSelectionBoxModule({ services }),
                            taskTooltip: createGanttTaskTooltipModule({ services }),
                            weekends: createGanttWeekendsModule({ services }),
                        }),
                    }),
                    onGetProjectModule: ({ services }) => createProjectModule({
                        strategy: new MemoryProjectStrategy({
                            project: {
                                id: '00000000-0000-0000-0000-00000000proj',
                                name: 'Dev Project',
                                ...getTaskDates(records),
                            },
                            services,
                        }),
                        services,
                    }),
                },
            }
        },
        })
    }, [count, seed, height])

    return (
        <Stack tokens={{ childrenGap: 8 }} styles={{ root: { height: '100%' } }}>
            {count !== undefined && (
                <Text variant="small">
                    {count.toLocaleString()} generated tasks
                    {generatedInMs !== undefined && ` · built in ${Math.round(generatedInMs)} ms`}
                    {seed !== undefined && ` · seed ${seed}`}
                </Text>
            )}
            <TaskGrid descriptor={descriptor} />
        </Stack>
    )
}
