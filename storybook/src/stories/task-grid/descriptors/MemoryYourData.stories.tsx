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

**Nothing is persisted for you either.** The grid rebuilds its control whenever it remounts — switching a
view does it, so does saving a record — and each rebuild starts from what \`onInitialize\` returns. Keeping
what the user did is yours to do, in one place.

### Keeping what the user did

\`onBeforeDestroy\` fires just before the grid is torn down, on unmount and on every remount, while every
provider still holds its data. Read whatever you want to keep off the service locator it hands you:

\`\`\`tsx
let records = SEED
let userQueries: ISavedQuery[] = []

<TaskGrid
    descriptor={descriptor}
    onBeforeDestroy={services => {
        records = services.get('taskDataProvider').getRawData()
        userQueries = services.find('userQueriesModule')?.provider.getQueries() ?? userQueries
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
happen, using the event props (\`onRecordSaved\`, \`onTasksDeleted\`, …), and treat \`onBeforeDestroy\` as the
last chance rather than the only one.

> Building a descriptor of your own rather than passing props? The same event is on the control:
> \`services.whenAvailable('datasetControl', control => control.events.addEventListener('onBeforeDestroy', …))\`.
> That is how the sandbox behind these examples keeps its data.

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

Returning fresh arrays every time, with no guard, wipes the data on every remount.

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
