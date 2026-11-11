import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { HowModulesWorkExample } from '../../../../task-grid/guide/features/howModulesWorkExamples'

const STEP = 'How modules work'

const DESCRIPTION = `
{{block: progress}}

Every feature this stage adds to the plan, from people to holidays, is a module. This step shows where a module goes, where its data is kept and when it loads, so the steps after it read the same way.

{{canvas: How modules work}}

## How it works

This step adds to the plan of [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview) one module in each of the three places a module can go, and a view that shows the new column. In **Code**, the new lines carry \`//new:\`.

**Three homes.** \`TaskDatasetControl\`, \`TaskGrid\` and \`TaskGantt\` each take a \`modules\` array, and a module goes in the one whose part it adds to. The rest of the guide uses the names in the second column.

| A module that | Is a | Goes in | Such as | In the example |
|---|---|---|---|---|
| Adds data the tasks carry, or works on the tasks whatever draws them | Task module | \`TaskDatasetControl\` \`modules\` | Lookup many, dependencies, checklist, custom columns, templates, project, task dragging | The checklist |
| Changes how the grid behaves | Grid module | \`TaskGrid\` \`modules\` | Editing, row selection, sorting, filtering | Filtering |
| Adds a feature to the chart | Gantt module | \`TaskGantt\` \`modules\` | Library, bar dragging, task drawing, task selection, tooltip, markers, non-working days, links | The tooltip |

To place a module, ask what its feature belongs to. A checklist belongs to the task, wherever the task is drawn, so it is a task module; a filter in a column's menu belongs to the grid, and a tooltip on a bar to the chart. A feature that has data and a drawing on the timeline takes one module in each place: the dependencies are a task module and their links a Gantt module, in [**Dependencies and links**](?path=/docs/controls-taskgrid-guide-features-dependencies-and-links--overview), and the project is a task module whose dates the markers, a Gantt module, draw in [**Templates and the project**](?path=/docs/controls-taskgrid-guide-features-templates-and-the-project--overview).

Task and grid modules come from \`@talxis/base-controls\`, Gantt modules from \`@talxis/base-controls/gantt\`.

**Where the data is kept.** A task module with data of its own, such as the checklist items, reads and writes them through a store, and comes in one factory per backend:

| Backend | Factory | Keeps the data in |
|---|---|---|
| Memory | \`createMemory…Module\`, such as \`createMemoryTaskChecklistModule({ items })\` | \`MemoryTable\`s you pass, as every example of this guide does |
| Dataverse | \`createDataverse…Module\` | Tables of your environment, which its parameters name |
| TALXIS | \`createTalxis…Module\` | The TALXIS tables, already mapped |
| Your own | The base factory, such as \`createTaskChecklistModule({ createStore })\` | A store you write over your API, in [**Your own backend**](?path=/docs/controls-taskgrid-guide-your-data-your-own-backend--overview) |

Not every module comes for every backend: the factories of each are under *Task modules* on [**Reference**](?path=/docs/controls-taskgrid-reference--overview). Of the Gantt modules, only the markers and the non-working days keep data, in memory or in a store of your own.

**When modules load.** Modules load on every mount: when the control opens, when the user switches views, and when the user saves *Edit columns*. The task modules load before \`onLoad\` runs, and the values of their columns load once the tasks have, so a module's cells fill in just after the rows. Keep a module's tables outside the component, as the tasks' table is, so that what the user changes survives the next mount.

**Columns from modules.** A task module that adds a column describes it itself. A view shows the column when its \`columns\` name it, and *Edit columns* offers it beside the store's own columns.

| Module | Its columns, by name |
|---|---|
| Checklist | \`TASK_CHECKLIST_COLUMN_NAME\` |
| Dependencies | \`PREDECESSORS_COLUMN_NAME\` and \`SUCCESSORS_COLUMN_NAME\` |
| Lookup many | The names of its \`columns\` |
| Custom columns | Each column's name, ending with \`DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX\` |

## Try it

- Press *Expand one level* twice, then rest the pointer on the bar of *Install the network*: the tooltip, a Gantt module, shows its name, progress and dates.
- Open the menu of the *Task* column, pick *Filter By*, type "paint" and apply: the filtering module, a grid module, keeps *Paint the meeting rooms* and the tasks above it.
- In **Code**, delete \`createMemoryTaskChecklistModule({ items: checklists })\` from \`controlModules\`: the *Checklist* column goes, though the view still names it.

## Remember

- A task module goes in \`TaskDatasetControl\`, a grid module in \`TaskGrid\` and a Gantt module in \`TaskGantt\`.
- A module with data comes for memory, Dataverse, TALXIS or a store of your own; the memory ones read tables you keep.
- Modules load on every mount, and the task modules load before the tasks.
- A module's column shows when a view names it, and *Edit columns* offers it.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Features/How modules work',
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

export const HowModulesWork: Story = {
    name: 'How modules work',
    tags: ['!dev'],
    render: () => renderStory(<HowModulesWorkExample />),
}
