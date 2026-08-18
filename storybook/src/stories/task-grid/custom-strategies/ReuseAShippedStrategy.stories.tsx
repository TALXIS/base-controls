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
| \`MemorySavedQueryStrategy\` | \`{ onGetSystemQueries, userQueries }\` | none | \`onCreateUserQueryDataProvider\` must return **the same instance's** \`createDataProvider()\`. A second instance has its own array, and saved views appear to vanish. |
| \`DataverseSavedQueryStrategy\` | \`{ onGetSystemQueries, entityName, recordId?, ownerId? }\` | \`talxis_userquery\` | It is itself an \`IDataProvider\`, so it can back the dialog directly. State is server-side, so a second instance is fine. \`entityName\` is only the \`talxis_returnedtypecode\` filter value. |
| \`DataverseCustomColumnsStrategy\` | \`{ entityName, recordId? }\` | \`talxis_attributedefinition\`, \`talxis_attributevalue\`, \`talxis_attributeoption\` | Work in progress. Values persist only when the task entity **is** the Dataverse \`task\` table, and only \`DataverseTaskStrategy\` knows how to read them back. |
| \`MemoryTaskStrategy\` | \`({ onInitialize }, deps)\` | none | Casts \`deps.templateDataProvider\` to \`MemoryTemplateDataProvider\`, so pair templates with the memory provider or not at all. \`onGetAvailableRelatedColumns\` returns \`[]\` — no related-entity columns. |
| \`MemoryTemplateDataProvider\` | \`{ templates }\` — records, columns, metadata and a \`children\` map | none | Only \`MemoryTaskStrategy\` reads its children. |
| \`DataverseTaskStrategy\` | \`(params, deps)\` — \`fetchXml\` plus the optional form ids and delete flags | Dataverse host, valid FetchXML | Needs a Dataverse custom-columns strategy in \`deps\` **if** any column name carries the custom-column suffix; it asserts the provider is there. Throws on template expansion. |
| \`FetchXmlDataProviderFactory\` | \`.create({ fetchXml, variables })\` | the table being queried | Handy inside \`onCreateLookupManyDataProvider\`. Not on the root barrel — deep import only. |

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

The most useful mix, and the escape hatch when \`talxis_userquery\` is not deployed: real tasks over the Web API, views that live for the session only.

\`\`\`ts
export class MyDataverseDescriptor implements ITaskGridDescriptor {
    private _savedQueryStrategy = new MemorySavedQueryStrategy({
        onGetSystemQueries: async () => SYSTEM_QUERIES,
        userQueries: [],
    })

    public onGetFieldMapping() {
        return { subject: 'talxis_name', parentId: 'talxis_parentprojecttaskid', stackRank: 'talxis_stackrankstring' }
    }

    public onCreateSavedQueryStrategy() {
        return this._savedQueryStrategy
    }

    //the same instance, or the views you just saved are not the ones the dialog writes to
    public onCreateUserQueryDataProvider() {
        return this._savedQueryStrategy.createDataProvider()
    }

    public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
        return new DataverseTaskStrategy({ fetchXml: BASE_FETCH_XML }, deps)
    }

    public onGetGridParameters() {
        return { enableTaskEditing: true, enableRowDragging: true }
    }
}
\`\`\`

Note what is *not* here: no \`onCreateCustomColumnsStrategy\`, which is how you drop the \`talxis_attributedefinition\` read the shipped Dataverse descriptor does at startup. Custom columns are off, and nothing touches the attribute tables. If you would rather keep the shipped descriptor and change just that one answer, subclass it instead — [**Strategies → Dataverse**](?path=/story/task-grid-strategies-dataverse--overview) has the three-hook version.

## Your own loader on MemoryTaskStrategy

If your data can be held in memory, you do not need a new task strategy at all. \`MemoryTaskStrategy\` takes an async callback, so point it at your own loader and keep everything else:

\`\`\`ts
public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
    return new MemoryTaskStrategy({
        onInitialize: async () => ({
            records: await fetchMyTasks(),
            metadata: METADATA,
        }),
    }, deps)
}
\`\`\`

That gets you working create, delete, move, templates and editing against your own records. The grid holds the complete task set client-side no matter which strategy serves it, so loading everything up front costs you nothing here.

The one thing it does not do is write back: mutations land in the array and stop there. Subclass it and wrap the mutating hooks (\`onRecordSave\`, \`onCreateTask\`, \`onDeleteTasks\`, \`onMoveTask\` — all prototype methods, so \`super\` keeps the in-memory store in step) and you have a server-backed grid without implementing the interface yourself. [**Strategies → Memory**](?path=/story/task-grid-strategies-memory--overview) has the snippet. Write the interface from scratch only when the data cannot be held in memory at all — which, given the above, means almost never. [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview) covers that case.

## Pairings that do not work

- **\`MemoryTaskStrategy\` + \`DataverseCustomColumnsStrategy\`** — the column definitions appear, but the memory strategy never consults the custom-columns provider, so no record ever gets a value.
- **\`MemoryTaskStrategy\` + a non-memory template provider** — it casts to \`MemoryTemplateDataProvider\` and calls \`getTemplateChildren()\`, which throws on anything else.
- **\`DataverseTaskStrategy\` + custom-column names with no custom-columns strategy** — the provider is non-null asserted the moment such a column is in the view.
- **\`MemorySavedQueryStrategy\` + a provider from a different instance** — the dialog writes into an array nobody reads.
- **Any Dataverse strategy outside a Dataverse host** — they call \`window.Xrm\` directly. This is why the Dataverse page has no live grid.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
