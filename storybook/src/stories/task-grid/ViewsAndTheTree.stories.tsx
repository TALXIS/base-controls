import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { TaskViewsExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
A task view looks at the tasks a particular way, such as sorted by start date or searched for *design*, while the tasks keep their tree. Sorting orders the subtasks under each parent, a filter or a search keeps each match's ancestors, and a view can also drop the tree and show a flat list. Try it below: open the *Design work* view.

{{canvas: Switch between task views}}

## Set up a view

\`onLoad\` returns the views with the store, \`DatasetControl.ViewSwitcher\` shows them, and each view's \`resolve(provider)\` sets the provider up and returns its columns as the view opens, as on a DatasetControl (see [**Views**](?path=/docs/controls-datasetcontrol-views--overview)). In \`resolve\`, a task view calls:

| Method | Description |
|---|---|
| \`setSorting(sorting)\` | Sorts each task's subtasks. Without it, tasks keep their stack rank order. |
| \`setFiltering(filtering)\` | Filters the tasks. |
| \`setQuickFindColumns(columnNames)\` | The columns quick find searches. The subject column when not called. On \`ITaskDataProvider\`. |
| \`setSearchQuery(query)\` | Starts the view searched. |

The \`data\` it returns is an \`ITaskViewData\`, whose \`isFlatList\` starts the view as a flat list. See *Flat list* below.

## The tree

Ancestors a filter or a search keeps are in italics where they do not match themselves. The header of the commands column opens or closes one level of the whole tree, and a parent opens by itself when a task is created or dropped under it.

## Flat list

A flat list shows the matching tasks on their own, without their ancestors. A *Path* column after the subject lists each task's ancestors, the column of **+** buttons is hidden, and tasks cannot be dragged. The user switches it with *Show hierarchy* in \`TaskDatasetControl.Settings\`, and your code with \`taskRuntime.setFlatList()\`.

## User views and state

With a user queries module, a saved view keeps its sorting, filters, quick find columns, search and flat list (see [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview)). A \`stateKey\` on \`TaskDatasetControl\` also keeps, per view, which tasks are open and whether the list is flat; one on \`TaskGrid\` keeps the scroll and focus (see the DatasetControl's [**State**](?path=/docs/controls-datasetcontrol-state--overview)).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'Let the user create, edit, delete and move tasks, and hide the inactive ones.' },
    { title: 'User views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views-user-views--overview', text: 'Let the user save a view of their own, kept where you choose.' },
    { title: 'Talking to the task grid', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'Switch to a flat list, open tasks and run your own work from code.' },
]

const meta = {
    title: 'Controls/TaskGrid/Views and the tree',
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

export const SwitchBetweenTaskViews: Story = {
    name: 'Switch between task views',
    render: () => renderStory(<TaskViewsExample />),
}
