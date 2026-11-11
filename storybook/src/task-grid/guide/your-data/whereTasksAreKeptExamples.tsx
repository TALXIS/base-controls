import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'

const WHERE_TASKS_ARE_KEPT_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA } from './office'

const tasks = createOfficeTable()

//new: only what onLoad returns changes between backends
const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    //new: which of your columns hold the tree, the dates and the progress
    fieldMapping: {
        parentId: 'parentid',
        subject: 'subject',
        stackRank: 'stackrank',
        stateCode: 'statecode',
        startDate: 'start',
        endDate: 'due',
        percentComplete: 'done',
    },
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='420px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseProjectModule, DataverseTaskStore, IDataverseHostRecord, ITaskGridLoadResult, ITaskGridView, ITaskRuntime } from '@talxis/base-controls'

//not run on this page: Dataverse tasks regarding the record the form shows

//picks which tasks load, not their columns
const FETCH_XML = \`<fetch>
    <entity name="task">
        <filter>
            <condition attribute="regardingobjectid" operator="eq" value="{{ hostRecord.id }}" />
        </filter>
    </entity>
</fetch>\`

const COLUMNS = ['subject', 'ownerid', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes', 'percentcomplete']

const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Whole plan', resolve: () => ({ columns: COLUMNS.map(name => ({ name })) }) },
]

//hostRecord is the record the form shows, such as { entityName: 'new_officemove', id }
export const createLoadTasks = (hostRecord: IDataverseHostRecord) => (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({ taskRuntime, fetchXml: FETCH_XML, hostRecord }),
    //task has no parent or rank of its own: add a lookup to task and a text column
    fieldMapping: {
        parentId: 'new_parenttaskid',
        subject: 'subject',
        stackRank: 'new_stackrank',
        stateCode: 'statecode',
        startDate: 'scheduledstart',
        endDate: 'scheduledend',
        duration: 'scheduleddurationminutes',
        percentComplete: 'percentcomplete',
    },
    views: VIEWS,
})

//for TaskDatasetControl's modules
export const createModules = (hostRecord: IDataverseHostRecord) => [
    //the form's record as the project: new tasks are regarding it
    createDataverseProjectModule({ entityName: hostRecord.entityName, id: hostRecord.id! }),
]
`,
}

const TALXIS_FILE: IGridExampleFile = {
    name: 'talxis.ts',
    code: `import { createDataverseProjectModule, createTalxisDependenciesModule, createTalxisTaskChecklistModule, DataverseTaskStore, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, PREDECESSORS_COLUMN_NAME, TASK_CHECKLIST_COLUMN_NAME } from '@talxis/base-controls'

//not run on this page: the plan as the tasks of a TALXIS project

const FETCH_XML = \`<fetch>
    <entity name="talxis_projecttask">
        <filter>
            <condition attribute="talxis_projectid" operator="eq" value="{{ project.id }}" />
        </filter>
    </entity>
</fetch>\`

//the modules' columns show when a view lists them by name
const COLUMNS = ['talxis_name', 'talxis_estimatedstartdate', 'talxis_estimatedenddate', 'talxis_percentcomplete', TASK_CHECKLIST_COLUMN_NAME, PREDECESSORS_COLUMN_NAME]

const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Whole plan', resolve: () => ({ columns: COLUMNS.map(name => ({ name })) }) },
]

export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({ taskRuntime, fetchXml: FETCH_XML }),
    fieldMapping: {
        parentId: 'talxis_parentprojecttaskid',
        subject: 'talxis_name',
        stackRank: 'talxis_stackrankstring',
        stateCode: 'statecode',
        startDate: 'talxis_estimatedstartdate',
        endDate: 'talxis_estimatedenddate',
        percentComplete: 'talxis_percentcomplete',
    },
    views: VIEWS,
})

//for TaskDatasetControl's modules
export const createModules = (projectId: string) => [
    //project in the FetchXML, and the lookup to it on new tasks
    createDataverseProjectModule({ entityName: 'talxis_project', id: projectId }),
    //each task's talxis_checklistjson
    createTalxisTaskChecklistModule(),
    //talxis_taskdependency
    createTalxisDependenciesModule(),
]
`,
}

const STORE_CALLS_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskCreateParameters, ITaskDeleteParameters, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { Stack, Text } from '@fluentui/react'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'

const tasks = createOfficeTable()

//new: the memory store, writing down every call that reaches it
class LoggingStore extends MemoryTaskStore {
    private _log: (line: string) => void

    constructor(taskRuntime: ITaskRuntime, log: (line: string) => void) {
        super({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS })
        this._log = log
    }

    public async load() {
        const result = await super.load()
        this._log(\`load: \${result.rawData.length} tasks\`)
        return result
    }

    public async createTask(parameters: ITaskCreateParameters) {
        this._log(\`createTask: under \${parameters.parentRecord?.getValue('subject') ?? 'the top level'}\`)
        return super.createTask(parameters)
    }

    public async saveTask(task: IRecord) {
        const changed = task.getFields().filter(field => field.isDirty()).map(field => field.getColumn().name)
        this._log(\`saveTask: \${task.getValue('subject')}, changed \${changed.join(', ')}\`)
        return super.saveTask(task)
    }

    public async deleteTasks(parameters: ITaskDeleteParameters) {
        this._log(\`deleteTasks: \${parameters.taskIds.map(taskId => tasks.getRow(taskId)?.subject).join(', ')}\`)
        return super.deleteTasks(parameters)
    }

    //new: asked after every change for what the backend changed on its own
    public async synchronize() {
        this._log('synchronize: nothing else changed')
        return { updatedRecords: [] }
    }
}

const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Whole plan', resolve: () => ({ columns: OFFICE_COLUMNS }) },
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
    const log = (line: string) => setLines(previous => [...previous, line].slice(-8))

    //new: every mount, such as a view switch, runs onLoad and gets a new store
    const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => {
        log('onLoad: a new mount')
        return { store: new LoggingStore(taskRuntime, log), fieldMapping: officeFieldMapping, views: VIEWS }
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <TaskDatasetControl modules={[createTaskDraggingModule()]} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='340px'>
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
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]} />
            </DatasetControl.Body>
        </TaskDatasetControl>
        {/* new: the last eight calls, the newest at the bottom */}
        <Stack>
            {lines.map((line, index) => <Text key={index} variant='small'>{line}</Text>)}
        </Stack>
    </Stack>
}
`

export const WhereTasksAreKeptExample = () => <GridExampleRunner seedCode={withOffice(WHERE_TASKS_ARE_KEPT_CODE, DATAVERSE_FILE, TALXIS_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const StoreCallsExample = () => <GridExampleRunner seedCode={withOffice(STORE_CALLS_CODE)} tabs={TASK_EXAMPLE_TABS} />
