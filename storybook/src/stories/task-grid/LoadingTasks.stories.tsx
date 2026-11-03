import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { OwnTasksExample, RootTaskExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
A task grid draws its tasks as a tree, so every task it loads has to say which task is its parent and where it sits among its siblings. The grid loads every task of the view at once, through a task provider that reads them from a store, such as one in memory or a Dataverse table. In \`onLoad\` you return that provider, with a field mapping that tells it which columns make the tree.

{{story: Show your own tasks}}

## Load the tasks

\`onLoad\` gets the view the user is on and works as on a DatasetControl: see [**DatasetControl › Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview).

| Parameter | Description |
|---|---|
| \`view\` | The view to load. The control applies its \`data\` for you. See [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview). |
| \`taskRuntime\` | The control's task runtime. Pass it to the data source. |

| Result | Default | Description |
|---|---|---|
| \`provider\` | Required | The tasks, from a data source below. |
| \`fieldMapping\` | Required | Which columns make the tree. See *Field mapping* below. |
| \`rootTaskId\` | None | Shows only the tasks under this one. See *Start from a task* below. |

Throw from \`onLoad\` and the control shows the error, with *Try again*. See [**DatasetControl › Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

## Field mapping

| Key | Required | Description |
|---|---|---|
| \`parentId\` | Yes | The lookup to the parent task. Empty for a top-level task. |
| \`subject\` | Yes | The task's name. Drawn with the tree's indent and arrow, pinned left, and searched by quick find when the view names no columns. |
| \`stackRank\` | Yes | The task's place among its siblings: a LexoRank string, such as \`0\\|hzzzzz:\`. The grid writes it when a task is created or moved. \`StackRank.between(previous, next)\` makes one. |
| \`stateCode\` | No, \`'statecode'\` | \`0\` is active. Inactive tasks are read-only, get no **+**, and *Hide inactive tasks* hides them. |
| \`percentComplete\` | No | Drawn as a progress bar. |
| \`startDate\`, \`endDate\` | No | The task's dates. The [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview) needs both. |
| \`duration\` | No | Minutes, as a duration column holds them. A day holds \`hoursPerDay\` hours. |

Every other column is an ordinary column of the view.

## Data sources and stores

A task provider reads and writes its tasks through a *store*, and a data source puts the two together. You pass the data source an \`onCreateStore(taskRuntime)\` that creates the store on every load:

| Store | Data source | Tasks are kept |
|---|---|---|
| \`MemoryTaskStore\` | \`createMemoryTaskDataSource\` | In a \`MemoryTaskDatabase\`, in the page. For prototypes, tests and these docs. |
| \`DataverseTaskStore\` | \`createDataverseTaskDataSource\` | In a Dataverse table, read through FetchXML and edited in its forms. TALXIS tasks load with it too. |
| Your own \`ITaskStore\` | \`createTaskDataSource\` | Wherever your store reads and writes them. See *Your own store* below. |

Every data source also takes \`provider\`, a class extending \`TaskDataProvider\`, to change the provider itself.

### Memory

\`MemoryTaskDatabase\` copies \`records\` and keeps every change; *Show your own tasks* above uses one. Creating and deleting pause briefly, as a server would, and opening a task shows an alert. Memory modules that create tasks, such as templates, take the same \`database\`.

### Dataverse

\`\`\`tsx
const TASKS_FETCH_XML = \`<fetch>
    <entity name="task">
        <attribute name="subject" />
        <attribute name="parentid" />
        <attribute name="stackrank" />
        <attribute name="statecode" />
        <filter>
            <condition attribute="projectid" operator="eq" value="{{ project.id }}" />
        </filter>
    </entity>
</fetch>\`

const loadTasks = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
    provider: createDataverseTaskDataSource({ taskRuntime, onCreateStore: () => new DataverseTaskStore({ taskRuntime, fetchXml: TASKS_FETCH_XML }) }),
    fieldMapping,
})
\`\`\`

| Parameter | Description |
|---|---|
| \`fetchXml\` | Required. Selects the tasks. It is a Liquid template over \`project\`, from the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module, and \`hostRecord\`. |
| \`hostRecord\` | \`{ entityName, id?, data? }\`, the record the grid sits on, such as the one the form shows. |
| \`form\` | How tasks open: \`editId\` and \`bulkEditId\` pick the forms, and \`onGetParameters(operation, defaults)\` changes what \`Xrm.Navigation.navigateTo\` gets. |
| \`onGetNewTaskDefaults\` | \`(params) => IRawRecord\`, values every new task starts with. |

*Edit* opens the task's form in a side dialog, or the bulk edit form for several, read-only for inactive tasks or without \`enableEditing\`. New tasks are created straight away in their place, with the project lookup filled in when the Project module is there. After a form closes or a save, the store reads back what changed, so dates a backend rescheduled show up. Every method is \`protected\`, for a subclass to change.

## Start from a task

Return \`rootTaskId\` to show only the tasks under one task, such as one project's. It is read on load: to change it, remount the control with a new \`key\`.

{{story: Start from a task}}

## Your own store

Implement \`ITaskStore\` and pass it to \`createTaskDataSource\`:

| Method | Description |
|---|---|
| \`onLoad(provider)\` | Returns \`{ rawData, metadata, columns }\`: every task of the view, the table's metadata, and the columns. |
| \`onGetAvailableColumns(options?)\`, \`onGetAvailableRelatedColumns()\` | What Edit columns offers. |
| \`onCreateTask(params)\` | Creates the task the grid already shows, from \`{ parentRecord, stackRank, data, taskId }\`. Returns \`{ record }\`, or \`null\` to drop it. |
| \`onSaveTask(task)\` | Saves what changed on a task, its parent and rank included. |
| \`onDeleteTasks({ taskIds, tree })\` | Deletes the tasks, deepest first. Returns the ones deleted and the ones that failed, or \`null\` when cancelled. |
| \`onOpenTasks(taskIds)\` | Opens the tasks outside the grid, such as in a form. \`null\` when nothing changed. |
| \`onOpenRelatedRecord(reference, columnName)\` | Opens the record a lookup points to. |
| \`onCanDeleteTask(task)\` | Optional. \`false\` keeps a task from being deleted. |
| \`onSynchronize()\` | Optional. Returns \`{ updatedRecords }\`, the tasks the backend changed since the last read. |

Throw "Not implemented." from a method your backend does not support.
`

const meta = {
    title: 'Controls/TaskGrid/Loading tasks',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ShowYourOwnTasks: Story = {
    name: 'Show your own tasks',
    render: () => renderStory(<OwnTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `An office move in a \`MemoryTaskDatabase\`, where *Sign the lease* is done (\`statecode\` \`1\`). Try: turn on *Hide inactive tasks* in the settings, or add a task to \`OFFICE_MOVE\` in **Code**.`,
            },
        },
    },
}

export const StartFromATask: Story = {
    name: 'Start from a task',
    render: () => renderStory(<RootTaskExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample projects, one at a time. Try: pick a project, then add a task with *New*: it goes under the project.`,
            },
        },
    },
}
