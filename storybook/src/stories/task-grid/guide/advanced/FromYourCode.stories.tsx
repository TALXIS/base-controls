import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { FromYourCodeExample, RibbonCommandsExample } from '../../../../task-grid/guide/advanced/fromYourCodeExamples'

const STEP = 'From your code'

const DESCRIPTION = `
{{block: progress}}

Your own buttons and commands can change the plan as the user does, with the same loading overlay and the same error dialogs, and your code can follow every change to the tree, whoever made it. This step adds a toolbar of your own to the office move, then ribbon commands of your own.

{{canvas: The task runtime}}

## How it works

The **task runtime** runs the task grid in one mount of \`TaskDatasetControl\`: it holds the tasks and makes the changes. Every mount has one of its own, as on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview), so reach the current one where your code runs:

| Your code runs | Reach it with |
|---|---|
| In \`onLoad\` | Its argument, as since [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| In a component inside the control, such as \`PlanToolbar\` | \`useTaskRuntime()\` |
| In \`onSetup\` on \`TaskDatasetControl\` | \`control.modules.observe('taskRuntime', …)\`, or \`control.modules.get('taskRuntime')\` in a hook that runs once the control has loaded |
| In a task module | \`datasetControl.modules.get('taskRuntime')\` |
| In a Gantt module | \`gantt.getTaskRuntime()\` |

\`taskRuntime.tasks\` makes the changes the user makes, with \`create\`, \`move\`, \`delete\` and \`open\`, each behind the loading overlay and with its failure shown. Each follows the props of [**Let users plan**](?path=/docs/controls-taskgrid-guide-basics-let-users-plan--overview): \`create\` needs \`enableCreation\`, \`delete\` needs \`enableDeletion\`, and \`move\` needs \`enableEditing\`. \`execute(operation, { loading, error })\` runs work of your own the same way, as **Mark done** does; with \`rethrow: false\` it resolves \`undefined\` when the work fails, instead of rejecting.

\`getProvider()\` returns the task provider, and its \`taskEvents\` report each change to the tree, whoever made it: \`onTasksCreated\`, \`onTasksDeleted\`, \`onTaskMoved\`, and \`onTasksUpdated\` for values merged in from your backend. A value the user edits is reported by the provider's own \`onRecordColumnValueChanged\`, as on [**Data providers**](?path=/docs/concepts-data-providers--overview). Every member and event is under *The task runtime* and *The task provider* on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

## Ribbon commands of your own

{{canvas: Ribbon commands of your own}}

\`TaskDatasetControl.Ribbon\` draws *New*, *Edit* and *Delete*, then the commands you add with the ribbon's \`hooks.commands\`. The hook runs on every load of the ribbon, such as when the selection changes, so add it from \`onSetup\` on \`TaskDatasetControl\` with \`control.parts.observe('ribbon', …)\`; what a command holds is on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview). A command can await a task action as it is, since the action shows its own error and an error shows once. A move clears the selection, as a drag does.

\`taskRuntime.hooks.ribbonCommandUi\` changes each item \`TaskDatasetControl.Ribbon\` draws, those in its menus too. An item is a Fluent \`IContextualMenuItem\` whose \`key\` is the command's \`id\`: \`'new'\`, \`'edit'\` and \`'delete'\` for the task grid's own. Here it turns *Delete* off while a top-level task is selected, so neither project of the plan can be deleted from the ribbon.

## Try it

- In *The task runtime*, open the plan, select *Paint the meeting rooms* and click **Add a check**: *Check the work* appears under it, and the line beside the buttons says *Created Check the work*.
- Select only *Check the work*, click *Delete* and confirm: the line says *Deleted 1 task*, though the ribbon deleted it.
- Select *Install the network* and click **Mark done**: its *Status* turns to *Done*.
- In *Ribbon commands of your own*, open the plan, select *Install the network* and click **Move up**: it moves above *Order desks and chairs*. Select *Move to the new office*: *Delete* is off.

## Remember

- The task runtime makes the changes the user makes, with the same overlay, the same errors and the same \`enable…\` props.
- Reach it with \`useTaskRuntime()\` inside the control, and through \`onSetup\` or a module outside it.
- \`taskEvents\` report each change to the tree, whoever made it.
- Commands of your own go in the ribbon's \`hooks.commands\`; \`hooks.ribbonCommandUi\` changes how any item is drawn.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Advanced/From your code',
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

export const TheTaskRuntime: Story = {
    name: 'The task runtime',
    tags: ['!dev'],
    render: () => renderStory(<FromYourCodeExample />),
}

export const RibbonCommandsOfYourOwn: Story = {
    name: 'Ribbon commands of your own',
    tags: ['!dev'],
    render: () => renderStory(<RibbonCommandsExample />),
}
