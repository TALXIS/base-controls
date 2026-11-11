import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { TASK_EXAMPLE_TABS, withOffice } from './shared'

const DEADLINES_CODE = `import { createTaskEditingModule, DatasetControl, TaskDatasetControl, TaskGrid, useDatasetControlModule } from '@talxis/base-controls'
import { createLoadOffice } from './office'
import { createDeadlinesModule, IDeadline } from './deadlines'
import { createLateDueDatesModule } from './lateDueDates'

const loadTasks = createLoadOffice()

//each project's deadline, kept in memory here; dataverse.ts reads them from Dataverse
const DEADLINES: IDeadline[] = [
    { projectId: 'move', date: '2026-03-20' },
    { projectId: 'party', date: '2026-04-08' },
]

//a task module goes on the control, which loads it on every mount
const controlModules = [createDeadlinesModule({ createStore: () => ({ loadDeadlines: async () => DEADLINES }) })]

//drawn inside the control, so it reads the module this mount loaded
const PlanGrid = () => {
    const deadlines = useDatasetControlModule('deadlines')
    //a grid module goes on the grid, built once per mount
    const modules = React.useMemo(() => [createTaskEditingModule(), createLateDueDatesModule(deadlines)], [deadlines])
    return <TaskGrid modules={modules} />
}

const GridExample = () => <TaskDatasetControl modules={controlModules} enableEditing onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <PlanGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const DEADLINES_MODULE_FILE: IGridExampleFile = {
    name: 'deadlines.ts',
    code: `import type { IDatasetControlModule, ITaskRuntime } from '@talxis/base-controls'

export interface IDeadline {
    projectId: string
    date: string
}

//where the deadlines are kept; the module creates one on every mount
export interface IDeadlinesStore {
    loadDeadlines(): Promise<IDeadline[]>
}

//what the rest of your code reaches as the deadlines module
export interface IDeadlines {
    /** The deadline of the project the task is in. */
    getDeadline(taskId: string): Dayjs | undefined
}

export interface IDeadlinesModuleParameters {
    createStore: (taskRuntime: ITaskRuntime) => IDeadlinesStore
}

//its name and what onLoad returns are declared in types.ts
export const createDeadlinesModule = (parameters: IDeadlinesModuleParameters): IDatasetControlModule<'deadlines'> => ({
    name: 'deadlines',
    //runs before the tasks load, so the deadlines are there when the grid draws
    onLoad: async (datasetControl): Promise<IDeadlines> => {
        const taskRuntime: ITaskRuntime = datasetControl.modules.get('taskRuntime')
        const deadlines = await parameters.createStore(taskRuntime).loadDeadlines()
        const dates = new Map(deadlines.map(deadline => [deadline.projectId, dayjs(deadline.date)]))
        return {
            //a project is a top-level task, the first of the task's ancestors
            getDeadline: taskId => dates.get(taskRuntime.getProvider().getRecordTree().structure.getAncestorIds(taskId)[0]),
        }
    },
})
`,
}

const LATE_DUE_DATES_FILE: IGridExampleFile = {
    name: 'lateDueDates.ts',
    code: `import { IGrid, IGridModule, ITaskDataProvider, TASK_GRID_PRIORITY } from '@talxis/base-controls'
import type { IDeadlines } from './deadlines'

//tints the due date of an active task that ends after its project's deadline
export const createLateDueDatesModule = (deadlines: IDeadlines): IGridModule<'lateDueDates'> => ({
    name: 'lateDueDates',
    onLoad: (grid: IGrid) => {
        //in a task grid, the grid's provider is the task provider
        const provider = grid.services.get('provider') as ITaskDataProvider
        //after the task grid's own cell hooks
        grid.services.get('cells').hooks.theme.add((builder, { record, columnName }) => {
            const taskId = record.getRecordId()
            const deadline = deadlines.getDeadline(taskId)
            const due = record.getValue('due')
            if (columnName === 'due' && deadline && due && dayjs(due).isAfter(deadline) && provider.isRecordActive(taskId)) {
                builder.tint('#d13438')
            }
        }, TASK_GRID_PRIORITY.tree + 1)
    },
})
`,
}

const DEADLINES_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `import type { IDeadlines } from './deadlines'

//not run on this page: names each module and what it provides, so get and find are typed
declare module '@talxis/base-controls' {
    interface IDatasetControlModuleMap {
        deadlines: IDeadlines
    }
    interface IGridModuleMap {
        //its onLoad returns nothing
        lateDueDates: void
    }
}
`,
}

const DEADLINES_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `import type { ITaskRuntime } from '@talxis/base-controls'
import type { IDeadline, IDeadlinesStore } from './deadlines'

//not run on this page: the deadlines from a Dataverse table, through the PCF context's Web API
//used as createStore: taskRuntime => new DataverseDeadlinesStore(taskRuntime)
export class DataverseDeadlinesStore implements IDeadlinesStore {
    private _taskRuntime: ITaskRuntime

