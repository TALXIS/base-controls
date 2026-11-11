import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GuideNavigation } from '../../../task-grid/guide/GuideSteps'
import { PlanTheTasksExample, TaskViewsExample } from '../../../task-grid/guide/viewsTreeAndEditingExamples'

const DESCRIPTION = `
Views decide which tasks the tree shows and in what order, and the \`enable…\` props decide what the user may change.

## Views and the flat list

\`onLoad\` returns the views with the store, and \`DatasetControl.ViewSwitcher\` offers them. A task view's \`resolve(provider)\` sets the task provider up as the view opens, with \`setSorting\`, \`setFiltering\`, \`setSearchQuery\` and \`setQuickFindColumns\`, and returns the columns to show. How views work in general is on [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

In the tree, a sort orders the subtasks under each parent, and a filter or a search keeps the ancestors of each match, in italics. A flat list shows the matching tasks on their own, and its rows cannot be dragged. The user switches to it with *Show hierarchy* in \`TaskDatasetControl.Settings\`, and a view starts as one when it returns \`data: { isFlatList: true }\`.

Which tasks are open and whether the list is flat are kept per view, and across mounts with a \`stateKey\`: see [**State**](?path=/docs/controls-datasetcontrol-state--overview).

Try: open the *Design work* view.

{{story: Views and the flat list}}

## Creating, editing, moving and deleting

Three props, each \`false\` by default and read at mount, turn on what the user may do, and two modules add editing in the cells and dragging.

| To | Turn on | The user |
|---|---|---|
| Create a task | \`enableCreation\` | Clicks *New* for a top-level task, or **+** on a row for a subtask |
| Edit a task in its form | \`enableEditing\` | Selects tasks and clicks *Edit* |
| Edit cells | \`enableEditing\`, and \`createTaskEditingModule()\` in \`TaskGrid\` | Double-clicks a cell; every edit saves on its own |
| Move a task | \`enableEditing\`, and \`createTaskDraggingModule()\` in \`TaskDatasetControl\` | Drags its row |
| Delete tasks | \`enableDeletion\` | Selects tasks, clicks *Delete* and confirms |

*Edit* and *Delete* act on the selection, so add \`createRowSelectionModule()\` to \`TaskGrid\`. A task whose \`stateCode\` is not \`0\` is inactive: it is read-only, cannot be dragged, gets no **+**, and *Hide inactive tasks* in the settings hides it.

Every change allowed, new tasks last, and completed tasks kept from deletion. Try: select *Website Redesign* and click **Delete**.

{{story: Creating, editing, moving and deleting}}

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Planning',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { navigation: () => <GuideNavigation current='Planning' /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ViewsAndTheFlatList: Story = {
    name: 'Views and the flat list',
    tags: ['!dev'],
    render: () => renderStory(<TaskViewsExample />),
}

export const CreatingEditingMovingAndDeleting: Story = {
    name: 'Creating, editing, moving and deleting',
    tags: ['!dev'],
    render: () => renderStory(<PlanTheTasksExample />),
}
