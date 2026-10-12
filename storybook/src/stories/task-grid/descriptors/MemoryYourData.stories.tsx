import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Descriptors/Memory/Your data',
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
## Your data, and who owns it

**Nothing you hand a memory implementation is ever written to.** Every one of them deep-clones what it is
given — the array and everything in it — so an inline edit, a drag, a saved view or a captured template
changes the grid's copy and never your fixture. Two grids can share the same arrays, and a fixture stays a
fixture.

**Nothing is persisted for you either.** Every view the grid loads gets a task strategy of its own, and every
mount starts from what \`onInitialize\` returns. \`MemoryTaskGridDescriptor\` carries the tasks from one view
to the next for you; keeping what the user did beyond the mount is yours to do.

> What the user did *to a view* — its columns, sorting, filters, expanded rows — is a different thing, and the
> grid keeps it with a \`stateKey\`. See [**Get started → State**](?path=/story/task-grid-get-started--overview).

### Keeping what the user did

\`onDestroyed\` fires before the grid goes, while every provider still holds its data. Read whatever you want
to keep off the runtime it hands you:

\`\`\`tsx
let records = SEED
let userQueries: ISavedQuery[] = []

<TaskGrid
    descriptor={descriptor}
    onDestroyed={runtime => {
        records = runtime.services.get('taskDataProvider').getRawData()
        userQueries = runtime.services.find('userQueriesModule')?.provider.getQueries() ?? userQueries
    }} />
\`\`\`

…and \`onInitialize\` hands \`records\` back on the next mount. Every provider has a getter for this:

| Data | Read it from |
|---|---|
| Tasks | \`services.get('taskDataProvider').getRawData()\` |
| Personal views | \`services.find('userQueriesModule')?.provider.getQueries()\` |
| Templates | \`services.find('templatesModule')?.provider.getTemplateSource()\` |
| Dependencies | \`services.find('dependenciesModule')?.provider.getDependencies()\` |
| Checklists | \`services.find('checklistModule')?.provider.getItems()\` |

Writing to a server is the same shape — persist there instead of into a variable. Or persist as changes
happen, using the event props (\`onAfterRecordSaved\`, \`onTasksDeleted\`, …), and treat \`onDestroyed\` as the
last chance rather than the only one.

> Building your own task strategy rather than passing props? \`MemoryTaskStrategy\` takes \`onDestroy\`, called
> with the view's provider before it goes — \`onDestroy: provider => records = provider.getRawData()\`. The rest
> is on the runtime: \`services.get('taskGrid').events.addEventListener('onDestroyed', …)\`. That is how the
> sandbox behind these examples keeps its data.

### Two things that will otherwise bite

**Seed once, behind a flag of your own.** Return the *current* value of your store on every call, not a
freshly generated one:

\`\`\`ts
let isSeeded = false
let records: IRawRecord[] = []

onInitialize: async () => {
    if (!isSeeded) {
        records = await fetchSeedRecords()
        isSeeded = true
    }
    return { records, /* … */ }
}
\`\`\`

Returning fresh arrays every time, with no guard, wipes the data on every mount.

**Keep one descriptor** for as long as the session should last — build it in \`useMemo\`, or outside the
component, never inline in JSX. A new descriptor starts from the seed again.

\`\`\`tsx
const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor(), [])
\`\`\`
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
