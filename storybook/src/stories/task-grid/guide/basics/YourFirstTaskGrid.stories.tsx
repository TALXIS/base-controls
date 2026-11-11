import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { YourFirstTaskGridExample } from '../../../../task-grid/guide/basics/yourFirstTaskGridExamples'

const STEP = 'Your first task grid'

const DESCRIPTION = `
{{block: progress}}

The guide plans an office move: eleven tasks, some of them parts of others. This step puts the plan on the page as a tree, read-only, so the team sees every task in its place.

{{canvas: Your first task grid}}

## How it works

A task grid needs your rows, a store that keeps them, and a field mapping that says which of your columns make the tree. The rows are in *office.ts* in **Code**.

| In the code | What it is |
|---|---|
| \`MemoryTable\` | A table of plain rows in the page's memory, made from \`OFFICE_TASKS\`. |
| \`MemoryTaskStore\` | The store: where the task grid reads the tasks, and later saves them. It keeps them in the \`MemoryTable\`, and opens a task in an alert when its name is clicked. |
| \`fieldMapping\` | Which column holds a task's parent (\`parentId\`), its name (\`subject\`) and its rank (\`stackRank\`). |
| \`onLoad\` | Returns the store and the field mapping. It is handed the task runtime, which the store needs. |
| \`TaskDatasetControl\` | Holds the tasks: it calls \`onLoad\`, and from the next step decides what the user may change. |
| \`TaskGrid\` | Draws the tasks as a tree, inside \`DatasetControl.Body\`. |

**The tree.** A task with a \`parentid\` is a subtask of that task; a task without one is at the top. Among the tasks under the same parent, the \`stackrank\` sets the order: ranks are compared as text, so \`'0|100000:'\` comes before \`'0|200000:'\`.

**Mounts.** \`onLoad\` runs whenever the control mounts: when it opens, and later each time the user switches views. So it returns a new store each time, while the table stays outside \`onLoad\` and keeps every change. How mounts work is on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

The grid shows the columns of \`OFFICE_COLUMNS\` that are not hidden. Like every control, it needs the root providers from [**Quick start**](?path=/docs/concepts-quick-start--overview); the examples of this guide already have them.

## Try it

- Open *Move to the new office* with its chevron: its four subtasks appear under it, in the order of their \`stackrank\`.
- Press *Expand one level*, the **+** above the chevrons, twice: each press opens one more level, and the whole plan is open.
- In **Code**, open *office.ts* and give *Plan the opening party* the \`stackrank\` \`'0|050000:'\`: back in **Preview**, it is above *Move to the new office*.
- In *office.ts*, add \`{ taskid: 'keys', subject: 'Hand back the old keys', parentid: null, stackrank: '0|300000:', statecode: 0 }\` to \`OFFICE_TASKS\`: it is the last task at the top.

## Remember

- A task sits under its parent and in its place among its siblings; the field mapping names the columns that say so.
- The store keeps the tasks. \`MemoryTaskStore\` keeps them in a \`MemoryTable\` that you make once.
- \`onLoad\` runs on every mount and returns a new store each time.
- \`TaskDatasetControl\` holds the tasks, and \`TaskGrid\` in its body draws them.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Basics/Your first task grid',
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

export const YourFirstTaskGrid: Story = {
    name: 'Your first task grid',
    tags: ['!dev'],
    render: () => renderStory(<YourFirstTaskGridExample />),
}
