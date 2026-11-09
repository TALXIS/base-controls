import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

const CUSTOM_COLUMNS_CODE = `import { createIndexedDbCustomColumnsModule, createTaskEditingModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskDatabase } from './tasks'

const loadTasks = createLoadTasks(createTaskDatabase())

const GridExample = () => {
    const modules = [
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
    ]

    return <TaskDatasetControl modules={modules} enableEditing onLoad={loadTasks} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <DatasetControl.EditColumns />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* edits the custom columns' values in place */}
            <TaskGrid modules={[createTaskEditingModule()]} />
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const LOOKUP_MANY_CODE = `import { createFilteringModule, createMemoryLookupManyModule, createTaskEditingModule, DatasetControl, ILookupManyColumn, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'
import { createLoadTasks, createTaskDatabase } from './tasks'

//assignedto draws people, tags coloured pills, and teams plain ones; try another appearance
const COLUMNS: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Assigned to', entityName: 'mem_person', appearance: { type: 'people' } },
    tags: { displayName: 'Tags', entityName: 'mem_tag', appearance: { type: 'colorful' } },
    teams: { displayName: 'Teams', entityName: 'mem_team' },
}

//a view lists each column by name, as a Lookup.Simple column; filter one from its column menu
const VIEW_COLUMNS: IColumn[] = Object.keys(COLUMNS).map(name => ({ name, displayName: COLUMNS[name].displayName, dataType: 'Lookup.Simple', visualSizeFactor: 200 }))

const loadTasks = createLoadTasks(createTaskDatabase(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject', 'statuscode'), ...VIEW_COLUMNS] }) },
])

//LOOKUP_MANY_SOURCES and LOOKUP_MANY_VALUES are the sample records of these docs
const GridExample = () => <TaskDatasetControl modules={[createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: COLUMNS, values: LOOKUP_MANY_VALUES })]} enableEditing onLoad={loadTasks} height='480px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule(), createFilteringModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const TEMPLATES_CODE = `import { createMemoryTemplatesModule, createRowSelectionModule, DatasetControl, IMemoryTemplate, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskDatabase } from './tasks'

//the templates create their tasks in the database the task store reads
const database = createTaskDatabase()
const loadTasks = createLoadTasks(database)

//listed under From template; select a task to save it as a template of your own
const ONBOARDING: IMemoryTemplate = {
    id: 'onboarding',
    name: 'Onboard a new colleague',
    data: { priority: 1 },
    children: [
        { data: { subject: 'Prepare the laptop' } },
        { data: { subject: 'Create the accounts' } },
        { data: { subject: 'First week' }, children: [
            { data: { subject: 'Meet the team' } },
            { data: { subject: 'Pick a first task' } },
        ] },
    ],
}

const GridExample = () => <TaskDatasetControl modules={[createMemoryTemplatesModule({ database, templates: [ONBOARDING] })]} enableCreation onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'single' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const CHECKLIST_CODE = `import { createMemoryTaskChecklistModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'
import { createLoadTasks, createTaskDatabase } from './tasks'

//a view lists the column as a Lookup.Simple column
const CHECKLIST: IColumn = { name: 'checklist__virtual', displayName: 'Checklist', dataType: 'Lookup.Simple', visualSizeFactor: 100 }

const loadTasks = createLoadTasks(createTaskDatabase(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject', 'percentcomplete'), CHECKLIST] }) },
])

//CHECKLIST_ITEMS are the sample checklists of these docs, by task id
const GridExample = () => <TaskDatasetControl modules={[createMemoryTaskChecklistModule({ items: CHECKLIST_ITEMS })]} onLoad={loadTasks} height='480px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const DEPENDENCIES_CODE = `import { createMemoryDependenciesModule, createRowSelectionModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'
import { createLoadTasks, createTaskDatabase } from './tasks'

//a view lists the counts as Lookup.Simple columns
const COUNTS: IColumn[] = [
    { name: 'predecessors__virtual', displayName: 'Predecessors', dataType: 'Lookup.Simple', visualSizeFactor: 100 },
    { name: 'successors__virtual', displayName: 'Successors', dataType: 'Lookup.Simple', visualSizeFactor: 100 },
]

const loadTasks = createLoadTasks(createTaskDatabase(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), ...COUNTS] }) },
])

