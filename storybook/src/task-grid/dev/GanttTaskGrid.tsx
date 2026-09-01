import React from 'react'
import { initializeIcons } from '@fluentui/react'
import { MemoryProjectStrategy, MemoryTaskGridDescriptor, TaskGrid, createGanttModule, createProjectModule } from '@talxis/base-controls'
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

/** The dates the fixture tasks span, so the project markers have somewhere to sit. */
const getFixtureDates = (records: IRawRecord[]) => {
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

/**
 * The memory Task Grid with the gantt module registered — the timeline beside the grid.
 *
 * Scratch story: the fixtures already carry start, end and percent-complete columns, so the module only
 * has to be told which ones they are. The project module is registered alongside it with a strategy that
 * derives the project's span from the tasks themselves, which is what draws the project markers.
 */
export const GanttTaskGrid = () => {
    const descriptor = React.useMemo(() => {
        const records = structuredClone(TASK_SOURCE.records)
        return new MemoryTaskGridDescriptor({
            height: '700px',
            onInitialize: async () => ({
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
                    }),
                    onGetProjectModule: ({ services }) => createProjectModule({
                        strategy: new MemoryProjectStrategy({
                            project: {
                                id: '00000000-0000-0000-0000-00000000proj',
                                name: 'Dev Project',
                                ...getFixtureDates(records),
                            },
                            services,
                        }),
                        services,
                    }),
                },
            }),
        })
    }, [])

    return <TaskGrid descriptor={descriptor} />
}
