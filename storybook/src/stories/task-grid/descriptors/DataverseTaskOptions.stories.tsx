import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Descriptors/Dataverse/Task options',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                component: `
## Deleting tasks

Two strategy options decide what deleting a parent task does. They resolve in this order:

| \`isDeletingTasksWithChildrenEnabled\` | \`isCascadeDeleteEnabled\` | Result |
|:---:|:---:|---|
| \`false\` (default) | either | A task that has children is refused and reported as an error. Nothing under it is deleted. |
| \`true\` | \`true\` | The task and its whole subtree are deleted. |
| \`true\` | \`false\` | Only the task is deleted; what happens to its children is the relationship's delete behaviour. |

The children check reads the complete hierarchy, so a child hidden by the active filter still counts.

> Leave \`isCascadeDeleteEnabled\` off when the task parent relationship is **parental** in Dataverse: the
> platform already deletes the subtree, and asking the client to delete it as well means deleting rows that
> are already gone.

## Ordering: stack ranks

Ordering works the same way as everywhere else — [**Memory → Task options**](?path=/story/task-grid-descriptors-memory-task-options--overview), under *Ordering* has the worked example. Two things are specific to Dataverse:

- The attribute you map to \`stackRank\` must be a **text** column.
- Rows the FetchXML excludes are never loaded, so they cannot be ranked against. Keep the query broad enough to hold the siblings you reorder.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
