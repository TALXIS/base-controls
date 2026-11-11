import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

const ModulesExampleRunner = (props: { code: string, extraFiles?: IGridExampleFile[] }) => <GridExampleRunner seedCode={[...withTasks(props.code), ...props.extraFiles ?? []]} tabs={TASK_EXAMPLE_TABS} />

const MODULES_CODE = `import { createMemoryDependenciesModule, createMemoryLookupManyModule, createMemoryTaskChecklistModule, createSortingModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, MemoryTable, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

//the memory modules keep their data in tables of yours; LOOKUP_MANY_*, CHECKLIST_ITEMS and DEPENDENCIES are sample data
const assignments = new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES })
const checklistItems = new MemoryTable({ idKey: 'id', rows: CHECKLIST_ITEMS })
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

//task modules, read on every mount of the control
const TASK_MODULES = [
    createTaskDraggingModule(),
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
        {/* grid modules, read once at mount */}
        <TaskGrid modules={[createTaskEditingModule(), createSortingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const MODULES_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseLookupManyModule, createDataverseProjectModule, createTalxisCustomColumnsModule, createTalxisDependenciesModule, createTalxisTaskChecklistModule, createTaskDraggingModule } from '@talxis/base-controls'

//the task modules of a model-driven app on TALXIS; GridExample.tsx does not import this file
export const createTaskModules = (taskEntityName: string, projectId: string) => [
    createDataverseProjectModule({ entityName: 'new_project', id: projectId, startDateColumn: 'new_start', endDateColumn: 'new_end' }),
    createTaskDraggingModule(),
    createDataverseLookupManyModule({
        columns: {
            assignedto: {
                displayName: 'Assigned to',
                entityName: 'systemuser',
                navigationPropertyName: 'new_task_systemuser',
                appearance: { type: 'people', imageUrlPropertyName: 'entityimage_url' },
                select: 'fullname,entityimage_url',
                fetchXml: '<fetch><entity name="systemuser"><attribute name="fullname" /><attribute name="entityimage_url" /></entity></fetch>',
            },
        },
    }),
    createTalxisTaskChecklistModule(),
    createTalxisDependenciesModule(),
    createTalxisCustomColumnsModule({ entityName: taskEntityName, recordId: projectId, enableCreation: true }),
]
`,
}

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

const GridExample = () => <TaskDatasetControl modules={[createMemoryProjectModule({ projects, projectId: 'website' })]} onLoad={loadTasks} height='440px'>
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

const PROJECT_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseProjectModule, DataverseTaskStore, ITaskGridLoadResult, ITaskRuntime } from '@talxis/base-controls'

//in a model-driven app, use these in place of the memory ones in GridExample.tsx
export const createProject = (projectId: string) => createDataverseProjectModule({
    entityName: 'new_project',
    id: projectId,
    startDateColumn: 'new_start',
    endDateColumn: 'new_end',
})

