import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { TalkingToTheTaskGridExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
Every mounted \`TaskDatasetControl\` has an \`ITaskRuntime\`: one object your code talks to, to create, open, delete and move tasks, run its own work behind the loading overlay, and reach the provider and the control.

## Get the task runtime

Outside the control, keep the one \`onReady\` passes you once the tasks have loaded. \`onMounted\` passes it before each load, and \`onDestroyed\` as the control unmounts.

\`\`\`tsx
const runtimeRef = React.useRef<ITaskRuntime>()

const addTask = async () => {
    await runtimeRef.current?.tasks.create(undefined, { data: { subject: 'Review the budget' } })
}

<TaskDatasetControl onLoad={loadTasks} onReady={runtime => runtimeRef.current = runtime}>...</TaskDatasetControl>
\`\`\`

Inside the control, such as in a part of your own, \`useTaskRuntime()\` returns it. A module gets it with \`datasetControl.parts.get('taskRuntime')\`.

{{story: Drive the task grid from your code}}

## Tasks

\`taskRuntime.tasks\` makes the same changes the user does. Each one shows the loading overlay while it runs, and its failure in a dialog.

| Member | Description |
|---|---|
| \`create(parentId?, { position?, data? })\` | Creates a task under \`parentId\`, or at the top level, starting with the column values in \`data\`. Returns the task, or \`null\` while \`enableCreation\` is off. |
| \`open(taskIds)\` | Opens the tasks outside the grid, such as in their form. |
| \`delete(taskIds)\` | Asks the user, then deletes the tasks with their subtasks. Does nothing while \`enableDeletion\` is off. |
| \`move(taskId, targetTaskId, position)\` | Moves a task \`'above'\`, \`'below'\` or as a \`'child'\` of another, and saves it. Returns \`true\`, or \`null\` when it cannot go there. |
| \`openRecord(reference, columnName?)\` | Opens the task, or the record a lookup points to, as a link in the grid does. |

To change a value, set it on the record and save it: \`record.setValue('percentcomplete', 100)\`, then \`await record.save()\`.

## Run your own work

\`execute(operation, options?)\` runs an async operation as the task actions run: with the loading overlay, and its failure shown once in a dialog.

\`\`\`tsx
await taskRuntime.execute(saveAll, { loading: { message: 'Completing tasks...' }, error: { title: 'The tasks could not be completed.' } })
\`\`\`

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
| \`isFlatList()\`, \`setFlatList(isFlatList)\` | The flat list. See [**Views and the tree**](?path=/docs/taskgrid-views-and-the-tree--overview). |
| \`isCreationEnabled()\`, \`isEditingEnabled()\`, \`isDeletionEnabled()\` | The control's \`enable…\` props. |
| \`getHoursPerDay()\` | The control's \`hoursPerDay\`. |
| \`registerRibbonCommandUi(hook, priority?)\` | Changes every item \`TaskDatasetControl.Ribbon\` draws, those in its menus too, such as \`item => item.disabled = true\`. Returns its unregistration. |
| \`services\` | \`get\`, \`find\` and \`observe\`, by key: \`datasetControl\`, \`pcfContext\`, \`provider\`. |
| \`events\` | \`onDestroyed\`. |

\`services.get('datasetControl')\` is the DatasetControl itself: switch views, reload, and reach its parts and modules, such as \`modules.find('dependencies')\`. See [**DatasetControl › Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).

## Settings of your own

\`TaskDatasetControl.Settings\` draws toggles. Add your own through the control's \`taskSettings\` part:

\`\`\`tsx
const datasetControl = taskRuntime.services.get('datasetControl')
datasetControl.parts.get('taskSettings').registerSettings(settings => settings.push({
    key: 'highlightLate',
    label: 'Highlight late tasks',
    isChecked: isHighlightingLate,
    onChange: isChecked => setHighlightingLate(isChecked),
}))
\`\`\`

## The grid

\`TaskGrid\` is a Grid, so \`onReady\` on \`TaskGrid\` passes you its \`IGrid\`. See [**Grid › Talking to the grid**](?path=/docs/grid-talking-to-the-grid--overview). A cell of your own also reads \`useTaskGridService('taskExpansion')\`, to open and close tasks: \`isExpanded(taskId)\`, \`setExpanded(taskId, isExpanded)\`, \`toggle(taskId)\`, \`expandLevel()\` and \`collapseLevel()\`.
`

const meta = {
    title: 'TaskGrid/Talking to the task grid',
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
                story: `Three buttons outside the control, each calling the task runtime. Try: select a few tasks and complete them, or add a task and find it at the top.`,
            },
        },
    },
}
