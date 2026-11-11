import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice, withTasks } from './shared'

const SHOWCASE_CODE = `import { createFilteringModule, createMemoryCustomColumnsModule, createMemoryDependenciesModule, createMemoryLookupManyModule, createMemoryTaskChecklistModule, createMemoryTemplatesModule, createRowSelectionModule, createSortingModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ICustomColumnRow, ICustomColumnValuesRow, IMemoryTemplate, ITaskGridView, MemoryTable, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable, TASK_VIEWS } from './tasks'

//sample data from these docs: LOOKUP_MANY_*, CHECKLIST_*, DEPENDENC*, TEMPLATES, getTaskColumns
//tables outlive every mount, so what the user changes survives a view switch
const tasks = createTaskTable()
const templates = new MemoryTable<IMemoryTemplate>({ idKey: 'id', rows: TEMPLATES })
const lookupManyValues = new MemoryTable({ idKey: 'taskId', rows: LOOKUP_MANY_VALUES })
const checklistItems = new MemoryTable({ idKey: 'id', rows: CHECKLIST_ITEMS })
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })
const customColumns = new MemoryTable<ICustomColumnRow>({ idKey: 'name', rows: [{ name: 'risk', displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }] })
const customColumnValues = new MemoryTable<ICustomColumnValuesRow>({ idKey: 'taskId' })

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

//the task modules go on the control
const controlModules = [
    createTaskDraggingModule(),
    createMemoryCustomColumnsModule({ columns: customColumns, values: customColumnValues, enableCreation: true }),
    createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: lookupManyValues }),
    createMemoryTemplatesModule({ tasks, templates }),
    createMemoryTaskChecklistModule({ items: checklistItems }),
    createMemoryDependenciesModule({ dependencies }),
]

//the grid modules go on the grid
const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule(), createFilteringModule()]

const GridExample = () => <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoad={loadTasks} height='560px'>
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
        <TaskGrid modules={gridModules} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const SMALLEST_CODE = `import { DatasetControl, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'

//TASKS, TASK_METADATA and TASK_COLUMNS are the sample tasks of these docs
//the table keeps every change, so it is made once
const tasks = new MemoryTable({ idKey: TASK_METADATA.PrimaryIdAttribute, rows: TASKS })

//the columns that make the tree: each task's parent, its name, and its place among its siblings
const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank' }

//called on every mount: where the tasks are kept, and which columns make the tree
const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: TASK_METADATA, columns: TASK_COLUMNS }),
    fieldMapping,
})

//the DatasetControl of tasks, with the grid that draws them in its body
const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='420px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const PARTS_CODE = `import { createRowSelectionModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

const GridExample = () => <TaskDatasetControl enableCreation enableEditing enableDeletion onLoad={loadTasks} height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* the views onLoad returns */}
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* New, Edit and Delete, ahead of your own commands */}
            <TaskDatasetControl.Ribbon />
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
            {/* Show hierarchy, Hide inactive tasks and what the modules add */}
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Notifications />
    <DatasetControl.Body>
        {/* Edit and Delete act on the selected rows */}
        <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            {/* how many tasks the tree shows */}
            <TaskDatasetControl.PageSizeSwitcher />
        </DatasetControl.Footer.Start>
    </DatasetControl.Footer>
</TaskDatasetControl>
`

const LOOKS_CODE = `import { DatasetControl, ITaskGridComponents, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { CommandBarButton, ProgressIndicator } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

const components: ITaskGridComponents = {
    percentComplete: {
        //the bar a percent complete cell draws: taller, and Done at 100%
        progress: { onRender: props => <ProgressIndicator {...props} barHeight={8} description={props.percentComplete === 1 ? 'Done' : props.description} /> },
    },
}

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            {/* the settings button without its text */}
            <TaskDatasetControl.Settings components={{ onRenderButton: props => <CommandBarButton {...props} text={undefined} /> }} />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid components={components} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const STORE_LOG_CODE = `import { createRowSelectionModule, createSortingModule, createTaskEditingModule, DatasetControl, ITaskCreateParameters, ITaskDeleteParameters, ITaskGridLoadResult, ITaskGridView, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { Stack, Text } from '@fluentui/react'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'

const tasks = createOfficeTable()

//the memory store, reporting every call the task provider makes to it
class LoggingStore extends MemoryTaskStore {
    private _log: (line: string) => void

    constructor(taskRuntime: ITaskRuntime, log: (line: string) => void) {
        super({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS })
        this._log = log
    }

    public async load() {
        this._log('load: every task of the view, once per mount')
        return super.load()
    }

    public async createTask(parameters: ITaskCreateParameters) {
        this._log('createTask: the new row waits for the store')
        const result = await super.createTask(parameters)
        this._log('createTask: done')
        return result
    }

    public async saveTask(task: IRecord) {
        this._log(\`saveTask: \${task.getValue('subject')}\`)
        return super.saveTask(task)
    }

    public async deleteTasks(parameters: ITaskDeleteParameters) {
        this._log(\`deleteTasks: \${parameters.taskIds.length}\`)
        return super.deleteTasks(parameters)
    }

    //asked after every write for what the backend changed on its own
    public async synchronize() {
        this._log('synchronize')
        return { updatedRecords: [] }
    }
}

const VIEWS: ITaskGridView[] = [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: OFFICE_COLUMNS }) },
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
    const log = (line: string) => setLines(previous => [line, ...previous].slice(0, 8))

    //every mount gets a new task runtime, and returns a new store
    const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => {
        log('onLoad: a new mount')
        return { store: new LoggingStore(taskRuntime, log), fieldMapping: officeFieldMapping, views: VIEWS }
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <TaskDatasetControl enableCreation enableEditing enableDeletion onLoad={loadTasks} height='360px'>
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
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule()]} />
            </DatasetControl.Body>
        </TaskDatasetControl>
        {/* the newest call first */}
        <Stack>
            {lines.map((line, index) => <Text key={index} variant='small'>{line}</Text>)}
        </Stack>
    </Stack>
}
`

const THREE_PLACES_CODE = `import { createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, TaskGantt } from '@talxis/base-controls/gantt'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

//the control's modules work with the tasks, whatever draws them
const controlModules = [createTaskDraggingModule()]

//the grid's modules change what the grid does
const gridModules = [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]

//the Gantt's modules change what the timeline does; the library module is required
const ganttModules = [createLibraryModule(), createBarDraggingModule()]

const GridExample = () => <TaskDatasetControl modules={controlModules} enableEditing onLoad={loadTasks} height='480px'>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const TaskGridShowcaseExample = () => <GridExampleRunner seedCode={withTasks(SHOWCASE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const SmallestTaskGridExample = () => <GridExampleRunner seedCode={SMALLEST_CODE} tabs={TASK_EXAMPLE_TABS} />
export const TaskGridPartsExample = () => <GridExampleRunner seedCode={withTasks(PARTS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TaskGridLooksExample = () => <GridExampleRunner seedCode={withTasks(LOOKS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const StoreLogExample = () => <GridExampleRunner seedCode={withOffice(STORE_LOG_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const ThreePlacesExample = () => <GridExampleRunner seedCode={withTasks(THREE_PLACES_CODE)} tabs={TASK_EXAMPLE_TABS} />
