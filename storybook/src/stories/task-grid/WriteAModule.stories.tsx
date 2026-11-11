import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { DeadlinesModuleExample, RowCommandModuleExample, SettingsFirstModuleExample } from '../../task-grid/examples/writeAModuleExamples'

const DESCRIPTION = `
When the built-in modules do not cover a rule of your business, such as flagging tasks that end after their project's deadline, you write a module of your own. A module is a small object the task grid loads on every mount: a task module works with the tasks and the task runtime, and a grid module changes what the grid draws. Try it below: set the *Due* of *Book the movers* past 20 March.

{{canvas: Flag tasks past their deadline}}

## Two kinds of module

| Kind | Goes in | \`onLoad\` gets | Use it to |
|---|---|---|---|
| Task module | \`TaskDatasetControl\`'s \`modules\` | The mount's DatasetControl, whose \`modules.get('taskRuntime')\` is the task runtime | Load what the tasks need, add columns, commands and toggles, and work with the task provider |
| Grid module | \`TaskGrid\`'s \`modules\` | The \`IGrid\`, whose \`provider\` service is the task provider | Change what the cells draw: their colours, controls and commands |

What every module has, \`name\`, \`priority\`, \`onLoad\` and \`onDestroy\`, is under *Add a module* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview) for a task module, and on the Grid's [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview) for a grid module. A Gantt module is on the Gantt's own [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview).

## A task module

A task module's \`onLoad(datasetControl, { signal })\` runs on every mount before \`onLoad\` on \`TaskDatasetControl\`, so it can load what the tasks need first, as the deadlines do; \`signal\` aborts when the mount goes. What it returns is the module, which other code reaches by its name.

| To | Use |
|---|---|
| Reach the task runtime | \`datasetControl.modules.get('taskRuntime')\` |
| Work with each mount's task provider | \`taskRuntime.services.observe('provider', provider => …)\`, called before the tasks load |
| Add to the grid | \`datasetControl.parts.observe('grid', grid => …)\`, while \`TaskGrid\` is drawn |
| Add commands | \`datasetControl.parts.observe('ribbon', …)\`: see *Add your own commands* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview) |
| Add a toggle | \`datasetControl.parts.observe('taskSettings', …)\`: see *Settings of your own* on [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview) |
| Read another module | \`datasetControl.modules.get(name)\`, for a module of a lower \`priority\` |

What an \`observe\` callback returns runs when that provider or part goes, so return your hook's remover. A module that keeps data takes \`createStore(taskRuntime)\`, as the built-in modules do, and calls it on every mount: the example's deadlines come from memory, and its *dataverse.ts* holds a store that reads them from Dataverse.

## Load before the rest

Every module loads before \`TaskDatasetControl\`'s \`onLoad\`, so \`onLoad\` can read any of them. Modules of one \`priority\` load at the same time, the lower first: the task runtime loads at \`-100\` and the built-in task modules at \`0\`, so a module that other modules or their stores read as they load takes a priority between, such as \`-50\`.

{{story: Load what onLoad needs}}

## A grid module

A grid module for a task grid is a Grid module. Its hooks on \`grid.services.get('cells')\` change each cell's \`theme\`, \`controlParameters\` and \`commands\` (see [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview)). In a task grid, the \`provider\` service is the task provider and \`taskExpansion\` opens and closes tasks. Add hooks at \`TASK_GRID_PRIORITY.tree + 1\` or later to run after the task grid's own.

To hand a grid module what a task module loaded, build it inside the control, where \`useDatasetControlModule(name)\` reads the mount's module, as \`PlanGrid\` in the first example does.

## Commands on every row

The task grid draws a row's commands in the column \`TASK_COMMANDS_COLUMN_KEY\`: with one command, its button, and with more, the first command as a menu of them all. Add yours with the \`commands\` cell hook, from a task module that reaches the grid as a part.

{{story: A command on every row}}

## Type your modules

Add each task module's name to \`IDatasetControlModuleMap\`, and each grid module's to \`IGridModuleMap\`, by augmenting \`@talxis/base-controls\`, as *types.ts* in the first example does: \`modules.get\`, \`modules.find\` and \`useDatasetControlModule\` are then typed. A module whose \`onLoad\` returns nothing is typed \`void\`. The file has to import or export something: see *Share what your module builds* on the Grid's [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview).

## Reference

### The task provider, for modules

These add to each mount's task provider, so call them in \`taskRuntime.services.observe('provider', …)\`. Each returns its remover.

| Member | Description |
|---|---|
| \`hooks.availableColumns.add(hook)\` | Adds columns that views and *Edit columns* can show, such as a column of your module's. |
| \`addColumnHandler(handler)\` | Loads and saves the columns the handler claims in place of the store: \`isHandledColumn(columnName)\`, \`loadValues(taskIds)\` and \`saveValue(record, column, value)\`. |
| \`addColumnMatcher(matcher)\` | Answers filters and quick find for the columns the matcher claims: \`isHandledColumn\`, \`isMatchingCondition\` and \`isMatchingSearch\`. |
| \`addRequiredColumn(column)\` | Loads a column with the tasks, whatever the view shows. |
| \`addLoadWaiter(waiter)\` | Holds the tasks back from the tree until it resolves, such as until a column's values have loaded. |

\`isColumnQueried(columnName)\` says whether the sorting, filtering or quick find reads a column. The task provider's other members are on [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Every decision a grid module can step into.' },
    { title: 'Talking to the task grid', iconName: 'Settings', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'The task runtime, the task provider and their services.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-modules--overview', text: 'The built-in modules, each with its memory, Dataverse and TALXIS variants.' },
]

const meta = {
    title: 'Controls/TaskGrid/Write a module',
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

export const FlagTasksPastTheirDeadline: Story = {
    name: 'Flag tasks past their deadline',
    render: () => renderStory(<DeadlinesModuleExample />),
}

export const LoadWhatOnLoadNeeds: Story = {
    name: 'Load what onLoad needs',
    render: () => renderStory(<SettingsFirstModuleExample />),
    parameters: {
        docs: {
            description: {
                story: `A module that loads the plan's settings before the tasks, which \`onLoad\` reads. Try: set \`rootTaskId\` to \`'party'\` in \`PLAN_SETTINGS\`.`,
            },
        },
    },
}

export const ACommandOnEveryRow: Story = {
    name: 'A command on every row',
    render: () => renderStory(<RowCommandModuleExample />),
    parameters: {
        docs: {
            description: {
                story: `*Duplicate* in the menu of every active task's **+**. Try: open the **+** of *Paint the meeting rooms* and pick *Duplicate*.`,
            },
        },
    },
}
