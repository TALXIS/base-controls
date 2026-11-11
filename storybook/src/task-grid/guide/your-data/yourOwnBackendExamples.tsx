import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'
import { CHECKLISTS_FILE } from '../officePlanFiles'

const TASKS_API_FILE: IGridExampleFile = {
    name: 'api.ts',
    code: `import { OFFICE_TASKS } from './office'

//stands in for your backend: tasks of its own shape, behind async calls
export interface IApiTask {
    id: string
    title: string
    parentId: string | null
    rank: string
    isDone: boolean
    due: string | null
}

//seeded with the office plan
let apiTasks: IApiTask[] = OFFICE_TASKS.map(row => ({ id: row.taskid, title: row.subject, parentId: row.parentid?.[0]?.id.guid ?? null, rank: row.stackrank, isDone: row.statecode !== 0, due: row.due }))
const rescheduledIds = new Set<string>()

const wait = () => new Promise(resolve => setTimeout(resolve, 300))

//the backend's own rule: a parent is due with its last subtask
const getDue = (apiTask: IApiTask): string | null => {
    const dues = apiTasks.filter(subtask => subtask.parentId === apiTask.id).map(getDue).filter((due): due is string => !!due).sort()
    return dues.length > 0 ? dues[dues.length - 1] : apiTask.due
}

const reschedule = () => {
    apiTasks = apiTasks.map(apiTask => {
        const due = getDue(apiTask)
        if (due === apiTask.due) {
            return apiTask
        }
        rescheduledIds.add(apiTask.id)
        return { ...apiTask, due }
    })
}

export const api = {
    getTasks: async (): Promise<IApiTask[]> => {
        await wait()
        return apiTasks.map(apiTask => ({ ...apiTask }))
    },
    createTask: async (apiTask: IApiTask): Promise<IApiTask> => {
        await wait()
        apiTasks = [...apiTasks, { ...apiTask }]
        reschedule()
        return { ...apiTask }
    },
    updateTask: async (apiTask: IApiTask): Promise<void> => {
        await wait()
        apiTasks = apiTasks.map(existing => existing.id === apiTask.id ? { ...apiTask } : existing)
        reschedule()
    },
    deleteTasks: async (ids: string[]): Promise<void> => {
        await wait()
        apiTasks = apiTasks.filter(apiTask => !ids.includes(apiTask.id))
        reschedule()
    },
    //the tasks the rule changed since the last call
    getRescheduledTasks: async (): Promise<IApiTask[]> => {
        await wait()
        const rescheduled = apiTasks.filter(apiTask => rescheduledIds.has(apiTask.id))
        rescheduledIds.clear()
        return rescheduled.map(apiTask => ({ ...apiTask }))
    },
}
`,
}

const API_STORE_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, IDeleteTasksResult, ITaskChanges, ITaskCreateParameters, ITaskCreateResult, ITaskDeleteParameters, ITaskGridLoadResult, ITaskLoadResult, ITaskRuntime, ITaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IColumn, IRawRecord, IRecord, IRecordSaveOperationResult } from '@talxis/client-libraries'
import { api, IApiTask } from './api'

const COLUMNS: IColumn[] = [
    { name: 'title', displayName: 'Task', dataType: 'SingleLine.Text', isPrimary: true, visualSizeFactor: 300 },
    { name: 'due', displayName: 'Due', dataType: 'DateAndTime.DateOnly', visualSizeFactor: 140 },
    { name: 'id', displayName: 'ID', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'parent', displayName: 'Parent', dataType: 'Lookup.Simple', isHidden: true },
    { name: 'rank', displayName: 'Rank', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'state', displayName: 'State', dataType: 'Whole.None', isHidden: true },
]

//new: your API's task as the row the task grid reads, and back
const toRow = (apiTask: IApiTask): IRawRecord => ({
    id: apiTask.id,
    title: apiTask.title,
    parent: apiTask.parentId ? [{ id: { guid: apiTask.parentId }, etn: 'apitask', name: '' }] : null,
    rank: apiTask.rank,
    state: apiTask.isDone ? 1 : 0,
    due: apiTask.due,
})
const toApiTask = (task: IRecord): IApiTask => ({
    id: task.getRecordId(),
    title: task.getValue('title'),
    parentId: task.getValue('parent')?.[0]?.id.guid ?? null,
    rank: task.getValue('rank'),
    isDone: Number(task.getValue('state')) !== 0,
    due: task.getValue('due') ? dayjs(task.getValue('due')).format('YYYY-MM-DD') : null,
})

