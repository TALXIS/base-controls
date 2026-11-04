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

const taskView = (id: string, name: string, columns: IColumn[], data: ITaskViewData = {}): IDatasetControlView<ITaskViewData> => ({ id, name, resolve: () => ({ columns, data }) })

export const loadTaskViews = async (): Promise<IDatasetControlView<ITaskViewData>[]> => [
    taskView('all', 'All tasks', getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete')),
    taskView('planning', 'Planning', getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes', 'estimatedeffort'), { sorting: [{ name: 'scheduledstart', sortDirection: 0 }] }),
    taskView('flat', 'Every task on its own', getTaskColumns('subject', 'statuscode', 'priority'), { isFlatList: true }),
]

//one database for the whole example, so changes survive a view switch
export const createTaskDatabase = () => new MemoryTaskDatabase({ records: TASKS, metadata: TASK_METADATA })

export const createLoadTasks = (database: MemoryTaskDatabase) => async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
    provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, database, columns: TASK_COLUMNS }) }),
    fieldMapping,
})
`,
}

export const withTasks = (code: string): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, TASKS_FILE]

/** The Task Grid examples load their own tasks, so they show no Data tab. */
export const TASK_EXAMPLE_TABS: IRunnerTab[] = ['preview', 'code']