//new tasks get the project in new_projectid, the lookup this FetchXML filters on
export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({
        taskRuntime,
        fetchXml: \`<fetch><entity name="new_projecttask"><filter><condition attribute="new_projectid" operator="eq" value="{{ project.id }}" /></filter></entity></fetch>\`,
    }),
    fieldMapping: { parentId: 'new_parenttaskid', subject: 'new_name', stackRank: 'new_stackrank', startDate: 'new_start', endDate: 'new_end' },
})
`,
}

const PROJECT_STORE_CODE = `import { createProjectModule, DatasetControl, ITaskRuntime, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()

//each top-level sample task stands for a project
const PROJECT_ID = '02000000-0000-0000-0000-000000000000'

//a store of your own, here reading the project from the task of the same id
const projectModule = createProjectModule({
    createStore: () => ({
        loadProject: async () => ({ id: PROJECT_ID, name: tasks.getRow(PROJECT_ID)?.subject }),
    }),
})

//the project loads before the tasks, so onLoad shows only its tasks
const loadTasks = async (taskRuntime: ITaskRuntime) => {
    const project = taskRuntime.services.get('datasetControl').modules.get('project')
    return { ...await createLoadTasks(tasks)(taskRuntime), rootTaskId: project.getId() }
}

const GridExample = () => <TaskDatasetControl modules={[projectModule]} onLoad={loadTasks} height='400px'>
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

const GridExample = () => <TaskDatasetControl modules={[createMemoryCustomColumnsModule({ columns, values, enableCreation: true, enableDeletion: true })]} enableEditing onLoad={loadTasks} height='480px'>
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

const CUSTOM_COLUMNS_TALXIS_FILE: IGridExampleFile = {
    name: 'talxis.ts',
    code: `import { createTalxisCustomColumnsModule } from '@talxis/base-controls'

//with TALXIS, use this in place of the memory module in GridExample.tsx
export const createProjectColumns = (projectId: string) => createTalxisCustomColumnsModule({
    //the table the columns are defined for, and the record whose own columns load beside them
    entityName: 'task',
    recordId: projectId,
    enableCreation: true,
    enableEditing: true,
    enableDeletion: true,
})
`,
}

const CUSTOM_COLUMNS_STORE_CODE = `import { createCustomColumnsModule, createTaskEditingModule, DatasetControl, ICustomColumnsStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { DatasetConstants, IColumn, IRawRecord } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

const STORY_POINTS = \`storypoints\${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}\`

//your backend: the column, and each task's values by column name
const STORY_POINTS_COLUMN: IColumn = { name: STORY_POINTS, displayName: 'Story points', dataType: 'Whole.None', isVirtual: true, visualSizeFactor: 120 }
const savedValues = new Map<string, IRawRecord>([['01000000-0000-0000-0000-000000000000', { [STORY_POINTS]: 40 }]])

//the module makes the store on every mount
const createStore = (): ICustomColumnsStore => ({
    //before the tasks load
    loadColumns: async () => [STORY_POINTS_COLUMN],
    //a task left out has no values
    loadValues: async taskIds => new Map<string, IRawRecord>(taskIds.filter(taskId => savedValues.has(taskId)).map(taskId => [taskId, savedValues.get(taskId)!])),
    //once for every edited cell
    saveValue: async (record, column, value) => {
        savedValues.set(record.getRecordId(), { ...savedValues.get(record.getRecordId()), [column.name]: value })
        return { recordId: record.getRecordId(), success: true, fields: [column.name] }
    },
    //called only through enableCreation, enableEditing and enableDeletion
    createColumn: async () => { throw new Error('Not implemented.') },
    updateColumn: async () => { throw new Error('Not implemented.') },
    deleteColumn: async () => { throw new Error('Not implemented.') },
})

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: STORY_POINTS, dataType: 'Whole.None' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[createCustomColumnsModule({ createStore })]} enableEditing onLoad={loadTasks} height='440px'>
    <DatasetControl.Body>
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

const GridExample = () => <TaskDatasetControl modules={[createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: COLUMNS, values })]} enableEditing onLoad={loadTasks} height='480px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const LOOKUP_MANY_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseLookupManyModule } from '@talxis/base-controls'

//in a model-driven app, use this in place of the memory module in GridExample.tsx
export const createTaskLookupMany = (projectId: string) => createDataverseLookupManyModule({
    //the record the grid sits on, as hostRecord in each FetchXML
    hostRecord: { entityName: 'new_project', id: projectId },
    columns: {
        //through an N:N relationship between the tasks and the users
        assignedto: {
            displayName: 'Assigned to',
            entityName: 'systemuser',
            navigationPropertyName: 'new_task_systemuser',
            appearance: { type: 'people', imageUrlPropertyName: 'entityimage_url' },
            //read with each person, for the avatar
            select: 'fullname,entityimage_url',
            //the people offered: the members of the project
            fetchXml: \`<fetch>
                <entity name="systemuser">
                    <attribute name="fullname" />
                    <attribute name="entityimage_url" />
                    <link-entity name="new_projectmember" from="new_userid" to="systemuserid">
                        <filter><condition attribute="new_projectid" operator="eq" value="{{ hostRecord.id }}" /></filter>
                    </link-entity>
                </entity>
            </fetch>\`,
        },
        //through a link table of your own, new_tasktag, with a lookup to the task and one to the tag
        tags: {
            displayName: 'Tags',
            entityName: 'new_tag',
            navigationPropertyName: 'new_task_tasktags',
            customIntersection: { navigationPropertyName: 'new_tagid' },
            appearance: { type: 'colorful', colorPropertyName: 'new_color' },
            select: 'new_name,new_color',
            fetchXml: '<fetch><entity name="new_tag"><attribute name="new_name" /><attribute name="new_color" /></entity></fetch>',
        },
    },
})
`,
}

const LOOKUP_MANY_FILTER_CODE = `import { createFilteringModule, createMemoryLookupManyModule, DatasetControl, ITaskGridView, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

//the id of the sample tag security
const SECURITY = '00020072-0000-0000-0000-000000000000'

const VIEWS: ITaskGridView[] = [{
    id: 'security',
    name: 'Security work',
    resolve: provider => {
        //a condition on a lookup-many column compares the ids of the records it holds
        provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'tags', conditionOperator: Operators.ContainValues.Value, value: [SECURITY] }] })
        //quick find searches the names in the lookup-many columns it is given
        provider.setQuickFindColumns(['subject', 'assignedto'])
        return { columns: [...getTaskColumns('subject'), ...LOOKUP_MANY_VIEW_COLUMNS] }
    },
}]

const loadTasks = createLoadTasks(createTaskTable(), VIEWS)
const values = new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES })

const GridExample = () => <TaskDatasetControl modules={[createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values })]} onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* Filter in a lookup-many column's menu opens the module's own filter */}
        <TaskGrid modules={[createFilteringModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const LOOKUP_MANY_STORE_CODE = `import { createLookupManyModule, createTaskEditingModule, DatasetControl, ILookupManyColumn, ILookupManyStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { MemoryDataProvider } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

//a column can carry settings of your own for your store to read
interface IStaffColumn extends ILookupManyColumn {
    department: string
}

const COLUMNS: { [columnName: string]: IStaffColumn } = {
    reviewers: { displayName: 'Reviewers', entityName: 'staff', department: 'Quality' },
    approvers: { displayName: 'Approvers', entityName: 'staff', department: 'Management' },
}

//your backend: the staff, and each task's picks by column name
const STAFF = [
    { staffid: 'chris', name: 'Chris Kim', department: 'Quality' },
    { staffid: 'riley', name: 'Riley Thompson', department: 'Quality' },
    { staffid: 'maya', name: 'Maya Patel', department: 'Management' },
    { staffid: 'jordan', name: 'Jordan Lee', department: 'Management' },
]
const picks = new Map<string, { [columnName: string]: ComponentFramework.EntityReference[] }>()

const store: ILookupManyStore<IStaffColumn> = {
    //a task left out holds no records
    loadValues: async taskIds => new Map(taskIds.filter(taskId => picks.has(taskId)).map(taskId => [taskId, picks.get(taskId)!])),
    saveValue: async (taskId, columnName, value) => {
        picks.set(taskId, { ...picks.get(taskId), [columnName]: value })
    },
    //the editor and the filter search this provider; the column's settings narrow the staff
    createOptionsProvider: ({ settings }) => new MemoryDataProvider({
        dataSource: STAFF.filter(person => person.department === settings.department),
        metadata: { PrimaryIdAttribute: 'staffid', PrimaryNameAttribute: 'name', LogicalName: 'staff', QuickFindColumns: ['name'] },
        columns: [{ name: 'name', displayName: 'Name', dataType: 'SingleLine.Text', isPrimary: true }],
    }),
}

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: 'reviewers', dataType: 'Lookup.Simple' }, { name: 'approvers', dataType: 'Lookup.Simple' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[createLookupManyModule({ columns: COLUMNS, createStore: () => store })]} enableEditing onLoad={loadTasks} height='440px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const LOOKUP_MANY_READ_CODE = `import { createMemoryLookupManyModule, createTaskEditingModule, DatasetControl, MemoryTable, TaskDatasetControl, TaskGrid, useDatasetControlModule, useTaskRuntime } from '@talxis/base-controls'
import { DefaultButton, Text } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const values = new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES })

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: 'assignedto', dataType: 'Lookup.Simple' }] }) },
])

