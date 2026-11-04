import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { WorkingWithTasksExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
A task grid lets the user add, rename, move and delete tasks where they are: from the ribbon, the **+** at the start of a row, the cells, and by dragging rows. Each of these is off until you turn it on, and every change is saved through the store (see [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview)). Try it below: drag a task under another.

{{canvas: Plan the tasks}}

## What the user can do

Three props turn on what the user may do with tasks, and two modules add editing in place and moving by dragging.

| To | Turn on | The user |
|---|---|---|
| Create a task | \`enableCreation\` | clicks *New* in the ribbon for a top-level task, or the **+** at the start of an active task's row for a subtask |
| Edit a task in its form | \`enableEditing\` | selects tasks and clicks *Edit*, or opens one from its subject |
| Edit cells in place | \`enableEditing\` and \`createTaskEditingModule()\` in \`TaskGrid\` | double-clicks a cell; every edit saves straight away |
| Delete tasks | \`enableDeletion\` | selects tasks and clicks *Delete*, then confirms |
| Move a task | \`enableEditing\` and \`createTaskDraggingModule()\` in \`TaskDatasetControl\` | drags its row |

*Edit* and *Delete* act on the selection, so add \`createRowSelectionModule()\` to \`TaskGrid\` (see [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview)). Without \`enableEditing\`, every task is locked.

A new task shows straight away, its cells loading until the store has created it. It goes first among its siblings, or last with \`defaultCreatePosition='last'\`; under a root task, *New* puts it under the root. The [**Templates**](?path=/docs/controls-taskgrid-modules-templates--overview) module adds *From template* next to both.

Deleting takes every subtask along. Tasks that could not be deleted are listed in a dialog and keep their ancestors; a store keeps a task from being deleted with \`onCanDeleteTask\`.

## Inactive tasks

A task whose \`stateCode\` column is not \`0\` is inactive. It stays read-only, gets no **+**, and *Hide inactive tasks* in \`TaskDatasetControl.Settings\` hides it.

## Dragging

- A row dropped between two rows lands at the level its distance from the left suggests.
- Held over a task for a moment, it becomes a subtask; held over a closed parent a little longer, the parent opens.
- Dragging works while the tree is shown, the tasks are sorted by nothing but their stack rank, and no cell is being edited.
- The new parent and rank are saved through the store.

\`createTaskDraggingModule\` takes \`onTaskMoved({ movingRecord, targetRecord, position, parentRecord, stackRank })\`, called after a task is moved, with \`position\` \`'above'\`, \`'below'\` or \`'child'\`.

## Events

These props of \`TaskDatasetControl\` follow every change, whichever way it was made:

| Prop | Called |
|---|---|
| \`onTasksCreated(records, parentId?)\` | After tasks are created, with the parent they went under. |
| \`onTasksDeleted(taskIds)\` | After tasks are deleted. |
| \`onTasksUpdated(records)\` | After tasks change, from a form or a move. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Talking to the task grid', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'Create, open, move and delete tasks from your code.' },
    { title: 'Templates', iconName: 'Copy', href: '?path=/docs/controls-taskgrid-modules-templates--overview', text: 'Create a task and its subtasks from a template in one go.' },
    { title: 'Editing on the timeline', iconName: 'Timeline', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, and draw new tasks on the Gantt.' },
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
    render: () => renderStory(<WorkingWithTasksExample />),
}
