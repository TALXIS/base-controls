import React from 'react'
import { Stack, Text, initializeIcons } from '@fluentui/react'
import {
    Marker,
    MemoryGanttMarkersStrategy,
    MemoryProjectStrategy,
    MemoryTaskGridDescriptor,
    TaskGrid,
    MilestoneMarker,
    createGanttMarkersModule,
    createGanttModule,
    createProjectModule,
} from '@talxis/base-controls'
import type { ISavedQuery } from '@talxis/base-controls'
import { IRawRecord } from '@talxis/client-libraries'
import {
    PARENT_ID_COL,
    PERCENT_COMPLETE_COL,
    STACK_RANK_COL,
    STATE_CODE_COL,
    SUBJECT_COL,
    TASK_SOURCE,
    getQueryColumns,
} from '../memoryTaskData'
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
    columns: getQueryColumns(SUBJECT_COL, START_DATE_COL, END_DATE_COL, PERCENT_COMPLETE_COL),
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

    const descriptor = React.useMemo(() => new MemoryTaskGridDescriptor({
        height,
        onInitialize: async () => {
            const startedAt = performance.now()
            const records = count === undefined
                ? structuredClone(TASK_SOURCE.records)
                : generateTasks({ count, seed })
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
                systemQueries: [ALL_TASKS],
                gridParameters: {
                    enableTaskCreation: true,
                    enableTaskEditing: true,
                    enableTaskDeletion: true,
                    enableInlineCreation: true,
                    enableShowHierarchyToggle: true,
                    enableHideInactiveTasksToggle: true,
                    enableQuickFind: true,
                    enableSorting: true,
                    enableFiltering: true,
                    enableNavigation: true,
                    enableRowDragging: true,
                },
                modules: {
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
                                enableTodayMarker: true,
                                enableProjectMarkers: true,
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
    }), [count, seed, height])

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
