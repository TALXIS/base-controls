import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GanttModuleExample, GridModuleExample, PlanToolbarExample, RibbonCommandsExample, TaskModuleExample } from '../../../task-grid/guide/FromYourCodeExamples'

const DESCRIPTION = `
At the end of this step your own code works the task grid: buttons and ribbon commands that create, move and complete tasks, and modules that bring your business rules to the tasks, the grid and the Gantt. All of it goes through the task runtime, which acts on tasks as the user's commands do, behind the same loading overlay and with the same error dialogs. Try it below: select a task, click **Add a review**, then delete the review with **Delete**.

{{canvas: A toolbar of your own}}

## The task runtime

Every mount of a \`TaskDatasetControl\` has a task runtime of its own, so reach the current one where your code runs:

| Your code runs | Reach it with |
|---|---|
| In a component inside the control | \`useTaskRuntime()\`, as the toolbar above does |
| Outside the control | \`onSetup\` on \`TaskDatasetControl\`, which hands you each mount's DatasetControl: \`control.modules.observe('taskRuntime', …)\` |
| In a task module | \`datasetControl.modules.get('taskRuntime')\` |
| In a Gantt module | \`gantt.getTaskRuntime()\` |

Its \`tasks\` make the changes the user makes, through the store:

| Member | Does |
|---|---|
| \`create(parentId?, { position?, data? })\` | Creates a task under \`parentId\`, at \`'first'\`, \`'last'\` or \`{ before: siblingId }\`, with the column values in \`data\`. Resolves the task, or \`null\` when it was not created |
| \`open(taskIds)\` | Opens the tasks outside the grid, such as in their form |
| \`move(taskId, targetTaskId, position)\` | Moves a task \`'above'\` or \`'below'\` another, or makes it the first \`'child'\` of it, and saves it. Resolves \`null\` when it cannot go there |
| \`delete(taskIds)\` | Asks the user, then deletes the tasks with their subtasks |

Each runs behind the loading overlay and shows its failure in a dialog before it rejects; \`create\` shows the wait on the new row instead, and resolves \`null\` on a failure. To change a value, set it on the task's record and save it. Work of your own runs the same way through \`taskRuntime.execute(operation, parameters?)\`, as *Mark done* does; its parameters, and the runtime's \`lifecycle\`, are on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

\`getProvider()\` returns the task provider, the tasks and their tree. Its \`taskEvents\` report every change, whoever made it: \`onTasksCreated\`, \`onTasksDeleted\`, \`onTaskMoved\`, \`onTasksUpdated\` for values your backend changed, \`onEditorClosed\` and \`onTreeChanged\`. Each \`addEventListener\` returns its remover.

## Ribbon commands of your own

\`TaskDatasetControl.Ribbon\` draws *New*, *Edit* and *Delete*, then the commands you add with the ribbon's \`hooks.commands\`, as under *Add your own commands* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview). A command shows the error its \`onExecute\` throws, and a task action has shown its own already, so wrap \`move\`, \`open\` and \`delete\` in a \`runQuietly\` of your own, as the example does.

{{story: Ribbon commands of your own}}

To change how the ribbon draws an item, such as turning *Delete* off for projects, add a hook to \`taskRuntime.hooks.ribbonCommandUi\`: it gets each item just before the ribbon draws it.

## A task module

A task module goes in \`TaskDatasetControl\`'s \`modules\` and works with the tasks, whatever draws them. Its \`onLoad(datasetControl, { signal })\` runs on every mount before the tasks load, and what it returns is the module, which other code reaches by its \`name\`. It reaches the task runtime with \`datasetControl.modules.get('taskRuntime')\`, and a part of the control, such as \`grid\`, \`ribbon\` or \`taskSettings\`, with \`datasetControl.parts.observe(name, …)\`: return the remover of what you add there, so it goes with the part. What \`name\`, \`priority\`, \`onLoad\` and \`onDestroy\` mean for every module is under *Add a module* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

{{story: A task module}}

## A grid module

A grid module goes in \`TaskGrid\`'s \`modules\` and changes what the grid draws. Its \`onLoad(grid)\` gets the \`IGrid\`, whose \`provider\` service is the task provider, and the hooks on \`grid.services.get('cells')\` change each cell's \`theme\`, \`controlParameters\`, \`commands\` and \`loading\`, as on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview). Add them at \`TASK_GRID_PRIORITY.tree + 1\` to run after the task grid's own.

{{story: A grid module}}

## A Gantt module

A Gantt module goes in \`TaskGantt\`'s \`modules\`. Its \`onLoad(gantt)\` runs on every mount before the chart is drawn. \`gantt.services.get(key)\` reaches what is there from the start, such as \`schedule\` and \`taskRuntime\`; what comes with the chart, such as \`tasks\`, \`zooming\`, \`timeline\` and \`chart\`, DHTMLX's own instance, is reached with \`gantt.services.observe(key, …)\`, or with \`gantt.services.get(key)\` once the chart is drawn. \`gantt.surfaces.hooks.surfaces\` draws a component of yours over the chart, where \`useGantt()\`, \`useGanttService(key)\` and \`useGanttModule(name)\` read the Gantt. Colours, class names and DHTMLX templates are on [**Make it yours**](?path=/docs/controls-taskgrid-guide-make-it-yours--overview).

{{story: A Gantt module}}

Name each module, and what its \`onLoad\` returns, in \`IDatasetControlModuleMap\`, \`IGridModuleMap\` or \`IGanttModuleMap\` by augmenting the package, as *types.ts* in each example does, so \`modules.get(name)\` is typed.

## Where next

**Next:** [**Reference**](?path=/docs/controls-taskgrid-reference--overview), for every prop, module parameter and runtime member.
`

const meta = {
    title: 'Controls/TaskGrid/Guide/From your code',
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

export const AToolbarOfYourOwn: Story = {
    name: 'A toolbar of your own',
    render: () => renderStory(<PlanToolbarExample />),
}

export const RibbonCommandsOfYourOwn: Story = {
    name: 'Ribbon commands of your own',
    render: () => renderStory(<RibbonCommandsExample />),
    parameters: {
        docs: {
            description: {
                story: `Commands that insert a task above the selected one and move it among its siblings. Try: select *Install the network* and click **Move up**.`,
            },
        },
    },
}

export const ATaskModule: Story = {
    name: 'A task module',
    render: () => renderStory(<TaskModuleExample />),
    parameters: {
        docs: {
            description: {
                story: `A module that adds *Duplicate* to the row commands of every active task. Try: open the **+** of *Paint the meeting rooms* and pick *Duplicate*.`,
            },
        },
    },
}

export const AGridModule: Story = {
    name: 'A grid module',
    render: () => renderStory(<GridModuleExample />),
    parameters: {
        docs: {
            description: {
                story: `A module that tints a due date past its project's deadline. Try: set the *Due* of *Book the movers* to 24 March.`,
            },
        },
    },
}

export const AGanttModule: Story = {
    name: 'A Gantt module',
    render: () => renderStory(<GanttModuleExample />),
    parameters: {
        docs: {
            description: {
                story: `A module that draws a menu for the bar the user right-clicks. Try: right-click a bar and pick *Show on timeline*.`,
            },
        },
    },
}
