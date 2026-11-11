import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { LetUsersPlanExample } from '../../../../task-grid/guide/basics/letUsersPlanExamples'

const STEP = 'Let users plan'

const DESCRIPTION = `
{{block: progress}}

A plan changes every day, so the team plans where they see it: they add tasks, rename them, change their dates, move them about and delete them, while tasks that are finished stay read-only.

{{canvas: Let users plan}}

## How it works

The plan is the one from the last step; in **Code**, the lines this step adds carry a \`//new:\` comment.

Three props say what the user may change, and each is off until you turn it on. Some changes also need a module: a feature you add by listing it in a \`modules\` prop.

| To let the user | Turn on | And add |
|---|---|---|
| Add a task with *New*, or a subtask with the **+** on a row | \`enableCreation\` | |
| Change a task in its cells | \`enableEditing\` | \`createTaskEditingModule()\` to \`TaskGrid\` |
| Move a task by dragging its row | \`enableEditing\` | \`createTaskDraggingModule()\` to \`TaskDatasetControl\` |
| Open the selected tasks in their form with *Edit* | \`enableEditing\` | \`createRowSelectionModule()\` to \`TaskGrid\` |
| Delete the selected tasks with *Delete* | \`enableDeletion\` | \`createRowSelectionModule()\` to \`TaskGrid\` |

\`TaskDatasetControl.Ribbon\` in the header shows *New*, and *Edit* and *Delete* while tasks are selected; the memory store opens a task in an alert instead of a form. Some modules go in \`TaskGrid\` and others in \`TaskDatasetControl\`; [**How modules work**](?path=/docs/controls-taskgrid-guide-features-how-modules-work--overview) says which goes where.

**Every change saves on its own.** An edited cell, a dragged row, a new task and a confirmed deletion go to the store at once, with no *Save* button.

**Inactive tasks.** A task whose \`statecode\` is not \`0\` is inactive, like *Sign the lease* in *office.ts*. It is read-only: its cells do not open, its row does not drag, and it has no **+**. It can still be deleted. The field mapping's \`stateCode\` names this column, and is \`statecode\` unless you set it.

## Try it

- Open *Move to the new office*, point at *Fit out the space* and press its **+**: a new task opens as its first subtask, named *(No Name)*. Click into the name, replace it with one of your own and press Enter.
- Double-click the *Due* of *Book the movers* and pick another day: the new date saves at once.
- Drag *Book the movers* onto *Fit out the space* and hold it there until the row is highlighted, then drop it: it is now the first subtask of *Fit out the space*.
- Double-click a cell of *Sign the lease*: it does not open, and the row shows a lock.

## Remember

- \`enableCreation\`, \`enableEditing\` and \`enableDeletion\` say what the user may change; all three are off by default.
- Editing cells and dragging rows are modules: editing goes in \`TaskGrid\`, dragging in \`TaskDatasetControl\`.
- Every change saves on its own.
- A task whose \`statecode\` is not \`0\` is inactive and read-only.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Basics/Let users plan',
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

export const LetUsersPlan: Story = {
    name: 'Let users plan',
    tags: ['!dev'],
    render: () => renderStory(<LetUsersPlanExample />),
}
