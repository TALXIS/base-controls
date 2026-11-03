import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { TaskViewsExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
Views work as on a DatasetControl: \`onLoadViews\` lists them, \`DatasetControl.ViewSwitcher\` shows them, and each one resolves its columns as it opens (see [**DatasetControl › Views**](?path=/docs/controls-datasetcontrol-views--overview)). A task view's \`data\` is an \`ITaskViewData\`, and the control applies it for you: \`onLoad\` does not need to read the view.

\`\`\`tsx
const loadTaskViews = async (): Promise<IDatasetControlView<ITaskViewData>[]> => [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: ALL_COLUMNS }) },
    { id: 'planning', name: 'Planning', resolve: () => ({ columns: PLANNING_COLUMNS, data: { sorting: [{ name: 'scheduledstart', sortDirection: 0 }] } }) },
    { id: 'flat', name: 'Every task on its own', resolve: () => ({ columns: ALL_COLUMNS, data: { isFlatList: true } }) },
]

<TaskDatasetControl onLoadViews={loadTaskViews} onLoad={loadTasks}>...</TaskDatasetControl>
\`\`\`

{{story: Switch between task views}}

## Task view data

| Key | Description |
|---|---|
| \`sorting\` | Sorts each task's subtasks. Without it, tasks keep their stack rank order. |
| \`filtering\` | Filters the tasks. |
| \`quickFindColumns\` | The columns quick find searches. The subject column when left out. |
| \`searchQuery\` | Starts the view searched. |
| \`isFlatList\` | Starts the view as a flat list. See *Flat list* below. |

## The tree

The tree always follows the parent lookups; sorting only orders the subtasks under each parent. A filter or a search keeps each match's ancestors, in italics where they don't match themselves. The header of the commands column opens or closes one level of the whole tree, and a parent opens by itself when a task is created or dropped under it.

## Flat list

A flat list shows the matching tasks on their own, without their ancestors. A *Path* column after the subject lists each task's ancestors, and tasks cannot be dragged. The user switches it with *Show hierarchy* in \`TaskDatasetControl.Settings\`, and your code with \`taskRuntime.setFlatList()\`.

## Inactive tasks

*Hide inactive tasks* in \`TaskDatasetControl.Settings\` filters out every task whose \`stateCode\` is not \`0\`.

## User views and state

With a user queries module, a saved view keeps its sorting, filters, quick find columns, search and flat list (see *Let users save their own views* on [**DatasetControl › Views**](?path=/docs/controls-datasetcontrol-views--overview)). A \`stateKey\` on \`TaskDatasetControl\` also keeps, per view, which tasks are open; one on \`TaskGrid\` keeps the scroll and focus (see [**DatasetControl › State**](?path=/docs/controls-datasetcontrol-state--overview)).
`

const meta = {
    title: 'Controls/TaskGrid/Views and the tree',
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
    parameters: {
        docs: {
            description: {
                story: `Three views of the sample projects: the whole tree, the tree sorted by start date, and a flat list. Try: search for *test* to see the ancestors kept, then switch to *Every task on its own*, or turn off *Show hierarchy* in the settings.`,
            },
        },
    },
}
