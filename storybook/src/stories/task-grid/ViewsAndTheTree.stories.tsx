import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { TaskViewsExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
A task view looks at the tasks a particular way, such as sorted by start date or searched for *design*, while the tasks keep their tree. Sorting orders the subtasks under each parent, and a filter or a search keeps each match's ancestors, so a match still shows where it belongs. A view can also drop the tree and show the matching tasks as a flat list.

{{story: Switch between task views}}

## Task view data

\`onLoadViews\` lists the views, \`DatasetControl.ViewSwitcher\` shows them, and each one resolves its columns as it opens, as on a DatasetControl (see [**DatasetControl › Views**](?path=/docs/controls-datasetcontrol-views--overview)). A task view's \`data\` is an \`ITaskViewData\`:

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

With a user queries module, a saved view keeps its sorting, filters, quick find columns, search and flat list (see [**DatasetControl › User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview)). A \`stateKey\` on \`TaskDatasetControl\` also keeps, per view, which tasks are open; one on \`TaskGrid\` keeps the scroll and focus (see [**DatasetControl › State**](?path=/docs/controls-datasetcontrol-state--overview)).
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
                story: `Four views of the sample projects: the tree, the tree sorted by start date, a search for *design*, and a flat list. Try: open *Design work* to see the ancestors kept, then switch to *Every task on its own*, or turn off *Show hierarchy* in the settings.`,
            },
        },
    },
}
