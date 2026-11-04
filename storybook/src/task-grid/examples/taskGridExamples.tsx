import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

const SHOWCASE_CODE = `import { createLoadTasks, createTaskDatabase, loadTaskViews } from './tasks'

//sample data from these docs: LOOKUP_MANY_*, CHECKLIST_*, DEPENDENC*, TEMPLATES, getTaskColumns
const VIEW_COLUMNS = [...LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, ...DEPENDENCY_COLUMNS]

//*Every task on its own* in the view switcher draws the tasks without the tree
const loadViews = async () => (await loadTaskViews()).map(view => view.id === 'all'
    ? { ...view, resolve: () => ({ columns: getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete').concat(VIEW_COLUMNS), data: { quickFindColumns: ['subject', 'assignedto', 'tags'] } }) }
    : view)

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
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
        createMemoryChecklistModule({ items: CHECKLIST_ITEMS }),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    ], [database])

    //enableCreation adds the + at the start of a row, which adds a subtask
    return <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoadViews={loadViews} onLoad={loadTasks} stateKey='taskGridDocs.showcase' height='560px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Ribbon />
                {/* adds a checklist, a dependency or a custom column */}
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

const BASIC_CODE = `const fieldMapping: IFieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode' }

const GridExample = () => {
    const database = React.useMemo(() => new MemoryTaskDatabase({ records: TASKS, metadata: TASK_METADATA }), [])

    //onLoad returns a field mapping beside the provider
    const loadTasks = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
        provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, database, columns: TASK_COLUMNS }) }),
        fieldMapping,
    })

    return <TaskDatasetControl onLoad={loadTasks} enableCreation enableEditing enableDeletion height='420px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Ribbon />
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* throws outside a TaskDatasetControl */}
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
    const loadTasks = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
        provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, database, columns: COLUMNS }) }),
        fieldMapping,
    })

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

const ROOT_TASK_CODE = `import { createLoadTasks, createTaskDatabase, loadTaskViews } from './tasks'

const getParentId = (task: IRawRecord): string | undefined => task.parentid?.[0]?.id.guid

const ROOT_OPTIONS = [
    { key: '', text: 'Every project' },
    ...TASKS.filter(task => !getParentId(task)).map(task => ({ key: task[TASK_METADATA.PrimaryIdAttribute], text: task.subject })),
]

const GridExample = () => {
    const [rootTaskId, setRootTaskId] = React.useState('')
    const database = React.useMemo(createTaskDatabase, [])

    const loadTasks = async (parameters: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
        ...await createLoadTasks(database)(parameters),
        rootTaskId: rootTaskId || undefined,
    })

    return <Stack tokens={{ childrenGap: 12 }}>
        <Dropdown label='Project' styles={{ root: { maxWidth: 320 } }} options={ROOT_OPTIONS} selectedKey={rootTaskId} onChange={(_, option) => setRootTaskId(String(option?.key ?? ''))} />
        {/* the root is read on load */}
        <TaskDatasetControl key={rootTaskId} enableCreation onLoadViews={loadTaskViews} onLoad={loadTasks} height='420px'>
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

//the control applies each view's data for you
const loadViews = async (): Promise<IDatasetControlView<ITaskViewData>[]> => [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: COLUMNS }) },
    //sorts each task's subtasks
    { id: 'planning', name: 'Planning', resolve: () => ({ columns: COLUMNS, data: { sorting: [{ name: 'scheduledstart', sortDirection: 0 }] } }) },
    //matches keep their ancestors
    { id: 'design', name: 'Design work', resolve: () => ({ columns: COLUMNS, data: { searchQuery: 'design' } }) },
    { id: 'flat', name: 'Every task on its own', resolve: () => ({ columns: COLUMNS, data: { isFlatList: true } }) },
]

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    const gridModules = React.useMemo(() => [createSortingModule(), createFilteringModule()], [])

    return <TaskDatasetControl onLoadViews={loadViews} onLoad={loadTasks} stateKey='taskGridDocs.views' height='480px'>
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

const WORKING_CODE = `import { createLoadTasks, createTaskDatabase, loadTaskViews } from './tasks'

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
            onLoadViews={loadTaskViews}
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

const TALKING_CODE = `import { createLoadTasks, createTaskDatabase, loadTaskViews } from './tasks'

const GridExample = () => {
    const runtimeRef = React.useRef<ITaskRuntime>()
    const [showButtons, setShowButtons] = React.useState(true)
    const showButtonsRef = React.useRef(showButtons)
    showButtonsRef.current = showButtons
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' })], [])

    //called on every mount once the tasks have loaded
    const onReady = (runtime: ITaskRuntime) => {
        runtimeRef.current = runtime
        //the part exists once TaskDatasetControl.Settings mounts
        runtime.services.get('datasetControl').parts.observe('taskSettings', (settings: any) => settings.registerSettings((items: any[]) => items.push({
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
        <TaskDatasetControl enableCreation enableEditing onLoadViews={loadTaskViews} onLoad={loadTasks} onReady={onReady} height='440px'>
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

export const loadTasks = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
    provider: createDataverseTaskDataSource({ taskRuntime, onCreateStore: () => new DataverseTaskStore({ taskRuntime, fetchXml: TASKS_FETCH_XML }) }),
    fieldMapping,
})
`,
}

export const TaskGridShowcaseExample = () => <GridExampleRunner seedCode={withTasks(SHOWCASE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BasicTaskGridExample = () => <GridExampleRunner seedCode={BASIC_CODE} tabs={TASK_EXAMPLE_TABS} />
export const OwnTasksExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OWN_TASKS_CODE }, DATAVERSE_TASKS_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const RootTaskExample = () => <GridExampleRunner seedCode={withTasks(ROOT_TASK_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TaskViewsExample = () => <GridExampleRunner seedCode={withTasks(VIEWS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const WorkingWithTasksExample = () => <GridExampleRunner seedCode={withTasks(WORKING_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TalkingToTheTaskGridExample = () => <GridExampleRunner seedCode={withTasks(TALKING_CODE)} tabs={TASK_EXAMPLE_TABS} />