//DEPENDENCIES are the sample dependencies of these docs
const GridExample = () => <TaskDatasetControl modules={[createMemoryDependenciesModule({ dependencies: DEPENDENCIES })]} enableDeletion onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* Delete acts on the selected rows */}
        <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const MODULES_CODE = `import { createLocalStorageUserQueriesModule, createSortingModule, createTaskChecklistModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ITaskChecklistItem, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskDatabase } from './tasks'

//CHECKLIST_COLUMN and CHECKLIST_ITEMS are the sample checklists of these docs
const loadTasks = createLoadTasks(createTaskDatabase(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject', 'statuscode', 'percentcomplete'), CHECKLIST_COLUMN] }) },
])

const GridExample = () => {
    //task and DatasetControl modules, read on every mount
    const controlModules = [
        createTaskDraggingModule(),
        //the base factory makes your store on every mount
        createTaskChecklistModule({
            createStore: () => ({ loadItems: async taskIds => new Map<string, ITaskChecklistItem[]>(taskIds.map(taskId => [taskId, CHECKLIST_ITEMS[taskId] ?? []])) }),
        }),
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'taskGridDocs.modules.views' }),
    ]
    //Grid modules, read at mount
    const gridModules = [createTaskEditingModule(), createSortingModule()]

    return <TaskDatasetControl modules={controlModules} enableEditing onLoad={loadTasks} height='440px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid modules={gridModules} />
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const PROJECT_CODE = `import { createMemoryProjectModule, DatasetControl, IDatasetControl, IProject, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { MessageBar } from '@fluentui/react'
import { createLoadTasks, createTaskDatabase } from './tasks'

const loadTasks = createLoadTasks(createTaskDatabase())

const GridExample = () => {
    const [project, setProject] = React.useState<IProject>()

    const onSetup = (control: IDatasetControl<ITaskViewData>) => {
        control.lifecycle.events.addEventListener('onReady', () => setProject(control.modules.find('project')))
    }

    return <>
        {project && <MessageBar>{project.getName()}: {project.getStartDate()?.format('D MMM YYYY')} to {project.getEndDate()?.format('D MMM YYYY')}</MessageBar>}
        {/* loaded before the tasks, on every mount */}
        <TaskDatasetControl modules={[createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } })]} onSetup={onSetup} onLoad={loadTasks} height='400px'>
            <DatasetControl.Body>
                <TaskGrid />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </>
}
`

const LOOKUP_MANY_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseLookupManyModule } from '@talxis/base-controls'

//in a model-driven app, use this module instead of the memory one in GridExample.tsx
export const createAssigneesModule = (projectId: string) => createDataverseLookupManyModule({
    hostRecord: { entityName: 'msdyn_project', id: projectId },
    columns: {
        assignedto: {
            displayName: 'Assigned to',
            entityName: 'systemuser',
            navigationPropertyName: 'task_assignees',
            appearance: { type: 'people', imageUrlPropertyName: 'entityimage_url' },
            select: 'fullname,entityimage_url',
            fetchXml: \`<fetch><entity name="systemuser"><attribute name="fullname" /></entity></fetch>\`,
        },
    },
})
`,
}

const CUSTOM_COLUMNS_TALXIS_FILE: IGridExampleFile = {
    name: 'talxis.ts',
    code: `import { createTalxisCustomColumnsModule } from '@talxis/base-controls'

//with TALXIS, use this module instead of the IndexedDB one in GridExample.tsx
export const createProjectColumnsModule = (projectId: string) => createTalxisCustomColumnsModule({ entityName: 'task', recordId: projectId, enableCreation: true, enableEditing: true, enableDeletion: true })
`,
}

const PROJECT_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseProjectModule } from '@talxis/base-controls'

//in a model-driven app, use this module instead of the memory one in GridExample.tsx
export const createDataverseProject = (projectId: string) => createDataverseProjectModule({ entityName: 'msdyn_project', id: projectId, startDateColumn: 'msdyn_scheduledstart', endDateColumn: 'msdyn_finish', columns: ['msdyn_customer'] })
`,
}

const DEPENDENCIES_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseDependenciesModule } from '@talxis/base-controls'

//in a model-driven app, use this module instead of the memory one in GridExample.tsx
export const dependenciesModule = createDataverseDependenciesModule({
    entityName: 'new_taskdependency',
    predecessorAttribute: 'new_predecessorid',
    successorAttribute: 'new_successorid',
    typeAttribute: 'new_type',
    dependencyTypeCodes: { 1: 'finishToStart', 2: 'startToStart', 3: 'finishToFinish', 4: 'startToFinish' },
})
`,
}

export const ModulesExample = () => <GridExampleRunner seedCode={withTasks(MODULES_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const ProjectExample = () => <GridExampleRunner seedCode={[...withTasks(PROJECT_CODE), PROJECT_DATAVERSE_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const CustomColumnsExample = () => <GridExampleRunner seedCode={[...withTasks(CUSTOM_COLUMNS_CODE), CUSTOM_COLUMNS_TALXIS_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const LookupManyExample = () => <GridExampleRunner seedCode={[...withTasks(LOOKUP_MANY_CODE), LOOKUP_MANY_DATAVERSE_FILE]} tabs={TASK_EXAMPLE_TABS} />
export const TemplatesExample = () => <GridExampleRunner seedCode={withTasks(TEMPLATES_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const ChecklistExample = () => <GridExampleRunner seedCode={withTasks(CHECKLIST_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const DependenciesExample = () => <GridExampleRunner seedCode={[...withTasks(DEPENDENCIES_CODE), DEPENDENCIES_DATAVERSE_FILE]} tabs={TASK_EXAMPLE_TABS} />
