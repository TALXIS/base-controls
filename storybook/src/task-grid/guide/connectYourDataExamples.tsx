import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withOffice } from '../examples/shared'

const STORE_CALLS_CODE = `import { createRowSelectionModule, createSortingModule, createTaskEditingModule, DatasetControl, ITaskCreateParameters, ITaskDeleteParameters, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { Stack, Text } from '@fluentui/react'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'

const tasks = createOfficeTable()

//the memory store, reporting every call that reaches it
class LoggingStore extends MemoryTaskStore {
    private _log: (line: string) => void

    constructor(taskRuntime: ITaskRuntime, log: (line: string) => void) {
        super({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS })
        this._log = log
    }

    public async load() {
        this._log('load: every task of the view')
        return super.load()
    }

    public async createTask(parameters: ITaskCreateParameters) {
        this._log('createTask: the new row waits for the store')
        return super.createTask(parameters)
    }

    public async saveTask(task: IRecord) {
        this._log(\`saveTask: \${task.getValue('subject')}\`)
        return super.saveTask(task)
    }

    public async deleteTasks(parameters: ITaskDeleteParameters) {
        this._log(\`deleteTasks: \${parameters.taskIds.length}\`)
        return super.deleteTasks(parameters)
    }

    //asked after every write for what the backend changed on its own
    public async synchronize() {
        this._log('synchronize')
        return { updatedRecords: [] }
    }
}

const VIEWS: ITaskGridView[] = [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: OFFICE_COLUMNS }) },
    {
        id: 'due',
        name: 'By due date',
        resolve: provider => {
            provider.setSorting([{ name: 'due', sortDirection: 0 }])
            return { columns: OFFICE_COLUMNS }
        },
    },
]

const GridExample = () => {
    const [lines, setLines] = React.useState<string[]>([])
    const log = (line: string) => setLines(previous => [line, ...previous].slice(0, 8))

    //every mount, such as a view switch, gets a new task runtime and returns a new store
    const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => {
        log('onLoad: a new mount')
        return { store: new LoggingStore(taskRuntime, log), fieldMapping: officeFieldMapping, views: VIEWS }
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <TaskDatasetControl enableCreation enableEditing enableDeletion onLoad={loadTasks} height='360px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Ribbon />
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule()]} />
            </DatasetControl.Body>
        </TaskDatasetControl>
        {/* the newest call first */}
        <Stack>
            {lines.map((line, index) => <Text key={index} variant='small'>{line}</Text>)}
        </Stack>
    </Stack>
}
`

const DATAVERSE_CODE = `import { DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

//the memory store runs here; in a model-driven app, use loadTasks from dataverse.ts or talxis.ts
const loadTasks = createLoadOffice()

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='340px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { DataverseTaskStore, IDataverseHostRecord, ITaskGridLoadResult, ITaskRuntime } from '@talxis/base-controls'

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

const TALXIS_FILE: IGridExampleFile = {
    name: 'talxis.ts',
    code: `import { createDataverseProjectModule, DataverseTaskStore, ITaskGridLoadResult, ITaskRuntime } from '@talxis/base-controls'

//TALXIS keeps a project's tasks in talxis_projecttask
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

//for TaskDatasetControl's modules: fills in project in the FetchXML, and the lookup on new tasks
export const createProjectModules = (projectId: string) => [createDataverseProjectModule({ entityName: 'talxis_project', id: projectId })]

export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({ taskRuntime, fetchXml: FETCH_XML }),
    fieldMapping: { parentId: 'talxis_parentprojecttaskid', subject: 'talxis_name', stackRank: 'talxis_stackrankstring' },
})
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

export const StoreCallsExample = () => <GridExampleRunner seedCode={withOffice(STORE_CALLS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const DataverseTasksExample = () => <GridExampleRunner seedCode={withOffice(DATAVERSE_CODE, DATAVERSE_FILE, TALXIS_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const OwnStoreExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OWN_STORE_CODE }, API_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const RescheduledDatesExample = () => <GridExampleRunner seedCode={withOffice(RESCHEDULE_CODE)} tabs={TASK_EXAMPLE_TABS} />
