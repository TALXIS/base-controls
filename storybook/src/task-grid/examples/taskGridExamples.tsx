import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

const SHOWCASE_CODE = `import { createLoadTasks, createTaskDatabase, TASK_VIEWS } from './tasks'

//sample data from these docs: LOOKUP_MANY_*, CHECKLIST_*, DEPENDENC*, TEMPLATES, getTaskColumns
const VIEW_COLUMNS = [...LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, ...DEPENDENCY_COLUMNS]

//All tasks adds the modules' columns and searches assignees and tags
const VIEWS: ITaskGridView[] = TASK_VIEWS.map(view => view.id !== 'all' ? view : {
    ...view,
    resolve: provider => {
        provider.setQuickFindColumns(['subject', 'assignedto', 'tags'])
        return { columns: getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete').concat(VIEW_COLUMNS) }
    },
})

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = async (control: IDatasetControl<ITaskViewData>): Promise<ITaskGridLoadResult> => ({ ...await createLoadTasks(database)(control), views: VIEWS })
    const gridModules = React.useMemo(() => [
        createRowSelectionModule({ mode: 'multiple' }),
        createTaskEditingModule(),
        createSortingModule(),
        createFilteringModule(),
    ], [])
    const controlModules = React.useMemo(() => [
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'taskGridDocs.showcase.views' }),
        createTaskDraggingModule(),
        createIndexedDbCustomColumnsModule({ databaseName: 'taskGridDocs.showcase.columns', columns: [{ displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }], enableCreation: true, enableDeletion: true }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: LOOKUP_MANY_VALUES }),
        createMemoryTemplatesModule({ database, templates: TEMPLATES }),
        createMemoryTaskChecklistModule({ items: CHECKLIST_ITEMS }),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    ], [database])

    //enableCreation adds the + at the start of a row, which adds a subtask
    return <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoad={loadTasks} stateKey='taskGridDocs.showcase' height='560px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
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
            <TaskGrid stateKey='grid' modules={gridModules} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <TaskDatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </TaskDatasetControl>
}
`

const BASIC_CODE = `//the columns that make the tree
const fieldMapping: IFieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode' }

const GridExample = () => {
    const database = React.useMemo(() => new MemoryTaskDatabase({ records: TASKS, metadata: TASK_METADATA }), [])

    //returns the tasks and the field mapping
    const loadTasks = async (control: IDatasetControl<ITaskViewData>): Promise<ITaskGridLoadResult> => {
        //a module of the control, loaded before onLoad
        const taskRuntime = control.modules.get('taskRuntime')
        return {
            provider: createMemoryTaskProvider({ taskRuntime, createStore: () => new MemoryTaskStore({ taskRuntime, database, columns: TASK_COLUMNS }) }),
            fieldMapping,
        }
    }

    //the DatasetControl for tasks; creating, editing and deleting are off until turned on
    return <TaskDatasetControl onLoad={loadTasks} enableCreation height='420px'>
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
}
`

const OWN_TASKS_CODE = `//a parent lookup holds { id: { guid }, etn, name }
const parentOf = (id: string, name: string) => [{ id: { guid: id }, etn: 'officetask', name }]

const OFFICE_MOVE = [
    { taskid: 'move', subject: 'Move to the new office', parentid: null, stackrank: '0|100000:', statecode: 0, owner: 'Jana', due: '2026-03-31' },
    { taskid: 'lease', subject: 'Sign the lease', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|100000:', statecode: 1, owner: 'Jana', due: '2026-01-15' },
    { taskid: 'fitout', subject: 'Fit out the space', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|200000:', statecode: 0, owner: 'Tomáš', due: '2026-02-28' },
    { taskid: 'desks', subject: 'Order desks and chairs', parentid: parentOf('fitout', 'Fit out the space'), stackrank: '0|100000:', statecode: 0, owner: 'Petra', due: '2026-02-01' },
    { taskid: 'network', subject: 'Install the network', parentid: parentOf('fitout', 'Fit out the space'), stackrank: '0|200000:', statecode: 0, owner: 'Martin', due: '2026-02-20' },
    { taskid: 'movers', subject: 'Book the movers', parentid: parentOf('move', 'Move to the new office'), stackrank: '0|300000:', statecode: 0, owner: 'Tomáš', due: '2026-03-10' },
    { taskid: 'party', subject: 'Plan the opening party', parentid: null, stackrank: '0|200000:', statecode: 0, owner: 'Lucie', due: '2026-04-10' },
]

//what views and Edit columns pick from
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
const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode' }

const GridExample = () => {
    //one database for every view
    const database = React.useMemo(() => new MemoryTaskDatabase({ records: OFFICE_MOVE, metadata: { PrimaryIdAttribute: 'taskid', LogicalName: 'officetask' } }), [])

    //called at mount, on every view switch and on every reload
    const loadTasks = async (control: IDatasetControl<ITaskViewData>): Promise<ITaskGridLoadResult> => {
        const taskRuntime = control.modules.get('taskRuntime')
        return {
            provider: createMemoryTaskProvider({ taskRuntime, createStore: () => new MemoryTaskStore({ taskRuntime, database, columns: COLUMNS }) }),
            fieldMapping,
        }
    }

    return <TaskDatasetControl onLoad={loadTasks} height='360px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid />
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const ROOT_TASK_CODE = `import { createLoadTasks, createTaskDatabase } from './tasks'

const getParentId = (task: IRawRecord): string | undefined => task.parentid?.[0]?.id.guid

const ROOT_OPTIONS = [
    { key: '', text: 'Every project' },
    ...TASKS.filter(task => !getParentId(task)).map(task => ({ key: task[TASK_METADATA.PrimaryIdAttribute], text: task.subject })),
]

