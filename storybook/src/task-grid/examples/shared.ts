import type { IRunnerTab } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

/** The sample tasks, their views and a memory loader, imported by the Task Grid examples. */
export const TASKS_FILE: IGridExampleFile = {
    name: 'tasks.ts',
    code: `import { IFieldMapping, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore } from '@talxis/base-controls'
import type { IRawRecord } from '@talxis/client-libraries'

//TASKS, TASK_METADATA, TASK_COLUMNS and getTaskColumns are the sample tasks of these docs
export const fieldMapping: IFieldMapping = {
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

//one table for the whole example, so changes survive a view switch
export const createTaskTable = () => new MemoryTable<IRawRecord>({ idKey: TASK_METADATA.PrimaryIdAttribute, rows: TASKS })

export const createLoadTasks = (tasks: MemoryTable<IRawRecord>, views = TASK_VIEWS) => async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => {
    return {
        store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
        fieldMapping,
        views,
    }
}
`,
}

/** A small plan of moving offices, as plain rows, imported by the Task Grid examples about stores. */
export const OFFICE_FILE: IGridExampleFile = {
    name: 'office.ts',
    code: `import { IFieldMapping, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore } from '@talxis/base-controls'
import type { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from '@talxis/client-libraries'

//a lookup holds an array with one reference, here to the parent task
const parentOf = (taskid: string, name: string) => [{ id: { guid: taskid }, etn: 'officetask', name }]
const MOVE = parentOf('move', 'Move to the new office')
const FIT_OUT = parentOf('fitout', 'Fit out the space')
const PARTY = parentOf('party', 'Plan the opening party')

//one row per task: its parent, its rank among its siblings, and statecode 0 while it is active
export const OFFICE_TASKS: IRawRecord[] = [
    { taskid: 'move', subject: 'Move to the new office', parentid: null, stackrank: '0|100000:', statecode: 0, owner: 'Jana', start: '2026-01-05', due: '2026-03-27', done: 30 },
    { taskid: 'lease', subject: 'Sign the lease', parentid: MOVE, stackrank: '0|100000:', statecode: 1, owner: 'Jana', start: '2026-01-05', due: '2026-01-16', done: 100 },
    { taskid: 'fitout', subject: 'Fit out the space', parentid: MOVE, stackrank: '0|200000:', statecode: 0, owner: 'Tomáš', start: '2026-01-19', due: '2026-02-27', done: 40 },
    { taskid: 'desks', subject: 'Order desks and chairs', parentid: FIT_OUT, stackrank: '0|100000:', statecode: 0, owner: 'Petra', start: '2026-01-19', due: '2026-01-30', done: 80 },
    { taskid: 'network', subject: 'Install the network', parentid: FIT_OUT, stackrank: '0|200000:', statecode: 0, owner: 'Martin', start: '2026-02-02', due: '2026-02-20', done: 20 },
    { taskid: 'paint', subject: 'Paint the meeting rooms', parentid: FIT_OUT, stackrank: '0|300000:', statecode: 0, owner: 'Tomáš', start: '2026-02-09', due: '2026-02-27', done: 0 },
    { taskid: 'movers', subject: 'Book the movers', parentid: MOVE, stackrank: '0|300000:', statecode: 0, owner: 'Tomáš', start: '2026-03-02', due: '2026-03-06', done: 0 },
    { taskid: 'movein', subject: 'Move in', parentid: MOVE, stackrank: '0|400000:', statecode: 0, owner: 'Jana', start: '2026-03-23', due: '2026-03-27', done: 0 },
    { taskid: 'party', subject: 'Plan the opening party', parentid: null, stackrank: '0|200000:', statecode: 0, owner: 'Lucie', start: '2026-04-01', due: '2026-04-10', done: 0 },
    { taskid: 'invites', subject: 'Send the invitations', parentid: PARTY, stackrank: '0|100000:', statecode: 0, owner: 'Lucie', start: '2026-04-01', due: '2026-04-03', done: 0 },
    { taskid: 'catering', subject: 'Order the catering', parentid: PARTY, stackrank: '0|200000:', statecode: 0, owner: 'Lucie', start: '2026-04-06', due: '2026-04-10', done: 0 },
]

//every column views and Edit columns pick from
export const OFFICE_COLUMNS: IColumn[] = [
    { name: 'subject', displayName: 'Task', dataType: 'SingleLine.Text', isPrimary: true, visualSizeFactor: 260 },
    { name: 'owner', displayName: 'Owner', dataType: 'SingleLine.Text', visualSizeFactor: 110 },
    { name: 'start', displayName: 'Start', dataType: 'DateAndTime.DateOnly', visualSizeFactor: 120 },
    { name: 'due', displayName: 'Due', dataType: 'DateAndTime.DateOnly', visualSizeFactor: 120 },
    { name: 'done', displayName: '% done', dataType: 'Whole.None', visualSizeFactor: 140 },
    { name: 'taskid', displayName: 'ID', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'parentid', displayName: 'Parent', dataType: 'Lookup.Simple', isHidden: true },
    { name: 'stackrank', displayName: 'Rank', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'statecode', displayName: 'State', dataType: 'Whole.None', isHidden: true },
]

export const OFFICE_METADATA: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: 'taskid', LogicalName: 'officetask' }

export const officeFieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'start',
    endDate: 'due',
    percentComplete: 'done',
}

//one table for the whole example, so changes survive every mount
export const createOfficeTable = () => new MemoryTable<IRawRecord>({ idKey: 'taskid', rows: OFFICE_TASKS })

export const createLoadOffice = (tasks = createOfficeTable()) => (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping: officeFieldMapping,
})
`,
}

/** The entry, then the sample tasks, then any files of its own. */
export const withTasks = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, TASKS_FILE, ...files]

/** The entry, then the office plan, then any files of its own. */
export const withOffice = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, OFFICE_FILE, ...files]

/** The Task Grid examples load their own tasks, so they show no Data tab. */
export const TASK_EXAMPLE_TABS: IRunnerTab[] = ['preview', 'code']
