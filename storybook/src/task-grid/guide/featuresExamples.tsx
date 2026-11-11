import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withTasks } from '../examples/shared'

const FEATURES_CODE = `import { createMemoryDependenciesModule, createMemoryLookupManyModule, createMemoryTaskChecklistModule, createTaskEditingModule, DatasetControl, MemoryTable, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

//each memory module keeps its data in a table of yours, here filled with sample data
const assignments = new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES })
const checklistItems = new MemoryTable({ idKey: 'id', rows: CHECKLIST_ITEMS })
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

//task modules go on the control, and every mount loads them anew
const TASK_MODULES = [
    createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: { assignedto: LOOKUP_MANY_COLUMNS.assignedto }, values: assignments }),
    createMemoryTaskChecklistModule({ items: checklistItems }),
    createMemoryDependenciesModule({ dependencies }),
]

//a view shows a module's column by naming it; the module fills in the rest
const byName = (name: string): IColumn => ({ name, dataType: 'Lookup.Simple' })

const loadTasks = createLoadTasks(createTaskTable(), [{
    id: 'all',
    name: 'All tasks',
    resolve: () => ({ columns: [...getTaskColumns('subject', 'statuscode'), ...['assignedto', TASK_CHECKLIST_COLUMN_NAME, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME].map(byName)] }),
}])

const GridExample = () => <TaskDatasetControl modules={TASK_MODULES} enableEditing onLoad={loadTasks} height='480px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const PROJECT_CODE = `import { createMemoryProjectModule, DatasetControl, IMemoryProject, MemoryTable, TaskDatasetControl, TaskGrid, useDatasetControlModule } from '@talxis/base-controls'
import { Text } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

//dates are ISO strings in the table; the module hands them out as dayjs
const projects = new MemoryTable<IMemoryProject>({ idKey: 'id', rows: [
    { id: 'website', name: 'Website Redesign', startDate: '2025-10-01', endDate: '2026-01-31' },
    { id: 'mobile', name: 'Mobile App', startDate: '2025-11-01', endDate: '2026-04-30' },
] })

const loadTasks = createLoadTasks(createTaskTable())

//anything inside the control reads the project by the module's name
const ProjectSummary = () => {
    const project = useDatasetControlModule('project')
    return <Text>{project.getName()}: {project.getStartDate()?.format('D MMM YYYY')} to {project.getEndDate()?.format('D MMM YYYY')}</Text>
}

const GridExample = () => <TaskDatasetControl modules={[createMemoryProjectModule({ projects, projectId: 'website' })]} onLoad={loadTasks} height='400px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <ProjectSummary />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const CUSTOM_COLUMNS_CODE = `import { createMemoryCustomColumnsModule, createTaskEditingModule, DatasetControl, ICustomColumnRow, ICustomColumnValuesRow, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { DatasetConstants } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

//every custom column's full name ends with this suffix
const RISK = \`risk\${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}\`
const BUDGET = \`budget\${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}\`

//the columns the user starts with; the module adds the suffix to their names
const columns = new MemoryTable<ICustomColumnRow>({ idKey: 'name', rows: [
    { name: 'risk', displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] },
    { name: 'budget', displayName: 'Budget', dataType: 'Currency', precision: 0 },
] })

//each task's values by full column name; a choice holds its option's number, counted from 1
const values = new MemoryTable<ICustomColumnValuesRow>({ idKey: 'taskId', rows: [
    { taskId: '01000000-0000-0000-0000-000000000000', values: { [RISK]: 2, [BUDGET]: 120000 } },
    { taskId: '02000000-0000-0000-0000-000000000000', values: { [RISK]: 3, [BUDGET]: 250000 } },
] })

//a view shows a custom column by its full name
const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject', 'statuscode'), { name: RISK, dataType: 'OptionSet' }, { name: BUDGET, dataType: 'Currency' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[createMemoryCustomColumnsModule({ columns, values, enableCreation: true, enableDeletion: true })]} enableEditing onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            {/* holds Add custom column, and the delete command beside each custom column */}
            <DatasetControl.EditColumns />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* edits the values in place, each saved on its own */}
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const LOOKUP_MANY_CODE = `import { createMemoryLookupManyModule, createTaskEditingModule, DatasetControl, ILookupManyColumn, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

//each column picks records of one table and draws them its own way; try 'plain' for the tags
const COLUMNS: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Assigned to', entityName: 'mem_person', appearance: { type: 'people' } },
    tags: { displayName: 'Tags', entityName: 'mem_tag', appearance: { type: 'colorful' } },
    teams: { displayName: 'Teams', entityName: 'mem_team' },
}

//a view shows each column by its name
const VIEW_COLUMNS: IColumn[] = Object.keys(COLUMNS).map(name => ({ name, dataType: 'Lookup.Simple' }))

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), ...VIEW_COLUMNS] }) },
])

