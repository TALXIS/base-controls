import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withOffice, withTasks } from './shared'

const OWN_TASKS_CODE = `import { DatasetControl, IFieldMapping, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from '@talxis/client-libraries'

//a lookup holds an array with one reference, here to the parent task
const parentOf = (taskid: string, name: string) => [{ id: { guid: taskid }, etn: 'officetask', name }]

//statecode 0 is an active task
const OFFICE_MOVE: IRawRecord[] = [
    { taskid: 'move', subject: 'Move to the new office', parentid: null, stackrank: '0|100000:', statecode: 0, owner: 'Jana', due: '2026-03-27' },
    { taskid: 'lease', subject: 'Sign the lease', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|100000:', statecode: 1, owner: 'Jana', due: '2026-01-16' },
    { taskid: 'fitout', subject: 'Fit out the space', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|200000:', statecode: 0, owner: 'Tomáš', due: '2026-02-27' },
    { taskid: 'desks', subject: 'Order desks and chairs', parentid: parentOf('fitout', 'Fit out the space'), stackrank: '0|100000:', statecode: 0, owner: 'Petra', due: '2026-01-30' },
    { taskid: 'network', subject: 'Install the network', parentid: parentOf('fitout', 'Fit out the space'), stackrank: '0|200000:', statecode: 0, owner: 'Martin', due: '2026-02-20' },
    { taskid: 'movers', subject: 'Book the movers', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|300000:', statecode: 0, owner: 'Tomáš', due: '2026-03-06' },
    { taskid: 'party', subject: 'Plan the opening party', parentid: null, stackrank: '0|200000:', statecode: 0, owner: 'Lucie', due: '2026-04-10' },
]

//what the grid and Edit columns pick from; the hidden ones load without showing
const COLUMNS: IColumn[] = [
    { name: 'subject', displayName: 'Task', dataType: 'SingleLine.Text', isPrimary: true, visualSizeFactor: 300 },
    { name: 'owner', displayName: 'Owner', dataType: 'SingleLine.Text', visualSizeFactor: 140 },
    { name: 'due', displayName: 'Due', dataType: 'DateAndTime.DateOnly', visualSizeFactor: 130 },
    { name: 'taskid', displayName: 'ID', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'parentid', displayName: 'Parent', dataType: 'Lookup.Simple', isHidden: true },
    { name: 'stackrank', displayName: 'Rank', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'statecode', displayName: 'State', dataType: 'Whole.None', isHidden: true },
]

//rows are found by the primary id
const metadata: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: 'taskid', LogicalName: 'officetask' }

//which of your columns make the tree; stateCode is 'statecode' when left out
const fieldMapping: Omit<IFieldMapping, 'stateCode'> = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

//keeps every change, so it is made once
const tasks = new MemoryTable<IRawRecord>({ idKey: 'taskid', rows: OFFICE_MOVE })

//called on every mount, with a new store
const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata, columns: COLUMNS }),
    fieldMapping,
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='340px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const DATAVERSE_TASKS_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { DataverseTaskStore, IDataverseHostRecord, ITaskGridLoadResult, ITaskRuntime } from '@talxis/base-controls'

//not run on this page: the same task grid in a model-driven app, its tasks in Dataverse
//task has no parent or rank of its own, so this table adds a lookup to task and a text column
const FETCH_XML = \`<fetch>
    <entity name="task">
        <attribute name="subject" />
        <attribute name="new_parenttaskid" />
        <attribute name="new_stackrank" />
        <attribute name="statecode" />
        <attribute name="ownerid" />
        <attribute name="scheduledend" />
        <filter>
            <condition attribute="regardingobjectid" operator="eq" value="{{ hostRecord.id }}" />
        </filter>
    </entity>
</fetch>\`

//hostRecord is the record the form shows, such as { entityName: 'account', id }
export const createLoadTasks = (hostRecord: IDataverseHostRecord) => (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({
        taskRuntime,
        //a Liquid template over hostRecord, and project when the Project module is loaded
        fetchXml: FETCH_XML,
        hostRecord,
        //the forms Edit opens one task and several tasks in; the default forms when left out
        form: { editId: '00000000-0000-0000-0000-000000000001', bulkEditId: '00000000-0000-0000-0000-000000000002' },
    }),
    fieldMapping: { parentId: 'new_parenttaskid', subject: 'subject', stackRank: 'new_stackrank' },
})
`,
}

