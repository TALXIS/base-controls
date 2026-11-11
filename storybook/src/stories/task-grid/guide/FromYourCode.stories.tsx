import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { GuideNavigation } from '../../../task-grid/guide/GuideSteps'
import { GanttModuleExample, GridModuleExample, PlanToolbarExample, RibbonCommandsExample, TaskModuleExample } from '../../../task-grid/guide/FromYourCodeExamples'

const DESCRIPTION = `
Do from your code what the user does, and add features of your own as modules.

## The task runtime

Your code works the task grid through the task runtime, which makes the changes the user makes, behind the same loading overlay and with the same error dialogs. Every mount has one of its own, so reach the current one where your code runs:

| Your code runs | Reach it with |
|---|---|
| In a component inside the control | \`useTaskRuntime()\`, as the toolbar below does |
| Outside the control | \`onSetup\` on \`TaskDatasetControl\`: \`control.modules.observe('taskRuntime', …)\` |
| In a task module | \`datasetControl.modules.get('taskRuntime')\` |
| In a Gantt module | \`gantt.getTaskRuntime()\` |

Its \`tasks\` create, open, move and delete tasks, and \`getProvider().taskEvents\` report every change, whoever made it; every member is on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

Try: select a task, click **Add a review**, then delete the review with **Delete**.

{{story: The task runtime}}

## Ribbon commands of your own

\`TaskDatasetControl.Ribbon\` draws *New*, *Edit* and *Delete*, then the commands you add with the ribbon's \`hooks.commands\`, as on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview). A task action shows its own error dialog before it rejects, so wrap \`move\`, \`open\` and \`delete\` in a \`runQuietly\` of your own, as the example does.

To change how the ribbon draws an item, such as turning *Delete* off for projects, add a hook to \`taskRuntime.hooks.ribbonCommandUi\`.

Try: select *Install the network* and click **Move up**.

{{story: Ribbon commands of your own}}

## A task module

A task module goes in \`TaskDatasetControl\`'s \`modules\` and works with the tasks, whatever draws them. Its \`onLoad(datasetControl, { signal })\` runs on every mount before the tasks load, and reaches a part of the control, such as \`grid\` or \`ribbon\`, with \`datasetControl.parts.observe(name, …)\`: return the remover of what you add there. What every module's members mean is under *Add a module* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

Name each module in \`IDatasetControlModuleMap\`, \`IGridModuleMap\` or \`IGanttModuleMap\` by augmenting the package, as *types.ts* does, so \`modules.get(name)\` is typed.

Try: open the **+** of *Paint the meeting rooms* and pick *Duplicate*.

{{story: A task module}}

## A grid module

A grid module goes in \`TaskGrid\`'s \`modules\` and changes what the grid draws. Its \`onLoad(grid)\` gets the grid, whose \`provider\` service is the task provider, and the hooks on \`grid.services.get('cells')\` change each cell, as on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview). Add them at \`TASK_GRID_PRIORITY.tree + 1\` to run after the task grid's own.

A module that tints a due date past its project's deadline. Try: set the *Due* of *Book the movers* to 24 March.

{{story: A grid module}}

## A Gantt module

A Gantt module goes in \`TaskGantt\`'s \`modules\`, and its \`onLoad(gantt)\` runs on every mount before the chart is drawn. \`gantt.services.get(key)\` reaches what is there from the start, such as \`taskRuntime\`; what comes with the chart, such as \`tasks\`, \`zooming\` and \`chart\`, is reached with \`gantt.services.observe(key, …)\`. \`gantt.surfaces.hooks.surfaces\` draws a component of yours over the chart.

Try: right-click a bar and pick *Show on timeline*.

{{story: A Gantt module}}

## Where next

{{block: explore}}

{{block: navigation}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Reference', iconName: 'Table', href: '?path=/docs/controls-taskgrid-reference--overview', text: 'Every prop, module parameter and runtime member.' },
    { title: 'TaskGrid', iconName: 'Timeline', href: '?path=/docs/controls-taskgrid-overview--overview', text: 'What a task grid is made of, and every slot.' },
]

const meta = {
    title: 'Controls/TaskGrid/Guide/From your code',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { navigation: () => <GuideNavigation current='From your code' />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TheTaskRuntime: Story = {
    name: 'The task runtime',
    tags: ['!dev'],
    render: () => renderStory(<PlanToolbarExample />),
}

export const RibbonCommandsOfYourOwn: Story = {
    name: 'Ribbon commands of your own',
    tags: ['!dev'],
    render: () => renderStory(<RibbonCommandsExample />),
}

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
