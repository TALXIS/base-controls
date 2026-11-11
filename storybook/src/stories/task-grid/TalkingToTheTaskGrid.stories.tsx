import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { BackendTasksExample, DriveTheTaskGridExample, OwnSettingsExample, RibbonCommandUiExample, TaskCommandsExample } from '../../task-grid/examples/talkingToTheTaskGridExamples'

const DESCRIPTION = `
Your code can create, open, move and delete tasks as the user's commands do, from a button outside the grid, a part of your own or a module. It does so through the control's task runtime, which also runs your own work behind the loading overlay and reaches the tasks and the control around them. Try it below: click *Add a task*.

{{canvas: Drive the task grid from your code}}

## Get the task runtime

The task runtime is the DatasetControl module named \`taskRuntime\`, loaded before every other module. Every mount brings a new one, so keep the latest:

| From | Get it with |
|---|---|
| Outside the control | \`onSetup\` on \`TaskDatasetControl\`, which hands you each mount's DatasetControl before its modules load: \`control.modules.observe('taskRuntime', …)\`, as the example does |
| \`onLoad\` | Its argument |
| A part of your own inside the control | \`useTaskRuntime()\` |
| A module | \`datasetControl.modules.get('taskRuntime')\`: see [**Write a module**](?path=/docs/controls-taskgrid-write-a-module--overview) |

Its \`lifecycle\` holds the mount's status and events, such as \`onReady\` once the tasks have loaded: see [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). The DatasetControl itself, to switch views or reload, is on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

## Act on tasks

\`taskRuntime.tasks\` makes the same changes the user does, through the store. Each runs behind the loading overlay and shows its failure in a dialog before it rejects. \`create\` is the exception: the new task's row shows the wait, and a failure resolves \`null\`.

| Member | Description |
|---|---|
| \`create(parentId?, { position?, data? })\` | Creates a task under \`parentId\`, or where *New* would, starting with the column values in \`data\`. \`position\` is \`'first'\`, \`'last'\` or \`{ before: siblingId }\`, and the \`defaultCreatePosition\` when left out or when that sibling is not under the parent. Returns the task once the store has created it, or \`null\`, such as while \`enableCreation\` is off. |
| \`move(taskId, targetTaskId, position)\` | Moves a task \`'above'\` or \`'below'\` another, or makes it the first \`'child'\` of it, and saves it. Returns \`true\`, or \`null\` when it cannot go there, such as into its own subtree. |
| \`delete(taskIds)\` | Asks the user, then deletes the tasks with their subtasks. Does nothing while \`enableDeletion\` is off. |
| \`open(taskIds)\` | Opens the tasks outside the grid, such as in their form. |
| \`openRecord(reference, columnName?)\` | Opens the task, or the record a lookup points to, as a link in the grid does. |
| \`openRelatedRecord(reference, columnName)\` | Opens the record the task's lookup in \`columnName\` points to. |

To change a value, set it on the task's record and save it, as *Complete the selected* does. A ribbon command shows what it throws, so a command that calls \`move\`, \`delete\` or \`open\` catches what they throw, which the task grid has shown already, as \`runQuietly\` does here:

{{story: Commands that create and move tasks}}

## Run your own work

\`taskRuntime.execute(operation, parameters?)\` runs an async operation as the task actions run: behind the loading overlay, with its failure shown once in a dialog. *Complete the selected* above uses it. It is the \`execute\` every runtime has, and its parameters are under *Run actions* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

## Add tasks your backend created

When your backend creates tasks itself, such as a task with its subtasks from one call, \`provider.createTasksWith(parentId, create, { position? })\` works out where the first task goes and calls \`create\` with \`{ parentRecord, stackRank }\`. \`create\` makes the tasks and returns \`{ records }\`, every task it created, and they join the tree, the first under \`parentId\` and the rest under it. It shows no wait of its own, so run it through \`execute\` with a loading message, as *From template* does.

{{story: Add tasks your backend created}}

## Settings of your own

\`TaskDatasetControl.Settings\` draws toggles. Add your own through the control's \`taskSettings\` part with \`hooks.settings.add(hook, priority?)\`: the hook runs as the menu opens and pushes \`{ key, label, isChecked, onChange }\`.

{{story: Settings of your own}}

## Change what the ribbon draws

\`taskRuntime.hooks.ribbonCommandUi.add(hook, priority?)\` changes every item \`TaskDatasetControl.Ribbon\` draws, those in its menus too, just before it draws them, such as \`item => item.disabled = true\`. To add commands, see *Add your own commands* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview).

{{story: Change what the ribbon draws}}

## The grid

\`TaskGrid\` is a Grid, so \`onSetup\` on \`TaskGrid\` hands you its \`IGrid\`: see [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). Its \`provider\` service is the task provider, and a cell of your own reads \`useTaskGridService('taskExpansion')\` to open and close tasks: \`isExpanded(taskId)\`, \`setExpanded(taskId, expanded)\`, \`toggle(taskId)\`, \`expandLevel()\` and \`collapseLevel()\`.

## Reference

### The task runtime

| Member | Description |
|---|---|
| \`tasks\` | The task actions. See *Act on tasks* above. |
| \`execute(operation, parameters?)\` | Runs your own work behind the loading overlay. See *Run your own work* above. |
| \`getProvider()\` | The task provider: the tasks, the selection and the tree. See *The task provider* below. |
| \`getView()\` | The open view, with its \`data\`. |
| \`getFieldMapping()\` | The field mapping \`onLoad\` returned. |
| \`getHoursPerDay()\` | The \`hoursPerDay\` \`onLoad\` returned, \`24\` when it returned none. |
| \`getLabels(set)\` | A label set as the control translates it: see [**Localization**](?path=/docs/concepts-localization--overview). |
| \`isFlatList()\`, \`setFlatList(isFlatList)\` | The flat list. See [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview). |
| \`isCreationEnabled()\`, \`isEditingEnabled()\`, \`isDeletionEnabled()\` | The control's \`enable…\` props. |
| \`hooks.ribbonCommandUi\` | Changes the items \`TaskDatasetControl.Ribbon\` draws. See above. |
| \`getRibbonCommandItems(items)\` | Copies of \`items\` with every ribbon command UI hook applied, menus included. |
| \`lifecycle\` | The mount's status and lifecycle events. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`services\` | \`get\`, \`find\` and \`observe\`, by key. See *Services* below. |

### The task provider

\`getProvider()\` returns an \`ITaskDataProvider\`: a data provider (see [**Data providers**](?path=/docs/concepts-data-providers--overview)) with these members of its own.

| Member | Description |
|---|---|
| \`taskEvents\` | The events every change raises. See *Events* on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). |
| \`getRecordTree()\` | \`view\`, the tree as the grid shows it, filtered and sorted, and \`structure\`, the whole tree: \`getChildren(parentId?)\`, \`getParent(taskId)\`, \`getAncestorIds(taskId)\`, \`getDescendants(taskId)\`, \`getNeighbours(taskId)\`. |
| \`getAllRecords()\` | Every loaded task, whatever the view shows. |
| \`getFieldMapping()\`, \`getRootTaskId()\`, \`getStore()\` | What \`onLoad\` returned. |
| \`isRecordActive(taskId)\` | Whether the task is active. |
| \`areInactiveTasksHidden()\`, \`setInactiveTasksHidden(isHidden)\` | *Hide inactive tasks*. |
| \`createTask(parentId?, { position?, data? })\` | Shows a new task at once and has the store create it. \`tasks.create\` adds the *(No Name)* subject, the dialog on a failure and the subject editor. Returns the task, or \`null\` under a task the store has not created yet. |
| \`isTaskPending(taskId)\`, \`whenTaskCreated(taskId)\` | Whether the store is still creating a task, and a promise of \`true\` once it has, \`false\` when it dropped it. It rejects when the store failed. |
| \`createTasksWith(parentId, create, { position? })\` | Adds the tasks your backend created. See *Add tasks your backend created* above. |
| \`moveTask(taskId, targetTaskId, position)\` | Places a task without saving it, and returns it, or \`null\` when it cannot go there; \`tasks.move\` saves it too. |
| \`updateTaskData(rawRecords)\` | Merges values into the loaded tasks by their id, keeping the user's unsaved edits. |
| \`synchronize()\` | Asks the store what the backend changed and merges it in. See *Rescheduled dates* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). |

What modules add to the task provider is on [**Write a module**](?path=/docs/controls-taskgrid-write-a-module--overview).

### Services

| Key | Holds |
|---|---|
| \`datasetControl\` | The DatasetControl of the mount, the one \`onSetup\` hands you: its views, parts and modules, such as \`modules.find('dependencies')\`. |
| \`pcfContext\` | The PCF context the control is under. |
| \`provider\` | The task provider, once \`onLoad\` has returned. |
| \`taskTree\` | The grid's tree, while \`TaskGrid\` is drawn: \`revealTask(taskId)\` scrolls a task into view. |
| \`savingChains\` | The tasks a save can reach, held until it settles: \`isTaskSaving(taskId)\`, \`isTaskLocked(taskId)\`, and \`track(taskIds, operation)\` for a write of your own. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'What the user can do with tasks, and the events that follow every change.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-write-a-module--overview', text: 'Package what your code does with the tasks as a module.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Switch views, reload, and reach the parts and modules of the DatasetControl.' },
]

const meta = {
    title: 'Controls/TaskGrid/Talking to the task grid',
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

export const DriveTheTaskGridFromYourCode: Story = {
    name: 'Drive the task grid from your code',
    render: () => renderStory(<DriveTheTaskGridExample />),
}

export const CommandsThatCreateAndMoveTasks: Story = {
    name: 'Commands that create and move tasks',
    render: () => renderStory(<TaskCommandsExample />),
    parameters: {
        docs: {
            description: {
                story: `Ribbon commands that insert a task above the selected one and move it among its siblings. Try: select *Install the network* and click **Move up**.`,
            },
        },
    },
}

export const AddTasksYourBackendCreated: Story = {
    name: 'Add tasks your backend created',
    render: () => renderStory(<BackendTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `A button of your own that adds a task with its subtasks, created in one call. Try: select *Website Redesign* and click **Add a launch checklist**.`,
            },
        },
    },
}

export const SettingsOfYourOwn: Story = {
    name: 'Settings of your own',
    render: () => renderStory(<OwnSettingsExample />),
    parameters: {
        docs: {
            description: {
                story: `A toggle of your own that filters the tasks. Try: turn on *In progress only* in the settings.`,
            },
        },
    },
}

export const ChangeWhatTheRibbonDraws: Story = {
    name: 'Change what the ribbon draws',
    render: () => renderStory(<RibbonCommandUiExample />),
    parameters: {
        docs: {
            description: {
                story: `*Delete* stays off while a project, a top-level task, is selected. Try: select *Website Redesign*, then one of its tasks.`,
            },
        },
    },
}