const TALXIS_TASKS_FILE: IGridExampleFile = {
    name: 'talxis.ts',
    code: `import { createDataverseProjectModule, DataverseTaskStore, ITaskGridLoadResult, ITaskRuntime } from '@talxis/base-controls'

//not run on this page: TALXIS keeps a project's tasks in talxis_projecttask
const FETCH_XML = \`<fetch>
    <entity name="talxis_projecttask">
        <attribute name="talxis_name" />
        <attribute name="talxis_parentprojecttaskid" />
        <attribute name="talxis_stackrankstring" />
        <attribute name="statecode" />
        <filter>
            <condition attribute="talxis_projectid" operator="eq" value="{{ project.id }}" />
        </filter>
    </entity>
</fetch>\`

//for TaskDatasetControl's modules: project in the FetchXML, and the lookup on new tasks
export const createProjectModules = (projectId: string) => [createDataverseProjectModule({ entityName: 'talxis_project', id: projectId })]

export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({ taskRuntime, fetchXml: FETCH_XML }),
    fieldMapping: { parentId: 'talxis_parentprojecttaskid', subject: 'talxis_name', stackRank: 'talxis_stackrankstring' },
})
`,
}

const RANK_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, StackRank, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRawRecord } from '@talxis/client-libraries'
import { OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'

const parentOf = (taskid: string, name: string) => [{ id: { guid: taskid }, etn: 'officetask', name }]

//rows from a spreadsheet: in the order they should show, but with no rank
const IMPORTED: IRawRecord[] = [
    { taskid: 'trip', subject: 'Team trip', parentid: null, statecode: 0, owner: 'Lucie' },
    { taskid: 'venue', subject: 'Pick the venue', parentid: parentOf('trip', 'Team trip'), statecode: 0, owner: 'Petra' },
    { taskid: 'bus', subject: 'Book the bus', parentid: parentOf('trip', 'Team trip'), statecode: 0, owner: 'Martin' },
    { taskid: 'menu', subject: 'Choose the menu', parentid: parentOf('trip', 'Team trip'), statecode: 0, owner: 'Lucie' },
    { taskid: 'photos', subject: 'Share the photos', parentid: null, statecode: 0, owner: 'Jana' },
]

//each row ranks after the row before it under the same parent
const rankInOrder = (rows: IRawRecord[]): IRawRecord[] => {
    const lastRanks = new Map<string, string>()
    return rows.map(row => {
        const parentId = row.parentid?.[0]?.id.guid ?? ''
        const stackrank = StackRank.between(lastRanks.get(parentId))
        lastRanks.set(parentId, stackrank)
        return { ...row, stackrank }
    })
}

const tasks = new MemoryTable<IRawRecord>({ idKey: 'taskid', rows: rankInOrder(IMPORTED) })

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping: officeFieldMapping,
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='280px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const KEEP_TASKS_CODE = `import { createRowSelectionModule, DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { DefaultButton, Stack, Text } from '@fluentui/react'
import type { IRawRecord } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

const GridExample = () => {
    //the table outlives every mount, so it can be read and kept at any time
    const [tasks, setTasks] = React.useState(createTaskTable)
    const [copy, setCopy] = React.useState<string>()
    const [mountKey, setMountKey] = React.useState(0)

    //the kept rows start a new table, and the control is mounted anew over it
    const loadCopy = () => {
        setTasks(new MemoryTable<IRawRecord>({ idKey: TASK_METADATA.PrimaryIdAttribute, rows: JSON.parse(copy!) }))
        setMountKey(key => key + 1)
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Keep a copy' onClick={() => setCopy(JSON.stringify(tasks.getRows()))} />
            <DefaultButton text='Load the copy' disabled={!copy} onClick={loadCopy} />
            {copy && <Text>{JSON.parse(copy).length} tasks kept</Text>}
        </Stack>
        <TaskDatasetControl key={mountKey} enableCreation enableDeletion onLoad={createLoadTasks(tasks)} height='420px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Ribbon />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </Stack>
}
`

const EXTEND_STORE_CODE = `import { DatasetControl, ITaskCreateParameters, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'

const tasks = createOfficeTable()

//the memory store, with values of its own on every new task
class OfficeTaskStore extends MemoryTaskStore {
    public async createTask(parameters: ITaskCreateParameters) {
        //parameters.data holds the subject and what the caller passed, so it goes last
        return super.createTask({ ...parameters, data: { owner: 'Unassigned', due: dayjs().add(7, 'day').format('YYYY-MM-DD'), ...parameters.data } })
    }
}

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new OfficeTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping: officeFieldMapping,
})

const GridExample = () => <TaskDatasetControl enableCreation onLoad={loadTasks} height='400px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const EXTEND_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { DataverseTaskStore, ITaskCreateParameters } from '@talxis/base-controls'

//not run on this page: the same change to the Dataverse store, whose helpers are protected
export class OfficeTaskStore extends DataverseTaskStore {
    public async createTask(parameters: ITaskCreateParameters) {
        return super.createTask({ ...parameters, data: { scheduledend: dayjs().add(7, 'day').toDate(), ...parameters.data } })
    }
}
`,
}

const API_FILE: IGridExampleFile = {
    name: 'api.ts',
    code: `//stands in for your backend: plain records behind async calls
export interface ITodo {
    id: string
    title: string
    parentId: string | null
    rank: string
    isDone: boolean
}

let todos: ITodo[] = [
    { id: 'notes', title: 'Write the release notes', parentId: null, rank: '0|100000:', isDone: false },
    { id: 'collect', title: 'Collect the changes', parentId: 'notes', rank: '0|100000:', isDone: true },
    { id: 'review', title: 'Get them reviewed', parentId: 'notes', rank: '0|200000:', isDone: false },
    { id: 'publish', title: 'Publish the release', parentId: null, rank: '0|200000:', isDone: false },
]

const wait = () => new Promise(resolve => setTimeout(resolve, 500))

export const api = {
    getTodos: async (): Promise<ITodo[]> => {
        await wait()
        return todos.map(todo => ({ ...todo }))
    },
    createTodo: async (todo: ITodo): Promise<ITodo> => {
        await wait()
        todos = [...todos, todo]
        return { ...todo }
    },
    updateTodo: async (todo: ITodo): Promise<void> => {
        await wait()
        todos = todos.map(existing => existing.id === todo.id ? { ...todo } : existing)
    },
    deleteTodos: async (ids: string[]): Promise<void> => {
        await wait()
        todos = todos.filter(todo => !ids.includes(todo.id))
    },
}
`,
}

const OWN_STORE_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, IDeleteTasksResult, IOpenTasksResult, ITaskCreateParameters, ITaskCreateResult, ITaskDeleteParameters, ITaskGridLoadResult, ITaskLoadResult, ITaskRuntime, ITaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from '@talxis/client-libraries'
import { api, ITodo } from './api'

const COLUMNS: IColumn[] = [
    { name: 'title', displayName: 'To do', dataType: 'SingleLine.Text', isPrimary: true, visualSizeFactor: 360 },
    { name: 'id', displayName: 'ID', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'parent', displayName: 'Parent', dataType: 'Lookup.Simple', isHidden: true },
    { name: 'rank', displayName: 'Rank', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'state', displayName: 'State', dataType: 'Whole.None', isHidden: true },
]

//a todo as the row the task grid reads, and back
const toRow = (todo: ITodo): IRawRecord => ({
    id: todo.id,
    title: todo.title,
    parent: todo.parentId ? [{ id: { guid: todo.parentId }, etn: 'todo', name: '' }] : null,
    rank: todo.rank,
    state: todo.isDone ? 1 : 0,
})
const toTodo = (task: IRecord): ITodo => ({
    id: task.getRecordId(),
    title: task.getValue('title'),
    parentId: task.getValue('parent')?.[0]?.id.guid ?? null,
    rank: task.getValue('rank'),
    isDone: Number(task.getValue('state')) !== 0,
})

class TodoStore implements ITaskStore {
    private _taskRuntime: ITaskRuntime

    constructor(taskRuntime: ITaskRuntime) {
        this._taskRuntime = taskRuntime
    }

    //every task of the view, at once
    public async load(): Promise<ITaskLoadResult> {
        const todos = await api.getTodos()
        return { rawData: todos.map(toRow), metadata: { PrimaryIdAttribute: 'id', LogicalName: 'todo' }, columns: COLUMNS }
    }

    //what Edit columns offers
    public async getAvailableColumns() {
        return COLUMNS
    }

    public async getAvailableRelatedColumns() {
        return []
    }

    //the grid already shows the task under taskId, with its parent and rank worked out
    public async createTask(parameters: ITaskCreateParameters): Promise<ITaskCreateResult> {
        const todo = await api.createTodo({
            id: parameters.taskId ?? crypto.randomUUID(),
            title: parameters.data?.title ?? '',
            parentId: parameters.parentRecord?.getRecordId() ?? null,
            rank: parameters.stackRank,
            isDone: false,
        })
        return { record: toRow(todo) }
    }

    //an edit, or a move with its new parent and rank
    public async saveTask(task: IRecord): Promise<IRecordSaveOperationResult> {
        await api.updateTodo(toTodo(task))
        return { recordId: task.getRecordId(), success: true, fields: task.getFields().filter(field => field.isDirty()).map(field => field.getColumn().name) }
    }

    //called level by level, the deepest tasks first
    public async deleteTasks(parameters: ITaskDeleteParameters): Promise<IDeleteTasksResult> {
        await api.deleteTodos(parameters.taskIds)
        return { success: true, deletedTaskIds: parameters.taskIds }
    }

    //where a task opens outside the grid, such as a form; null when nothing changed
    public async openTasks(taskIds: string[]): Promise<IOpenTasksResult | null> {
        await this._taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: \`Your app opens \${taskIds.length} todo(s) here.\` })
        return null
    }

    //no lookups to open; canDeleteTask and synchronize are optional
    public async openRelatedRecord() {
        throw new Error('Not implemented.')
    }
}

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new TodoStore(taskRuntime),
    fieldMapping: { parentId: 'parent', subject: 'title', stackRank: 'rank', stateCode: 'state' },
})

const GridExample = () => <TaskDatasetControl modules={[createTaskDraggingModule()]} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='320px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const RESCHEDULE_CODE = `import { createTaskEditingModule, DatasetControl, ITaskChanges, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'

const tasks = createOfficeTable()
const parentIdOf = (taskId: string): string | undefined => tasks.getRow(taskId)?.parentid?.[0]?.id.guid

//a backend with a rule of its own: a parent is due with its last subtask
class SchedulingStore extends MemoryTaskStore {
    private _changedIds = new Set<string>()

    public async saveTask(task: IRecord) {
        const result = await super.saveTask(task)
        for (let parentId = parentIdOf(task.getRecordId()); parentId; parentId = parentIdOf(parentId)) {
            const lastDue = tasks.getRows(row => row.parentid?.[0]?.id.guid === parentId).map(row => dayjs(row.due)).reduce((last, due) => due.isAfter(last) ? due : last)
            tasks.update(parentId, { due: lastDue.format('YYYY-MM-DD') })
            this._changedIds.add(parentId)
        }
        return result
    }

    //asked after every write: the tasks the backend changed since
    public async synchronize(): Promise<ITaskChanges> {
        const updatedRecords = [...this._changedIds].map(taskId => tasks.getRow(taskId)!)
        this._changedIds.clear()
        return { updatedRecords }
    }
}

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new SchedulingStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping: officeFieldMapping,
})

