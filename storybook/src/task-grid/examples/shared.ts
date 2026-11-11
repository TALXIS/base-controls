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

/** The office move every guide example plans, as plain rows, with its columns and a memory loader. */
export const OFFICE_FILE: IGridExampleFile = {
    name: 'office.ts',
    code: `import { IFieldMapping, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore } from '@talxis/base-controls'
import type { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from '@talxis/client-libraries'

//a lookup holds an array with one reference, here to the parent task
const parentOf = (taskid: string, name: string) => [{ id: { guid: taskid }, etn: 'officetask', name }]
const MOVE = parentOf('move', 'Move to the new office')
const FIT_OUT = parentOf('fitout', 'Fit out the space')
const PARTY = parentOf('party', 'Plan the opening party')

//the values of the Status and Priority option sets
export const STATUS = { notStarted: 1, inProgress: 2, waiting: 3, done: 4 }
export const PRIORITY = { low: 0, normal: 1, high: 2 }

//one row per task: its parent, its rank among its siblings, and statecode 0 while it is active
export const OFFICE_TASKS: IRawRecord[] = [
    { taskid: 'move', subject: 'Move to the new office', parentid: null, stackrank: '0|100000:', statecode: 0, owner: 'Jana', status: STATUS.inProgress, priority: PRIORITY.high, effort: 90, start: '2026-01-05', due: '2026-03-27', done: 30 },
    { taskid: 'lease', subject: 'Sign the lease', parentid: MOVE, stackrank: '0|100000:', statecode: 1, owner: 'Jana', status: STATUS.done, priority: PRIORITY.high, effort: 6, start: '2026-01-05', due: '2026-01-16', done: 100 },
    { taskid: 'fitout', subject: 'Fit out the space', parentid: MOVE, stackrank: '0|200000:', statecode: 0, owner: 'Tomáš', status: STATUS.inProgress, priority: PRIORITY.normal, effort: 64, start: '2026-01-19', due: '2026-02-27', done: 40 },
    { taskid: 'desks', subject: 'Order desks and chairs', parentid: FIT_OUT, stackrank: '0|100000:', statecode: 0, owner: 'Petra', status: STATUS.inProgress, priority: PRIORITY.normal, effort: 8, start: '2026-01-19', due: '2026-01-30', done: 80 },
    { taskid: 'network', subject: 'Install the network', parentid: FIT_OUT, stackrank: '0|200000:', statecode: 0, owner: 'Martin', status: STATUS.inProgress, priority: PRIORITY.high, effort: 24, start: '2026-02-02', due: '2026-02-20', done: 20 },
    { taskid: 'paint', subject: 'Paint the meeting rooms', parentid: FIT_OUT, stackrank: '0|300000:', statecode: 0, owner: 'Tomáš', status: STATUS.notStarted, priority: PRIORITY.low, effort: 32, start: '2026-02-09', due: '2026-02-27', done: 0 },
    { taskid: 'movers', subject: 'Book the movers', parentid: MOVE, stackrank: '0|300000:', statecode: 0, owner: 'Tomáš', status: STATUS.waiting, priority: PRIORITY.normal, effort: 4, start: '2026-03-02', due: '2026-03-06', done: 0 },
    { taskid: 'movein', subject: 'Move in', parentid: MOVE, stackrank: '0|400000:', statecode: 0, owner: 'Jana', status: STATUS.notStarted, priority: PRIORITY.high, effort: 16, start: '2026-03-23', due: '2026-03-27', done: 0 },
    { taskid: 'party', subject: 'Plan the opening party', parentid: null, stackrank: '0|200000:', statecode: 0, owner: 'Lucie', status: STATUS.notStarted, priority: PRIORITY.normal, effort: 7, start: '2026-04-01', due: '2026-04-10', done: 0 },
    { taskid: 'invites', subject: 'Send the invitations', parentid: PARTY, stackrank: '0|100000:', statecode: 0, owner: 'Lucie', status: STATUS.notStarted, priority: PRIORITY.normal, effort: 3, start: '2026-04-01', due: '2026-04-03', done: 0 },
    { taskid: 'catering', subject: 'Order the catering', parentid: PARTY, stackrank: '0|200000:', statecode: 0, owner: 'Lucie', status: STATUS.notStarted, priority: PRIORITY.low, effort: 4, start: '2026-04-06', due: '2026-04-10', done: 0 },
]

//every column views and Edit columns pick from; the hidden ones are there to add
export const OFFICE_COLUMNS: IColumn[] = [
    { name: 'subject', displayName: 'Task', dataType: 'SingleLine.Text', isPrimary: true, visualSizeFactor: 280 },
    { name: 'owner', displayName: 'Owner', dataType: 'SingleLine.Text', visualSizeFactor: 110 },
    {
        name: 'status', displayName: 'Status', dataType: 'OptionSet', visualSizeFactor: 130,
        metadata: { OptionSet: [
            { Value: STATUS.notStarted, Label: 'Not started', Color: '#8a8886' },
            { Value: STATUS.inProgress, Label: 'In progress', Color: '#0078d4' },
            { Value: STATUS.waiting, Label: 'Waiting', Color: '#c19c00' },
            { Value: STATUS.done, Label: 'Done', Color: '#107c10' },
        ] },
    },
    { name: 'start', displayName: 'Start', dataType: 'DateAndTime.DateOnly', visualSizeFactor: 120 },
    { name: 'due', displayName: 'Due', dataType: 'DateAndTime.DateOnly', visualSizeFactor: 120 },
    { name: 'done', displayName: '% done', dataType: 'Whole.None', visualSizeFactor: 140 },
    {
        name: 'priority', displayName: 'Priority', dataType: 'OptionSet', visualSizeFactor: 110, isHidden: true,
        metadata: { OptionSet: [
            { Value: PRIORITY.low, Label: 'Low', Color: '#69797e' },
            { Value: PRIORITY.normal, Label: 'Normal', Color: '#0078d4' },
            { Value: PRIORITY.high, Label: 'High', Color: '#d13438' },
        ] },
    },
    { name: 'effort', displayName: 'Effort (h)', dataType: 'Decimal', visualSizeFactor: 110, isHidden: true },
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
