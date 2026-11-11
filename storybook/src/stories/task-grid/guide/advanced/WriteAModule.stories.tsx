import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { GanttModuleExample, GridModuleExample, TaskModuleExample } from '../../../../task-grid/guide/advanced/writeAModuleExamples'

const STEP = 'Write a module'

const DESCRIPTION = `
{{block: progress}}

A feature the team wants in every plan belongs in a module: one object that any task grid loads with a line in its \`modules\`, as the built-in features do. This step writes one module for each of the three homes of [**How modules work**](?path=/docs/controls-taskgrid-guide-features-how-modules-work--overview), each adding one thing to the office move.

{{canvas: A task module}}

## How it works

A module is an object with a \`name\`, unique where it is loaded, and an \`onLoad\` that runs on every mount and gets what the module is loaded into:

| Module | Goes in | \`onLoad\` gets | Named in |
|---|---|---|---|
| A task module | \`TaskDatasetControl\`'s \`modules\` | The DatasetControl, before the tasks load: \`modules.get('taskRuntime')\`, and \`parts.observe(name, …)\` for a part it draws, such as \`grid\` or \`ribbon\` | \`IDatasetControlModuleMap\` of \`@talxis/base-controls\` |
| A grid module | \`TaskGrid\`'s \`modules\` | The grid, before AG Grid exists: its services, such as \`cells\`, \`columns\` and \`provider\` | \`IGridModuleMap\` of \`@talxis/base-controls\` |
| A Gantt module | \`TaskGantt\`'s \`modules\` | The Gantt, before the chart is drawn: \`getTaskRuntime()\`, \`services\`, \`surfaces\` and \`hooks.chartConfig\` | \`IGanttModuleMap\` of \`@talxis/base-controls/gantt\` |

What \`onLoad\` returns is the module's instance, which \`modules.get(name)\` hands to other code. *types.ts* names each module and the type of its instance by augmenting the package, \`void\` when \`onLoad\` returns nothing; it does not run on this page, so it sits in **Code** beside the example. \`priority\`, \`onDestroy\` and the \`signal\` that \`onLoad\` gets are under *Add a module* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview), and the Grid's [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview) has the rest for a grid module.

**The task module above** reaches the grid while \`TaskGrid\` is drawn, with \`datasetControl.parts.observe('grid', …)\`: the callback returns the hook's remover, so the hook goes with the grid. Its \`commands\` hook on the cells adds *Duplicate* to the cell of \`TASK_COMMANDS_COLUMN_KEY\`, the column of a row's **+**, at \`TASK_GRID_PRIORITY.tree + 1\` so that it comes after the **+**; with two commands, the cell draws them as a menu. The copy is made with \`taskRuntime.tasks.create\`, so it needs \`enableCreation\` as **+** does.

## A grid module

{{canvas: A grid module}}

A grid module of a task grid is a grid module like any other: its \`onLoad(grid)\` adds hooks to the grid's services, as on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview). In a task grid, the grid's \`provider\` service is the task provider of [**From your code**](?path=/docs/controls-taskgrid-guide-advanced-from-your-code--overview), tree and all. Here a \`theme\` hook on the cells turns the due date red on any task of *Move to the new office* that ends after 27 March.

## A Gantt module

{{canvas: A Gantt module}}

A Gantt module's \`onLoad(gantt)\` runs on every mount, before the chart is drawn. \`gantt.services.get(key)\` reaches what is there from the start, such as \`taskRuntime\`, \`schedule\` and \`state\`. What comes with the chart, \`chart\`, \`timeline\`, \`dragging\`, \`zooming\`, \`grid\` and \`tasks\`, is reached with \`gantt.services.observe(key, …)\`, or in a component with \`useGanttService(key)\`, which is \`undefined\` until it comes.

\`gantt.surfaces.hooks.surfaces\` draws a component of yours over the chart once the chart is drawn. It is drawn inside the Gantt, so it can call \`useGantt()\`, as \`TaskMenu\` does to show a menu for the bar the user right-clicks.

## Try it

- In *A task module*, open the plan, click the **+** of *Paint the meeting rooms* and pick *Duplicate*: *Paint the meeting rooms (copy)* appears right below it, with the same dates.
- In *A grid module*, open *Move to the new office*, double-click the *Due* of *Book the movers* and pick 30 March: the date turns red. In **Code**, set \`MOVE_DEADLINE\` to \`'2026-03-20'\`: the example starts again, and *Move to the new office* and *Move in* are late.
- In *A Gantt module*, open the plan, right-click the bar of *Install the network* and pick *Show on timeline*: the timeline zooms to it. Right-click it again and pick *Add a subtask*: a new task opens under it, ready for its name.

## Remember

- A module is a \`name\` and an \`onLoad\` that runs on every mount, in the \`modules\` of what it extends.
- A task module reaches the task runtime and the control's parts, a grid module the grid's services, and a Gantt module the chart.
- *types.ts* names each module for TypeScript, and never runs.

You have seen the whole task grid. Every prop, parameter and member is on Reference.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Advanced/Write a module',
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

export const ATaskModule: Story = {
    name: 'A task module',
    tags: ['!dev'],
    render: () => renderStory(<TaskModuleExample />),
}

export const AGridModule: Story = {
    name: 'A grid module',
    tags: ['!dev'],
    render: () => renderStory(<GridModuleExample />),
}

export const AGanttModule: Story = {
    name: 'A Gantt module',
    tags: ['!dev'],
    render: () => renderStory(<GanttModuleExample />),
}
