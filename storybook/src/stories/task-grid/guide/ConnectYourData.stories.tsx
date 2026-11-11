import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { DataverseTasksExample, OwnStoreExample, RescheduledDatesExample, StoreCallsExample } from '../../../task-grid/guide/connectYourDataExamples'

const DESCRIPTION = `
A task grid reads and writes its tasks through a *store*, which keeps them wherever you choose: in memory, in Dataverse, in TALXIS or behind an API of your own. On this page you pick a store, map your columns to the tree, and see which calls reach the store while the user works. Try it below: rename a task and watch the calls that reach the store.

{{canvas: Watch the store at work}}

## What reaches the store

The store loads every task of the view at once. Sorting, filtering, searching and expanding the tree then happen in the page, and only what the user changes goes back to the store.

| The user | The store gets |
|---|---|
| Opens the control, or switches the view | \`load()\`, once |
| Sorts, filters, searches, or opens and closes tasks | Nothing |
| Creates a task | \`createTask()\`, while the new row shows as loading |
| Edits a cell, or drags a task | \`saveTask()\` |
| Deletes tasks | \`deleteTasks()\`, the deepest level first |
| Creates, saves or deletes | \`synchronize()\` afterwards, when the store has it: see *Dates the backend changes* below |

\`onLoad\` runs on every mount: when the control opens, when the user picks a view or saves *Edit columns*, and on *Try again*. Return a new store from it each time, and keep the rows themselves, such as a \`MemoryTable\`, outside it. How mounts work is on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

## What onLoad returns

| Key | Required | Description |
|---|---|---|
| \`store\` | Yes | Where the tasks are kept. See the sections below. |
| \`fieldMapping\` | Yes | The columns that make the tree. See *Field mapping* below. |
| \`views\` | No | The views to switch between: see [**Views, tree and editing**](?path=/docs/controls-taskgrid-guide-views-tree-and-editing--overview). Without them, the grid shows the store's columns. |
| \`rootTaskId\` | No | Shows only the tasks under one task, such as a project's. The store has to load that task too. Read at mount: remount the control with a new \`key\` to change it. |
| \`hoursPerDay\` | No | The hours in a day of a task's duration, unless the duration column's metadata says otherwise; \`24\` when left out. |

## Field mapping

| Key | Required | Description |
|---|---|---|
| \`parentId\` | Yes | The lookup to the parent task, empty for a top-level task. A task whose parent is not loaded shows at the top level. |
| \`subject\` | Yes | The task's name, drawn with the tree's indent and chevron, and what quick find searches unless the view names other columns. |
| \`stackRank\` | Yes | The task's place among its siblings, a LexoRank text such as \`0\\|hzzzzz:\`. The grid writes it when a task is created or moved. Rows without one get it from \`StackRank.between(previous?, next?)\`. |
| \`stateCode\` | No, \`'statecode'\` | \`0\` is active; any other value, or none, is inactive, so give every task one. |
| \`percentComplete\` | No | Drawn as a progress bar. |
| \`startDate\`, \`endDate\` | No | The task's dates. The Gantt needs both. |
| \`duration\` | No | Minutes, as a duration column holds them. |

The mapped columns load whether a view lists them or not.

## In memory

\`MemoryTaskStore\` keeps the tasks in a \`MemoryTable\`, a table of plain rows that you create once, outside the control, so it outlives every mount. It takes the \`taskRuntime\`, the \`tasks\` table, the \`metadata\` whose \`PrimaryIdAttribute\` is the table's \`idKey\`, and the \`columns\` that views and *Edit columns* pick from. Creating and deleting pause briefly, as a server would, and opening a task shows an alert. The examples in this guide run on it, and [**Your first task grid**](?path=/docs/controls-taskgrid-guide-your-first-task-grid--overview) sets one up line by line.

## In Dataverse

\`DataverseTaskStore\` reads the tasks through the FetchXML you give it, every page of them, as a Liquid template over \`hostRecord\`, the record the grid sits on, and \`project\`, from the Project module on [**Features**](?path=/docs/controls-taskgrid-guide-features--overview). *Edit* opens a task in its form in a side dialog, or several in the bulk edit form, read-only when the task is inactive or \`enableEditing\` is off. A new task is created in its place straight away, with its parent, its rank and, when the Project module is loaded, its lookup to the project. Its parameters are on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

{{story: Tasks in Dataverse and TALXIS}}

## In TALXIS

TALXIS keeps a project's tasks in \`talxis_projecttask\`, which \`DataverseTaskStore\` loads as any other table, with \`createDataverseProjectModule\` naming the project, as the example's *talxis.ts* shows. The TALXIS variants of the modules know the rest of its tables: see [**Features**](?path=/docs/controls-taskgrid-guide-features--overview).

## Your own API

Implement \`ITaskStore\` over your API and return it from \`onLoad\` as \`store\`. Throw "Not implemented." from a method your backend does not support; every method is on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

{{story: A store over your own API}}

To change one thing a built-in store does, extend it instead: every store is a class, so override a method such as \`createTask\` to give new tasks values of their own, or \`canDeleteTask\` to keep some tasks from being deleted.

## Dates the backend changes

After every save, creation and deletion, the task grid asks the store through \`synchronize()\` which tasks the backend changed on its own, such as dates it rescheduled, and shows them, keeping the user's unsaved edits. \`DataverseTaskStore\` answers with the tasks modified since its last read; on a store of your own, \`synchronize()\` is optional.

{{story: Dates the backend changed}}

## Where next

**Next:** [**Views, tree and editing**](?path=/docs/controls-taskgrid-guide-views-tree-and-editing--overview)
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Connect your data',
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

export const WatchTheStoreAtWork: Story = {
    name: 'Watch the store at work',
    render: () => renderStory(<StoreCallsExample />),
}

export const TasksInDataverseAndTalxis: Story = {
    name: 'Tasks in Dataverse and TALXIS',
    render: () => renderStory(<DataverseTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `The memory plan runs here, while *dataverse.ts* and *talxis.ts* load the same kind of tasks in a model-driven app.`,
            },
        },
    },
}

export const AStoreOverYourOwnApi: Story = {
    name: 'A store over your own API',
    render: () => renderStory(<OwnStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A store over an API of todos, which creates, saves, moves and deletes through it. Try: drag *Publish the release* onto *Write the release notes*.`,
            },
        },
    },
}

export const DatesTheBackendChanged: Story = {
    name: 'Dates the backend changed',
    render: () => renderStory(<RescheduledDatesExample />),
    parameters: {
        docs: {
            description: {
                story: `A backend that keeps a parent due with its last subtask, its changes shown after each save. Try: set the *Due* of *Move in* to 10 April.`,
            },
        },
    },
}
