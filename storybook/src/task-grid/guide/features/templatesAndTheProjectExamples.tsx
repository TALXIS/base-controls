import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS } from '../../examples/shared'
import { PROJECT_FILE, TEMPLATES_FILE, withOfficePlan } from '../officePlanFiles'

const TEMPLATES_AND_THE_PROJECT_CODE = `import { createMemoryProjectModule, createMemoryTemplatesModule, createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, IMemoryProject, ITaskGridView, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid, useDatasetControlModule } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createMarkersModule, createTaskDrawingModule, createTaskSelectionModule, TaskGantt } from '@talxis/base-controls/gantt'
import { Text } from '@fluentui/react'
import { OFFICE_COLUMNS, OFFICE_METADATA, OFFICE_TASKS } from './office'
import { TEMPLATES } from './templates'
import { PROJECT } from './project'

//templates create their tasks in the table the store reads
const tasks = new MemoryTable({ idKey: 'taskid', rows: OFFICE_TASKS })
//new: the templates, the ones the user saves among them
const templates = new MemoryTable({ idKey: 'id', rows: TEMPLATES })
//new: the projects, of which the project module loads one by its id
const projects = new MemoryTable<IMemoryProject>({ idKey: 'id', rows: [PROJECT] })

const fieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'due', percentComplete: 'done' }

//new: only Task and Due, so the grid fits beside a wider chart
const views: ITaskGridView[] = [{ id: 'timeline', name: 'Timeline', resolve: () => ({ columns: [{ name: 'subject' }, { name: 'due', visualSizeFactor: 100 }] }) }]

const loadTasks = (taskRuntime: ITaskRuntime) => ({
    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),
    fieldMapping,
    views,
})

//new: anything inside the control finds the project module by its name
const ProjectDates = () => {
    const project = useDatasetControlModule('project')
    return <Text>{project.getName()}: {project.getStartDate()?.format('D MMM')} to {project.getEndDate()?.format('D MMM YYYY')}</Text>
}

const controlModules = [
    createTaskDraggingModule(),
    //new: From template, on New and on each row's +, and Save as template
    createMemoryTemplatesModule({ tasks, templates }),
    //new: the project the tasks belong to, loaded before them
    createMemoryProjectModule({ projects, projectId: PROJECT.id }),
]

const gridModules = [createTaskEditingModule(), createRowSelectionModule({ mode: 'multiple' })]

//new: marks today, and the project's start and end
const ganttModules = [createLibraryModule(), createBarDraggingModule(), createTaskDrawingModule(), createTaskSelectionModule(), createMarkersModule()]

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} modules={controlModules} enableCreation enableEditing enableDeletion height='520px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
            {/* new: the project's name and dates */}
            <ProjectDates />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: a wider chart, for the project's dates */}
        <TaskGantt.Split defaultGanttSize={45}>
            <TaskGrid modules={gridModules} />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const TemplatesAndTheProjectExample = () => <GridExampleRunner seedCode={withOfficePlan(TEMPLATES_AND_THE_PROJECT_CODE, TEMPLATES_FILE, PROJECT_FILE)} tabs={TASK_EXAMPLE_TABS} />
