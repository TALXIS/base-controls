import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS } from './shared'
import { CALENDAR_FILE, CHECKLISTS_FILE, DEPENDENCIES_FILE, PEOPLE_FILE, TAGS_FILE, withOfficePlan } from '../guide/officePlanFiles'

const OFFICE_MOVE_CODE = `import { createFilteringModule, createMemoryDependenciesModule, createMemoryLookupManyModule, createMemoryTaskChecklistModule, createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ILookupManyColumn, IMemoryLookupManyValues, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createLinksModule, createMemoryMarkersModule, createMemoryNonWorkingDaysModule, createTaskDrawingModule, createTaskSelectionModule, createTaskTooltipModule, TaskGantt } from '@talxis/base-controls/gantt'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'
import { ASSIGNMENTS, PEOPLE, PERSON_COLUMNS, PERSON_METADATA } from './people'
import { TAG_COLUMNS, TAG_METADATA, TAGS, TASK_TAGS } from './tags'
import { CHECKLISTS } from './checklists'
import { DEPENDENCIES } from './dependencies'
import { HOLIDAYS, MILESTONES } from './calendar'

//every table lives outside the component, so each change survives the next mount
const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })
const picks = new MemoryTable<IMemoryLookupManyValues>({
    idKey: 'taskId',
    rows: OFFICE_TASKS.map(task => ({ taskId: task.taskid, values: { assignedto: ASSIGNMENTS[task.taskid] ?? [], tags: TASK_TAGS[task.taskid] ?? [] } })),
})
const checklists = new MemoryTable({ idKey: 'id', rows: CHECKLISTS })
const dependencies = new MemoryTable({ idKey: 'id', rows: DEPENDENCIES })
const milestones = new MemoryTable({ idKey: 'id', rows: MILESTONES })
const holidays = new MemoryTable({ idKey: 'id', rows: HOLIDAYS })

const sources = {
    person: { records: new MemoryTable({ idKey: 'personid', rows: PEOPLE }), metadata: PERSON_METADATA, columns: PERSON_COLUMNS },
    tag: { records: new MemoryTable({ idKey: 'tagid', rows: TAGS }), metadata: TAG_METADATA, columns: TAG_COLUMNS },
}

const lookupManyColumns: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Assigned to', entityName: 'person', appearance: { type: 'people' } },
    tags: { displayName: 'Tags', entityName: 'tag', appearance: { type: 'colorful' } },
}

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'due', percentComplete: 'done' }

const views: ITaskGridView[] = [
    {
        id: 'plan',
        name: 'Whole plan',
        resolve: () => ({ columns: [
            { name: 'subject', visualSizeFactor: 262 },
            { name: 'assignedto', visualSizeFactor: 112 },
            { name: 'tags', visualSizeFactor: 90 },
            //the tooltip's status pill fails unless the view loads this column
            { name: 'status', isHidden: true },
        ] }),
    },
    {
        id: 'list',
        name: 'Every task',
        resolve: () => ({
            columns: [{ name: 'subject' }, { name: TASK_CHECKLIST_COLUMN_NAME, visualSizeFactor: 130 }, { name: 'due', visualSizeFactor: 100 }, { name: 'status', isHidden: true }],
            data: { isFlatList: true },
        }),
    },
]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views,
})

//task modules: data the tasks carry, whatever draws them
const controlModules = [
    createTaskDraggingModule(),
    createMemoryLookupManyModule({ sources, columns: lookupManyColumns, values: picks }),
    createMemoryTaskChecklistModule({ items: checklists }),
    createMemoryDependenciesModule({ dependencies }),
]

//grid modules: editing in the cells, selecting rows, and Filter By in each column's menu
const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' }), createFilteringModule()]

//Gantt modules: one feature of the chart each
const ganttModules = [
    createLibraryModule(),
    createBarDraggingModule(),
    createTaskDrawingModule(),
    createTaskSelectionModule(),
    createLinksModule(),
    createMemoryMarkersModule({ markers: milestones }),
    createMemoryNonWorkingDaysModule({ nonWorkingDays: holidays }),
    createTaskTooltipModule({ statusColumnName: 'status' }),
]

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion stateKey='officeMovePlan' height='560px'>
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
        <TaskGantt.Split defaultGanttSize={38}>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const OfficeMoveExample = () => <GridExampleRunner seedCode={withOfficePlan(OFFICE_MOVE_CODE, PEOPLE_FILE, TAGS_FILE, CHECKLISTS_FILE, DEPENDENCIES_FILE, CALENDAR_FILE)} tabs={TASK_EXAMPLE_TABS} />