const GridExample = () => <TaskDatasetControl enableEditing onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const ROOT_TASK_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { Dropdown } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const loadAllTasks = createLoadTasks(createTaskTable())

//the top-level sample tasks are the projects
const PROJECTS = [
    { key: '', text: 'Every project' },
    ...TASKS.filter(task => !task.parentid).map(task => ({ key: task[TASK_METADATA.PrimaryIdAttribute], text: task.subject })),
]

const GridExample = () => {
    const [rootTaskId, setRootTaskId] = React.useState('')

    const loadTasks = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => ({
        ...await loadAllTasks(taskRuntime),
        rootTaskId: rootTaskId || undefined,
    })

    return <>
        <Dropdown label='Project' options={PROJECTS} selectedKey={rootTaskId} onChange={(_, option) => setRootTaskId(String(option!.key))} />
        {/* the root is read at mount, so a new key mounts the control again */}
        <TaskDatasetControl key={rootTaskId} enableCreation onLoad={loadTasks} height='420px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Ribbon />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <TaskGrid />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </>
}
`

export const OwnTasksExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OWN_TASKS_CODE }, DATAVERSE_TASKS_FILE, TALXIS_TASKS_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const RankRowsExample = () => <GridExampleRunner seedCode={withOffice(RANK_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const KeepTheTasksExample = () => <GridExampleRunner seedCode={withTasks(KEEP_TASKS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const ExtendAStoreExample = () => <GridExampleRunner seedCode={withOffice(EXTEND_STORE_CODE, EXTEND_DATAVERSE_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const OwnStoreExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OWN_STORE_CODE }, API_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const RescheduledDatesExample = () => <GridExampleRunner seedCode={withOffice(RESCHEDULE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const RootTaskExample = () => <GridExampleRunner seedCode={withTasks(ROOT_TASK_CODE)} tabs={TASK_EXAMPLE_TABS} />
