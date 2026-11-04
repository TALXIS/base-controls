import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { BasicTaskGridExample, TaskGridShowcaseExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
TaskGrid shows tasks as a tree, each under its parent and in its place among its siblings, and lets the user create, edit, move and delete them. It is a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) with a [**Grid**](?path=/docs/controls-grid-get-started--overview) in its body, so views, quick find, the ribbon and the Grid modules work as they do there, and a [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview) can draw the same tasks on a timeline beside it. Try it below: drag a task onto another.

{{canvas: Overview}}

## The smallest task grid

{{story: The smallest task grid}}

- \`TaskDatasetControl\` is the DatasetControl for tasks: it takes the DatasetControl's parts and most of its props.
- Its \`onLoad\` returns the tasks and the columns that make the tree: see [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview).
- \`TaskGrid\` goes in its body and takes the Grid's props.
- Creating, editing and deleting are off until you turn them on: see [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview).

Place it under the root providers: see [**Quick start**](?path=/docs/concepts-quick-start--overview).

## Changing how it looks

\`TaskGrid\` takes the Grid's \`components\` and keys for its own cells, and \`TaskDatasetControl.Settings\` takes its own. How slots work: [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGrid\` | \`treeCell\` | A cell's keys (see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview)), plus \`indent\` (\`onRenderIndent\`) and \`toggle\` (\`onRenderContainer\`, \`onRenderButton\`) | \`TaskGridUiTreeCellIndentComponents\`, \`GroupingUiToggleComponents\` | The subject cell, its indent and its chevron |
| | \`percentComplete\` | A cell's keys, plus \`progress\` (\`onRenderProgress\`) | \`TaskGridUiPercentCompleteComponents\` | The progress bar |
| | \`expansionHeader\` | \`expandCollapse\` (\`onRenderContainer\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\`) | \`GroupingUiExpandCollapseComponents\` | The buttons that open and close a level |
| | \`taskCommands\` | An empty cell's keys | | The **+** and a row's commands |
| \`TaskDatasetControl.Settings\` | Top level | \`onRenderButton\`, \`onRenderTooltip\` | \`TaskGridUiSettingsMenuComponents\` | The settings button and its menu |

## Reference

### TaskDatasetControl props

| Prop | Default | Description |
|---|---|---|
| \`onLoad\` | Required | Returns the provider and the field mapping for a view. See [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). |
| \`hoursPerDay\` | \`24\` | How many hours a day of a task's duration holds. |
| \`modules\` | None | The task modules, and DatasetControl modules such as user views. At mount. See [**Modules**](?path=/docs/controls-taskgrid-modules--overview). |
| \`onMounted\`, \`onReady\`, \`onDestroyed\` | None | Pass you the task runtime. See [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview). |

\`enableCreation\`, \`enableEditing\`, \`enableDeletion\`, \`defaultCreatePosition\` and the \`onTasks…\` events are on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). Every other prop works as on a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview).

### Parts

Every DatasetControl part works inside a \`TaskDatasetControl\`. Three are its own:

| Part | Description |
|---|---|
| \`TaskDatasetControl.Ribbon\` | The DatasetControl ribbon, with *New*, *Edit* and *Delete* ahead of your own commands, and what the modules add. |
| \`TaskDatasetControl.Settings\` | A menu of toggles: *Show hierarchy*, *Hide inactive tasks* and what the modules add. \`enableShowHierarchy={false}\` and \`enableHideInactiveTasks={false}\` leave one out. |
| \`TaskDatasetControl.PageSizeSwitcher\` | The count of tasks shown. Task grids load every task at once, so it has no page sizes. |

### TaskGrid props

\`TaskGrid\` takes every prop of \`<Grid />\` (see [**Props and events**](?path=/docs/controls-grid-props-and-events--overview)). These differ:

| Prop | Default | Description |
|---|---|---|
| \`modules\` | None | Grid modules, with \`createTaskEditingModule()\` for editing. Grouping, totals and the plain editing module are left out. At mount. |
| \`components\` | Defaults | The Grid's pieces, plus the task grid's own cells. See *Changing how it looks* above. |
| \`enableZebra\` | \`false\` | |
| \`enableOptionSetColors\` | \`true\` | |
| \`onOpenRecord\` | Opens the task, or the record a lookup points to | Through the store. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'Tasks in memory, in Dataverse or in a store of your own, mapped onto the tree.' },
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'Let the user create, edit, delete and move tasks.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-modules--overview', text: 'Assignees, tags, checklists, dependencies, templates and custom columns.' },
]

const meta = {
    title: 'Controls/TaskGrid/Get started',
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

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<TaskGridShowcaseExample />),
}

export const TheSmallestTaskGrid: Story = {
    name: 'The smallest task grid',
    render: () => renderStory(<BasicTaskGridExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample tasks in memory, with a ribbon and the settings. Try: add a subtask from a row's **+**.`,
            },
        },
    },
}
