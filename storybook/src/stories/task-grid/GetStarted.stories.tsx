import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { SmallestTaskGridExample, TaskGridLooksExample, TaskGridPartsExample, TaskGridShowcaseExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
A task grid shows a plan as a tree of tasks, each under its parent and in its place among its siblings, and lets the user build that plan where they see it: add tasks, rename them, drag them about and delete them. It is a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) whose records are tasks, drawn by a [**Grid**](?path=/docs/controls-grid-get-started--overview), with an optional [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview) beside it, so most of what those controls do works here too. Try it below: drag a task onto another.

{{canvas: Overview}}

## The smallest task grid

A task grid needs two things besides the control: a *store* that holds the tasks, and a *field mapping* that names the columns making the tree. Open **Code**: its comments walk through each line.

{{story: The smallest task grid}}

Like every control, it needs the root providers from [**Quick start**](?path=/docs/concepts-quick-start--overview).

## What it is made of

| Part | Draws | Goes |
|---|---|---|
| \`TaskDatasetControl\` | The frame around the other parts, with its loading state and errors. It loads the tasks through the store \`onLoad\` returns, and its \`enable…\` props say what the user may change. | Around everything else. |
| \`TaskGrid\` | The tasks as a tree. It is a Grid, takes the Grid's props, and throws outside a \`TaskDatasetControl\`. | In \`DatasetControl.Body\`. |
| \`TaskGantt\` | The same tasks on a timeline, row for row with the grid. It comes from \`@talxis/base-controls/gantt\`: see [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview). | Beside the \`TaskGrid\`, in \`TaskGantt.Split\`. |
| \`TaskDatasetControl.Ribbon\` | \`DatasetControl.Ribbon\` with *New*, *Edit* and *Delete* first. | In the header. |
| \`TaskDatasetControl.Settings\` | A menu of toggles: *Show hierarchy*, *Hide inactive tasks* and what the modules add. \`enableShowHierarchy={false}\` and \`enableHideInactiveTasks={false}\` leave one out. | In the header. |
| \`TaskDatasetControl.PageSizeSwitcher\` | How many tasks the tree shows. A task grid loads every task at once, so it has no pages. | In the footer. |

Every other DatasetControl part goes in as it is, such as the view switcher, quick find, *Edit columns* and notifications.

{{story: Every part in its place}}

## What it shares

A task grid does what a DatasetControl and a Grid do, and their pages describe it:

| For | See |
|---|---|
| Views, and how a view sets up the provider | [**Views**](?path=/docs/controls-datasetcontrol-views--overview), and for what tasks add, [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview) |
| Views users save themselves | [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview) |
| The header, the body and the footer | [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview) |
| Search, picking columns, messages above the tasks | [**Quick find**](?path=/docs/controls-datasetcontrol-parts-quick-find--overview), [**Edit columns**](?path=/docs/controls-datasetcontrol-parts-edit-columns--overview), [**Notifications and empty state**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview) |
| The ribbon and commands of your own | [**Ribbon**](?path=/docs/controls-datasetcontrol-parts-ribbon--overview) |
| What the user changed in each view, and a failed load | [**State**](?path=/docs/controls-datasetcontrol-state--overview), [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview) |
| Columns and how a cell draws its value | [**Columns**](?path=/docs/controls-grid-columns--overview) |
| Editing in the cells | [**Editing**](?path=/docs/controls-grid-modules-editing--overview), with \`createTaskEditingModule()\` in place of the Grid's editing module |
| Sorting, filtering, selection and copying | [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview), [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) |
| Colours, cells and headers of your own | [**Appearance**](?path=/docs/controls-grid-appearance--overview) |
| The grid's props, and the grid from your code | [**Props and events**](?path=/docs/controls-grid-props-and-events--overview), [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview) |

Grouping and totals are left out: the tree is the task grid's own row model.

## The TaskGrid pages

| Page | Read it to |
|---|---|
| [**How it works**](?path=/docs/controls-taskgrid-how-it-works--overview) | See how the store, the task provider and the parts work together. |
| [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview) | Load tasks from memory, Dataverse, TALXIS or an API of your own. |
| [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview) | Sort, filter and search the tree, or show a flat list. |
| [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview) | Let the user create, edit, move and delete tasks. |
| [**Modules**](?path=/docs/controls-taskgrid-modules--overview) | Add dependencies, checklists, templates and more, in the backend you choose. |
| [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview) | Do from your code what the user does. |
| [**Write a module**](?path=/docs/controls-taskgrid-write-a-module--overview) | Add a feature of your own. |
| [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview) | Draw the tasks on a timeline. |
| [**Build your own task grid**](?path=/docs/controls-taskgrid-build-your-own-task-grid--overview) | Build one step by step, then move it to Dataverse or TALXIS. |

## Changing how it looks

\`TaskGrid\` takes the Grid's \`components\` and keys for its own cells, and \`TaskDatasetControl.Settings\` takes its own. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGrid\` | \`treeCell\` | A cell's keys (see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview)), plus \`indent\` (\`onRender\`) and \`toggle\` (\`onRender\`, \`onRenderButton\`) | \`TaskGridUiTreeCellIndentComponents\`, \`GroupingUiToggleComponents\` | The subject cell, its indent and its chevron |
| | \`percentComplete\` | A cell's keys, plus \`progress\` (\`onRender\`) | \`TaskGridUiPercentCompleteComponents\` | The progress bar |
| | \`expansionHeader\` | \`expandCollapse\` (\`onRender\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\`) | \`GroupingUiExpandCollapseComponents\` | The buttons that open and close a level |
| | \`taskCommands\` | An empty cell's keys | | The **+** and a row's other commands |
| \`TaskDatasetControl.Settings\` | Top level | \`onRender\`, \`onRenderButton\` | \`TaskGridUiSettingsMenuComponents\` | The settings button and its menu |

{{story: Change how the tasks look}}

## Reference

### TaskDatasetControl props

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`onLoad\` | \`(taskRuntime: ITaskRuntime) => ITaskGridLoadResult \\| Promise<ITaskGridLoadResult>\` | Required | At mount | Gets the task runtime and returns the store, the field mapping and the views. See [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). |
| \`modules\` | \`IDatasetControlModule[]\` | None | At mount | Task modules, and DatasetControl modules such as user views. See [**Modules**](?path=/docs/controls-taskgrid-modules--overview). |
| \`onSetup\` | \`(control: IDatasetControl<ITaskViewData>) => void\` | None | At mount | Gets the DatasetControl of each mount, before its modules load. See [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview). |

\`enableCreation\`, \`enableEditing\`, \`enableDeletion\` and \`defaultCreatePosition\` are on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). Every other prop works as on a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview).

### TaskGrid props

\`TaskGrid\` takes every prop of a Grid (see [**Props and events**](?path=/docs/controls-grid-props-and-events--overview)). These differ:

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`modules\` | \`ITaskGridGridModule[]\` | None | At mount | Grid modules, loaded after the tree. See *Modules in three places* on [**How it works**](?path=/docs/controls-taskgrid-how-it-works--overview). |
| \`components\` | \`ITaskGridComponents\` | Defaults | Live | The Grid's pieces, plus the task grid's own cells. See *Changing how it looks* above. |
| \`enableZebra\` | \`boolean\` | \`false\` | At mount | Shades every other row. |
| \`enableOptionSetColors\` | \`boolean\` | \`true\` | At mount | Draws options that have a colour as tags. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'How it works', iconName: 'Flow', href: '?path=/docs/controls-taskgrid-how-it-works--overview', text: 'The store, the task provider and the parts, and which calls reach your backend.' },
    { title: 'Build your own task grid', iconName: 'Build', href: '?path=/docs/controls-taskgrid-build-your-own-task-grid--overview', text: 'From your rows in memory to a Gantt on Dataverse, one step at a time.' },
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'Tasks in memory, in Dataverse, in TALXIS or behind an API of your own.' },
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
    render: () => renderStory(<SmallestTaskGridExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample tasks in memory, drawn as a tree. Try: add \`enableCreation\` to \`TaskDatasetControl\`, then press **+** on a row.`,
            },
        },
    },
}

export const EveryPartInItsPlace: Story = {
    name: 'Every part in its place',
    render: () => renderStory(<TaskGridPartsExample />),
    parameters: {
        docs: {
            description: {
                story: `The DatasetControl parts and the task grid's own around the tasks. Try: turn off *Show hierarchy* in the settings.`,
            },
        },
    },
}

export const ChangeHowTheTasksLook: Story = {
    name: 'Change how the tasks look',
    render: () => renderStory(<TaskGridLooksExample />),
    parameters: {
        docs: {
            description: {
                story: `A taller progress bar that reads *Done* at 100%, and the settings button without its text. Try: set \`barHeight\` to 4.`,
            },
        },
    },
}
