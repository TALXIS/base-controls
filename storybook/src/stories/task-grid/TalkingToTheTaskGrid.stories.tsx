import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { TalkingToTheTaskGridExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
Your code can create, open, move and delete tasks as the user's commands do, from a button outside the grid, a part of your own or a module. It does so through the control's task runtime, which also runs your own work behind the loading overlay and reaches the tasks and the control around them. Try it below: click *Add a task*.

{{canvas: Drive the task grid from your code}}

## Get the task runtime

Every load mounts the control anew, with a new task runtime, so keep the latest one. Outside the control, \`onSetup\` on \`TaskDatasetControl\` passes it to you as each mount starts, before its tasks load, and \`onLoad\` gets the same runtime. Its \`lifecycle\` holds the mount's status and its events, such as \`onReady\` once the tasks have loaded: see [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

Inside the control, such as in a part of your own, \`useTaskRuntime()\` returns it. A module gets it with \`datasetControl.parts.get('taskRuntime')\`.

## Tasks

\`taskRuntime.tasks\` makes the same changes the user does. Each one shows its failure in a dialog, and the loading overlay while it runs, except \`create\`: the new task's row shows the wait.

| Member | Description |
|---|---|
| \`create(parentId?, { position?, data? })\` | Creates a task under \`parentId\`, or at the top level, starting with the column values in \`data\`. Returns the task once the store has created it, or \`null\`, such as while \`enableCreation\` is off. |
| \`open(taskIds)\` | Opens the tasks outside the grid, such as in their form. |
| \`delete(taskIds)\` | Asks the user, then deletes the tasks with their subtasks. Does nothing while \`enableDeletion\` is off. |
| \`move(taskId, targetTaskId, position)\` | Moves a task \`'above'\`, \`'below'\` or as a \`'child'\` of another, and saves it. Returns \`true\`, or \`null\` when it cannot go there. |
| \`openRecord(reference, columnName?)\` | Opens the task, or the record a lookup points to, as a link in the grid does. |
| \`openRelatedRecord(reference, columnName)\` | Opens the record the task's lookup in \`columnName\` points to. |

To change a value, set it on the record and save it, as *Complete the selected* does.

## Run your own work

\`execute(operation, options?)\` runs an async operation as the task actions run: with the loading overlay, and its failure shown once in a dialog. *Complete the selected* uses it.

| Option | Default | Description |
|---|---|---|
| \`loading.show\` | \`true\` | \`false\` runs it without the overlay. |
| \`loading.message\` | None | Shown in the overlay. |
| \`error.title\` | A generic title | The dialog's title. |
| \`error.rethrow\` | \`true\` | \`false\` resolves \`undefined\` once the dialog is shown, instead of throwing. |

## Settings of your own

\`TaskDatasetControl.Settings\` draws toggles. Add your own through the control's \`taskSettings\` part with \`registerSettings(hook, priority?)\`, as *Show the buttons* in the example does. Each toggle is \`{ key, label, isChecked, onChange }\`.

## The grid

\`TaskGrid\` is a Grid, so \`onSetup\` on \`TaskGrid\` passes you its \`IGrid\`. See [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). A cell of your own also reads \`useTaskGridService('taskExpansion')\`, to open and close tasks: \`isExpanded(taskId)\`, \`setExpanded(taskId, isExpanded)\`, \`toggle(taskId)\`, \`expandLevel()\` and \`collapseLevel()\`.

## Reference

### Other members

| Member | Description |
|---|---|
| \`getProvider()\` | The task provider: the tasks, the selection and the record tree. |
| \`getView()\` | The open view, with its \`data\`. |
| \`getFieldMapping()\` | The field mapping \`onLoad\` returned. |
| \`getLabels(set)\` | A label set as the control translates it: see [**Localization**](?path=/docs/concepts-localization--overview). |
| \`isFlatList()\`, \`setFlatList(isFlatList)\` | The flat list. See [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview). |
| \`isCreationEnabled()\`, \`isEditingEnabled()\`, \`isDeletionEnabled()\` | The control's \`enable…\` props. |
| \`getHoursPerDay()\` | The control's \`hoursPerDay\`. |
| \`lifecycle\` | The mount's status and lifecycle events. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`registerRibbonCommandUi(hook, priority?)\` | Changes every item \`TaskDatasetControl.Ribbon\` draws, those in its menus too, such as \`item => item.disabled = true\`. Returns its unregistration. |
| \`getRibbonCommandItems(items)\` | Copies of \`items\` with every ribbon command UI hook applied, menus included. |
| \`services\` | \`get\`, \`find\` and \`observe\`, by key: \`datasetControl\`, \`pcfContext\`, \`provider\`, \`taskTree\` (the grid's tree, while it is drawn). |

\`services.get('datasetControl')\` is the DatasetControl itself: switch views, reload, and reach its parts and modules, such as \`modules.find('dependencies')\`. See [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'What the user can do with tasks, and the events that follow every change.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Switch views, reload, and reach the parts and modules of the DatasetControl.' },
    { title: 'Write a module', iconName: 'Timeline', href: '?path=/docs/controls-taskgrid-gantt-write-a-module--overview', text: 'Reach the task runtime from a Gantt module of your own.' },
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
    render: () => renderStory(<TalkingToTheTaskGridExample />),
}
