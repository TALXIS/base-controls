import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

const SHOWCASE_CODE = `import { createFilteringModule, createIndexedDbCustomColumnsModule, createMemoryDependenciesModule, createMemoryLookupManyModule, createMemoryTaskChecklistModule, createMemoryTemplatesModule, createRowSelectionModule, createSortingModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, IMemoryTemplate, ITaskGridView, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable, TASK_VIEWS } from './tasks'

//sample data from these docs: LOOKUP_MANY_*, CHECKLIST_*, DEPENDENC*, TEMPLATES, getTaskColumns
//tables outlive every mount, so what the user changes survives a view switch
const tasks = createTaskTable()
const templates = new MemoryTable<IMemoryTemplate>({ idKey: 'id', rows: TEMPLATES })
const lookupManyValues = new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES })
const checklistItems = new MemoryTable({ idKey: 'id', rows: CHECKLIST_ITEMS })
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

//All tasks shows the modules' columns too and searches assignees and tags
const VIEWS: ITaskGridView[] = [{
    id: 'all',
    name: 'All tasks',
    resolve: provider => {
        provider.setQuickFindColumns(['subject', 'assignedto', 'tags'])
        return { columns: [...getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete'), ...LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, ...DEPENDENCY_COLUMNS] }
    },
}, ...TASK_VIEWS.filter(view => view.id !== 'all')]

const loadTasks = createLoadTasks(tasks, VIEWS)

const GridExample = () => {
    const modules = [
        createTaskDraggingModule(),
        createIndexedDbCustomColumnsModule({ databaseName: 'taskGridDocs.showcase.columns', columns: [{ displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }], enableCreation: true }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: lookupManyValues }),
        createMemoryTemplatesModule({ tasks, templates }),
        createMemoryTaskChecklistModule({ items: checklistItems }),
        createMemoryDependenciesModule({ dependencies }),
    ]

    //enableCreation adds the + at the start of a row, which adds a subtask
    return <TaskDatasetControl modules={modules} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='560px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Ribbon />
                {/* picks module columns or adds a custom one */}
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule(), createFilteringModule()]} />
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const BASIC_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'

//TASKS, TASK_METADATA and TASK_COLUMNS are the sample tasks of these docs
//keeps every change, so it is made once
const tasks = new MemoryTable({ idKey: TASK_METADATA.PrimaryIdAttribute, rows: TASKS })

//the columns that make the tree
const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

//returns where the tasks are kept and the field mapping
const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping,
})

//the DatasetControl for tasks; creating, editing and deleting are off until turned on
const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableCreation height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* takes the Grid's props, and throws outside a TaskDatasetControl */}
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const OWN_TASKS_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'

//a parent lookup holds { id: { guid }, etn, name }
const parentOf = (id: string, name: string) => [{ id: { guid: id }, etn: 'officetask', name }]

//statecode 0 is an active task
const OFFICE_MOVE = [
    { taskid: 'move', subject: 'Move to the new office', parentid: null, stackrank: '0|100000:', statecode: 0, owner: 'Jana', due: '2026-03-31' },
    { taskid: 'lease', subject: 'Sign the lease', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|100000:', statecode: 1, owner: 'Jana', due: '2026-01-15' },
    { taskid: 'fitout', subject: 'Fit out the space', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|200000:', statecode: 0, owner: 'Tomáš', due: '2026-02-28' },
    { taskid: 'desks', subject: 'Order desks and chairs', parentid: parentOf('fitout', 'Fit out the space'), stackrank: '0|100000:', statecode: 0, owner: 'Petra', due: '2026-02-01' },
    { taskid: 'network', subject: 'Install the network', parentid: parentOf('fitout', 'Fit out the space'), stackrank: '0|200000:', statecode: 0, owner: 'Martin', due: '2026-02-20' },
    { taskid: 'movers', subject: 'Book the movers', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|300000:', statecode: 0, owner: 'Tomáš', due: '2026-03-10' },
    { taskid: 'party', subject: 'Plan the opening party', parentid: null, stackrank: '0|200000:', statecode: 0, owner: 'Lucie', due: '2026-04-10' },
]

//what the grid and Edit columns pick from
const COLUMNS: IColumn[] = [
    { name: 'subject', displayName: 'Task', dataType: 'SingleLine.Text', isPrimary: true, visualSizeFactor: 300 },
    { name: 'owner', displayName: 'Owner', dataType: 'SingleLine.Text', visualSizeFactor: 140 },
    { name: 'due', displayName: 'Due', dataType: 'DateAndTime.DateOnly', visualSizeFactor: 130 },
    { name: 'taskid', displayName: 'ID', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'parentid', displayName: 'Parent', dataType: 'Lookup.Simple', isHidden: true },
    { name: 'stackrank', displayName: 'Rank', dataType: 'SingleLine.Text', isHidden: true },
    { name: 'statecode', displayName: 'State', dataType: 'Whole.None', isHidden: true },
]

//the columns that make the tree
const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

const metadata = { PrimaryIdAttribute: 'taskid', LogicalName: 'officetask' }

//keeps every change, so it is made once
const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_MOVE })

//called on every mount
const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata, columns: COLUMNS }),
    fieldMapping,
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='360px'>
    <DatasetControl.Body>
        <TaskGrid />
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

const VIEWS_CODE = `import { createFilteringModule, createSortingModule, DatasetControl, ITaskGridView, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const COLUMNS = getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend')

//each view sets the provider up as it opens
const VIEWS: ITaskGridView[] = [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'planning',
        name: 'Planning',
        resolve: provider => {
            //sorts each task's subtasks
            provider.setSorting([{ name: 'scheduledstart', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
    {
        id: 'design',
        name: 'Design work',
        resolve: provider => {
            //matches keep their ancestors
            provider.setSearchQuery('design')
            return { columns: COLUMNS }
        },
    },
    //the task grid reads isFlatList from the view's data
    { id: 'flat', name: 'Every task on its own', resolve: () => ({ columns: COLUMNS, data: { isFlatList: true } }) },
]

//the views come with the store
const loadTasks = createLoadTasks(createTaskTable(), VIEWS)

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createSortingModule(), createFilteringModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const WORKING_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskRuntime, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { MessageBar } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

const GridExample = () => {
    const [message, setMessage] = React.useState('')

    const onLoad = async (taskRuntime: ITaskRuntime) => {
        //a new provider on every mount, so its listeners go with it
        taskRuntime.services.observe('provider', provider => {
            provider.taskEvents.addEventListener('onTasksCreated', records => setMessage('Created ' + records.map(record => record.getValue('subject')).join(', ')))
            provider.taskEvents.addEventListener('onTasksDeleted', taskIds => setMessage('Deleted ' + taskIds.length + ' tasks'))
            provider.taskEvents.addEventListener('onTaskMoved', ({ movingRecord, position, targetRecord }) => setMessage('Moved ' + movingRecord.getValue('subject') + ' ' + position + ' ' + targetRecord.getValue('subject')))
        })
        return loadTasks(taskRuntime)
    }

    return <>
        {message && <MessageBar>{message}</MessageBar>}
        {/* the dragging module moves tasks by dragging their rows */}
        <TaskDatasetControl modules={[createTaskDraggingModule()]} enableCreation enableEditing enableDeletion onLoad={onLoad} height='480px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Ribbon />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                {/* Edit and Delete act on the selected rows */}
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]} />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </>
}
`

const KEEP_TASKS_CODE = `import { createRowSelectionModule, DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { DefaultButton, Stack, Text } from '@fluentui/react'
import type { IRawRecord } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

const GridExample = () => {
    //the table outlives every mount, so it can be read and kept at any time
    const [tasks, setTasks] = React.useState(createTaskTable)
    const loadTasks = React.useMemo(() => createLoadTasks(tasks), [tasks])
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
        <TaskDatasetControl key={mountKey} enableCreation enableDeletion onLoad={loadTasks} height='420px'>
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

const TALKING_CODE = `import { createRowSelectionModule, DatasetControl, IDatasetControl, ITaskRuntime, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { DefaultButton, Stack } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

const GridExample = () => {
    const runtimeRef = React.useRef<ITaskRuntime>()
    const [showButtons, setShowButtons] = React.useState(true)
    //the settings hook reads the latest value when the menu opens
    const showButtonsRef = React.useRef(showButtons)
    showButtonsRef.current = showButtons

    //called on every mount with its new control, before its modules load
    const onSetup = (control: IDatasetControl<ITaskViewData>) => {
        control.modules.observe('taskRuntime', (taskRuntime: ITaskRuntime) => {
            runtimeRef.current = taskRuntime
        })
        //the part exists once TaskDatasetControl.Settings mounts
        control.parts.observe('taskSettings', settings => settings.hooks.settings.add(items => items.push({
            key: 'showButtons',
            label: 'Show the buttons',
            isChecked: showButtonsRef.current,
            onChange: setShowButtons,
        })))
    }

    const addTask = async () => {
        await runtimeRef.current!.tasks.create(undefined, { data: { subject: 'Review the budget', priority: 2 } })
    }

    const completeSelected = async () => {
        const runtime = runtimeRef.current!
        const provider = runtime.getProvider()
        const records = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id])
        //runs behind the loading overlay
        await runtime.execute(async () => {
            for (const record of records) {
                record.setValue('percentcomplete', 100)
                await record.save()
            }
        }, { loading: { message: 'Completing tasks...' }, error: { title: 'The tasks could not be completed.' } })
    }

    const toggleHierarchy = () => {
        const runtime = runtimeRef.current!
        runtime.setFlatList(!runtime.isFlatList())
    }

    return <>
        {showButtons && <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Add a task' onClick={addTask} />
            <DefaultButton text='Complete the selected' onClick={completeSelected} />
            <DefaultButton text='Toggle the hierarchy' onClick={toggleHierarchy} />
        </Stack>}
        <TaskDatasetControl enableCreation onSetup={onSetup} onLoad={loadTasks} height='440px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Settings />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </>
}
`

const DATAVERSE_TASKS_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { DataverseTaskStore, ITaskGridLoadResult, ITaskRuntime } from '@talxis/base-controls'

//in a model-driven app, load the tasks this way instead of from the memory table in GridExample.tsx
const TASKS_FETCH_XML = \`<fetch>
    <entity name="task">
        <attribute name="subject" />
        <attribute name="parentid" />
        <attribute name="stackrank" />
        <attribute name="statecode" />
        <filter>
            <condition attribute="projectid" operator="eq" value="{{ project.id }}" />
        </filter>
    </entity>
</fetch>\`

export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({ taskRuntime, fetchXml: TASKS_FETCH_XML }),
    fieldMapping: { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' },
})
`,
}

export const TaskGridShowcaseExample = () => <GridExampleRunner seedCode={withTasks(SHOWCASE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BasicTaskGridExample = () => <GridExampleRunner seedCode={BASIC_CODE} tabs={TASK_EXAMPLE_TABS} />
export const OwnTasksExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OWN_TASKS_CODE }, DATAVERSE_TASKS_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const RootTaskExample = () => <GridExampleRunner seedCode={withTasks(ROOT_TASK_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TaskViewsExample = () => <GridExampleRunner seedCode={withTasks(VIEWS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const WorkingWithTasksExample = () => <GridExampleRunner seedCode={withTasks(WORKING_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const KeepTheTasksExample = () => <GridExampleRunner seedCode={withTasks(KEEP_TASKS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TalkingToTheTaskGridExample = () => <GridExampleRunner seedCode={withTasks(TALKING_CODE)} tabs={TASK_EXAMPLE_TABS} />