const GridExample = () => {
    const [rootTaskId, setRootTaskId] = React.useState('')
    const database = React.useMemo(createTaskDatabase, [])

    const loadTasks = async (control: IDatasetControl<ITaskViewData>): Promise<ITaskGridLoadResult> => ({
        ...await createLoadTasks(database)(control),
        rootTaskId: rootTaskId || undefined,
    })

    return <Stack tokens={{ childrenGap: 12 }}>
        <Dropdown label='Project' styles={{ root: { maxWidth: 320 } }} options={ROOT_OPTIONS} selectedKey={rootTaskId} onChange={(_, option) => setRootTaskId(String(option?.key ?? ''))} />
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
    </Stack>
}
`

const VIEWS_CODE = `import { createLoadTasks, createTaskDatabase } from './tasks'

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

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    //the views come with the tasks
    const loadTasks = async (control: IDatasetControl<ITaskViewData>): Promise<ITaskGridLoadResult> => ({ ...await createLoadTasks(database)(control), views: VIEWS })
    const gridModules = React.useMemo(() => [createSortingModule(), createFilteringModule()], [])

    return <TaskDatasetControl onLoad={loadTasks} stateKey='taskGridDocs.views' height='480px'>
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
            <TaskGrid stateKey='grid' modules={gridModules} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <TaskDatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </TaskDatasetControl>
}
`

const WORKING_CODE = `import { createLoadTasks, createTaskDatabase } from './tasks'

const subjects = (records: IRecord[]) => records.map(record => record.getValue('subject')).join(', ')

const GridExample = () => {
    const [message, setMessage] = React.useState('')
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    //Edit and Delete act on the selected rows
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()], [])
    const controlModules = React.useMemo(() => [
        //moves tasks by dragging their rows
        createTaskDraggingModule({ onTaskMoved: ({ movingRecord, position, targetRecord }) => setMessage('Moved ' + movingRecord.getValue('subject') + ' ' + position + ' ' + targetRecord.getValue('subject')) }),
    ], [])

    return <Stack tokens={{ childrenGap: 8 }}>
        {message && <MessageBar onDismiss={() => setMessage('')}>{message}</MessageBar>}
        <TaskDatasetControl
            modules={controlModules}
            enableCreation
            enableEditing
            enableDeletion
            onLoad={loadTasks}
            onTasksCreated={records => setMessage('Created ' + subjects(records))}
            onTasksDeleted={taskIds => setMessage('Deleted ' + taskIds.length + ' tasks')}
            height='480px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Ribbon />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <TaskGrid modules={gridModules} />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </Stack>
}
`

const TALKING_CODE = `import { createLoadTasks, createTaskDatabase } from './tasks'

const GridExample = () => {
    const runtimeRef = React.useRef<ITaskRuntime>()
    const [showButtons, setShowButtons] = React.useState(true)
    const showButtonsRef = React.useRef(showButtons)
    showButtonsRef.current = showButtons
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' })], [])

    //called on every mount with its new control, before its modules load
    const onSetup = (control: IDatasetControl<ITaskViewData>) => {
        control.modules.observe('taskRuntime', (taskRuntime: ITaskRuntime) => {
            runtimeRef.current = taskRuntime
        })
        //the part exists once TaskDatasetControl.Settings mounts
        control.parts.observe('taskSettings', (settings: any) => settings.addSettingsHook((items: any[]) => items.push({
            key: 'showButtons',
            label: 'Show the buttons',
            isChecked: showButtonsRef.current,
            onChange: (isChecked: boolean) => setShowButtons(isChecked),
        })))
    }

    const addTask = async () => {
        await runtimeRef.current?.tasks.create(undefined, { data: { subject: 'Review the budget', priority: 2 } })
    }

    const completeSelected = async () => {
        const runtime = runtimeRef.current
        if (!runtime) {
            return
        }
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
        const runtime = runtimeRef.current
        runtime?.setFlatList(!runtime.isFlatList())
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        {showButtons && <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Add a task' onClick={() => { addTask() }} />
            <DefaultButton text='Complete the selected' onClick={() => { completeSelected() }} />
            <DefaultButton text='Toggle the hierarchy' onClick={toggleHierarchy} />
        </Stack>}
        <TaskDatasetControl enableCreation enableEditing onSetup={onSetup} onLoad={loadTasks} height='440px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Settings />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <TaskGrid modules={gridModules} />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </Stack>
}
`

const DATAVERSE_TASKS_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `//in a model-driven app, load the tasks this way instead of from the memory database in GridExample.tsx
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

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode' }

export const loadTasks = async (control: IDatasetControl<ITaskViewData>): Promise<ITaskGridLoadResult> => {
    const taskRuntime = control.modules.get('taskRuntime')
    return {
        provider: createDataverseTaskProvider({ taskRuntime, createStore: () => new DataverseTaskStore({ taskRuntime, fetchXml: TASKS_FETCH_XML }) }),
        fieldMapping,
    }
}
`,
}

export const TaskGridShowcaseExample = () => <GridExampleRunner seedCode={withTasks(SHOWCASE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BasicTaskGridExample = () => <GridExampleRunner seedCode={BASIC_CODE} tabs={TASK_EXAMPLE_TABS} />
export const OwnTasksExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OWN_TASKS_CODE }, DATAVERSE_TASKS_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const RootTaskExample = () => <GridExampleRunner seedCode={withTasks(ROOT_TASK_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TaskViewsExample = () => <GridExampleRunner seedCode={withTasks(VIEWS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const WorkingWithTasksExample = () => <GridExampleRunner seedCode={withTasks(WORKING_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TalkingToTheTaskGridExample = () => <GridExampleRunner seedCode={withTasks(TALKING_CODE)} tabs={TASK_EXAMPLE_TABS} />
