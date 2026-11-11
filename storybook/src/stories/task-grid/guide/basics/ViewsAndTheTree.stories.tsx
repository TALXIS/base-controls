import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { ViewsAndTheTreeExample } from '../../../../task-grid/guide/basics/viewsAndTheTreeExamples'

const STEP = 'Views and the tree'

const DESCRIPTION = `
{{block: progress}}

Each person on the move looks at the plan their own way: the whole tree, the largest tasks first, or one list of everything. Views give each of these a name, and search finds a task without losing its place in the plan.

{{canvas: Views and the tree}}

## How it works

The plan is the one from the last step, with a view switcher, a search box and a settings menu in the header; the new lines carry \`//new:\` in **Code**.

**Views.** \`onLoad\` returns the views with the store, and \`DatasetControl.ViewSwitcher\` lists them; the first one opens first. A view has an \`id\`, a \`name\` and a \`resolve(provider)\` that runs as the view opens:

| To | In \`resolve\` |
|---|---|
| Sort the tasks | Call \`provider.setSorting(…)\`. In the tree, a sort orders the tasks under each parent. |
| Filter or search them | Call \`provider.setFiltering(…)\` or \`provider.setSearchQuery(…)\`. |
| Pick the columns | Return them in \`columns\`, by name. A view may show a column that is hidden in \`OFFICE_COLUMNS\`, such as *Effort (h)*. |
| Start as a flat list | Return \`data: { isFlatList: true }\`. |

A switch mounts the control again, so \`onLoad\` runs again, and the table outside it keeps every change. How views work in any DatasetControl is on [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

**Search keeps the context.** \`DatasetControl.QuickFind\` searches the names of the tasks. A task that matches stays under the tasks above it, and those are in italics because they do not match themselves. A filter works the same way.

**The flat list** shows the tasks that match on their own rows, without the tree. Its rows cannot be dragged and have no **+**, and the *Path* column, \`PATH_COLUMN_NAME\`, shows where each task sits in the tree.

**The settings menu.** \`TaskDatasetControl.Settings\` holds two switches: *Show hierarchy* turns the flat list off and on, and *Hide inactive tasks* hides tasks such as *Sign the lease*.

**What is remembered.** Each view keeps what the user did in it, such as the tasks they opened, the search and the flat list. With a \`stateKey\`, the control keeps all of it, and the view it is on, when it mounts again, for as long as its state store lasts: see [**State**](?path=/docs/controls-datasetcontrol-state--overview). Here, opening **Code** and coming back to **Preview** mounts it again.

**Start from one task.** Return a \`rootTaskId\` from \`onLoad\` and the tree shows only the tasks under that task.

## Try it

- Press *Expand one level* twice to open the whole plan, then search for *paint*: only *Paint the meeting rooms* is left, under *Move to the new office* and *Fit out the space* in italics.
- Switch to *By effort* and open the plan the same way: under each task, the one with the most hours comes first.
- Switch to *Every task*: all eleven tasks are in one list, with their *Path*. In the settings menu, turn on *Hide inactive tasks* to take *Sign the lease* out of the list, and *Show hierarchy* to get the tree back.
- Switch back to *Whole plan*: the search and the open tasks are as you left them. Open **Code** and come back to **Preview**: they still are.
- In **Code**, add \`rootTaskId: 'fitout'\` to what \`loadTasks\` returns: the tree starts with the three subtasks of *Fit out the space*.

## Remember

- A view has an \`id\`, a \`name\` and a \`resolve\` that sorts, filters and picks the columns; \`onLoad\` returns the views with the store.
- A search or a filter shows each match under the tasks above it, in italics.
- The flat list shows the matches on their own rows, and they cannot be dragged.
- Each view keeps what the user opened, and a \`stateKey\` keeps it when the control mounts again.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Basics/Views and the tree',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ViewsAndTheTree: Story = {
    name: 'Views and the tree',
    tags: ['!dev'],
    render: () => renderStory(<ViewsAndTheTreeExample />),
}
