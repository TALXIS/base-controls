import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { TalkingToTheTaskGridExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
The user creates, opens, moves and deletes tasks through the grid's commands, but your code can do the same, from a button outside the grid, a part of your own or a module. It does so through one object, the \`ITaskRuntime\`, which every mounted \`TaskDatasetControl\` creates. It acts on tasks as the user's commands do, runs your own work behind the loading overlay, and reaches the provider and the control.

{{story: Drive the task grid from your code}}

## Get the task runtime

Outside the control, keep the one \`onReady\` passes you; \`onMounted\` and \`onDestroyed\` pass it too, at the steps under *Lifecycle* on [**DatasetControl › Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview). Inside the control, such as in a part of your own, \`useTaskRuntime()\` returns it. A module gets it with \`datasetControl.parts.get('taskRuntime')\`.

## Tasks

\`taskRuntime.tasks\` makes the same changes the user does. Each one shows the loading overlay while it runs, and its failure in a dialog.

| Member | Description |
|---|---|
| \`create(parentId?, { position?, data? })\` | Creates a task under \`parentId\`, or at the top level, starting with the column values in \`data\`. Returns the task, or \`null\` while \`enableCreation\` is off. |
| \`open(taskIds)\` | Opens the tasks outside the grid, such as in their form. |
| \`delete(taskIds)\` | Asks the user, then deletes the tasks with their subtasks. Does nothing while \`enableDeletion\` is off. |
| \`move(taskId, targetTaskId, position)\` | Moves a task \`'above'\`, \`'below'\` or as a \`'child'\` of another, and saves it. Returns \`true\`, or \`null\` when it cannot go there. |
| \`openRecord(reference, columnName?)\` | Opens the task, or the record a lookup points to, as a link in the grid does. |

To change a value, set it on the record and save it, as *Complete the selected* does.

## Run your own work

\`execute(operation, options?)\` runs an async operation as the task actions run: with the loading overlay, and its failure shown once in a dialog. *Complete the selected* above uses it.

| Option | Default | Description |
|---|---|---|
| \`loading.show\` | \`true\` | \`false\` runs it without the overlay. |
| \`loading.message\` | None | Shown in the overlay. |
| \`error.title\` | A generic title | The dialog's title. |
| \`error.rethrow\` | \`true\` | \`false\` resolves \`undefined\` once the dialog is shown, instead of throwing. |

## Everything else

| Member | Description |
|---|---|
| \`getProvider()\` | The task provider: the tasks, the selection and the record tree. |
| \`getView()\` | The open view, with its \`data\`. |
| \`getFieldMapping()\` | The field mapping \`onLoad\` returned. |
| \`isFlatList()\`, \`setFlatList(isFlatList)\` | The flat list. See [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview). |
| \`isCreationEnabled()\`, \`isEditingEnabled()\`, \`isDeletionEnabled()\` | The control's \`enable…\` props. |
| \`getHoursPerDay()\` | The control's \`hoursPerDay\`. |
| \`registerRibbonCommandUi(hook, priority?)\` | Changes every item \`TaskDatasetControl.Ribbon\` draws, those in its menus too, such as \`item => item.disabled = true\`. Returns its unregistration. |
| \`services\` | \`get\`, \`find\` and \`observe\`, by key: \`datasetControl\`, \`pcfContext\`, \`provider\`. |
| \`events\` | \`onDestroyed\`. |

\`services.get('datasetControl')\` is the DatasetControl itself: switch views, reload, and reach its parts and modules, such as \`modules.find('dependencies')\`. See [**DatasetControl › Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

## Settings of your own

\`TaskDatasetControl.Settings\` draws toggles. Add your own through the control's \`taskSettings\` part with \`registerSettings(hook, priority?)\`, as *Show the buttons* above does. Each toggle is \`{ key, label, isChecked, onChange }\`.

## The grid

\`TaskGrid\` is a Grid, so \`onReady\` on \`TaskGrid\` passes you its \`IGrid\`. See [**Grid › Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). A cell of your own also reads \`useTaskGridService('taskExpansion')\`, to open and close tasks: \`isExpanded(taskId)\`, \`setExpanded(taskId, isExpanded)\`, \`toggle(taskId)\`, \`expandLevel()\` and \`collapseLevel()\`.
`

const meta = {
    title: 'Controls/TaskGrid/Talking to the task grid',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
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
    parameters: {
        docs: {
            description: {
                story: `Three buttons outside the control call the task runtime, and a setting of its own hides them. Try: select a few tasks and complete them, or turn off *Show the buttons* in the settings.`,
            },
        },
    },
}
