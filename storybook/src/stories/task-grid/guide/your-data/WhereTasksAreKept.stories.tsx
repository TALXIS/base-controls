import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { StoreCallsExample, WhereTasksAreKeptExample } from '../../../../task-grid/guide/your-data/whereTasksAreKeptExamples'

const STEP = 'Where tasks are kept'

const DESCRIPTION = `
{{block: progress}}

So far the plan has lived in memory. This step moves it to where your tasks really live, Dataverse or TALXIS, by changing only what \`onLoad\` returns, and shows exactly what the task grid asks of the store.

{{canvas: Where tasks are kept}}

## How it works

*GridExample.tsx* returns the memory store. *dataverse.ts* and *talxis.ts* load the same plan in a model-driven app, so they do not run on this page: each exports what \`onLoad\` returns, and the modules for \`TaskDatasetControl\`'s \`modules\`. The control and the grid stay as they are, and each module's factory for every backend is under *Task modules* on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

| \`onLoad\` returns | What it is |
|---|---|
| \`store\` | Where the tasks are kept: the table below. |
| \`fieldMapping\` | Which of your columns hold the tree, the dates and the progress. |
| \`views\` | The views to switch between, from [**Views and the tree**](?path=/docs/controls-taskgrid-guide-basics-views-and-the-tree--overview). With \`DataverseTaskStore\`, the columns that load are the view's and the mapped ones. |
| \`rootTaskId\` | The task the tree starts from, also from *Views and the tree*. |
| \`hoursPerDay\` | How many hours one day of \`duration\` holds, \`24\` by default. |

### The stores

| Store | Keeps the tasks | Takes |
|---|---|---|
| \`MemoryTaskStore\` | In a \`MemoryTable\` you keep outside \`onLoad\` | \`taskRuntime\`, \`tasks\`, \`metadata\`, \`columns\` |
| \`DataverseTaskStore\` | In any Dataverse table, read through FetchXML | \`taskRuntime\`, \`fetchXml\`, and optionally \`hostRecord\` and \`form\` |
| \`DataverseTaskStore\` in TALXIS | In \`talxis_projecttask\` | The same, with \`createDataverseProjectModule\` naming the project |
| A store of your own | Behind your API | See [**Your own backend**](?path=/docs/controls-taskgrid-guide-your-data-your-own-backend--overview) |

\`DataverseTaskStore\` runs in a model-driven app, where it reads and writes through the Web API. It loads every task the FetchXML selects at once. *Edit* opens one task in its form in a side dialog and several in the bulk edit form; \`form\` names other forms. A new task is created in its place with its parent and rank, and with its lookup to the project when the project module is loaded.

### Which tasks load

The FetchXML selects which tasks load, through its entity and its filter. With views, the columns come from the view and the field mapping, so it needs no attributes; without views, the grid shows the attributes it lists. It is a Liquid template over two records:

| Write | For | Comes from |
|---|---|---|
| \`{{ hostRecord.id }}\`, \`{{ hostRecord.entityName }}\` | The record the grid sits on, such as the one the form shows | The store's \`hostRecord\` |
| \`{{ hostRecord.<column> }}\` | One of that record's columns | \`hostRecord.data\` |
| \`{{ project.id }}\`, \`{{ project.name }}\`, \`{{ project.entityName }}\` | The project the tasks belong to | The project module, from [**Templates and the project**](?path=/docs/controls-taskgrid-guide-features-templates-and-the-project--overview) |
| \`{{ project.<column> }}\` | One of the project's columns | \`columns\` of \`createDataverseProjectModule\` |

\`hostRecord\` fills in the template and nothing else. Only the project module gives new tasks their lookup, so *dataverse.ts* loads the form's record as the project too.

### The field mapping

\`parentId\`, \`subject\` and \`stackRank\` are required; the rest are there when your table has them.

| Key | Holds | The office plan | Dataverse \`task\` | TALXIS |
|---|---|---|---|---|
| \`parentId\` | The lookup to the parent task, empty at the top | \`parentid\` | \`new_parenttaskid\`, a lookup to task you add | \`talxis_parentprojecttaskid\` |
| \`subject\` | The name, drawn with the chevron | \`subject\` | \`subject\` | \`talxis_name\` |
| \`stackRank\` | The place among its siblings, as text | \`stackrank\` | \`new_stackrank\`, a text column you add | \`talxis_stackrankstring\` |
| \`stateCode\` | \`0\` while the task is active; \`statecode\` when left out | \`statecode\` | \`statecode\` | \`statecode\` |
| \`startDate\`, \`endDate\` | The dates; the timeline needs both | \`start\`, \`due\` | \`scheduledstart\`, \`scheduledend\` | \`talxis_estimatedstartdate\`, \`talxis_estimatedenddate\` |
| \`duration\` | The length in minutes | None | \`scheduleddurationminutes\` | None |
| \`percentComplete\` | The progress, drawn as a bar | \`done\` | \`percentcomplete\` | \`talxis_percentcomplete\` |

### Durations

With \`duration\` mapped, a bar dragged or drawn on the timeline writes the task's length in minutes along with its dates, counting only working days when the non-working days module is loaded. \`hoursPerDay\` says how many hours one day of that length holds: with the default \`24\`, a five-day task holds 7,200 minutes, and with \`hoursPerDay: 8\` it holds 2,400. Either way a duration column and the tooltip show five days; set it to the length of a day in your backend.

## What reaches the store

The store loads every task of the view at once. Sorting, filtering, search and opening the tree then work in the page, and only what the user changes goes back to the store. This example writes down each call under the grid.

{{canvas: What reaches the store}}

| The user | The store gets |
|---|---|
| Opens the control, or switches the view | \`onLoad\` makes a new store, and \`load()\` runs once |
| Sorts, filters, searches, or opens and closes tasks | Nothing |
| Creates a task | \`createTask()\`, while the new row shows as loading |
| Edits a cell, or drags a task | \`saveTask()\`, with the columns that changed |
| Deletes tasks | \`deleteTasks()\`, one level at a time, the deepest first |
| Any of the three above | \`synchronize()\` afterwards, when the store has it |

\`DataverseTaskStore\` answers \`synchronize()\` with the tasks modified since it last read them, so dates that a plugin or a flow changes after a save show at once, while the user's unsaved edits stay.

## Try it

- In the first example's **Code**, change \`subject: 'subject'\` to \`subject: 'owner'\`: the tree draws each task's owner beside the chevron, and *Task* becomes an ordinary column.
- In *What reaches the store*, open *Move to the new office*: nothing reaches the store. Double-click the cell of *Book the movers* beside its name, rename it and press Enter: the log shows \`saveTask\` with \`subject\`, then \`synchronize\`.
- Click the row of *Fit out the space*, so that only it is selected, press *Delete* and confirm: \`deleteTasks\` runs for its three subtasks first, then for the task itself.
- Switch to *By due date*: a new mount runs \`onLoad\` and \`load\`. Search for "plan": nothing reaches the store.

## Remember

- Moving the plan to another backend changes the store, the field mapping and the views that \`onLoad\` returns, and the modules you load.
- The FetchXML selects the tasks over \`hostRecord\` and \`project\`; the view and the field mapping select their columns.
- The store is asked only for what the user changes, and \`synchronize()\` brings back what the backend changed on its own.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Your data/Where tasks are kept',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const WhereTasksAreKept: Story = {
    name: 'Where tasks are kept',
    tags: ['!dev'],
    render: () => renderStory(<WhereTasksAreKeptExample />),
}

export const WhatReachesTheStore: Story = {
    name: 'What reaches the store',
    tags: ['!dev'],
    render: () => renderStory(<StoreCallsExample />),
}
