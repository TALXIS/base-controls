import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Custom strategies/Reuse a shipped strategy',
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
A descriptor is not an all-or-nothing choice between memory and Dataverse. The grid's factory consumes only interfaces and does no \`instanceof\` check anywhere, so any shipped piece drops into a descriptor of your own next to pieces you wrote yourself.

That is the cheapest way out of most awkward situations: Dataverse tasks in an environment without the saved-view table, your own API behind memory's fully working CRUD, or a shipped view manager next to a task strategy you wrote.

## What you can reuse

| Piece | Construct with | Environment needs | Pairing caveat |
|---|---|---|---|
| \`MemoryUserQueryStrategy\` | \`{ userQueries, services }\` — the array it reads and writes, plus the locator every strategy takes | none | Hand it the array you keep for the session, not a fresh literal: it is rebuilt per control instance, so a new array each time would wipe the views the user saved. |
| \`TalxisUserQueryStrategy\` | \`{ entityName, recordId?, ownerId?, services }\` | \`talxis_userquery\` | State is server-side, so a second instance is fine. \`entityName\` is only the \`talxis_returnedtypecode\` filter value; omit \`ownerId\` and the views are shared environment-wide. |
| \`MemoryTaskStrategy\` | \`{ onInitialize, services, …hooks }\` — \`onInitialize\` resolves \`{ rawData, metadata, columns }\`; one optional hook per operation sits beside it | none | \`onGetAvailableRelatedColumns\` returns \`[]\` — no related-entity columns. Column metadata is passed through as the views declare it, so a lookup is filterable only if you said so — see [**Memory → Lookup-many columns**](?path=/story/task-grid-strategies-memory--overview). |
| \`MemoryTemplateDataProvider\` | \`{ templates, services }\` — the template source, plus the locator it reaches the task side through | none | Pairs with any task strategy. It copies the source, so a template captured at runtime is kept only if you listen for \`onAfterTemplateCreated\` and store \`getTemplateSource()\`. |
| \`DataverseTaskStrategy\` | \`{ onInitialize, services, …hooks }\` — \`onInitialize\` resolves the \`fetchXml\`, form ids and delete flags; the hooks sit beside it | Dataverse host, valid FetchXML | Reads and writes lookup-many relationship columns through the Xrm Web API, so those columns need their \`LookupMany\` metadata to be right. |
| \`MemoryTaskDependencyStrategy\` | \`{ dependencies, services }\` — the array it reads and deletes from, plus the locator | none | Pairs with any task strategy. Hand it the array you keep for the session, not a shared fixture: deleting a task removes the rows that pointed at it. It is asked for the tasks the grid loaded rather than deciding scope itself, so the array can hold dependencies for tasks the current view excludes. |
| \`DataverseTaskDependencyStrategy\` | the table, its two task lookups, its option set, what the option set's values mean, and \`services\` — all required | Dataverse host, a dependency table | Read-only, and scoped by the task ids the grid hands it rather than by a filter of its own, so widening the view widens the read. Nothing filters \`statecode\`: deactivated rows are counted. An option-set value the map does not name falls back to finish-to-start with a warning. |
| \`MemoryLookupManyDataProviderFactory\` / \`DataverseLookupManyDataProviderFactory\` | \`.create({ source, services })\` / \`.create(parameters)\` | records you hold / the column's \`FetchXml\` binding | What you return from a \`lookupMany\` module's \`createDataProvider\`, one provider per lookup-many cell. The Dataverse one takes the parameters it was handed as-is; both return \`undefined\` when they have nothing for the column. |

Both shipped descriptors are themselves reusable this way: nothing stops you from holding a \`MemoryTaskGridDescriptor\` and delegating most hooks to it.

## How the pieces reach each other

One rule: every factory the grid calls hands you an object with \`services\` on it, and every strategy, provider and module factory takes \`services\` as a field of its own params object. Forward it and each piece resolves what it needs when a method runs:

\`\`\`ts
//the descriptor hands the locator to your builder; forward it untouched
onCreateTaskStrategy: ({ services }) => new MemoryTaskStrategy({ onInitialize, services })

//the same locator is what a provider is constructed with
new MemoryTemplateDataProvider({ templates, services })
\`\`\`

What a locator holds depends on which modules the grid runs with — see [**Custom strategies → Services**](?path=/story/task-grid-custom-strategies--overview).

## Dataverse data, in-memory views

The most useful mix, and the escape hatch when \`talxis_userquery\` is not deployed: real tasks over the Web API, personal views that live for the session only. No custom descriptor needed — the shipped one takes the module.

\`\`\`ts
//kept outside the callback: it runs per control instance, and this array is the store
const userQueries: ISavedQuery[] = []

const descriptor = new DataverseTaskGridDescriptor({
    onInitialize: async () => ({
        baseFetchXml: BASE_FETCH_XML,
        fieldMapping: FIELD_MAPPING,
        systemQueries: SYSTEM_QUERIES,
        gridParameters: { enableTaskEditing: true, enableViewSwitcher: true },
        //personal views in memory, tasks in Dataverse. Importing createUserQueryModule is what brings
        //the view manager and the save dialogs along with the strategy
        modules: {
            onGetUserQueriesModule: ({ services }) => createUserQueryModule({
                strategy: new MemoryUserQueryStrategy({ userQueries, services }),
                services,
                enableQueryManager: true,
            }),
        },
    }),
})
\`\`\`

Note what is *not* here: no \`onGetTemplatesModule\`, so the template commands stay out of the ribbon. Every optional feature works this way — the builder you leave out is the code you do not ship. See [**Modules**](?path=/story/task-grid-modules--overview).

## Your own loader on MemoryTaskStrategy

If your data can be held in memory, you do not need a new task strategy at all. \`MemoryTaskStrategy\`'s one required hook is an async loader, so point it at your own data and keep everything else — from a descriptor of your own, or through the \`onCreateTaskStrategy\` \`MemoryTaskGridDescriptor\`'s \`onInitialize\` resolves:

\`\`\`ts
onCreateTaskStrategy: ({ services }) => new MemoryTaskStrategy({
    onInitialize: async provider => ({
        rawData: await fetchMyTasks(),
        metadata: METADATA,
        columns: provider.getColumns(),
    }),
}),
\`\`\`

That gets you working create, delete, move, templates and editing against your own records. The grid holds the complete task set client-side no matter which strategy serves it, so loading everything up front costs you nothing here.

The one thing it does not do is write back: mutations land in the array and stop there. That is what the mutating hooks are for — each one receives the parameters of the matching \`MemoryTaskActions\` method, so you persist and then forward, and the in-memory store stays in step without a subclass:

\`\`\`ts
onRecordSave: async params => {
    const result = MemoryTaskActions.saveRecord(params)   //writes the dirty fields into the store
    await api.patch(result.recordId, result.fields)
    return result
},
onDeleteTasks: async params => {
    await api.delete(params.taskIds)
    return MemoryTaskActions.deleteTasks(params)
},
\`\`\`

\`onCreateTask\` and \`onMoveTask\` work the same way — and both are handed the siblings they land between, resolved over the whole dataset, so you never compute that yourself. That is a server-backed grid without implementing the interface — or a subclass — yourself. [**Strategies → Memory**](?path=/story/task-grid-strategies-memory--overview) has the snippet. Write the interface from scratch only when the data cannot be held in memory at all — which, given the above, means almost never. [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview) covers that case.

## Pairings that do not work

- **Any Dataverse strategy outside a Dataverse host** — they call \`window.Xrm\` directly. This is why the Dataverse page has no live grid.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
