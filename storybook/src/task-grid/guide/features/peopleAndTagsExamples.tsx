import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS } from '../../examples/shared'
import { PEOPLE_FILE, TAGS_FILE, withOfficePlan } from '../officePlanFiles'

const PEOPLE_AND_TAGS_CODE = `import { createFilteringModule, createMemoryLookupManyModule, createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ILookupManyColumn, IMemoryLookupManyValues, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createTaskDrawingModule, createTaskSelectionModule, TaskGantt } from '@talxis/base-controls/gantt'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'
import { ASSIGNMENTS, PEOPLE, PERSON_COLUMNS, PERSON_METADATA } from './people'
import { TAG_COLUMNS, TAG_METADATA, TAGS, TASK_TAGS } from './tags'

const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })

//new: the records the columns pick from, by entity name
const sources = {
    person: { records: new MemoryTable({ idKey: 'personid', rows: PEOPLE }), metadata: PERSON_METADATA, columns: PERSON_COLUMNS },
    tag: { records: new MemoryTable({ idKey: 'tagid', rows: TAGS }), metadata: TAG_METADATA, columns: TAG_COLUMNS },
}

//new: each column by the name views give it: its label, entity and look
const columns: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Assigned to', entityName: 'person', appearance: { type: 'people' } },
    tags: { displayName: 'Tags', entityName: 'tag', appearance: { type: 'colorful' } },
}

//new: each task's picks, by column name
const values = new MemoryTable<IMemoryLookupManyValues>({
    idKey: 'taskId',
    rows: OFFICE_TASKS.map(task => ({ taskId: task.taskid, values: { assignedto: ASSIGNMENTS[task.taskid] ?? [], tags: TASK_TAGS[task.taskid] ?? [] } })),
})

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: the two columns in place of the owner, sized to fit beside the chart
const views: ITaskGridView[] = [
    { id: 'plan', name: 'Whole plan', resolve: () => ({ columns: [{ name: 'subject' }, { name: 'assignedto', visualSizeFactor: 110 }, { name: 'tags', visualSizeFactor: 140 }] }) },
]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views,
})

//new: a task module: the people and the tags stay with the tasks
const controlModules = [createTaskDraggingModule(), createMemoryLookupManyModule({ sources, columns, values })]

//new: the filtering module filters these columns by their records
const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' }), createFilteringModule()]

const ganttModules = [createLibraryModule(), createBarDraggingModule(), createTaskDrawingModule(), createTaskSelectionModule()]

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: a wider grid, for the new columns */}
        <TaskGantt.Split defaultGanttSize={30}>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const PeopleAndTagsExample = () => <GridExampleRunner seedCode={withOfficePlan(PEOPLE_AND_TAGS_CODE, PEOPLE_FILE, TAGS_FILE)} tabs={TASK_EXAMPLE_TABS} />
