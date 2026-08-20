import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Strategies/Dataverse',
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
\`DataverseTaskGridDescriptor\` drives the grid from a Dataverse entity over the Xrm Web API, with FetchXML as the query language.

It handles the wiring a model-driven subgrid would give you: saved views persisted per user, forms opened for create and edit, relationship columns associated and disassociated on save, and custom columns backed by attribute-definition rows.

\`\`\`ts
import { DataverseTaskGridDescriptor } from '@talxis/base-controls'
\`\`\`

> There is no live grid on this page. Storybook mocks only \`Xrm.Utility.getGlobalContext()\` — \`Xrm.WebApi\` and \`getEntityMetadata\` are rejecting stubs, so this strategy cannot run outside a Dataverse host. That gap is exactly why the [**Memory**](?path=/story/task-grid-strategies-memory--overview) strategy exists.

## Environment prerequisites

Two features are backed by TALXIS models rather than by your task entity, and **both are opt-in**: you get them by handing the descriptor the strategy that implements them. Say nothing and the model is never read — and the strategy's code is never pulled into your bundle.

| Feature | Strategy to supply | Model it needs |
|---|---|---|
| Personal saved views | \`onCreateUserQueryStrategy\` → \`DataverseUserQueryStrategy\` | \`talxis_userquery\` with \`talxis_userqueryid\`, \`talxis_name\`, \`talxis_description\`, \`talxis_layoutjson\`, \`talxis_returnedtypecode\`, \`talxis_recordid\`, \`ownerid\` |
| Custom columns | \`onCreateCustomColumnsStrategy\` → \`DataverseCustomColumnsStrategy\` | \`talxis_attributedefinition\`, \`talxis_attributevalue\`, \`talxis_attributeoption\` |

\`\`\`ts
onCreateUserQueryStrategy: (context) => new DataverseUserQueryStrategy({
    entityName: context.entityName,
    recordId: context.recordId,
    ownerId: context.userId,
}),
onCreateCustomColumnsStrategy: (context) => new DataverseCustomColumnsStrategy({
    entityName: context.entityName,
    recordId: context.recordId,
}),
\`\`\`

The \`context\` carries what the descriptor resolved for you — the entity name comes from your FetchXML, \`recordId\` from \`projectRecord\`, \`userId\` from the parameter of the same name.

> Wire a strategy whose model is **not** deployed and the grid sits on its loading skeleton and never renders: both reads happen before the first provider is created, and neither is wrapped in the grid's error handling. If a table is missing, leave its callback out.

Nothing stops you from answering a feature differently — return a strategy of your own, or one from another extension, and custom columns or views can live wherever you like. Task loading and saving keep using the shipped \`DataverseTaskStrategy\`. See [**Custom strategies → Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview).

## Setup

\`onInitialize\` resolves the **data**; the feature hooks and \`height\` sit next to it on the constructor argument. Task-level options go to the task strategy:

\`\`\`ts
const descriptor = new DataverseTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        baseFetchXml: \`
            <fetch>
                <entity name="talxis_projecttask">
                    <attribute name="talxis_name" />
                    <attribute name="statecode" />
                    <attribute name="talxis_stackrankstring" />
                    <attribute name="talxis_parentprojecttaskid" />
                    <filter>
                        <condition attribute="talxis_projectid" operator="eq" value="{{ project.id }}" />
                    </filter>
                </entity>
            </fetch>
        \`,
        fieldMapping: {
            subject: 'talxis_name',
            parentId: 'talxis_parentprojecttaskid',
            stackRank: 'talxis_stackrankstring',
            projectId: 'talxis_projectid',
        },
        systemQueries: [allTasksView],
        projectRecord: { entityName: 'talxis_project', id: projectId },
        userId: userId,
        gridParameters: { enableTaskEditing: true, enableQueryManager: true },
    }),
    //personal views are on because this returns a strategy - there is no flag for it
    onCreateUserQueryStrategy: (context) => new DataverseUserQueryStrategy({
        entityName: context.entityName,
        recordId: context.recordId,
        ownerId: context.userId,
    }),
    //the form ids, the delete behaviour and the root task are the strategy's options
    onCreateTaskStrategy: ({ deps, fetchXml, projectRecord, sourceRecord }) => new DataverseTaskStrategy({
        onInitialize: async () => ({
            fetchXml,
            projectRecord,
            sourceRecord,
            editFormId,
            createFormId,
            isCascadeDeleteEnabled: true,
        }),
        //every other hook takes the parameters of the matching DataverseTaskActions method
        onGetFormParameters: (operation, parameters) => parameters,
    }, deps),
})
\`\`\`

Both shipped strategies are shaped the same way: a required \`onInitialize\` that resolves what the strategy runs on — awaited while the grid shows its skeleton, so anything it needs can be fetched there — plus one optional hook per operation next to it. Every hook receives the parameters of the matching \`DataverseTaskActions\` method, so an override can wrap the shipped behaviour instead of replacing it:

\`\`\`ts
onDeleteTasks: async params => {
    await audit(params.taskIds)
    return DataverseTaskActions.deleteTasks(params)
},
\`\`\`

The full set: \`onGetAvailableColumns\`, \`onGetAvailableRelatedColumns\`, \`onCreateTask\`, \`onDeleteTasks\`, \`onCreateTasksFromTemplate\` (no Dataverse default — the shipped one throws), \`onOpenDatasetItems\`, \`onMoveTask\`, \`onRecordSave\`, \`onIsRecordActive\` and \`onGetFormParameters\`. The task entity name is derived from the FetchXML, so you never pass it separately — and it is handed back to you on the \`context\` of every \`onCreate*\` callback, which is why those hooks can live outside \`onInitialize\`. Omit \`onCreateTaskStrategy\` and the descriptor builds a plain \`DataverseTaskStrategy\` over the resolved FetchXML.

## Field mapping

\`fieldMapping\` tells the grid which of your columns carry structural meaning; everything else it treats as ordinary data. Dataverse uses \`IDataverseFieldMapping\`, which differs from the base mapping in two ways: \`stateCode\` is dropped because Dataverse always uses \`statecode\`, and \`projectId\` is added.

| Property | Required | Description |
|---|:--------:|---|
| \`subject\` | ✅ | The title column. Always pinned left and never hidden by the control. |
| \`parentId\` | ✅ | The lookup pointing at the parent task. This alone produces the hierarchy; a row with no parent is top level. |
| \`stackRank\` | ✅ | The ordering attribute — a text column. Sorted by default, and rewritten when rows are dragged. |
| \`projectId?\` | — | The project lookup on the task entity. When set, new tasks are pre-filled with the current project reference. |

> **Troubleshooting.** Everything renders flat → \`parentId\` is not the attribute that actually holds the parent. A FetchXML response carries lookups as \`_<lookup>_value\`, which the grid reads natively, so this is almost always a mapping typo rather than a data-shape problem. Rows in an unexpected order → \`stackRank\` is unmapped, or the attribute is not a string column.

## Liquid variables in FetchXML

\`baseFetchXml\` is a <a href="https://shopify.github.io/liquid/" target="_blank" rel="noreferrer">Liquid</a> template, rendered before the query runs. Two records are injected:

| Variable | Description |
|---|---|
| \`{{ project.id }}\` | GUID of the \`projectRecord\`, when one was supplied. |
| \`{{ project.<attribute> }}\` | Any raw attribute of that project record. |
| \`{{ currentRecord.id }}\` | GUID of the \`sourceRecord\`, when one was supplied. |
| \`{{ currentRecord.<attribute> }}\` | Any raw attribute of that source record. |

Both \`projectRecord\` and \`sourceRecord\` accept either a hydrated \`ISingleRecord\` or a plain \`{ entityName, id }\` reference — the descriptor fetches the record itself in the latter case.

## Parameters

Resolved by \`onInitialize\`:

| Parameter | Required | Description |
|---|:--------:|---|
| \`baseFetchXml\` | ✅ | FetchXML driving the initial load. May use the Liquid variables above. |
| \`fieldMapping\` | ✅ | Column roles, plus the optional \`projectId\` lookup. |
| \`systemQueries\` | ✅ | Non-deletable views in the view switcher. At least one, and their columns are the grid's catalogue. |
| \`projectRecord?\` | — | The project these tasks belong to. Injected into Liquid templates and pre-filled on create. |
| \`sourceRecord?\` | — | An additional record exposed to Liquid templates (a sprint or board, say). |
| \`userId?\` | — | Current user GUID. Pass it to the user-query strategy to scope personal views per user. |
| \`gridParameters?\` | — | Feature flags. See [**Customizations**](?path=/story/task-grid-customizations--overview). |

Passed next to \`onInitialize\` on the constructor argument, because they run again on every remount:

| Parameter | Required | Description |
|---|:--------:|---|
| \`height?\` | — | Container height. Read before the data resolves, to size the loading skeleton. |
| \`onCreateTaskStrategy?\` | — | Returns the task strategy. Where the form ids, \`rootTaskId\`, the cascade-delete flags and the per-operation hooks live. |
| \`onCreateUserQueryStrategy?\` | — | Returns the personal-views implementation. Omitted ⇒ system views only. |
| \`onCreateCustomColumnsStrategy?\` | — | Returns the custom-columns strategy. Omitted ⇒ custom columns off. |
| \`onCreateTemplateDataProvider?\` | — | Returns a template provider. Nothing Dataverse-side ships, so this has to be yours. |
| \`onCreateLookupManyDataProvider?\` | — | Feeds a lookup-many picker. Required once a column carries \`metadata.LookupMany\`. |
| \`onCreateGridCustomizerStrategy?\` | — | Supplies the AG Grid [**Customizer**](?path=/story/task-grid-customizations-customizer--overview). |

## Saved views

Return a \`DataverseUserQueryStrategy\` from \`onCreateUserQueryStrategy\` and personal views are persisted as \`talxis_userquery\` rows, with each view's columns, filters and sorting serialized into \`talxis_layoutjson\`. Pass \`userId\` as its \`ownerId\` to scope them per user; leave it out and the views are shared across the environment. System views come from \`systemQueries\` and are never written.

Without that callback the feature is simply off — \`enableQueryManager\`, \`enableSaveAsNewQuery\` and \`enableSaveQueryChanges\` then have nothing to switch on, because each getter ANDs the flag with the capability. That combination used to be reachable and threw *"Function not implemented"*; it no longer exists.

## Lookup-many columns

A lookup-many column surfaces a 1:N or N:N relationship as a single cell. Two distinct pieces of column metadata drive it:

\`\`\`ts
{
    name: 'tags',
    isVirtual: true,
    dataType: 'Lookup.Simple',
    metadata: {
        Targets: ['talxis_tag'],
        LookupMany: {
            // identifies the relationship - drives $expand and associate/disassociate
            ReferencedEntityNavigationPropertyName: 'talxis_projecttask_talxis_Tag_talxis_Tag',
        },
    },
    controls: [{
        appliesTo: 'both',
        name: 'ColorfulLookupMany',
        bindings: {
            // loads the picker's candidate records
            FetchXml: { value: '<fetch><entity name="talxis_tag">…</entity></fetch>', type: 'SingleLine.Text' },
            ColorPropertyName: { value: 'talxis_color', type: 'SingleLine.Text' },
        },
    }],
}
\`\`\`

- **\`metadata.LookupMany\`** identifies the relationship. The strategy resolves the OData expand clause from it and handles associate/disassociate on save. Its presence is also what makes the column render as a picker.
- **\`controls[0].bindings.FetchXml\`** is the candidate query. \`DataverseLookupManyDataProviderFactory\` reads it and renders its Liquid per row, so \`{{ task.id }}\` and \`{{ task.<attribute> }}\` scope the picker to the cell it sits on, while \`{{ project.* }}\` and \`{{ currentRecord.* }}\` come from the descriptor's records.
- **\`controls[0].name\`** picks the variant: \`LookupMany\`, \`PeopleLookupMany\`, or \`ColorfulLookupMany\`.

The column name itself is arbitrary — the relationship is identified by the navigation property, not the name.

Feeding the picker is a parameter, the same as on the memory descriptor — the factory does the work:

\`\`\`ts
onCreateLookupManyDataProvider: (parameters) => DataverseLookupManyDataProviderFactory.create(parameters),
\`\`\`

The parameters carry everything the factory needs — the cell's record and column, plus the project and source records the descriptor resolved — so there is nothing to wire. It returns \`undefined\` for a column with no \`FetchXml\` binding, and the grid then reports that the column has no candidates.

## Custom columns

\`enableCustomColumnCreation\` and friends let users define columns at runtime, stored as \`talxis_attributedefinition\` and \`talxis_attributevalue\` rows.

One thing about \`DataverseCustomColumnsStrategy\` is worth knowing before you wire it: nothing is assembled from the entity name. \`onRefresh\` reads the relationship between your task entity and \`talxis_attributevalue\` off the metadata and takes all three names it needs from it — the collection to expand through, the lookup to bind against, and that lookup's entity set — so a non-standard schema works as-is. Pass \`navigationPropertyName\` only if your entity somehow has more than one relationship to \`talxis_attributevalue\`; it then says which one holds the values.

The \`enableCustomColumn*\` flags only trim the ribbon commands within the feature. What decides whether it exists — and whether \`talxis_attributedefinition\` is read at all — is \`onCreateCustomColumnsStrategy\`.

## Templates

No Dataverse implementation ships: \`DataverseTemplateDataProvider\`'s capture throws and so does \`DataverseTaskStrategy.onCreateTasksFromTemplate\`. The \`onCreateTemplateDataProvider\` parameter is there for a provider of your own; without one the template commands stay out of the ribbon. See [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview) for the contract to implement, and [**Memory**](?path=/story/task-grid-strategies-memory--overview) for a working example.

## Ordering: stack ranks

Same scheme as the memory strategy: the data provider resolves the neighbours a row lands between — over the whole dataset, so rows the active view filters out still count — and the strategy turns them into a rank with \`StackRank.between\`. One drag rewrites one row rather than renumbering its siblings. The attribute you map to \`stackRank\` must be a text column. The [**Memory**](?path=/story/task-grid-strategies-memory--overview) page has the worked example.

Note what this does *not* cover: rows excluded by the view's own FetchXML are never loaded, so they cannot be considered. Keep the query broad enough to hold the siblings you reorder.

## One difference from the memory descriptor

\`onLoadDependencies\` re-runs your \`onInitialize\` on **every remount** — and the grid remounts when a view changes or a record is saved — re-fetching the project and source records each time. Keep that callback idempotent and cheap; do not treat it as session state the way the memory descriptor's cached one can be treated. The same applies to the \`onCreate*\` callbacks: they run per control instance, so anything stateful behind them has to live outside.

The only hook this descriptor has no parameter for is \`onGetControlId\` — the grid generates a UUID instead. Everything else is either wired natively or opt-in above; if you need to change what one of the native pieces does, see [**Custom strategies → Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
