import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { OwnTasksExample, RootTaskExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
A task grid loads every task of the view at once, through a task provider that reads them from a store, such as one in memory or a Dataverse table. You hand the control that provider together with a field mapping, which names the columns that make the tree: each task's parent and its place among its siblings. Try it below: add a task to \`OFFICE_MOVE\` in **Code**.

{{canvas: Show your own tasks}}

## Load the tasks

\`onLoad(control)\` gets the DatasetControl, whose \`control.modules.get('taskRuntime')\` is the task runtime to pass to the data source. It returns the \`provider\` and the \`fieldMapping\`, the \`views\` to switch between (see [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview)), and a \`rootTaskId\` to show only part of the tree (see *Start from a task* below). Everything else works as on a DatasetControl, errors included: see [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview) and [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

## Field mapping

| Key | Required | Description |
|---|---|---|
| \`parentId\` | Yes | The lookup to the parent task. Empty for a top-level task. |
| \`subject\` | Yes | The task's name. Drawn with the tree's indent and arrow, pinned left, and searched by quick find when the view names no columns. |
| \`stackRank\` | Yes | The task's place among its siblings: a LexoRank string, such as \`0\\|hzzzzz:\`. The grid writes it when a task is created or moved. \`StackRank.between(previous, next)\` makes one. |
| \`stateCode\` | No, \`'statecode'\` | \`0\` is active. See *Inactive tasks* on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). |
| \`percentComplete\` | No | Drawn as a progress bar. |
| \`startDate\`, \`endDate\` | No | The task's dates. The [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview) needs both. |
| \`duration\` | No | Minutes, as a duration column holds them. A day holds as many hours as \`TaskDatasetControl\`'s \`hoursPerDay\`. |

Every other column is an ordinary column of the view.

## Data sources and stores

A task provider reads and writes its tasks through a *store*, and a data source puts the two together. You pass the data source an \`createStore(taskRuntime)\` that creates the store on every load:

| Store | Data source | Tasks are kept |
|---|---|---|
| \`MemoryTaskStore\` | \`createMemoryTaskProvider\` | In a \`MemoryTaskDatabase\`, in the page. For prototypes, tests and these docs. |
| \`DataverseTaskStore\` | \`createDataverseTaskProvider\` | In a Dataverse table, read through FetchXML and edited in its forms. TALXIS tasks load with it too. |
| Your own \`ITaskStore\` | \`createTaskProvider\` | Wherever your store reads and writes them. See *Your own store* below. |

Every data source also takes \`provider\`, a class extending \`TaskDataProvider\`, to change the provider itself.

### Memory

\`MemoryTaskDatabase\` copies \`records\` and keeps every change; the example above uses one. Creating and deleting pause briefly, as a server would, and opening a task shows an alert. Memory modules that create tasks, such as templates, take the same \`database\`.

### Dataverse

The example's *dataverse.ts* loads the tasks from Dataverse; its parameters are under *Reference* below. *Edit* opens the task's form in a side dialog, or the bulk edit form for several, and the form is told the task is read-only when it is inactive or \`enableEditing\` is off. New tasks are created in their place straight away, with the project lookup filled in when the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module is there. To change how the store works, extend \`DataverseTaskStore\`: its helper methods are \`protected\`.

## Rescheduled dates

After every save, from a cell, a form, a move or a dependency, the provider asks the store what the backend changed through \`synchronize\`, so dates a backend rescheduled show up. \`DataverseTaskStore\` implements it, and it is optional on a store of your own.

## Start from a task

Return \`rootTaskId\` to show only the tasks under one task, such as one project's. It is read at mount: to change it, remount the control with a new \`key\`, as the example does.

{{story: Start from a task}}

## Your own store

Implement \`ITaskStore\`, listed under *Reference* below, and pass it to \`createTaskProvider\`. Throw "Not implemented." from a method your backend does not support.

## Reference

### Dataverse

| Parameter | Description |
|---|---|
| \`fetchXml\` | Required. Selects the tasks. It is a Liquid template over \`project\`, from the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module, and \`hostRecord\`. |
| \`hostRecord\` | \`{ entityName, id?, data? }\`, the record the grid sits on, such as the one the form shows. |
| \`form\` | How tasks open: \`editId\` and \`bulkEditId\` pick the forms, and \`getParameters(operation, defaults)\` changes what \`Xrm.Navigation.navigateTo\` gets. |
| \`getNewTaskDefaults\` | \`(params) => IRawRecord\`, values every new task starts with. |

### Your own store

| Method | Description |
|---|---|
| \`load(provider)\` | Returns \`{ rawData, metadata, columns }\`: every task of the view, the table's metadata, and the columns. |
| \`getAvailableColumns(options?)\`, \`getAvailableRelatedColumns()\` | What *Edit columns* offers. |
| \`createTask(params)\` | Creates the task the grid already shows, from \`{ parentRecord, stackRank, data, taskId }\`. Returns \`{ record }\`, or \`null\` to drop it. |
| \`saveTask(task)\` | Saves what changed on a task, its parent and rank included. |
| \`deleteTasks({ taskIds, tree })\` | Deletes the tasks, deepest first. Returns the ones deleted and the ones that failed, or \`null\` when cancelled. |
| \`openTasks(taskIds)\` | Opens the tasks outside the grid, such as in a form. \`null\` when nothing changed. |
| \`openRelatedRecord(reference, columnName)\` | Opens the record a lookup points to. |
| \`canDeleteTask(task)\` | Optional. \`false\` keeps a task from being deleted. |
| \`synchronize()\` | Optional. Returns \`{ updatedRecords }\`, the tasks the backend changed since the last read. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Views and the tree', iconName: 'BulletedTreeList', href: '?path=/docs/controls-taskgrid-views-and-the-tree--overview', text: 'Views that sort, filter and search the tree, or show a flat list.' },
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'Let the user create, edit, delete and move tasks.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-modules--overview', text: 'Data the tasks carry beside their own columns, kept in the backend you choose.' },
]

const meta = {
    title: 'Controls/TaskGrid/Loading tasks',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}

export const StartFromATask: Story = {
    name: 'Start from a task',
    render: () => renderStory(<RootTaskExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample projects, one at a time; *New* adds a task under the picked project. Try: pick a project.`,
            },
        },
    },
}
