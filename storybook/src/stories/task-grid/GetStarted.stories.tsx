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

Where the tasks come from, and which columns make the tree, is on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). What the user may change is on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). Place the control under the root providers: see [**Quick start**](?path=/docs/concepts-quick-start--overview).

## Changing how it looks

\`TaskGrid\` takes the Grid's \`components\` and keys for its own cells, and \`TaskDatasetControl.Settings\` takes its own. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGrid\` | \`treeCell\` | A cell's keys (see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview)), plus \`indent\` (\`onRender\`) and \`toggle\` (\`onRender\`, \`onRenderButton\`) | \`TaskGridUiTreeCellIndentComponents\`, \`GroupingUiToggleComponents\` | The subject cell, its indent and its chevron |
| | \`percentComplete\` | A cell's keys, plus \`progress\` (\`onRender\`) | \`TaskGridUiPercentCompleteComponents\` | The progress bar |
| | \`expansionHeader\` | \`expandCollapse\` (\`onRender\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\`) | \`GroupingUiExpandCollapseComponents\` | The buttons that open and close a level |
| | \`taskCommands\` | An empty cell's keys | | The **+** and a row's commands |
| \`TaskDatasetControl.Settings\` | Top level | \`onRenderButton\`, \`onRender\` | \`TaskGridUiSettingsMenuComponents\` | The settings button and its menu |

## Reference

### TaskDatasetControl props

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`onLoad\` | \`(taskRuntime: ITaskRuntime) => ITaskGridLoadResult \\| Promise<ITaskGridLoadResult>\` | Required | At mount | Gets the task runtime and returns the store, the field mapping and the views. See [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). |
| \`modules\` | \`IDatasetControlModule[]\` | None | At mount | The task modules, and DatasetControl modules such as user views. See [**Modules**](?path=/docs/controls-taskgrid-modules--overview). |
| \`onSetup\` | \`(control: IDatasetControl<ITaskViewData>) => void\` | None | At mount | Gets the DatasetControl of each mount, before its modules load. See [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview). |

\`enableCreation\`, \`enableEditing\`, \`enableDeletion\` and \`defaultCreatePosition\` are on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). Every other prop works as on a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview).

### Parts

Every DatasetControl part works inside a \`TaskDatasetControl\`. Three are its own:

| Part | Description |
|---|---|
| \`TaskDatasetControl.Ribbon\` | The DatasetControl ribbon, with *New*, and *Edit* and *Delete* while tasks are selected, ahead of your own commands and what the modules add. |
| \`TaskDatasetControl.Settings\` | A menu of toggles: *Show hierarchy*, *Hide inactive tasks* and what the modules add. \`enableShowHierarchy={false}\` and \`enableHideInactiveTasks={false}\` leave one out. |
| \`TaskDatasetControl.PageSizeSwitcher\` | The count of tasks shown. Task grids load every task at once, so it has no page sizes. |

### TaskGrid props

\`TaskGrid\` takes every prop of a Grid (see [**Props and events**](?path=/docs/controls-grid-props-and-events--overview)). These differ:

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`modules\` | \`ITaskGridGridModule[]\` | None | At mount | Grid modules. See *Where modules go* on [**Modules**](?path=/docs/controls-taskgrid-modules--overview). |
| \`components\` | \`ITaskGridComponents\` | Defaults | Live | The Grid's pieces, plus the task grid's own cells. See *Changing how it looks* above. |
| \`enableZebra\` | \`boolean\` | \`false\` | At mount | Shades every other row. |
| \`enableOptionSetColors\` | \`boolean\` | \`true\` | At mount | Draws options that have a colour as tags. |

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
                story: `The sample tasks in memory, with a ribbon and the settings menu. Try: add a subtask from a row's **+**.`,
            },
        },
    },
}
