import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { InactiveTasksExample, KeepFinishedTasksExample, NewTaskExample, PlanTheTasksExample, StoreFailureExample, TaskEventsExample } from '../../task-grid/examples/workingWithTasksExamples'

const DESCRIPTION = `
A task grid lets the user add, rename, move and delete tasks where they are: from the ribbon, the **+** at the start of a row, the cells, and by dragging rows. Each of these is off until you turn it on, and every change is saved through the store (see [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview)). Try it below: drag a task under another.

{{canvas: Plan the tasks}}

## What the user can do

Three props turn on what the user may do with tasks, and two modules add editing in place and moving by dragging. The props are under *Reference* below.

| To | Turn on | The user |
|---|---|---|
| Create a task | \`enableCreation\` | clicks *New* in the ribbon for a top-level task, or the **+** at the start of an active task's row for a subtask |
| Edit a task in its form | \`enableEditing\` | selects tasks and clicks *Edit*; clicking a subject opens its task either way |
| Edit cells in place | \`enableEditing\` and \`createTaskEditingModule()\` in \`TaskGrid\` | double-clicks a cell; every edit saves straight away |
| Delete tasks | \`enableDeletion\` | selects tasks and clicks *Delete*, then confirms |
| Move a task | \`enableEditing\` and \`createTaskDraggingModule()\` in \`TaskDatasetControl\` | drags its row |

*Edit* and *Delete* act on the selection, so add \`createRowSelectionModule()\` to \`TaskGrid\` (see [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview)). Without \`enableEditing\`, every task is locked; how a cell edits is on [**Editing**](?path=/docs/controls-grid-modules-editing--overview).

## Creating tasks

*New* creates a top-level task, or one under the root when \`onLoad\` returned a \`rootTaskId\`, and a row's **+** a subtask, its parent opening to show it. A new task shows straight away, its row loading until the store has created it, and is named *(No Name)* until the user names it. It goes first among its siblings, or last with \`defaultCreatePosition='last'\`; your code can also put it right before a sibling (see [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview)).

With \`enableEditing\` and \`createTaskEditingModule()\`, the newest task opens its subject for typing, with *(No Name)* selected, unless the user is already typing in another cell or in a field outside the grid.

{{story: Name a new task}}

The [**Templates**](?path=/docs/controls-taskgrid-modules-templates--overview) module adds *From template* to *New* and to the **+**. To change *(No Name)*, see [**Localization**](?path=/docs/concepts-localization--overview).

## Editing tasks

*Edit* opens the selected tasks outside the grid through the store, such as in their Dataverse form (see *Dataverse and TALXIS* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview)), and when the form closes, the grid shows what it saved. In the cells, with \`createTaskEditingModule()\` in \`TaskGrid\`'s \`modules\`, every edit saves on its own, with no *Save* to press.

## Deleting tasks

*Delete* asks first, then deletes the tasks with every subtask, the deepest first. A store keeps a task from being deleted with \`canDeleteTask\`: that task and every task above it stay, and a dialog lists the tasks that could not be deleted.

{{story: Keep finished tasks}}

## Inactive tasks

A task whose \`stateCode\` column is not \`0\`, or is empty, is inactive. It stays read-only, cannot be dragged and gets no **+**. *Hide inactive tasks* in \`TaskDatasetControl.Settings\` hides it, unless an active task is under it, and a view starts with them hidden when it filters on the state code as the toggle does.

{{story: Inactive tasks}}

## Dragging

A row dropped between two rows lands at the level its distance from the left suggests. Held over an active task for a moment, it becomes a subtask, and held over a closed parent a little longer, the parent opens. The new parent and rank are saved through the store.

Rows can be dragged while the tree is shown, the tasks are sorted by nothing but their stack rank, and no cell is being edited. \`createTaskDraggingModule()\` goes in \`TaskDatasetControl\`'s \`modules\` and takes no options; follow the moves with \`onTaskMoved\` under *Events*.

## Events

The task provider's \`taskEvents\` follow every change, whichever way it was made. Every mount builds a new provider, so subscribe in \`onLoad\` through \`taskRuntime.services.observe('provider', …)\`, as the example does.

| Event | Fires |
|---|---|
| \`onTasksCreated(records, parentId?)\` | When new tasks join the tree, with the parent they went under; a task from *New* or **+** joins before the store has created it. |
| \`onTasksDeleted(taskIds)\` | After tasks are deleted, and when the store drops or fails to create a new task. |
| \`onTaskMoved({ movingRecord, targetRecord, position, parentRecord, stackRank })\` | When a task is moved, before it saves, with \`position\` \`'above'\`, \`'below'\` or \`'child'\`. |
| \`onTasksUpdated(records)\` | After tasks take new values in place, such as what a form, the backend or a newly created task brought. |
| \`onEditorClosed(taskIds)\` | After the form the tasks were opened in closes. |

{{story: Follow every change}}

## When something fails

Every task action runs through the task runtime's \`execute\`: behind the loading overlay, its failure shown in a dialog (see *Run actions* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview)). A new task is the exception: its own row shows the wait, and when the store throws, the row goes and the dialog says why. A store that returns \`null\` from \`createTask\` drops the task without a dialog.

{{story: When the store fails}}

## Reference

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`enableCreation\` | \`boolean\` | \`false\` | At mount | *New* in the ribbon, and the **+** on each active task's row. |
| \`enableEditing\` | \`boolean\` | \`false\` | At mount | *Edit* for the selected tasks, editing in the cells and on the timeline, and dragging. Without it, forms open read-only. |
| \`enableDeletion\` | \`boolean\` | \`false\` | At mount | *Delete* for the selected tasks. |
| \`defaultCreatePosition\` | \`'first' \\| 'last'\` | \`'first'\` | At mount | Where among its siblings a new task goes when the call names no place of its own. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Talking to the task grid', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'Create, open, move and delete tasks from your code.' },
    { title: 'Templates', iconName: 'Copy', href: '?path=/docs/controls-taskgrid-modules-templates--overview', text: 'Create a task and its subtasks from a template in one go.' },
    { title: 'Editing on the timeline', iconName: 'Timeline', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, draw new tasks and missing dates, and select tasks on the Gantt.' },
]

const meta = {
    title: 'Controls/TaskGrid/Working with tasks',
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

export const PlanTheTasks: Story = {
    name: 'Plan the tasks',
    render: () => renderStory(<PlanTheTasksExample />),
}

export const NameANewTask: Story = {
    name: 'Name a new task',
    render: () => renderStory(<NewTaskExample />),
    parameters: {
        docs: {
            description: {
                story: `New tasks go last, and the newest opens its subject for typing. Try: click **New**, type a name and press Enter.`,
            },
        },
    },
}

export const KeepFinishedTasks: Story = {
    name: 'Keep finished tasks',
    render: () => renderStory(<KeepFinishedTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `A store that keeps every completed task, and the tasks above it. Try: select *Website Redesign* and click **Delete**.`,
            },
        },
    },
}

export const InactiveTasks: Story = {
    name: 'Inactive tasks',
    render: () => renderStory(<InactiveTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `A view that starts with the inactive tasks hidden. Try: turn off *Hide inactive tasks* in the settings, then try to rename *Discovery & Planning*.`,
            },
        },
    },
}

export const FollowEveryChange: Story = {
    name: 'Follow every change',
    render: () => renderStory(<TaskEventsExample />),
    parameters: {
        docs: {
            description: {
                story: `The task provider's events, the newest first. Try: drag a task onto another.`,
            },
        },
    },
}

export const WhenTheStoreFails: Story = {
    name: 'When the store fails',
    render: () => renderStory(<StoreFailureExample />),
    parameters: {
        docs: {
            description: {
                story: `A store that cannot create tasks. Try: click **New**.`,
            },
        },
    },
}
