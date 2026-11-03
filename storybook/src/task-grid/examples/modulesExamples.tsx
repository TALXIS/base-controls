import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { withTasks } from './shared'

interface IModuleExample {
    /** Declarations above the component, such as the module's view. */
    setup: string
    /** The control modules, as an array expression over `database`. */
    modules: string
    /** The view's columns, as an expression. */
    columns: string
    /** Parts added to the header's end, before the ribbon. */
    headerParts?: string
}

const createModuleCode = (example: IModuleExample) => `import { createLoadTasks, createTaskDatabase } from './tasks'
${example.setup}
const loadViews = async (): Promise<IDatasetControlView<ITaskViewData>[]> => [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: ${example.columns} }) },
]

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createFilteringModule()], [])
    const controlModules = React.useMemo(() => ${example.modules}, [database])

    return <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoadViews={loadViews} onLoad={loadTasks} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>${example.headerParts ?? ''}
                <TaskDatasetControl.Ribbon />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid modules={gridModules} />
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const CUSTOM_COLUMNS_CODE = createModuleCode({
    setup: '',
    modules: `[
        //a new database starts with these columns
        createIndexedDbCustomColumnsModule({
            databaseName: 'taskGridDocs.customColumns',
            columns: [
                { displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] },
                { displayName: 'Budget', dataType: 'Currency', precision: 0 },
            ],
            enableCreation: true,
            enableDeletion: true,
        }),
    ]`,
    columns: `getTaskColumns('subject', 'statuscode', 'scheduledend')`,
    headerParts: `
                <DatasetControl.EditColumns />`,
})

const LOOKUP_MANY_CODE = createModuleCode({
    setup: `
//assignedto draws people, tags coloured pills, and teams plain ones
const COLUMNS: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Assigned to', entityName: 'mem_person', appearance: { type: 'people' } },
    tags: { displayName: 'Tags', entityName: 'mem_tag', appearance: { type: 'colorful' } },
    teams: { displayName: 'Teams', entityName: 'mem_team' },
}

//a view lists each column by name, as a Lookup.Simple column
const VIEW_COLUMNS: IColumn[] = Object.keys(COLUMNS).map(name => ({ name, displayName: COLUMNS[name].displayName, dataType: 'Lookup.Simple', visualSizeFactor: 200 }))
`,
    modules: `[createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: COLUMNS, values: LOOKUP_MANY_VALUES })]`,
    columns: `[...getTaskColumns('subject', 'statuscode'), ...VIEW_COLUMNS]`,
})

const TEMPLATES_CODE = createModuleCode({
    setup: `
const ONBOARDING: IMemoryTemplate = {
    id: 'onboarding',
    name: 'Onboard a new colleague',
    data: { priority: 1 },
    children: [
        { data: { subject: 'Prepare the laptop', estimatedeffort: 2 } },
        { data: { subject: 'Create the accounts', estimatedeffort: 1 } },
        { data: { subject: 'First week', estimatedeffort: 40 }, children: [
            { data: { subject: 'Meet the team' } },
            { data: { subject: 'Pick a first task' } },
        ] },
    ],
}
`,
    modules: `[createMemoryTemplatesModule({ database, templates: [ONBOARDING, ...TEMPLATES] })]`,
    columns: `getTaskColumns('subject', 'priority', 'estimatedeffort')`,
})

const CHECKLIST_CODE = createModuleCode({
    setup: `
//a view lists the column as a Lookup.Simple column
const CHECKLIST: IColumn = { name: 'checklist__virtual', displayName: 'Checklist', dataType: 'Lookup.Simple', visualSizeFactor: 100 }
`,
    modules: `[createMemoryChecklistModule({ items: CHECKLIST_ITEMS })]`,
    columns: `[...getTaskColumns('subject', 'statuscode', 'percentcomplete'), CHECKLIST]`,
})

const DEPENDENCIES_CODE = createModuleCode({
    setup: `
//a view lists the counts as Lookup.Simple columns
const COUNTS: IColumn[] = [
    { name: 'predecessors__virtual', displayName: 'Predecessors', dataType: 'Lookup.Simple', visualSizeFactor: 100 },
    { name: 'successors__virtual', displayName: 'Successors', dataType: 'Lookup.Simple', visualSizeFactor: 100 },
]
`,
    modules: `[createMemoryDependenciesModule({ dependencies: DEPENDENCIES })]`,
    columns: `[...getTaskColumns('subject', 'scheduledstart', 'scheduledend'), ...COUNTS]`,
})

const MODULES_CODE = `import { createLoadTasks, createTaskDatabase } from './tasks'

const loadViews = async (): Promise<IDatasetControlView<ITaskViewData>[]> => [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject', 'statuscode', 'percentcomplete'), CHECKLIST_COLUMN] }) },
]

const createChecklistStore = (): IChecklistStore => ({
    onLoadItems: async taskIds => new Map<string, IChecklistItem[]>(taskIds.map(taskId => [taskId, CHECKLIST_ITEMS[taskId] ?? []])),
})

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    //task and DatasetControl modules, read on every mount
    const controlModules = React.useMemo(() => [
        createTaskDraggingModule(),
        //the base factory makes your store on every mount
        createChecklistModule({ onCreateStore: createChecklistStore }),
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'taskGridDocs.modules.views' }),
    ], [])
    //Grid modules, read at mount
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule()], [])

    return <TaskDatasetControl modules={controlModules} enableEditing onLoadViews={loadViews} onLoad={loadTasks} stateKey='taskGridDocs.modules' height='440px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid stateKey='grid' modules={gridModules} />
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const PROJECT_CODE = `import { createLoadTasks, createTaskDatabase, loadTaskViews } from './tasks'

const GridExample = () => {
    const [project, setProject] = React.useState<IProject>()
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    //loaded before the tasks, on every mount
    const controlModules = React.useMemo(() => [
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
    ], [])

    const onReady = (taskRuntime: ITaskRuntime) => setProject(taskRuntime.services.get('datasetControl').modules.find('project'))

    return <Stack tokens={{ childrenGap: 8 }}>
        {project && <MessageBar>{project.getName()}: {project.getStartDate()?.format('D MMM YYYY')} to {project.getEndDate()?.format('D MMM YYYY')}</MessageBar>}
        <TaskDatasetControl modules={controlModules} onLoadViews={loadTaskViews} onLoad={loadTasks} onReady={onReady} height='400px'>
            <DatasetControl.Body>
                <TaskGrid />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </Stack>
}
`

export const ModulesExample = () => <GridExampleRunner seedCode={withTasks(MODULES_CODE)} />
export const ProjectExample = () => <GridExampleRunner seedCode={withTasks(PROJECT_CODE)} />
export const CustomColumnsExample = () => <GridExampleRunner seedCode={withTasks(CUSTOM_COLUMNS_CODE)} />
export const LookupManyExample = () => <GridExampleRunner seedCode={withTasks(LOOKUP_MANY_CODE)} />
export const TemplatesExample = () => <GridExampleRunner seedCode={withTasks(TEMPLATES_CODE)} />
export const ChecklistExample = () => <GridExampleRunner seedCode={withTasks(CHECKLIST_CODE)} />
export const DependenciesExample = () => <GridExampleRunner seedCode={withTasks(DEPENDENCIES_CODE)} />
