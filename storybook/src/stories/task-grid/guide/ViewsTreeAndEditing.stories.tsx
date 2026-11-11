import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { PlanTheTasksExample, TaskViewsExample } from '../../../task-grid/guide/viewsTreeAndEditingExamples'

const DESCRIPTION = `
Views decide how the user looks at the tasks, such as sorted by start date, searched for a word or as a flat list, and the \`enable…\` props decide what the user may change. On this page you give your task grid views, deal with inactive tasks, and let the user create, edit, move and delete tasks. Try it below: open the *Design work* view.

{{canvas: Switch between task views}}

## Views

\`onLoad\` returns the views with the store, and \`DatasetControl.ViewSwitcher\` offers them. A task view is an \`ITaskGridView\`: its \`resolve(provider)\` sets the task provider up as the view opens, with \`setSorting\`, \`setFiltering\`, \`setSearchQuery\` and \`setQuickFindColumns\`, and returns the columns to show. Returning \`data: { isFlatList: true }\` starts the view as a flat list. How views work in general is on [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

A view lists only the columns it shows, as the mapped columns load anyway. With a user queries module, a view the user saves keeps its sorting, filters, search and whether it is a flat list: see [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview).

## Tree and flat list

In the tree, sorting orders the subtasks under each parent, and without a sort the tasks keep their stack rank order. A filter or a search keeps the ancestors of each match, in italics where they do not match themselves.

A flat list shows the matching tasks on their own, without their ancestors. It follows the view's sorting, and keeps the tree's order when the view has none. Tasks cannot be dragged in it, and the column of **+** buttons is hidden. The user switches it with *Show hierarchy* in \`TaskDatasetControl.Settings\`, which adds a *Path* column listing each task's ancestors; a view that starts as a flat list shows the path when its columns list \`PATH_COLUMN_NAME\`, as *Every task on its own* does.

Which tasks are open and whether the list is flat are kept per view, and across mounts with a \`stateKey\` on \`TaskDatasetControl\`: see [**State**](?path=/docs/controls-datasetcontrol-state--overview).

## Inactive tasks

A task whose \`stateCode\` column is not \`0\`, or is empty, is inactive: it is read-only, cannot be dragged and gets no **+**. *Hide inactive tasks* in the settings hides it, unless an active task is under it. A view that filters on the state code as the toggle does, such as *Open tasks* above, starts with them hidden.

## What the user can do

Three props, each \`false\` by default and read at mount, turn on what the user may do, and two modules add editing in the cells and dragging.

| To | Turn on | The user |
|---|---|---|
| Create a task | \`enableCreation\` | Clicks *New* in the ribbon for a top-level task, or the **+** on an active task's row for a subtask. |
| Edit a task in its form | \`enableEditing\` | Selects tasks and clicks *Edit*. Clicking a subject opens its task either way. |
| Edit cells | \`enableEditing\`, and \`createTaskEditingModule()\` in \`TaskGrid\` | Double-clicks a cell; every edit saves on its own. |
| Move a task | \`enableEditing\`, and \`createTaskDraggingModule()\` in \`TaskDatasetControl\` | Drags its row. |
| Delete tasks | \`enableDeletion\` | Selects tasks, clicks *Delete* and confirms. |

*Edit* and *Delete* act on the selection, so add \`createRowSelectionModule()\` to \`TaskGrid\` (see [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview)). How a cell edits is on [**Editing**](?path=/docs/controls-grid-modules-editing--overview).

{{story: Let the user plan}}

## Creating

A new task shows at once, its row loading until the store has created it, and is named *(No Name)*. It goes first among its siblings, or last with \`defaultCreatePosition='last'\`, and its parent opens to show it. With cell editing on, its subject opens for typing, unless the user is already typing somewhere else. When the store fails, the row goes and a dialog says why.

The Templates module on [**Features**](?path=/docs/controls-taskgrid-guide-features--overview) adds *From template* to *New* and to the **+**. To change *(No Name)*, see [**Localization**](?path=/docs/concepts-localization--overview).

## Editing and moving

*Edit* opens the selected tasks through the store, such as in their Dataverse form, and the grid shows what the form saved once it closes. A dragged row lands at the level its distance from the left suggests; held over an active task for a moment, it becomes a subtask, and held over a closed parent a little longer, the parent opens. Rows can be dragged while the tree is shown, the view sorts by nothing but the stack rank, and no cell is being edited.

## Deleting

*Delete* asks first, then deletes the tasks with all their subtasks, the deepest first. A store keeps a task with \`canDeleteTask\`, as the example's does: that task and every task above it stay, and a dialog lists them.

## Where next

**Next:** [**Features**](?path=/docs/controls-taskgrid-guide-features--overview)
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Views, tree and editing',
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

export const SwitchBetweenTaskViews: Story = {
    name: 'Switch between task views',
    render: () => renderStory(<TaskViewsExample />),
}

export const LetTheUserPlan: Story = {
    name: 'Let the user plan',
    render: () => renderStory(<PlanTheTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `Every change allowed, new tasks last, and completed tasks kept from deletion. Try: select *Website Redesign* and click **Delete**.`,
            },
        },
    },
}
