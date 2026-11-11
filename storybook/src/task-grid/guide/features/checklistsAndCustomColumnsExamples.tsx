import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS } from '../../examples/shared'
import { CHECKLISTS_FILE, withOfficePlan } from '../officePlanFiles'

const CHECKLISTS_AND_CUSTOM_COLUMNS_CODE = `import { createMemoryCustomColumnsModule, createMemoryTaskChecklistModule, createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ICustomColumnRow, ICustomColumnValuesRow, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, TASK_CHECKLIST_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createTaskDrawingModule, createTaskSelectionModule, TaskGantt } from '@talxis/base-controls/gantt'
import { DatasetConstants } from '@talxis/client-libraries'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'
import { CHECKLISTS } from './checklists'

const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })
//new: the items of every task's checklist
const checklists = new MemoryTable({ idKey: 'id', rows: CHECKLISTS })

//new: the team's custom columns, the ones it adds later among them
const customColumns = new MemoryTable<ICustomColumnRow>({ idKey: 'name', rows: [
    { name: 'budget', displayName: 'Budget', dataType: 'Currency', precision: 0 },
    { name: 'supplier', displayName: 'Supplier', dataType: 'SingleLine.Text' },
] })

//new: the module adds this suffix to every custom column's name
const BUDGET = \`budget\${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}\`
const SUPPLIER = \`supplier\${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}\`

//new: each task's values, by the columns' full names
const customValues = new MemoryTable<ICustomColumnValuesRow>({ idKey: 'taskId', rows: [
    { taskId: 'desks', values: { [BUDGET]: 18000, [SUPPLIER]: 'Deskworks' } },
    { taskId: 'network', values: { [BUDGET]: 9500, [SUPPLIER]: 'Wired Right' } },
    { taskId: 'movers', values: { [BUDGET]: 3200, [SUPPLIER]: 'City Movers' } },
] })

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: the checklist and the custom columns, by their names
const views: ITaskGridView[] = [
    { id: 'plan', name: 'Whole plan', resolve: () => ({ columns: [{ name: 'subject' }, { name: TASK_CHECKLIST_COLUMN_NAME }, { name: BUDGET, visualSizeFactor: 100 }, { name: SUPPLIER, visualSizeFactor: 120 }] }) },
]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views,
})

const controlModules = [
    createTaskDraggingModule(),
    //new: each task's checklist, as done/total
    createMemoryTaskChecklistModule({ items: checklists }),
    //new: Add custom column and Delete custom column in Edit columns
    createMemoryCustomColumnsModule({ columns: customColumns, values: customValues, enableCreation: true, enableDeletion: true }),
]

const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' })]

const ganttModules = [createLibraryModule(), createBarDraggingModule(), createTaskDrawingModule(), createTaskSelectionModule()]

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
            {/* new: where the team adds and deletes custom columns */}
            <DatasetControl.EditColumns />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: a wider grid, for the new columns */}
        <TaskGantt.Split defaultGanttSize={25}>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const ChecklistsAndCustomColumnsExample = () => <GridExampleRunner seedCode={withOfficePlan(CHECKLISTS_AND_CUSTOM_COLUMNS_CODE, CHECKLISTS_FILE)} tabs={TASK_EXAMPLE_TABS} />