    constructor(taskRuntime: ITaskRuntime) {
        this._taskRuntime = taskRuntime
    }

    public async loadDeadlines(): Promise<IDeadline[]> {
        const { webAPI } = this._taskRuntime.services.get('pcfContext')
        const { entities } = await webAPI.retrieveMultipleRecords('new_deadline', '?$select=_new_projecttaskid_value,new_date')
        return entities.map(entity => ({ projectId: entity._new_projecttaskid_value, date: entity.new_date }))
    }
}
`,
}

const SETTINGS_FIRST_CODE = `import { DatasetControl, IDatasetControlModule, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA, officeFieldMapping } from './office'

const tasks = createOfficeTable()

export interface IPlanSettings {
    rootTaskId?: string
    columns: string[]
}

//stands in for settings your app reads first, such as a PCF control's parameters
const PLAN_SETTINGS: IPlanSettings = { rootTaskId: 'fitout', columns: ['subject', 'owner', 'due'] }

const planSettingsModule: IDatasetControlModule<'planSettings'> = {
    name: 'planSettings',
    //after the task runtime (-100) and before the task modules (0), so their stores can read it too
    priority: -50,
    onLoad: async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return PLAN_SETTINGS
    },
}

//every module has loaded by the time onLoad runs
const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => {
    const settings = taskRuntime.services.get('datasetControl').modules.get('planSettings')
    return {
        store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
        fieldMapping: officeFieldMapping,
        rootTaskId: settings.rootTaskId,
        views: [{ id: 'plan', name: 'Plan', resolve: () => ({ columns: settings.columns.map(name => ({ name })) }) }],
    }
}

const GridExample = () => <TaskDatasetControl modules={[planSettingsModule]} onLoad={loadTasks} height='280px'>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const ROW_COMMAND_CODE = `import { createTaskEditingModule, DatasetControl, IDatasetControlModule, ITaskRuntime, TASK_COMMANDS_COLUMN_KEY, TASK_GRID_PRIORITY, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//a copy of the task, right after it among its siblings
const duplicate = async (taskRuntime: ITaskRuntime, task: IRecord) => {
    const { structure } = taskRuntime.getProvider().getRecordTree()
    const { next } = structure.getNeighbours(task.getRecordId())
    await taskRuntime.tasks.create(structure.getParent(task.getRecordId())?.getRecordId(), {
        position: next ? { before: next.getRecordId() } : 'last',
        data: { subject: \`\${task.getValue('subject')} (copy)\`, owner: task.getValue('owner'), start: task.getValue('start'), due: task.getValue('due') },
    })
}

//adds Duplicate to the menu of every active task's row commands
const duplicateModule: IDatasetControlModule<'duplicate'> = {
    name: 'duplicate',
    onLoad: datasetControl => {
        const taskRuntime: ITaskRuntime = datasetControl.modules.get('taskRuntime')
        //the grid is a part of the control, there while TaskGrid is drawn
        datasetControl.parts.observe('grid', grid => grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
            if (columnName !== TASK_COMMANDS_COLUMN_KEY || !taskRuntime.isCreationEnabled() || !taskRuntime.getProvider().isRecordActive(record.getRecordId())) {
                return
            }
            //after the row's +, which becomes a menu of both
            result.items.push({ key: 'duplicate', text: 'Duplicate', iconProps: { iconName: 'Copy' }, onClick: () => { duplicate(taskRuntime, record) } })
        }, TASK_GRID_PRIORITY.tree + 1))
    },
}

const GridExample = () => <TaskDatasetControl modules={[duplicateModule]} enableCreation enableEditing onLoad={loadTasks} height='400px'>
    <DatasetControl.Body>
        <TaskGrid modules={[createTaskEditingModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const SETTINGS_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `import type { IPlanSettings } from './GridExample'

//not run on this page: types what modules.get('planSettings') returns
declare module '@talxis/base-controls' {
    interface IDatasetControlModuleMap {
        planSettings: IPlanSettings
    }
}
`,
}

const ROW_COMMAND_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `//not run on this page: names the module, whose onLoad returns nothing
declare module '@talxis/base-controls' {
    interface IDatasetControlModuleMap {
        duplicate: void
    }
}

export { }
`,
}

export const DeadlinesModuleExample = () => <GridExampleRunner seedCode={withOffice(DEADLINES_CODE, DEADLINES_MODULE_FILE, LATE_DUE_DATES_FILE, DEADLINES_TYPES_FILE, DEADLINES_DATAVERSE_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const SettingsFirstModuleExample = () => <GridExampleRunner seedCode={withOffice(SETTINGS_FIRST_CODE, SETTINGS_TYPES_FILE)} tabs={TASK_EXAMPLE_TABS} />
export const RowCommandModuleExample = () => <GridExampleRunner seedCode={withOffice(ROW_COMMAND_CODE, ROW_COMMAND_TYPES_FILE)} tabs={TASK_EXAMPLE_TABS} />
