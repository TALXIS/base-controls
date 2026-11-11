import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { OFFICE_FILE, TASK_EXAMPLE_TABS, withOffice } from './shared'

const STEP_TASKS_CODE = `import { DatasetControl, IFieldMapping, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA } from './office'

//1. your rows, in a table that outlives every mount, so what the user changes is kept
const tasks = createOfficeTable()

//2. which of your columns make the tree, and which the task grid draws its own way
const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'start',
    endDate: 'due',
    percentComplete: 'done',
}

//3. called on every mount: a new store over your rows, and the mapping
const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
})

//4. the control that loads the tasks, and the grid that draws them
const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const STEP_VIEWS_CODE = `import { createFilteringModule, createSortingModule, DatasetControl, IFieldMapping, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA } from './office'

const tasks = createOfficeTable()

const fieldMapping: IFieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: each view lists the columns it shows and sets the provider up as it opens
const COLUMNS = [{ name: 'subject' }, { name: 'owner' }, { name: 'start' }, { name: 'due' }, { name: 'done' }]
const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Plan', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'nextUp',
        name: 'Next up',
        resolve: provider => {
            provider.setSorting([{ name: 'start', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
    //the tasks without the tree, until the user turns Show hierarchy back on
    { id: 'everyTask', name: 'Every task on its own', resolve: () => ({ columns: COLUMNS, data: { isFlatList: true } }) },
]

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views: VIEWS,
})

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='440px'>
    {/* new: the parts that switch, search and show the tree */}
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
        {/* new: sorting and filtering from the column headers */}
        <TaskGrid modules={[createSortingModule(), createFilteringModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const STEP_PLAN_CODE = `import { createFilteringModule, createRowSelectionModule, createSortingModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, IFieldMapping, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA } from './office'

const tasks = createOfficeTable()

const fieldMapping: IFieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode', startDate: 'start', endDate: 'due', percentComplete: 'done' }

const COLUMNS = [{ name: 'subject' }, { name: 'owner' }, { name: 'start' }, { name: 'due' }, { name: 'done' }]
const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Plan', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'nextUp',
        name: 'Next up',
        resolve: provider => {
            provider.setSorting([{ name: 'start', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
]

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views: VIEWS,
})

//new: a module of the control, moving tasks by dragging their rows
const controlModules = [createTaskDraggingModule()]

//new: selection for Edit and Delete, and editing in the cells
const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule(), createFilteringModule()]

//new: what the user may do
const GridExample = () => <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* new: New, Edit and Delete */}
            <TaskDatasetControl.Ribbon />
            <DatasetControl.QuickFind />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={gridModules} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const STEP_MODULES_CODE = `import { createFilteringModule, createMemoryDependenciesModule, createMemoryTaskChecklistModule, createRowSelectionModule, createSortingModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, IFieldMapping, ITaskDependency, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA } from './office'

const tasks = createOfficeTable()

//new: what the modules keep, each in a table of its own
const dependencies = new MemoryTable<ITaskDependency>({ idKey: 'id', rows: [
    { id: 'lease-fitout', predecessorTaskId: 'lease', successorTaskId: 'fitout', type: 'finishToStart' },
    { id: 'fitout-movers', predecessorTaskId: 'fitout', successorTaskId: 'movers', type: 'finishToStart' },
    { id: 'movers-movein', predecessorTaskId: 'movers', successorTaskId: 'movein', type: 'finishToStart' },
    { id: 'movein-party', predecessorTaskId: 'movein', successorTaskId: 'party', type: 'finishToStart' },
] })
const checklistItems = new MemoryTable({ idKey: 'id', rows: [
    { id: 'desks-1', taskId: 'desks', name: 'Measure the rooms', isCompleted: true },
    { id: 'desks-2', taskId: 'desks', name: 'Pick the chairs', isCompleted: true },
    { id: 'desks-3', taskId: 'desks', name: 'Place the order', isCompleted: false },
    { id: 'invites-1', taskId: 'invites', name: 'Write the guest list', isCompleted: false },
] })

const fieldMapping: IFieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: the columns the modules add, listed by name
const COLUMNS = [{ name: 'subject' }, { name: 'owner' }, { name: 'start' }, { name: 'due' }, { name: 'done' }, { name: TASK_CHECKLIST_COLUMN_NAME }, { name: PREDECESSORS_COLUMN_NAME }, { name: SUCCESSORS_COLUMN_NAME }]
const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Plan', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'nextUp',
        name: 'Next up',
        resolve: provider => {
            provider.setSorting([{ name: 'start', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
]

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views: VIEWS,
})

//new: the modules work with the tasks, so they go on the control
const controlModules = [
    createTaskDraggingModule(),
    createMemoryDependenciesModule({ dependencies }),
    createMemoryTaskChecklistModule({ items: checklistItems }),
]

const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule(), createFilteringModule()]

const GridExample = () => <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
            <DatasetControl.QuickFind />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={gridModules} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const STEP_GANTT_CODE = `import { createFilteringModule, createMemoryDependenciesModule, createMemoryProjectModule, createMemoryTaskChecklistModule, createRowSelectionModule, createSortingModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, IFieldMapping, IMemoryProject, ITaskDependency, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createLinksModule, createMarkersModule, TaskGantt } from '@talxis/base-controls/gantt'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA } from './office'

const tasks = createOfficeTable()

const dependencies = new MemoryTable<ITaskDependency>({ idKey: 'id', rows: [
    { id: 'lease-fitout', predecessorTaskId: 'lease', successorTaskId: 'fitout', type: 'finishToStart' },
    { id: 'fitout-movers', predecessorTaskId: 'fitout', successorTaskId: 'movers', type: 'finishToStart' },
    { id: 'movers-movein', predecessorTaskId: 'movers', successorTaskId: 'movein', type: 'finishToStart' },
    { id: 'movein-party', predecessorTaskId: 'movein', successorTaskId: 'party', type: 'finishToStart' },
] })
const checklistItems = new MemoryTable({ idKey: 'id', rows: [
    { id: 'desks-1', taskId: 'desks', name: 'Measure the rooms', isCompleted: true },
    { id: 'desks-2', taskId: 'desks', name: 'Pick the chairs', isCompleted: true },
    { id: 'desks-3', taskId: 'desks', name: 'Place the order', isCompleted: false },
    { id: 'invites-1', taskId: 'invites', name: 'Write the guest list', isCompleted: false },
] })
//new: the project the plan belongs to; the Gantt marks its start and end
const projects = new MemoryTable<IMemoryProject>({ idKey: 'id', rows: [{ id: 'office', name: 'New office', startDate: '2026-01-05', endDate: '2026-04-10' }] })

//the Gantt draws startDate and endDate
const fieldMapping: IFieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode', startDate: 'start', endDate: 'due', percentComplete: 'done' }

const COLUMNS = [{ name: 'subject' }, { name: 'owner' }, { name: 'start' }, { name: 'due' }, { name: 'done' }, { name: TASK_CHECKLIST_COLUMN_NAME }, { name: PREDECESSORS_COLUMN_NAME }, { name: SUCCESSORS_COLUMN_NAME }]
const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Plan', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'nextUp',
        name: 'Next up',
        resolve: provider => {
            provider.setSorting([{ name: 'start', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
]

const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views: VIEWS,
})

const controlModules = [
    createMemoryProjectModule({ projects, projectId: 'office' }),
    createTaskDraggingModule(),
    createMemoryDependenciesModule({ dependencies }),
    createMemoryTaskChecklistModule({ items: checklistItems }),
]

const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule(), createFilteringModule()]

//new: the Gantt's own modules; links draw the dependencies, markers today and the project's dates
const ganttModules = [createLibraryModule(), createBarDraggingModule(), createLinksModule(), createMarkersModule()]

const GridExample = () => <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
            <DatasetControl.QuickFind />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: the grid and the Gantt side by side, row for row */}
        <TaskGantt.Split>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const STEP_BACKEND_CODE = `import { createFilteringModule, createRowSelectionModule, createSortingModule, createTaskEditingModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createLinksModule, createMarkersModule, TaskGantt } from '@talxis/base-controls/gantt'
//new: the backend in a file of its own; dataverse.ts and talxis.ts export the same two
import { controlModules, loadTasks } from './memory'

const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule(), createFilteringModule()]
const ganttModules = [createLibraryModule(), createBarDraggingModule(), createLinksModule(), createMarkersModule()]

const GridExample = () => <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
            <DatasetControl.QuickFind />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

const MEMORY_BACKEND_FILE: IGridExampleFile = {
    name: 'memory.ts',
    code: `import { createMemoryDependenciesModule, createMemoryProjectModule, createMemoryTaskChecklistModule, createTaskDraggingModule, IFieldMapping, IMemoryProject, ITaskDependency, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TASK_CHECKLIST_COLUMN_NAME } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA } from './office'

//everything in the page: the tasks and what the modules keep
const tasks = createOfficeTable()
const dependencies = new MemoryTable<ITaskDependency>({ idKey: 'id', rows: [
    { id: 'lease-fitout', predecessorTaskId: 'lease', successorTaskId: 'fitout', type: 'finishToStart' },
    { id: 'fitout-movers', predecessorTaskId: 'fitout', successorTaskId: 'movers', type: 'finishToStart' },
    { id: 'movers-movein', predecessorTaskId: 'movers', successorTaskId: 'movein', type: 'finishToStart' },
    { id: 'movein-party', predecessorTaskId: 'movein', successorTaskId: 'party', type: 'finishToStart' },
] })
const checklistItems = new MemoryTable({ idKey: 'id', rows: [
    { id: 'desks-1', taskId: 'desks', name: 'Measure the rooms', isCompleted: true },
    { id: 'desks-2', taskId: 'desks', name: 'Pick the chairs', isCompleted: true },
    { id: 'desks-3', taskId: 'desks', name: 'Place the order', isCompleted: false },
    { id: 'invites-1', taskId: 'invites', name: 'Write the guest list', isCompleted: false },
] })
const projects = new MemoryTable<IMemoryProject>({ idKey: 'id', rows: [{ id: 'office', name: 'New office', startDate: '2026-01-05', endDate: '2026-04-10' }] })

const fieldMapping: IFieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode', startDate: 'start', endDate: 'due', percentComplete: 'done' }

const COLUMNS = [{ name: 'subject' }, { name: 'owner' }, { name: 'start' }, { name: 'due' }, { name: 'done' }, { name: TASK_CHECKLIST_COLUMN_NAME }, { name: PREDECESSORS_COLUMN_NAME }, { name: SUCCESSORS_COLUMN_NAME }]
const VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Plan', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'nextUp',
        name: 'Next up',
        resolve: provider => {
            provider.setSorting([{ name: 'start', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
]

export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views: VIEWS,
})

export const controlModules = [
    createMemoryProjectModule({ projects, projectId: 'office' }),
    createTaskDraggingModule(),
    createMemoryDependenciesModule({ dependencies }),
    createMemoryTaskChecklistModule({ items: checklistItems }),
]
`,
}

const DATAVERSE_BACKEND_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import { createDataverseDependenciesModule, createDataverseProjectModule, createTaskDraggingModule, DataverseTaskStore, IFieldMapping, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME } from '@talxis/base-controls'

//not run on this page: the same task grid on tables of your own in Dataverse
const PROJECT_ID = '00000000-0000-0000-0000-000000000001'

//a Liquid template; project comes from the project module
const FETCH_XML = \`<fetch>
    <entity name="new_officetask">
        <attribute name="new_name" />
        <attribute name="new_parenttaskid" />
        <attribute name="new_stackrank" />
        <attribute name="statecode" />
        <attribute name="new_owner" />
        <attribute name="new_start" />
        <attribute name="new_due" />
        <attribute name="new_done" />
        <filter>
            <condition attribute="new_projectid" operator="eq" value="{{ project.id }}" />
        </filter>
    </entity>
</fetch>\`

const fieldMapping: IFieldMapping = { parentId: 'new_parenttaskid', subject: 'new_name', stackRank: 'new_stackrank', stateCode: 'statecode', startDate: 'new_start', endDate: 'new_due', percentComplete: 'new_done' }

const COLUMNS = [{ name: 'new_name' }, { name: 'new_owner' }, { name: 'new_start' }, { name: 'new_due' }, { name: 'new_done' }, { name: PREDECESSORS_COLUMN_NAME }, { name: SUCCESSORS_COLUMN_NAME }]
const VIEWS: ITaskGridView[] = [{ id: 'plan', name: 'Plan', resolve: () => ({ columns: COLUMNS }) }]

export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({ taskRuntime, fetchXml: FETCH_XML }),
    fieldMapping,
    views: VIEWS,
})

//a checklist has no Dataverse variant: give createTaskChecklistModule a store of your own
export const controlModules = [
    //new tasks get the lookup to the project filled in
    createDataverseProjectModule({ entityName: 'new_project', id: PROJECT_ID, startDateColumn: 'new_start', endDateColumn: 'new_end' }),
    createTaskDraggingModule(),
    createDataverseDependenciesModule({
        entityName: 'new_taskdependency',
        predecessorAttribute: 'new_predecessorid',
        successorAttribute: 'new_successorid',
        typeAttribute: 'new_type',
        dependencyTypeCodes: { 100000000: 'finishToStart', 100000001: 'startToStart', 100000002: 'finishToFinish', 100000003: 'startToFinish' },
    }),
]
`,
}

const TALXIS_BACKEND_FILE: IGridExampleFile = {
    name: 'talxis.ts',
    code: `import { createDataverseProjectModule, createTalxisDependenciesModule, createTalxisTaskChecklistModule, createTalxisUserQueriesModule, createTaskDraggingModule, DataverseTaskStore, IFieldMapping, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, ITaskViewData, PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME, TASK_CHECKLIST_COLUMN_NAME } from '@talxis/base-controls'

//not run on this page: the same task grid on the TALXIS tables, which the TALXIS modules know
const PROJECT_ID = '00000000-0000-0000-0000-000000000001'

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

const fieldMapping: IFieldMapping = { parentId: 'talxis_parentprojecttaskid', subject: 'talxis_name', stackRank: 'talxis_stackrankstring', stateCode: 'statecode' }

const COLUMNS = [{ name: 'talxis_name' }, { name: TASK_CHECKLIST_COLUMN_NAME }, { name: PREDECESSORS_COLUMN_NAME }, { name: SUCCESSORS_COLUMN_NAME }]
const VIEWS: ITaskGridView[] = [{ id: 'plan', name: 'Plan', resolve: () => ({ columns: COLUMNS }) }]

export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new DataverseTaskStore({ taskRuntime, fetchXml: FETCH_XML }),
    fieldMapping,
    views: VIEWS,
})

export const controlModules = [
    createDataverseProjectModule({ entityName: 'talxis_project', id: PROJECT_ID }),
    createTaskDraggingModule(),
    //talxis_taskdependency
    createTalxisDependenciesModule(),
    //talxis_checklistjson on each task
    createTalxisTaskChecklistModule(),
    //the user's own views, as talxis_userquery records
    createTalxisUserQueriesModule<ITaskViewData>({ entityName: 'talxis_projecttask' }),
]
`,
}

export const BuildTasksStepExample = () => <GridExampleRunner seedCode={withOffice(STEP_TASKS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BuildViewsStepExample = () => <GridExampleRunner seedCode={withOffice(STEP_VIEWS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BuildPlanStepExample = () => <GridExampleRunner seedCode={withOffice(STEP_PLAN_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BuildModulesStepExample = () => <GridExampleRunner seedCode={withOffice(STEP_MODULES_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BuildGanttStepExample = () => <GridExampleRunner seedCode={withOffice(STEP_GANTT_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BuildBackendStepExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: STEP_BACKEND_CODE }, MEMORY_BACKEND_FILE, OFFICE_FILE, DATAVERSE_BACKEND_FILE, TALXIS_BACKEND_FILE]} tabs={TASK_EXAMPLE_TABS} />
