import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ExtendAStoreExample, KeepTheTasksExample, OwnStoreExample, OwnTasksExample, RankRowsExample, RescheduledDatesExample, RootTaskExample } from '../../task-grid/examples/loadingTasksExamples'

const DESCRIPTION = `
A task grid loads every task of the view at once from a *store*, which keeps the tasks wherever you choose: in memory, in a Dataverse table, in TALXIS, or behind an API of your own. You hand the control that store with a *field mapping*, which names the columns that make the tree: each task's parent and its place among its siblings. Try it below: add a task to \`OFFICE_MOVE\` in **Code**.

{{canvas: Show your own tasks}}

## Load the tasks

\`onLoad\` on \`TaskDatasetControl\` gets the task runtime on every mount and returns:

| Key | Required | Description |
|---|---|---|
| \`store\` | Yes | Where the tasks are kept. See *Stores* below. |
| \`fieldMapping\` | Yes | The columns that make the tree. See *Field mapping* below. |
| \`views\` | No | The views to switch between: see [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview). Without them, the grid shows the store's columns. |
| \`rootTaskId\` | No | Shows only the tasks under one task. See *Start from a task* below. |
| \`hoursPerDay\` | No | How many hours a day of a task's duration holds, unless the duration column's metadata says otherwise; \`24\` when left out. |

A failed load shows as on a DatasetControl: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview). The example's *dataverse.ts* and *talxis.ts* load the same kind of tasks from Dataverse and TALXIS; they do not run on this page.

## Field mapping

| Key | Required | Description |
|---|---|---|
| \`parentId\` | Yes | The lookup to the parent task, empty for a top-level task. A task whose parent is not loaded shows at the top level. |
| \`subject\` | Yes | The task's name. Drawn with the tree's indent and chevron, pinned left, and searched by quick find while a view sets no quick find columns of its own. |
| \`stackRank\` | Yes | The task's place among its siblings: a LexoRank text, such as \`0\\|hzzzzz:\`. The grid writes it when a task is created or moved. |
| \`stateCode\` | No, \`'statecode'\` | \`0\` is active; any other value, or none, is inactive, so give every task one. See *Inactive tasks* on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). |
| \`percentComplete\` | No | Drawn as a progress bar. |
| \`startDate\`, \`endDate\` | No | The task's dates. The [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview) needs both. |
| \`duration\` | No | Minutes, as a duration column holds them. A day holds \`hoursPerDay\` hours. |

The mapped columns load whether a view lists them or not. Every other column is an ordinary column of the view.

## Rank your own rows

Rows that come without a rank, such as from a spreadsheet, get one from \`StackRank.between(previous?, next?)\`: a rank between two neighbours, just after \`previous\` or just before \`next\` when there is only one, or in the middle when there is neither.

{{story: Rank rows that have none}}

## Stores

A store reads and writes the tasks for the task provider. Create a new one in every \`onLoad\`, with the task runtime it gets.

| Backend | Store | Tasks are kept |
|---|---|---|
| Memory | \`MemoryTaskStore\` | In a \`MemoryTable\` you keep, in the page: for prototypes, tests and these docs. See *Memory* below. |
| Dataverse | \`DataverseTaskStore\` | In a Dataverse table, read through FetchXML and opened in its forms. See *Dataverse and TALXIS* below. |
| TALXIS | \`DataverseTaskStore\` | In \`talxis_projecttask\`, as the example's *talxis.ts* shows. |
| Your own | Your \`ITaskStore\` | Wherever your API keeps them. See *A store of your own* below. |

The modules keep their data in the same backends: see [**Modules**](?path=/docs/controls-taskgrid-modules--overview).

## Memory

A \`MemoryTable\` is one table of plain rows that you create and keep, outside the control, so it outlives every mount. Every memory store and memory module reads and writes the tables you give it: tasks, templates, checklists and the rest each have their own. \`MemoryTaskStore\` takes the \`taskRuntime\`, the \`tasks\` table, the \`metadata\` whose \`PrimaryIdAttribute\` is the table's \`idKey\`, and the \`columns\` that views and *Edit columns* pick from. Creating and deleting pause briefly, as a server would, and opening a task shows an alert.

{{story: Keep the tasks}}

| Member | Description |
|---|---|
| \`new MemoryTable({ idKey, rows? })\` | A table whose rows are found by their \`idKey\` column, starting with copies of \`rows\`. |
| \`getRows(predicate?)\` | Copies of every row, or of the rows \`predicate\` keeps, as plain data. |
| \`getRow(id)\` | A copy of one row, or \`undefined\`. |
| \`insert(rows)\` | Adds copies of the rows, replacing any with the same id. |
| \`update(id, values)\` | Merges \`values\` into a row. Does nothing when there is no such row. |
| \`delete(ids)\` | Removes the rows. |

Rows from \`getRows()\` saved as JSON start a new table as it was: give the control the new table and mount it anew, as the example does. A control reads its tables when it loads, so after writing to one yourself, call \`reload()\` on the DatasetControl that \`onSetup\` hands you. Two controls given the same table read the same rows.

## Dataverse and TALXIS

\`DataverseTaskStore\` reads the tasks through the FetchXML you give it, every page of them, as a Liquid template over \`hostRecord\`, the record the grid sits on, and \`project\`, from the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module. Its parameters are under *Reference* below.

*Edit* opens the task's form in a side dialog, or the bulk edit form for several, and the form is told the task is read-only when it is inactive or \`enableEditing\` is off. A new task is created in its place straight away, with its parent and rank, and with the lookup to the project when the Project module is loaded: the task's lookup to the project's table, or, when it has several, the one the FetchXML filters by the project's id. TALXIS tasks load with the same store over \`talxis_projecttask\`, and the TALXIS variants of the modules know the rest of its tables.

## Change what a store does

Every store is a class: extend it and override a method, such as \`createTask\` to give new tasks values of their own, or \`canDeleteTask\` to keep some (see *Deleting tasks* on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview)). \`DataverseTaskStore\` keeps its helpers \`protected\` for this, as the example's *dataverse.ts* shows.

{{story: Give new tasks values of their own}}

## A store of your own

Implement \`ITaskStore\`, listed under *Reference* below, and return it from \`onLoad\` as \`store\`. Throw "Not implemented." from a method your backend does not support.

{{story: A store of your own}}

## Rescheduled dates

After every save, creation and deletion, from a cell, a form, a move, a template or a dependency, the task provider asks the store through \`synchronize()\` what the backend changed, and merges those tasks in, keeping the user's unsaved edits, so dates a backend rescheduled show up. \`DataverseTaskStore\` answers with the tasks modified since its last read; on a store of your own, \`synchronize()\` is optional.

{{story: Dates the backend changed}}

## Start from a task

Return \`rootTaskId\` to show only the tasks under one task, such as one project's. The store has to load that task too, not only the tasks under it: without it, the tree is empty and *New* has no parent to create under. It is read at mount: to change it, remount the control with a new \`key\`, as the example does.

{{story: Start from a task}}

## Reference

### Dataverse

| Parameter | Description |
|---|---|
| \`taskRuntime\` | Required. The task runtime \`onLoad\` gets. |
| \`fetchXml\` | Required. Selects the tasks. A Liquid template over \`project\`, from the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module, and \`hostRecord\`. |
| \`hostRecord\` | \`{ entityName, id?, data? }\`: the record the grid sits on, such as the one the form shows. |
| \`form\` | How tasks open: \`editId\` and \`bulkEditId\` pick the forms, and \`getParameters(operation, defaults)\` changes what \`Xrm.Navigation.navigateTo\` gets. |

### ITaskStore

| Method | Description |
|---|---|
| \`load(provider)\` | Returns \`{ rawData, metadata, columns }\`: every task of the view, the table's metadata with its \`PrimaryIdAttribute\`, and the columns. |
| \`getAvailableColumns(options?)\`, \`getAvailableRelatedColumns()\` | What views and *Edit columns* can show. |
| \`createTask(parameters)\` | Creates the task the grid already shows, from \`{ parentRecord, stackRank, data, taskId }\`. Returns \`{ record }\` as the backend saved it, or \`null\` to drop it. |
| \`saveTask(task)\` | Saves what changed on a task, its parent and rank included. |
| \`deleteTasks({ taskIds, tree })\` | Deletes the tasks, called level by level, the deepest first. Returns the ones deleted and the ones that failed, or \`null\` when cancelled. |
| \`openTasks(taskIds)\` | Opens the tasks outside the grid, such as in a form. Returns \`null\` when nothing changed. |
| \`openRelatedRecord(reference, columnName)\` | Opens the record a lookup points to. |
| \`canDeleteTask(task)\` | Optional. \`false\` keeps a task, and every task above it, from being deleted. |
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

export const RankRowsThatHaveNone: Story = {
    name: 'Rank rows that have none',
    render: () => renderStory(<RankRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `Rows from a spreadsheet, ranked in the order they come. Try: move the *Book the bus* row above *Pick the venue* in \`IMPORTED\`.`,
            },
        },
    },
}

export const KeepTheTasks: Story = {
    name: 'Keep the tasks',
    render: () => renderStory(<KeepTheTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `The tasks table kept outside the control, copied as JSON and loaded again. Try: keep a copy, delete a few tasks, then load the copy.`,
            },
        },
    },
}

export const GiveNewTasksValuesOfTheirOwn: Story = {
    name: 'Give new tasks values of their own',
    render: () => renderStory(<ExtendAStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A memory store whose new tasks start with an owner and a due date a week out. Try: click **New** and watch the row fill in.`,
            },
        },
    },
}

export const AStoreOfYourOwn: Story = {
    name: 'A store of your own',
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
                story: `A backend that keeps a parent due with its last subtask, its changes merged in after each save. Try: set the *Due* of *Move in* to 10 April.`,
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
                story: `The sample projects, one at a time; *New* adds a task under the picked project. Try: pick a project.`,
            },
        },
    },
}
