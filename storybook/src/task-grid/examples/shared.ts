import type { IRunnerTab } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

/** The sample tasks, their views and a memory loader, imported by the Task Grid examples. */
export const TASKS_FILE: IGridExampleFile = {
    name: 'tasks.ts',
    code: `export const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'scheduledstart',
    endDate: 'scheduledend',
    duration: 'scheduleddurationminutes',
    percentComplete: 'percentcomplete',
}

export const TASK_VIEWS: ITaskGridView[] = [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete') }) },
    {
        id: 'planning',
        name: 'Planning',
        resolve: provider => {
            provider.setSorting([{ name: 'scheduledstart', sortDirection: 0 }])
            return { columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes', 'estimatedeffort') }
        },
    },
    { id: 'flat', name: 'Every task on its own', resolve: () => ({ columns: getTaskColumns('subject', 'statuscode', 'priority'), data: { isFlatList: true } }) },
]

//one database for the whole example, so changes survive a view switch
export const createTaskDatabase = () => new MemoryTaskDatabase({ records: TASKS, metadata: TASK_METADATA })

export const createLoadTasks = (database: MemoryTaskDatabase) => async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => {
    return {
        store: new MemoryTaskStore({ taskRuntime, database, columns: TASK_COLUMNS }),
        fieldMapping,
        views: TASK_VIEWS,
    }
}
`,
}

export const withTasks = (code: string): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, TASKS_FILE]

/** The Task Grid examples load their own tasks, so they show no Data tab. */
export const TASK_EXAMPLE_TABS: IRunnerTab[] = ['preview', 'code']