//counts each person's tasks with getValue, which reads a column the view shows
const Workload = () => {
    const lookupMany = useDatasetControlModule('lookupMany')
    const taskRuntime = useTaskRuntime()
    const [workload, setWorkload] = React.useState('')

    const count = () => {
        const counts = new Map<string, number>()
        for (const taskId of Object.keys(taskRuntime.getProvider().getRecordsMap())) {
            for (const person of lookupMany.getValue(taskId, 'assignedto')) {
                counts.set(person.name, (counts.get(person.name) ?? 0) + 1)
            }
        }
        setWorkload([...counts].map(([name, taskCount]) => \`\${name}: \${taskCount}\`).join(', '))
    }

    return <>
        <DefaultButton text='Count assignments' onClick={count} />
        <Text>{workload}</Text>
    </>
}

const GridExample = () => <TaskDatasetControl modules={[createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: { assignedto: LOOKUP_MANY_COLUMNS.assignedto }, values })]} enableEditing onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <Workload />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const LOOKUP_MANY_LOOK_CODE = `import { createMemoryLookupManyModule, createTaskEditingModule, DatasetControl, ILookupManyUiPillProps, LookupManyUiPillsComponents, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

//a colour for each team, picked in code
const TEAM_COLOURS: { [teamName: string]: string } = {
    Design: '#8764b8', Frontend: '#0078d4', Backend: '#107c10', Platform: '#ff8c00',
    Quality: '#a4262c', Content: '#ca5010', Security: '#d13438', Data: '#038387',
}

//the default pill, tinted with its team's colour
const onRenderPill = (props: ILookupManyUiPillProps) => LookupManyUiPillsComponents.onRenderPill({ ...props, color: TEAM_COLOURS[props.reference.name] })

const values = new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES })

const teamsModule = createMemoryLookupManyModule({
    sources: LOOKUP_MANY_SOURCES,
    columns: { teams: LOOKUP_MANY_COLUMNS.teams },
    values,
    //the pills in the cells, and the picked ones in the editor
    components: { cell: { onRenderPill }, editor: { onRenderPill } },
})

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: 'teams', dataType: 'Lookup.Simple' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[teamsModule]} enableEditing onLoad={loadTasks} height='440px'>
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

const GridExample = () => <TaskDatasetControl modules={[createMemoryTemplatesModule({ tasks, templates })]} enableCreation onLoad={loadTasks} height='480px'>
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

const TEMPLATES_STORE_CODE = `import { createTemplatesModule, DatasetControl, ITemplatesStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { MemoryDataProvider } from '@talxis/client-libraries'
import { createLoadTasks, createTaskTable } from './tasks'

//the store creates tasks in the table the task store reads
const tasks = createTaskTable()
const loadTasks = createLoadTasks(tasks)

//your backend: release checklists, each a list of steps
const RELEASES = [
    { id: 'minor', name: 'Minor release', steps: ['Freeze the code', 'Run the regression tests', 'Deploy'] },
    { id: 'major', name: 'Major release', steps: ['Freeze the code', 'Run the regression tests', 'Write the release notes', 'Brief the support team', 'Deploy'] },
]

const releaseStore: ITemplatesStore = {
    //the picker lists and searches the records of this provider
    createTemplatesProvider: () => new MemoryDataProvider({
        dataSource: RELEASES.map(({ id, name }) => ({ id, name })),
        metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name', LogicalName: 'release', QuickFindColumns: ['name'] },
        columns: [{ name: 'name', displayName: 'Name', dataType: 'SingleLine.Text', isPrimary: true }],
    }),
    //the release's own task goes where the user asked, at stackRank, and its steps under it
    createTasks: async ({ templateId, parentRecord, stackRank }) => {
        const release = RELEASES.find(candidate => candidate.id === templateId)!
        const releaseTask = { mem_taskid: crypto.randomUUID(), subject: release.name, parentid: parentRecord ? [parentRecord.getNamedReference()] : null, stackrank: stackRank, statecode: 0 }
        const releaseReference = [{ id: { guid: releaseTask.mem_taskid }, name: release.name, etn: 'mem_task' }]
        const steps = release.steps.map((subject, index) => ({ mem_taskid: crypto.randomUUID(), subject, parentid: releaseReference, stackrank: \`0|\${index + 1}00000:\`, statecode: 0 }))
        tasks.insert([releaseTask, ...steps])
        //every task created, the steps included
        return { records: [releaseTask, ...steps] }
    },
}

const GridExample = () => <TaskDatasetControl modules={[createTemplatesModule({ createStore: () => releaseStore })]} enableCreation onLoad={loadTasks} height='480px'>
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

const TEMPLATES_CALL_CODE = `import { createMemoryTemplatesModule, DatasetControl, IMemoryTemplate, MemoryTable, TaskDatasetControl, TaskGrid, useDatasetControlModule } from '@talxis/base-controls'
import { PrimaryButton } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
const loadTasks = createLoadTasks(tasks)

const SPRINT: IMemoryTemplate = {
    id: 'sprint',
    name: 'Sprint',
    children: [
        { data: { subject: 'Plan the sprint' } },
        { data: { subject: 'Build the stories' } },
        { data: { subject: 'Review the sprint' } },
    ],
}
const sprintTemplates = new MemoryTable<IMemoryTemplate>({ idKey: 'id', rows: [SPRINT] })

//creates the template's tasks at the top level, or under the task whose id you pass second
const PlanSprint = () => {
    const templates = useDatasetControlModule('templates')
    return <PrimaryButton text='Plan a sprint' onClick={() => templates.createTasksFromTemplate('sprint')} />
}

//defaultCreatePosition puts the new tasks last, so the grid scrolls down to them
const GridExample = () => <TaskDatasetControl modules={[createMemoryTemplatesModule({ tasks, templates: sprintTemplates })]} enableCreation defaultCreatePosition='last' onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <PlanSprint />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const TEMPLATES_LOOK_CODE = `import { createMemoryTemplatesModule, DatasetControl, IMemoryTemplate, MemoryTable, TaskDatasetControl, TaskGrid, TemplatesUiRecordListComponents } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
const loadTasks = createLoadTasks(tasks)

//TEMPLATES are the sample templates of these docs
const templates = new MemoryTable<IMemoryTemplate>({ idKey: 'id', rows: TEMPLATES })

const templatesModule = createMemoryTemplatesModule({
    tasks,
    templates,
    //the default button of each template in the picker, with an icon of your own
    components: { list: { onRenderRecord: props => TemplatesUiRecordListComponents.onRenderRecord({ ...props, iconProps: { iconName: 'Rocket' } }) } },
})

const GridExample = () => <TaskDatasetControl modules={[templatesModule]} enableCreation onLoad={loadTasks} height='440px'>
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

const GridExample = () => <TaskDatasetControl modules={[createMemoryTaskChecklistModule({ items })]} onLoad={loadTasks} height='440px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const CHECKLIST_RELOAD_CODE = `import { createMemoryTaskChecklistModule, DatasetControl, IMemoryTaskChecklistItem, MemoryTable, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid, useDatasetControlModule } from '@talxis/base-controls'
import { DefaultButton } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const WEBSITE_REDESIGN = '01000000-0000-0000-0000-000000000000'

const items = new MemoryTable<IMemoryTaskChecklistItem>({ idKey: 'id', rows: [
    { id: 'brief', taskId: WEBSITE_REDESIGN, name: 'Write the brief', isCompleted: true },
    { id: 'kickoff', taskId: WEBSITE_REDESIGN, name: 'Hold the kick-off', isCompleted: false },
    { id: 'signoff', taskId: WEBSITE_REDESIGN, name: 'Get the sign-off', isCompleted: false },
] })

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: TASK_CHECKLIST_COLUMN_NAME, dataType: 'Lookup.Simple' }] }) },
])

