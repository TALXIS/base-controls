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
| \`MemoryUserQueryStrategy\` | \`{ userQueries }\` — the array it reads and writes | none | Hand it the array you keep for the session, not a fresh literal: it is rebuilt per control instance, so a new array each time would wipe the views the user saved. |
| \`DataverseUserQueryStrategy\` | \`{ entityName, recordId?, ownerId? }\` | \`talxis_userquery\` | State is server-side, so a second instance is fine. \`entityName\` is only the \`talxis_returnedtypecode\` filter value; omit \`ownerId\` and the views are shared environment-wide. |
| \`DataverseCustomColumnsStrategy\` | \`{ entityName, recordId? }\` | \`talxis_attributedefinition\`, \`talxis_attributevalue\`, \`talxis_attributeoption\` and a relationship between \`entityName\` and the value table | The relationship is read from metadata, so any schema works; \`navigationPropertyName\` only disambiguates when there is more than one. Only \`DataverseTaskStrategy\` knows how to read the values back, and there is **no in-memory custom-columns implementation**. |
| \`MemoryTaskStrategy\` | \`({ onInitialize, …hooks }, deps)\` — \`onInitialize\` resolves \`{ rawData, metadata, columns }\`; one optional hook per operation sits beside it | none | Casts \`deps.templateDataProvider\` to \`MemoryTemplateDataProvider\`, so pair templates with the memory provider or not at all. \`onGetAvailableRelatedColumns\` returns \`[]\` — no related-entity columns. |
| \`MemoryTemplateDataProvider\` | \`{ templates }\` — records, columns, metadata and a \`children\` map | none | Only \`MemoryTaskStrategy\` reads its children. |
| \`DataverseTaskStrategy\` | \`({ onInitialize, …hooks }, deps)\` — \`onInitialize\` resolves the \`fetchXml\`, form ids and delete flags; the hooks sit beside it | Dataverse host, valid FetchXML | Needs a Dataverse custom-columns strategy in \`deps\` **if** any column name carries the custom-column suffix; it asserts the provider is there. Throws on template expansion. |
| \`MemoryLookupManyDataProviderFactory\` / \`DataverseLookupManyDataProviderFactory\` | \`.create(source)\` / \`.create(parameters)\` | records you hold / the column's \`FetchXml\` binding | What you return from \`onCreateLookupManyDataProvider\`, one provider per lookup-many cell. The Dataverse one takes the parameters it was handed as-is; both return \`undefined\` when they have nothing for the column. |

Both shipped descriptors are themselves reusable this way: nothing stops you from holding a \`MemoryTaskGridDescriptor\` and delegating most hooks to it.

## How the pieces reach each other

Whatever you return from \`onCreateTaskStrategy\` receives one argument, assembled by the grid rather than by you:

\`\`\`ts
interface ITaskStrategyDeps {
    enableInlineCreation: boolean
    enableTaskEditing: boolean
    savedQueryDataProvider: ISavedQueryDataProvider
    customColumnsDataProvider?: ICustomColumnsDataProvider
    templateDataProvider?: ITemplateDataProvider
}
\`\`\`

The two optional members are present exactly when you implemented the matching descriptor hook, so a strategy that needs one is really asking you to implement that hook. Forward \`deps\` to the shipped constructor untouched — the flags come from \`onGetGridParameters\`, and the providers wrap the strategies created earlier in the startup sequence.

## Dataverse data, in-memory views

The most useful mix, and the escape hatch when \`talxis_userquery\` is not deployed: real tasks over the Web API, personal views that live for the session only. No custom descriptor needed — the shipped one takes the strategy as a parameter.

\`\`\`ts
//kept outside the callback: it runs per control instance, and this array is the store
const userQueries: ISavedQuery[] = []

const descriptor = new DataverseTaskGridDescriptor({
    onInitialize: async () => ({
        baseFetchXml: BASE_FETCH_XML,
        fieldMapping: FIELD_MAPPING,
        systemQueries: SYSTEM_QUERIES,
        //personal views in memory, tasks in Dataverse
        onCreateUserQueryStrategy: () => new MemoryUserQueryStrategy({ userQueries }),
        gridParameters: { enableTaskEditing: true, enableQueryManager: true },
    }),
})
\`\`\`

Note what is *not* here: no \`onCreateCustomColumnsStrategy\`, so nothing reads \`talxis_attributedefinition\` and custom columns are off. Every optional feature works this way — the callback you leave out is the code you do not ship.

## Your own loader on MemoryTaskStrategy

If your data can be held in memory, you do not need a new task strategy at all. \`MemoryTaskStrategy\`'s one required hook is an async loader, so point it at your own data and keep everything else — from a descriptor of your own, or through \`MemoryTaskGridDescriptor\`'s \`onCreateTaskStrategy\` parameter:

\`\`\`ts
onCreateTaskStrategy: ({ deps }) => new MemoryTaskStrategy({
    onInitialize: async provider => ({
        rawData: await fetchMyTasks(),
        metadata: METADATA,
        columns: provider.getColumns(),
    }),
}, deps),
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

\`onCreateTask\` and \`onMoveTask\` work the same way. That is a server-backed grid without implementing the interface — or a subclass — yourself. [**Strategies → Memory**](?path=/story/task-grid-strategies-memory--overview) has the snippet. Write the interface from scratch only when the data cannot be held in memory at all — which, given the above, means almost never. [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview) covers that case.

## Pairings that do not work

- **\`MemoryTaskStrategy\` + \`DataverseCustomColumnsStrategy\`** — the column definitions appear, but the memory strategy never consults the custom-columns provider, so no record ever gets a value.
- **\`MemoryTaskStrategy\` + a non-memory template provider** — it casts to \`MemoryTemplateDataProvider\` and calls \`getTemplateChildren()\`, which throws on anything else.
- **\`DataverseTaskStrategy\` + custom-column names with no custom-columns strategy** — the provider is non-null asserted the moment such a column is in the view.
- **\`MemoryUserQueryStrategy\` built from a fresh array per call** — the callback runs on every remount, so the views the user saved are dropped each time. Resolve the array once and close over it.
- **Any Dataverse strategy outside a Dataverse host** — they call \`window.Xrm\` directly. This is why the Dataverse page has no live grid.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
