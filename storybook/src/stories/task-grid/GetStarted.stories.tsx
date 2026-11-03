import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { TaskGridShowcaseExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
TaskGrid shows tasks as a tree: every task sits under its parent, in its place among its siblings. It is a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) with a [**Grid**](?path=/docs/controls-grid-get-started--overview) in its body, so views, quick find, Edit columns, the ribbon and the Grid modules work as they do there. On top, it adds the tree, commands to create, edit, delete and move tasks, and modules for what tasks carry: assignees, checklists, dependencies, templates and more. A [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview) can draw the same tasks on a timeline beside the grid.

Below are seven projects of a software company. Try: open a task's subtasks, drag a task onto another, add a subtask from the **+** at the start of a row, switch to *Every task on its own*, or open **Edit columns** to add a checklist, a dependency or a custom column. Open **Code** to read and edit the source.

{{canvas: Overview}}

## Basic usage

\`\`\`tsx
import { createMemoryTaskDataSource, DatasetControl, IFieldMapping, ITaskGridLoadParameters, ITaskGridLoadResult, MemoryTaskDatabase, MemoryTaskStore, PcfContextProvider, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'

const database = new MemoryTaskDatabase({ records: TASKS, metadata: { PrimaryIdAttribute: 'taskid', LogicalName: 'task' } })

const fieldMapping: IFieldMapping = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode' }

const loadTasks = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
    provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, database, columns: TASK_COLUMNS }) }),
    fieldMapping,
})

export const Tasks = () => <PcfContextProvider>
    <TaskDatasetControl onLoad={loadTasks} enableCreation enableEditing enableDeletion height='600px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <TaskDatasetControl.Ribbon />
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid />
        </DatasetControl.Body>
    </TaskDatasetControl>
</PcfContextProvider>
\`\`\`

\`TaskDatasetControl\` takes the DatasetControl's parts and most of its props; its \`onLoad\` gets a \`taskRuntime\` and returns a field mapping beside the provider, as [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview) shows. \`TaskGrid\` takes the Grid's props, always has the tree, and throws outside a \`TaskDatasetControl\`. \`PcfContextProvider\` wraps it all (see [**PCF context**](?path=/docs/concepts-pcf-context--overview)).

## TaskDatasetControl props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`(params: ITaskGridLoadParameters) => Promise<ITaskGridLoadResult>\` | Required | Returns the provider and the field mapping for a view. See [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). |
| \`enableCreation\` | \`boolean\` | \`false\` | The *New* command and each row's **+**. |
| \`enableEditing\` | \`boolean\` | \`false\` | The *Edit* command, and editing tasks in the grid and in their forms. Without it, every task is locked. |
| \`enableDeletion\` | \`boolean\` | \`false\` | The *Delete* command. |
| \`defaultCreatePosition\` | \`'first' \\| 'last'\` | \`'first'\` | Where a new task goes among its siblings. |
| \`hoursPerDay\` | \`number\` | \`24\` | How many hours a day of a task's duration holds. |
| \`modules\` | \`IDatasetControlModule[]\` | None | The task modules, and DatasetControl modules such as user views. Read on every mount. See [**Modules**](?path=/docs/controls-taskgrid-modules--overview). |
| \`onTasksCreated\` | \`(records: IRecord[], parentId?: string) => void\` | None | After tasks are created, with the parent they went under. |
| \`onTasksDeleted\` | \`(taskIds: string[]) => void\` | None | After tasks are deleted. |
| \`onTasksUpdated\` | \`(records: IRecord[]) => void\` | None | After tasks change, from a form or a move. |
| \`onMounted\`, \`onReady\`, \`onDestroyed\` | \`(taskRuntime: ITaskRuntime) => void\` | None | Pass you the task runtime before each load, once it succeeded, and as the control unmounts. See [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview). |

\`onLoadViews\`, \`onLoadDependencies\`, \`children\`, \`height\`, \`className\`, \`stateKey\`, \`destroyProviderOnUnmount\` and \`components\` work as on a DatasetControl: *How it fits together* on [**DatasetControl › Get started**](?path=/docs/controls-datasetcontrol-get-started--overview) says which page covers each.

## Parts

Every DatasetControl part works inside a \`TaskDatasetControl\`. Three are its own:

| Part | Description |
|---|---|
| \`TaskDatasetControl.Ribbon\` | The DatasetControl ribbon, with *New*, *Edit* and *Delete* ahead of your own commands, and what the modules add. |
| \`TaskDatasetControl.Settings\` | A menu of toggles: *Show hierarchy* and *Hide inactive tasks*, and what the modules add. \`enableShowHierarchy={false}\` and \`enableHideInactiveTasks={false}\` leave one out. |
| \`TaskDatasetControl.PageSizeSwitcher\` | The count of tasks shown. Task grids load every task at once, so it has no page sizes. |

## TaskGrid props

\`TaskGrid\` takes every prop of \`<Grid />\` (see [**Grid › Props and events**](?path=/docs/controls-grid-props-and-events--overview)), with three defaults of its own and two props that differ:

| Prop | Default | Description |
|---|---|---|
| \`modules\` | None | Grid modules, such as \`createRowSelectionModule()\`, \`createSortingModule()\` and \`createTaskEditingModule()\`. Grouping, aggregation and the plain editing module are left out: the tree takes their place. Read at mount. |
| \`components\` | Defaults | The Grid's components, plus the task grid's own cells. See *Changing how it looks* below. |
| \`enableZebra\` | \`false\` | |
| \`enableOptionSetColors\` | \`true\` | |
| \`onOpenRecord\` | Opens the task, or the record a lookup points to | Through the store. |

## Changing how it looks

\`TaskGrid\` takes the Grid's \`components\` and keys for its own cells, and \`TaskDatasetControl.Settings\` takes its own. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGrid\` | \`treeCell\` | A cell's keys (see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview)), plus \`indent\` (\`onRenderIndent\`) and \`toggle\` (\`onRenderContainer\`, \`onRenderButton\`) | \`TaskGridUiTreeCellIndentComponents\`, \`GroupingUiToggleComponents\` | The subject cell, its indent and its chevron |
| | \`percentComplete\` | A cell's keys, plus \`progress\` (\`onRenderProgress\`) | \`TaskGridUiPercentCompleteComponents\` | The progress bar |
| | \`expansionHeader\` | \`expandCollapse\` (\`onRenderContainer\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\`) | \`GroupingUiExpandCollapseComponents\` | The buttons that open and close a level |
| | \`taskCommands\` | An empty cell's keys | | The **+** and a row's commands |
| \`TaskDatasetControl.Settings\` | Top level | \`onRenderButton\`, \`onRenderTooltip\` | \`TaskGridUiSettingsMenuComponents\` | The settings button and its menu |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'Tasks in memory, in Dataverse or in a store of your own, mapped onto the tree by four columns.' },
    { title: 'Views and the tree', iconName: 'BulletedTreeList', href: '?path=/docs/controls-taskgrid-views-and-the-tree--overview', text: 'Views that sort, filter and search the tree, a flat list, and inactive tasks hidden.' },
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'Create, edit, delete and move tasks, in place or in their forms.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-modules--overview', text: 'Assignees, tags, checklists, dependencies, templates and custom columns, each on memory, Dataverse or TALXIS.' },
    { title: 'Talking to the task grid', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'Create, open and move tasks from your code, and run your own work behind the loading overlay.' },
    { title: 'Gantt', iconName: 'Timeline', href: '?path=/docs/controls-taskgrid-gantt-get-started--overview', text: 'The tasks on a timeline beside the grid: drag bars, draw tasks, link them, and mark the days that matter.' },
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