//ticks an item in the table, as a form of yours would, then reads that task's items again
const TickNextItem = () => {
    const checklist = useDatasetControlModule('taskChecklist')
    const tick = async () => {
        const [next] = items.getRows(item => item.taskId === WEBSITE_REDESIGN && !item.isCompleted)
        if (next) {
            items.update(next.id, { isCompleted: true })
            await checklist.reload([WEBSITE_REDESIGN])
        }
    }
    return <DefaultButton text='Tick the next item' onClick={tick} />
}

const GridExample = () => <TaskDatasetControl modules={[createMemoryTaskChecklistModule({ items })]} onLoad={loadTasks} height='400px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TickNextItem />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const CHECKLIST_STORE_CODE = `import { createTaskChecklistModule, DatasetControl, ITaskChecklistItem, ITaskChecklistStore, ITaskRuntime, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

//a store of your own, made with the task runtime on every mount; it works the items out from each task's columns
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

const GridExample = () => <TaskDatasetControl modules={[createTaskChecklistModule({ createStore })]} onLoad={loadTasks} height='440px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const CHECKLIST_LOOK_CODE = `import { createMemoryTaskChecklistModule, DatasetControl, MemoryTable, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { Text } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

//CHECKLIST_ITEMS are the sample checklist items of these docs
const items = new MemoryTable({ idKey: 'id', rows: CHECKLIST_ITEMS })