//LOOKUP_MANY_SOURCES holds the people, tags and teams by table; LOOKUP_MANY_VALUES each task's picks
const values = new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES })

const GridExample = () => <TaskDatasetControl modules={[createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: COLUMNS, values })]} enableEditing onLoad={loadTasks} height='440px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const TEMPLATES_CODE = `import { createMemoryTemplatesModule, createRowSelectionModule, DatasetControl, IMemoryTemplate, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

//the templates create their tasks in the table the task store reads
const tasks = createTaskTable()
const loadTasks = createLoadTasks(tasks)

//a template is its own task's values and its subtasks, each with values and subtasks of its own
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

//also keeps the templates the user saves with Save as template
const templates = new MemoryTable<IMemoryTemplate>({ idKey: 'id', rows: [ONBOARDING] })

const GridExample = () => <TaskDatasetControl modules={[createMemoryTemplatesModule({ tasks, templates })]} enableCreation onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* Save as template acts on the one selected task */}
        <TaskGrid modules={[createRowSelectionModule({ mode: 'single' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const CHECKLIST_CODE = `import { createMemoryTaskChecklistModule, DatasetControl, IMemoryTaskChecklistItem, MemoryTable, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const WEBSITE_REDESIGN = '01000000-0000-0000-0000-000000000000'
const API_PLATFORM = '02000000-0000-0000-0000-000000000000'

//each item names the task it belongs to
const items = new MemoryTable<IMemoryTaskChecklistItem>({ idKey: 'id', rows: [
    { id: 'brief', taskId: WEBSITE_REDESIGN, name: 'Write the brief', isCompleted: true },
    { id: 'kickoff', taskId: WEBSITE_REDESIGN, name: 'Hold the kick-off', isCompleted: true },
    { id: 'signoff', taskId: WEBSITE_REDESIGN, name: 'Get the sign-off', isCompleted: false },
    { id: 'contract', taskId: API_PLATFORM, name: 'Agree the API contract', isCompleted: false },
] })

//a view shows the column by its name
const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject', 'percentcomplete'), { name: TASK_CHECKLIST_COLUMN_NAME, dataType: 'Lookup.Simple' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[createMemoryTaskChecklistModule({ items })]} onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const DEPENDENCIES_CODE = `import { createMemoryDependenciesModule, createRowSelectionModule, DatasetControl, MemoryTable, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

//a view shows the counts by their column names
const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: PREDECESSORS_COLUMN_NAME, dataType: 'Lookup.Simple' }, { name: SUCCESSORS_COLUMN_NAME, dataType: 'Lookup.Simple' }] }) },
])

//DEPENDENCIES are the sample dependencies: { id, predecessorTaskId, successorTaskId, type }
//deleting a task deletes its dependencies from this table too
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

const GridExample = () => <TaskDatasetControl modules={[createMemoryDependenciesModule({ dependencies })]} enableDeletion onLoad={loadTasks} height='440px'>
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

const OWN_STORE_CODE = `import { createTaskChecklistModule, DatasetControl, ITaskChecklistItem, ITaskChecklistStore, ITaskRuntime, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

//made with the task runtime on every mount; works the items out from each task's columns
const createStore = (taskRuntime: ITaskRuntime): ITaskChecklistStore => ({
    loadItems: async taskIds => {
        const records = taskRuntime.getProvider().getRecordsMap()
        return new Map<string, ITaskChecklistItem[]>(taskIds.map(taskId => {
            const task = records[taskId].getRawData()
            return [taskId, [
                { id: \`\${taskId}-dates\`, name: 'Dates planned', isCompleted: !!task.scheduledstart && !!task.scheduledend },
                { id: \`\${taskId}-effort\`, name: 'Effort estimated', isCompleted: task.estimatedeffort > 0 },
                { id: \`\${taskId}-started\`, name: 'Work started', isCompleted: task.percentcomplete > 0 },
            ]]
        }))
    },
})

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject', 'estimatedeffort', 'percentcomplete'), { name: TASK_CHECKLIST_COLUMN_NAME, dataType: 'Lookup.Simple' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[createTaskChecklistModule({ createStore })]} onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const runner = (code: string) => () => <GridExampleRunner seedCode={withTasks(code)} tabs={TASK_EXAMPLE_TABS} />

export const FeaturesExample = runner(FEATURES_CODE)
export const ProjectExample = runner(PROJECT_CODE)
export const CustomColumnsExample = runner(CUSTOM_COLUMNS_CODE)
export const LookupManyExample = runner(LOOKUP_MANY_CODE)
export const TemplatesExample = runner(TEMPLATES_CODE)
export const ChecklistExample = runner(CHECKLIST_CODE)
export const DependenciesExample = runner(DEPENDENCIES_CODE)
export const OwnStoreExample = runner(OWN_STORE_CODE)
