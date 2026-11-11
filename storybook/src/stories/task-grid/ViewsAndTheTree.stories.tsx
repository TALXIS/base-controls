import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { TaskUserViewsExample, TaskViewsExample } from '../../task-grid/examples/viewsAndTheTreeExamples'

const DESCRIPTION = `
A task view looks at the tasks a particular way, such as sorted by start date or searched for *design*, while the tasks keep their tree. Sorting orders the subtasks under each parent, a filter or a search keeps each match's ancestors, and a view can also drop the tree and show a flat list. Try it below: open the *Design work* view.

{{canvas: Switch between task views}}

## Set up a view

\`onLoad\` returns the views with the store, and \`DatasetControl.ViewSwitcher\` shows them. How views work is on [**Views**](?path=/docs/controls-datasetcontrol-views--overview); a task view is an \`ITaskGridView\`, whose \`resolve(provider)\` gets the task provider as the view opens and calls:

| Method | Description |
|---|---|
| \`setSorting(sorting)\` | Sorts the tasks among their siblings. Without it, tasks keep their stack rank order. |
| \`setFiltering(filtering)\` | Filters the tasks. |
| \`setQuickFindColumns(columnNames)\` | The columns quick find searches, among the view's columns, hidden ones included. The subject when not called. |
| \`setSearchQuery(query)\` | Starts the view searched. |

A view lists only the columns it shows: the mapped columns load whether it lists them or not. A column that the store does not offer and the view gives no \`dataType\` is left out, such as one a saved user view still lists after it was deleted. Of the \`data\` a view returns, \`isFlatList: true\` starts it as a flat list.

## The tree

Ancestors that a filter or a search keeps are in italics where they do not match themselves. The header of the commands column opens or closes one level of the whole tree, and a parent opens by itself when a task is created or dropped under it. A task created since the view loaded stays shown whatever the filter, until the view loads again.

## Flat list

A flat list shows the matching tasks on their own, without their ancestors. The column of **+** buttons is hidden, and tasks cannot be dragged. The user switches it with *Show hierarchy* in \`TaskDatasetControl.Settings\`, and your code with \`taskRuntime.setFlatList()\` (see [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview)).

Switching to a flat list adds a *Path* column after the subject, listing each task's ancestors, and switching back takes it away. A view that starts as a flat list, such as *Every task on its own* in the example, shows the path only when its columns list \`PATH_COLUMN_NAME\`.

## User views

With a user queries module in \`TaskDatasetControl\`'s \`modules\`, a task view the user saves keeps its sorting, filters, quick find columns, search and whether it is a flat list, beside its columns. Where the views are kept, in this browser, TALXIS, a Dataverse table or a store of your own, is on [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview).

{{story: Save your own task views}}

## Kept per view

The task grid keeps, per view, which tasks are open and whether the list is flat, as a DatasetControl keeps a view's state: across view switches, and across mounts with a \`stateKey\` on \`TaskDatasetControl\` (see [**State**](?path=/docs/controls-datasetcontrol-state--overview)). A \`stateKey\` on \`TaskGrid\` keeps its scroll and focus too.

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

export const SaveYourOwnTaskViews: Story = {
    name: 'Save your own task views',
    render: () => renderStory(<TaskUserViewsExample />),
    parameters: {
        docs: {
            description: {
                story: `Task views the user saves, kept in this browser. Try: turn off *Show hierarchy* in the settings, then pick **Save as new view** in the view switcher.`,
            },
        },
    },
}
