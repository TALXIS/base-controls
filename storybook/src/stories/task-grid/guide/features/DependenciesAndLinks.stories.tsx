import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { DependenciesAndLinksExample } from '../../../../task-grid/guide/features/dependenciesAndLinksExamples'

const STEP = 'Dependencies and links'

const DESCRIPTION = `
{{block: progress}}

Some work waits on other work: the network goes in once the desks are there, and nobody moves in before the network and the movers are ready. Dependencies record this, counted in the grid and drawn as links on the timeline.

{{canvas: Dependencies and links}}

## How it works

This step adds a pair of modules to the plan of [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview), one in each of two homes. In **Code**, the new lines carry \`//new:\`, and *dependencies.ts* holds the four dependencies.

| Module | Is a | Does |
|---|---|---|
| \`createMemoryDependenciesModule({ dependencies })\` | Task module | Holds the dependencies, and counts them in *Predecessors* and *Successors* |
| \`createLinksModule()\` | Gantt module | Draws the dependencies as links, and saves the links the user draws through the dependencies module |

The links module needs the dependencies module: without it, the Gantt fails with an error. A dependency names its \`predecessorTaskId\`, the task that comes first, its \`successorTaskId\` and its \`type\`. The memory module keeps them in the \`MemoryTable\` you pass, and moves no dates.

**Drawing a link.** The user drags from the dot at one end of a bar to a bar of another task, and the two ends decide the type:

| From the predecessor's | To the successor's | \`type\` | The successor |
|---|---|---|---|
| End | Start | \`finishToStart\` | Starts once the predecessor ends |
| Start | Start | \`startToStart\` | Starts once the predecessor starts |
| End | End | \`finishToFinish\` | Ends once the predecessor ends |
| Start | End | \`startToFinish\` | Ends once the predecessor starts |

While the link is drawn, its tooltip names the type and the two tasks. It also says why a link is refused: a task cannot depend on itself, two tasks are linked only once, and no link may close a loop. Resting the pointer on a link shows the same, with the dates it joins, and a double-click deletes it once the user confirms. Drawing and deleting links need \`enableEditing\`, and deleting a task deletes its dependencies.

## Try it

- Press *Expand one level* twice, then drag from the dot at the end of *Paint the meeting rooms* to the start of *Move in*: a finish-to-start link appears, and *Move in* counts 3 predecessors.
- Drag from the end of *Move in* to the start of *Order desks and chairs*: the tooltip says the link would make a loop, and no link is drawn.
- Select *Install the network* and click *Delete*: once you confirm, its two links go, *Order desks and chairs* has no successor left, and *Move in* counts one predecessor fewer.

## Remember

- The dependencies are a task module; the links module is a Gantt module that draws them and saves through it.
- *Predecessors* and *Successors* show the counts when a view names their columns.
- A link to the task itself, a second link between two tasks or a loop is refused.
- Deleting a task deletes its dependencies.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Features/Dependencies and links',
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

export const DependenciesAndLinks: Story = {
    name: 'Dependencies and links',
    tags: ['!dev'],
    render: () => renderStory(<DependenciesAndLinksExample />),
}
