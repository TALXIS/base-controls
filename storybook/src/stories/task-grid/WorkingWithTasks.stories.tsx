import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { WorkingWithTasksExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
Three props turn on what the user may do with tasks, and two modules add editing in place and moving by dragging. Each change goes through the store: see [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview).

{{story: Plan the tasks}}

## What the user can do

| To | Turn on | The user |
|---|---|---|
| Create a task | \`enableCreation\` | clicks *New* in the ribbon for a top-level task, or the **+** at the start of an active task's row for a subtask |
| Edit a task in its form | \`enableEditing\` | selects tasks and clicks *Edit*, or opens one from its subject |
| Edit cells in place | \`enableEditing\` and \`createTaskEditingModule()\` in \`TaskGrid\` | double-clicks a cell; every edit saves straight away |
| Delete tasks | \`enableDeletion\` | selects tasks and clicks *Delete*, then confirms |
| Move a task | \`enableEditing\` and \`createTaskDraggingModule()\` in \`TaskDatasetControl\` | drags its row |

*Edit* and *Delete* act on the selection, so add \`createRowSelectionModule()\` to \`TaskGrid\` (see [**Grid › Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview)). Inactive tasks stay read-only throughout, and without \`enableEditing\` every task is locked.

A new task shows straight away, its cells loading until the store has created it. It goes first among its siblings, or last with \`defaultCreatePosition='last'\`; under a root task, *New* puts it under the root. The [**Templates**](?path=/docs/controls-taskgrid-modules-templates--overview) module adds *From template* next to both.

Deleting takes every subtask along. Tasks that could not be deleted are listed in a dialog and keep their ancestors; a store keeps a task from being deleted with \`onCanDeleteTask\`.

## Dragging

A row dropped between two rows lands at the level its distance from the left suggests. Held over a task for a moment, it becomes a subtask; held over a closed parent a little longer, the parent opens. Dragging works while the tree is shown, the tasks are sorted by nothing but their stack rank, and no cell is being edited. The new parent and rank are saved through the store.

| Option | Description |
|---|---|
| \`onTaskMoved\` | \`({ movingRecord, targetRecord, position, parentRecord, stackRank }) => void\`, after a task is moved. \`position\` is \`'above'\`, \`'below'\` or \`'child'\`. |

## Events

\`onTasksCreated\`, \`onTasksDeleted\` and \`onTasksUpdated\` on \`TaskDatasetControl\` follow every change, whichever way it was made. See *TaskDatasetControl props* on [**Get started**](?path=/docs/controls-taskgrid-get-started--overview). To make the same changes from your code, see [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview).
`

const meta = {
    title: 'Controls/TaskGrid/Working with tasks',
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

export const PlanTheTasks: Story = {
    name: 'Plan the tasks',
    render: () => renderStory(<WorkingWithTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample projects with every command on, editing in place and dragging. Try: rename a task, drag one under another, add a subtask with **+**, then select a few tasks and delete them.`,
            },
        },
    },
}
