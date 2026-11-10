import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { KeepTheTasksExample, OwnTasksExample, RootTaskExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
A task grid loads every task of the view at once from a *store*, such as one in memory or a Dataverse table. You hand the control that store together with a field mapping, which names the columns that make the tree: each task's parent and its place among its siblings. Try it below: add a task to \`OFFICE_MOVE\` in **Code**.

{{canvas: Show your own tasks}}

## Load the tasks

\`onLoad\` on \`TaskDatasetControl\` is called on every mount with the task runtime, and the control builds its task provider over the store it returns. Everything else works as on a DatasetControl, errors included: see [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview) and [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

| Key | Required | Description |
|---|---|---|
| \`store\` | Yes | Where the tasks are kept. See *Stores* below. |
| \`fieldMapping\` | Yes | The columns that make the tree. See *Field mapping* below. |
| \`views\` | No | The views to switch between. See [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview). Without them, the grid shows the store's columns. |
| \`rootTaskId\` | No | Shows only the tasks under one task. See *Start from a task* below. |
| \`hoursPerDay\` | No | How many hours a day of a task's duration holds; \`24\` when left out. |

## Field mapping

| Key | Required | Description |
|---|---|---|
| \`parentId\` | Yes | The lookup to the parent task. Empty for a top-level task. |
| \`subject\` | Yes | The task's name. Drawn with the tree's indent and arrow, pinned left, and searched by quick find when the view names no columns. |
| \`stackRank\` | Yes | The task's place among its siblings: a LexoRank string, such as \`0\\|hzzzzz:\`. The grid writes it when a task is created or moved. \`StackRank.between(previous, next)\` makes one. |
| \`stateCode\` | No, \`'statecode'\` | \`0\` is active. See *Inactive tasks* on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). |
| \`percentComplete\` | No | Drawn as a progress bar. |
| \`startDate\`, \`endDate\` | No | The task's dates. The [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview) needs both. |
| \`duration\` | No | Minutes, as a duration column holds them. A day holds \`hoursPerDay\` hours. |

Every other column is an ordinary column of the view.

## Stores

A store reads and writes the tasks for the task provider. Create a new one in every \`onLoad\`, with the task runtime it gets:

| Store | Tasks are kept |
|---|---|
| \`MemoryTaskStore\` | In a \`MemoryTable\` you keep, in the page. For prototypes, tests and these docs. |
| \`DataverseTaskStore\` | In a Dataverse table, read through FetchXML and edited in its forms. TALXIS tasks load with it too. |
| Your own \`ITaskStore\` | Wherever your store reads and writes them. See *Your own store* below. |

### Memory

A \`MemoryTable\` is one table of plain rows that you create and keep, outside the control, so it outlives every mount. Every memory store and memory module reads and writes the tables you give it: tasks, templates, checklists and the rest each have their own. Try it below: keep a copy, delete a few tasks, then load the copy.

{{story: Keep the tasks}}

\`new MemoryTable({ idKey, rows })\` copies the rows in and hands out copies, so no one changes it behind its back. \`dump()\` returns every row as plain data, and \`load(rows)\` replaces them all, so a dump saved as JSON loads back as it was. \`getRow\`, \`filter\`, \`insert\`, \`update\` and \`delete\` read and write single rows, and \`events\` fires \`onChanged\` after each write. A control reads its tables when it loads: after writing one yourself, call \`reload()\` on the control to show it. Pass the same table to two controls and both read the same rows.

\`MemoryTaskStore\` takes the \`taskRuntime\`, the \`tasks\` table, the \`metadata\` whose \`PrimaryIdAttribute\` is the table's \`idKey\`, and the \`columns\` that views and *Edit columns* pick from. Creating and deleting pause briefly, as a server would, and opening a task shows an alert.

### Dataverse

The example's *dataverse.ts* loads the tasks from Dataverse; its parameters are under *Reference* below. *Edit* opens the task's form in a side dialog, or the bulk edit form for several, and the form is told the task is read-only when it is inactive or \`enableEditing\` is off. New tasks are created in their place straight away, with the project lookup filled in when the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module is there. To change how the store works, extend \`DataverseTaskStore\`: its helper methods are \`protected\`.

## Rescheduled dates

After every save, creation and deletion, from a cell, a form, a move, a template or a dependency, the provider asks the store through \`synchronize()\` what the backend changed, and merges those tasks in, keeping the user's unsaved edits, so dates a backend rescheduled show up. \`DataverseTaskStore\` implements it by reading the tasks modified since its last read, and it is optional on a store of your own.

## Start from a task

Return \`rootTaskId\` to show only the tasks under one task, such as one project's. It is read at mount: to change it, remount the control with a new \`key\`, as the example does.

{{story: Start from a task}}

## Your own store

Implement \`ITaskStore\`, listed under *Reference* below, and return it from \`onLoad\` as \`store\`. Throw "Not implemented." from a method your backend does not support.

## Reference

### Dataverse

| Parameter | Description |
|---|---|
| \`taskRuntime\` | Required. The task runtime \`onLoad\` gets. |
| \`fetchXml\` | Required. Selects the tasks. It is a Liquid template over \`project\`, from the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module, and \`hostRecord\`. |
| \`hostRecord\` | \`{ entityName, id?, data? }\`, the record the grid sits on, such as the one the form shows. |
| \`form\` | How tasks open: \`editId\` and \`bulkEditId\` pick the forms, and \`getParameters(operation, defaults)\` changes what \`Xrm.Navigation.navigateTo\` gets. |
| \`getNewTaskDefaults\` | \`(params) => IRawRecord\`, or a promise of one: values every new task starts with; the values it is created with win. |

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

export const KeepTheTasks: Story = {
    name: 'Keep the tasks',
    render: () => renderStory(<KeepTheTasksExample />),
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