const checklistModule = createMemoryTaskChecklistModule({
    items,
    //no icon, and the count followed by a word
    components: { progress: { onRenderIcon: () => null, onRenderText: props => <Text {...props} variant='small'>{props.children} done</Text> } },
})

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: TASK_CHECKLIST_COLUMN_NAME, dataType: 'Lookup.Simple' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[checklistModule]} onLoad={loadTasks} height='440px'>
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

//DEPENDENCIES are the sample dependencies of these docs: { id, predecessorTaskId, successorTaskId, type }
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

const GridExample = () => <TaskDatasetControl modules={[createMemoryDependenciesModule({ dependencies })]} enableDeletion onLoad={loadTasks} height='480px'>
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

const DEPENDENCIES_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseDependenciesModule, createTalxisDependenciesModule } from '@talxis/base-controls'

//in a model-driven app, use one of these in place of the memory module in GridExample.tsx
//a table of your own: two lookups to the task table and an option set of the type
export const dependenciesModule = createDataverseDependenciesModule({
    entityName: 'new_taskdependency',
    predecessorAttribute: 'new_predecessorid',
    successorAttribute: 'new_successorid',
    typeAttribute: 'new_type',
    //every value of the option set, and the type it stands for
    dependencyTypeCodes: { 1: 'finishToStart', 2: 'startToStart', 3: 'finishToFinish', 4: 'startToFinish' },
})