//new: one method for each thing the task grid asks of the store
class ApiTaskStore implements ITaskStore {
    private _taskRuntime: ITaskRuntime

    constructor(taskRuntime: ITaskRuntime) {
        this._taskRuntime = taskRuntime
    }

    public async load(): Promise<ITaskLoadResult> {
        const apiTasks = await api.getTasks()
        return { rawData: apiTasks.map(toRow), metadata: { PrimaryIdAttribute: 'id', LogicalName: 'apitask' }, columns: COLUMNS }
    }

    public async getAvailableColumns() {
        return COLUMNS
    }

    public async getAvailableRelatedColumns() {
        return []
    }

    //the grid already shows the task under taskId, with its parent and rank worked out
    public async createTask(parameters: ITaskCreateParameters): Promise<ITaskCreateResult> {
        const apiTask = await api.createTask({
            id: parameters.taskId ?? crypto.randomUUID(),
            title: parameters.data?.title,
            parentId: parameters.parentRecord?.getRecordId() ?? null,
            rank: parameters.stackRank,
            isDone: false,
            due: null,
        })
        return { record: toRow(apiTask) }
    }

    //an edit, or a move with its new parent and rank
    public async saveTask(task: IRecord): Promise<IRecordSaveOperationResult> {
        await api.updateTask(toApiTask(task))
        return { recordId: task.getRecordId(), success: true, fields: task.getFields().filter(field => field.isDirty()).map(field => field.getColumn().name) }
    }

    //called level by level, the deepest tasks first
    public async deleteTasks(parameters: ITaskDeleteParameters): Promise<IDeleteTasksResult> {
        await api.deleteTasks(parameters.taskIds)
        return { success: true, deletedTaskIds: parameters.taskIds }
    }

    //new: asked after every change for the tasks your backend changed on its own
    public async synchronize(): Promise<ITaskChanges> {
        const apiTasks = await api.getRescheduledTasks()
        return { updatedRecords: apiTasks.map(toRow) }
    }

    //Edit: where your app edits tasks outside the grid; null when nothing changed
    public async openTasks() {
        await this._taskRuntime.services.get('pcfContext').navigation.openAlertDialog({ text: 'Your app opens the selected tasks here.' })
        return null
    }

    //the parent is the only lookup, and it is hidden
    public async openRelatedRecord() {
        throw new Error('Not implemented.')
    }
}

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new ApiTaskStore(taskRuntime),
    fieldMapping: { parentId: 'parent', subject: 'title', stackRank: 'rank', stateCode: 'state' },
})

const GridExample = () => <TaskDatasetControl modules={[createTaskDraggingModule()]} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='460px'>
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

const CHECKLIST_API_FILE: IGridExampleFile = {
    name: 'api.ts',
    code: `import { CHECKLISTS } from './checklists'

//stands in for your backend: the plan's checklist items behind an async call
export const api = {
    getChecklistItems: async (taskIds: string[]) => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return CHECKLISTS.filter(item => taskIds.includes(item.taskId))
    },
}
`,
}

const MODULE_STORE_CODE = `import { createTaskChecklistModule, DatasetControl, ITaskChecklistItem, ITaskChecklistStore, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'
import { api } from './api'

const tasks = createOfficeTable()

//new: made on every mount, and asked once for the items of every loaded task
const createStore = (): ITaskChecklistStore => ({
    loadItems: async taskIds => {
        const itemsByTask = new Map<string, ITaskChecklistItem[]>()
        for (const item of await api.getChecklistItems(taskIds)) {
            itemsByTask.set(item.taskId, [...itemsByTask.get(item.taskId) ?? [], item])
        }
        return itemsByTask
    },
})

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping: officeFieldMapping,
    views: [{ id: 'plan', name: 'Whole plan', resolve: () => ({ columns: [{ name: 'subject' }, { name: 'owner' }, { name: 'due' }, { name: TASK_CHECKLIST_COLUMN_NAME }] }) }],
})

//new: the base factory takes your store in place of a memory table
const GridExample = () => <TaskDatasetControl modules={[createTaskChecklistModule({ createStore })]} onLoad={loadTasks} height='420px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const ApiStoreExample = () => <GridExampleRunner seedCode={withOffice(API_STORE_CODE, TASKS_API_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const ModuleStoreExample = () => <GridExampleRunner seedCode={withOffice(MODULE_STORE_CODE, CHECKLISTS_FILE, CHECKLIST_API_FILE)} tabs={TASK_EXAMPLE_TABS} />