//TALXIS's own talxis_taskdependency table, mapped for you
export const talxisDependenciesModule = createTalxisDependenciesModule()
`,
}

const DEPENDENCIES_LINK_CODE = `import { createMemoryDependenciesModule, createRowSelectionModule, DatasetControl, MemoryTable, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TaskDatasetControl, TaskGrid, useDatasetControlModule, useTaskRuntime } from '@talxis/base-controls'
import { DefaultButton, Text } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const savedDependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: PREDECESSORS_COLUMN_NAME, dataType: 'Lookup.Simple' }, { name: SUCCESSORS_COLUMN_NAME, dataType: 'Lookup.Simple' }] }) },
])

const LinkSelectedTasks = () => {
    const dependencies = useDatasetControlModule('dependencies')
    const provider = useTaskRuntime().getProvider()
    const [message, setMessage] = React.useState('')
    const getSubject = (taskId: string) => provider.getRecordsMap()[taskId].getValue('subject')

    const link = async () => {
        const selectedTaskIds = provider.getSelectedRecordIds()
        if (selectedTaskIds.length !== 2) {
            setMessage('Select two tasks.')
            return
        }
        const [predecessorTaskId, successorTaskId] = selectedTaskIds
        //'self', 'duplicate' or 'cycle' when the dependency is refused
        const refusal = dependencies.getCreateDependencyRefusal(predecessorTaskId, successorTaskId)
        if (refusal) {
            setMessage(\`Refused: \${refusal}\`)
            return
        }
        await dependencies.createDependency({ predecessorTaskId, successorTaskId, type: 'finishToStart' })
        setMessage(\`\${getSubject(successorTaskId)} now waits on \${getSubject(predecessorTaskId)}\`)
    }

    return <>
        <DefaultButton text='Link the selected tasks' onClick={link} />
        <Text>{message}</Text>
    </>
}

//dependencies change only while enableEditing is on
const GridExample = () => <TaskDatasetControl modules={[createMemoryDependenciesModule({ dependencies: savedDependencies })]} enableEditing onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <LinkSelectedTasks />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const DEPENDENCIES_STORE_CODE = `import { createDependenciesModule, DatasetControl, IDependenciesStore, ITaskDependency, ITaskRuntime, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

//a store of your own: a task waits on each sibling that ends before it starts
const createStore = (taskRuntime: ITaskRuntime): IDependenciesStore => ({
    //the dependencies with any of these tasks at either end
    loadDependencies: async taskIds => {
        const askedTaskIds = new Set(taskIds)
        const tasks = Object.values(taskRuntime.getProvider().getRecordsMap()).map(record => record.getRawData())
        const dependencies: ITaskDependency[] = []
        for (const successor of tasks) {
            for (const predecessor of tasks) {
                const isAsked = askedTaskIds.has(predecessor.mem_taskid) || askedTaskIds.has(successor.mem_taskid)
                const isSibling = predecessor.parentid?.[0]?.id.guid === successor.parentid?.[0]?.id.guid
                if (isAsked && isSibling && predecessor.scheduledend < successor.scheduledstart) {
                    dependencies.push({ id: \`\${predecessor.mem_taskid}-\${successor.mem_taskid}\`, predecessorTaskId: predecessor.mem_taskid, successorTaskId: successor.mem_taskid, type: 'finishToStart' })
                }
            }
        }
        return dependencies
    },
    //never called while enableEditing is off
    createDependency: async () => { throw new Error('Not implemented.') },
    updateDependency: async () => { throw new Error('Not implemented.') },
    deleteDependency: async () => { throw new Error('Not implemented.') },
})

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject', 'scheduledstart', 'scheduledend'), { name: PREDECESSORS_COLUMN_NAME, dataType: 'Lookup.Simple' }, { name: SUCCESSORS_COLUMN_NAME, dataType: 'Lookup.Simple' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[createDependenciesModule({ createStore })]} onLoad={loadTasks} height='440px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const DEPENDENCIES_LOOK_CODE = `import { createMemoryDependenciesModule, DatasetControl, MemoryTable, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { Text } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })

const dependenciesModule = createMemoryDependenciesModule({
    dependencies,
    //a count above one in bold
    components: { count: { onRenderCount: props => <Text {...props} styles={{ root: { fontWeight: Number(props.children) > 1 ? 600 : 400 } }} /> } },
})

const loadTasks = createLoadTasks(createTaskTable(), [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: [...getTaskColumns('subject'), { name: PREDECESSORS_COLUMN_NAME, dataType: 'Lookup.Simple' }, { name: SUCCESSORS_COLUMN_NAME, dataType: 'Lookup.Simple' }] }) },
])

const GridExample = () => <TaskDatasetControl modules={[dependenciesModule]} onLoad={loadTasks} height='440px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const ModulesExample = () => <ModulesExampleRunner code={MODULES_CODE} extraFiles={[MODULES_DATAVERSE_FILE]} />

export const ProjectExample = () => <ModulesExampleRunner code={PROJECT_CODE} extraFiles={[PROJECT_DATAVERSE_FILE]} />
export const ProjectStoreExample = () => <ModulesExampleRunner code={PROJECT_STORE_CODE} />

export const CustomColumnsExample = () => <ModulesExampleRunner code={CUSTOM_COLUMNS_CODE} extraFiles={[CUSTOM_COLUMNS_TALXIS_FILE]} />
export const CustomColumnsStoreExample = () => <ModulesExampleRunner code={CUSTOM_COLUMNS_STORE_CODE} />

export const LookupManyExample = () => <ModulesExampleRunner code={LOOKUP_MANY_CODE} extraFiles={[LOOKUP_MANY_DATAVERSE_FILE]} />
export const LookupManyFilterExample = () => <ModulesExampleRunner code={LOOKUP_MANY_FILTER_CODE} />
export const LookupManyStoreExample = () => <ModulesExampleRunner code={LOOKUP_MANY_STORE_CODE} />
export const LookupManyReadExample = () => <ModulesExampleRunner code={LOOKUP_MANY_READ_CODE} />
export const LookupManyLookExample = () => <ModulesExampleRunner code={LOOKUP_MANY_LOOK_CODE} />

export const TemplatesExample = () => <ModulesExampleRunner code={TEMPLATES_CODE} />
export const TemplatesStoreExample = () => <ModulesExampleRunner code={TEMPLATES_STORE_CODE} />
export const TemplatesCallExample = () => <ModulesExampleRunner code={TEMPLATES_CALL_CODE} />
export const TemplatesLookExample = () => <ModulesExampleRunner code={TEMPLATES_LOOK_CODE} />

export const ChecklistExample = () => <ModulesExampleRunner code={CHECKLIST_CODE} />
export const ChecklistReloadExample = () => <ModulesExampleRunner code={CHECKLIST_RELOAD_CODE} />
export const ChecklistStoreExample = () => <ModulesExampleRunner code={CHECKLIST_STORE_CODE} />
export const ChecklistLookExample = () => <ModulesExampleRunner code={CHECKLIST_LOOK_CODE} />

export const DependenciesExample = () => <ModulesExampleRunner code={DEPENDENCIES_CODE} extraFiles={[DEPENDENCIES_DATAVERSE_FILE]} />
export const DependenciesLinkExample = () => <ModulesExampleRunner code={DEPENDENCIES_LINK_CODE} />
export const DependenciesStoreExample = () => <ModulesExampleRunner code={DEPENDENCIES_STORE_CODE} />
export const DependenciesLookExample = () => <ModulesExampleRunner code={DEPENDENCIES_LOOK_CODE} />
