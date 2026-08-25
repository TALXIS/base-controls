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

It handles the wiring a model-driven subgrid would give you: saved views persisted per user, forms opened for create and edit, and relationship columns associated and disassociated on save.

\`\`\`ts
import { DataverseTaskGridDescriptor } from '@talxis/base-controls'
\`\`\`

> There is no live grid on this page. Storybook mocks only \`Xrm.Utility.getGlobalContext()\` — \`Xrm.WebApi\` and \`getEntityMetadata\` are rejecting stubs, so this strategy cannot run outside a Dataverse host. That gap is exactly why the [**Memory**](?path=/story/task-grid-strategies-memory--overview) strategy exists.

## Environment prerequisites

Personal saved views are backed by a TALXIS model rather than by your task entity, and they are **opt-in**: you get them by registering the module that carries them. Say nothing and the model is never read — and the module's code is never pulled into your bundle.

| Feature | Module to register | Model it needs |
|---|---|---|
| Personal saved views | \`modules.onGetUserQueriesModule\` → \`createUserQueryModule({ strategy: new TalxisUserQueryStrategy(...) })\` | \`talxis_userquery\` with \`talxis_userqueryid\`, \`talxis_name\`, \`talxis_description\`, \`talxis_layoutjson\`, \`talxis_returnedtypecode\`, \`talxis_recordid\`, \`ownerid\` |

\`\`\`ts
//part of what onInitialize resolves - see Modules for the full picture
modules: {
    onGetUserQueriesModule: context => createUserQueryModule({
        strategy: new TalxisUserQueryStrategy({
            entityName: context.entityName,
            recordId: context.recordId,
            ownerId: context.userId,
        }),
        enableQueryManager: true,
    }),
},
\`\`\`

Each builder gets only the slice of context its own strategy needs — the entity name comes from your FetchXML, \`recordId\` from \`projectRecord\`, \`userId\` from the parameter of the same name — not one shared object every builder has to pick through. See [**Modules**](?path=/story/task-grid-modules--overview).

> Register a module whose model is **not** deployed and the grid sits on its loading skeleton and never renders: both reads happen before the first provider is created, and neither is wrapped in the grid's error handling. If a table is missing, leave its builder out.

Nothing stops you from answering a feature differently — return a strategy of your own, or one from another extension, and views can live wherever you like. Task loading and saving keep using the shipped \`DataverseTaskStrategy\`. See [**Custom strategies → Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview).

## Setup

\`onInitialize\` resolves everything — the data, the task strategy and the feature modules. \`height\` is the only other constructor parameter, because the loading skeleton needs it before your data exists:

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
        gridParameters: { enableTaskEditing: true, enableViewSwitcher: true },
        //personal views are on because this registers the module - there is no flag for it
        modules: {
            onGetUserQueriesModule: context => createUserQueryModule({
                strategy: new TalxisUserQueryStrategy({
                    entityName: context.entityName,
                    recordId: context.recordId,
                    ownerId: context.userId,
                }),
                enableQueryManager: true,
            }),
        },
        //the form ids, the delete behaviour and the root task are the strategy's options
        onCreateTaskStrategy: ({ services, fetchXml, projectRecord, sourceRecord }) => new DataverseTaskStrategy({
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
        }, services),
    }),
})
\`\`\`

Both shipped strategies are shaped the same way: a required \`onInitialize\` that resolves what the strategy runs on — awaited while the grid shows its skeleton, so anything it needs can be fetched there — plus one optional hook per operation next to it. Every hook receives the parameters of the matching \`DataverseTaskActions\` method, so an override can wrap the shipped behaviour instead of replacing it:

\`\`\`ts
onDeleteTasks: async params => {
    await audit(params.taskIds)
    return DataverseTaskActions.deleteTasks(params)
},
\`\`\`

The full set: \`onGetAvailableColumns\`, \`onGetAvailableRelatedColumns\`, \`onCreateTask\`, \`onDeleteTasks\`, \`onOpenDatasetItems\`, \`onMoveTask\`, \`onRecordSave\`, \`onIsRecordActive\` and \`onGetFormParameters\`. The task entity name is derived from the FetchXML, so you never pass it separately — it reaches you on the \`context\` each module builder and \`onCreateTaskStrategy\` receives. Omit \`onCreateTaskStrategy\` and the descriptor builds a plain \`DataverseTaskStrategy\` over the resolved FetchXML.

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
| \`onCreateTaskStrategy?\` | — | Returns the task strategy. Where the form ids, \`rootTaskId\`, the cascade-delete flags and the per-operation hooks live. |
| \`modules?\` | — | The feature modules, one \`onGetXModule\` builder per feature. See [**Modules**](?path=/story/task-grid-modules--overview); the Dataverse-specific shape is \`IDataverseModules\`. |

The one constructor parameter, next to \`onInitialize\`:

| Parameter | Required | Description |
|---|:--------:|---|
| \`height?\` | — | Container height. Read before the data resolves, to size the loading skeleton. |

## Saved views

Register \`createUserQueryModule({ strategy: new TalxisUserQueryStrategy(...) })\` from \`modules.onGetUserQueriesModule\` and personal views are persisted as \`talxis_userquery\` rows, with each view's columns, filters and sorting serialized into \`talxis_layoutjson\`. Pass \`userId\` as its \`ownerId\` to scope them per user; leave it out and the views are shared across the environment. System views come from \`systemQueries\` and are never written.

Without that module the feature is simply off, and its options — \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\` — have nowhere to be set, because they belong to the module rather than to \`gridParameters\`. Not registering it also keeps the view manager and both dialogs out of your bundle.

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

- **\`metadata.LookupMany\`** identifies the relationship. The strategy resolves the OData expand clause from it and handles associate/disassociate on save. It is also what makes the column render as a picker — see [**Customizations**](?path=/story/task-grid-customizations--overview), under *Column metadata*.
- **\`controls[0].bindings.FetchXml\`** is the candidate query. \`DataverseLookupManyDataProviderFactory\` reads it and renders its Liquid per row, so \`{{ task.id }}\` and \`{{ task.<attribute> }}\` scope the picker to the cell it sits on, while \`{{ project.* }}\` and \`{{ currentRecord.* }}\` come from the descriptor's records.
- **\`controls[0].name\`** picks the variant: \`LookupMany\`, \`PeopleLookupMany\`, or \`ColorfulLookupMany\`.

The column name itself is arbitrary — the relationship is identified by the navigation property, not the name.

Feeding the picker is the \`lookupMany\` [**module**](?path=/story/task-grid-modules--overview); the factory does the work:

\`\`\`ts
modules: {
    onGetLookupManyModule: (context) => createLookupManyModule({
        createDataProvider: (parameters) => DataverseLookupManyDataProviderFactory.create({
            ...parameters,
            projectRecord: context.projectRecord,
            sourceRecord: context.sourceRecord,
        }),
    }),
},
\`\`\`

The parameters carry everything the factory needs: the cell's record and column from the call, the project and source records from \`context\`. It returns \`undefined\` for a column with no \`FetchXml\` binding, and the grid then reports that the column has no candidates.

## Templates

No Dataverse implementation ships: \`DataverseTemplateDataProvider\` lists templates through FetchXML but implements neither capturing one from a task nor expanding one into tasks. The \`templates\` module is there for a provider of your own; without one the template commands stay out of the ribbon. See [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview) for the contract to implement, and [**Memory**](?path=/story/task-grid-strategies-memory--overview) for a working example.

## Task dependencies

\`DataverseTaskDependencyStrategy\` reads dependency rows through the Web API. It knows nothing about your schema: the table, its two task lookups, its option set and what that option set's values mean are all arguments, so it serves any table shaped like a dependency.

\`\`\`ts
import { createDependenciesModule, DataverseTaskDependencyStrategy } from '@talxis/base-controls'

//returned from onInitialize
modules: {
    onGetDependenciesModule: () => createDependenciesModule({
        strategy: new DataverseTaskDependencyStrategy({
            entityName: 'talxis_taskdependency',
            primaryIdAttribute: 'talxis_taskdependencyid',
            predecessorAttribute: 'talxis_predecessortaskid',
            successorAttribute: 'talxis_successortaskid',
            typeAttribute: 'talxis_dependencytypecode',
            //the grid works in link types, not option-set values, so the map is yours to state
            dependencyTypeCodes: {
                742070000: 'finishToStart',
                742070001: 'startToStart',
                742070002: 'finishToFinish',
                742070003: 'startToFinish',
            },
        }),
    }),
},
\`\`\`

Every parameter is required, including the map: the grid works in link types, so nothing can be inferred from a bare option-set value. A value the map does not name is currently treated as finish-to-start and warned about once — a temporary leniency, since the map is meant to name every value the attribute can hold.

Two things worth knowing about the read. It is **scoped by the tasks the grid loaded**, in batches of 800 ids, and a dependency counts when either of its ends is one of them — so a link pointing at a task outside the current view still arrives, and widening the view widens the read. And it filters on nothing else: a **deactivated** dependency row is still counted, so a solution that deactivates rather than deletes them needs its own strategy for now.

Registering the module is what creates the two columns — see [**Modules → Task dependencies**](?path=/story/task-grid-modules--dependencies).

## Ordering: stack ranks

Ordering works the same way as everywhere else — [**Memory**](?path=/story/task-grid-strategies-memory--overview), under *Ordering* has the worked example. Two things are specific to Dataverse:

- The attribute you map to \`stackRank\` must be a **text** column.
- Rows the FetchXML excludes are never loaded, so they cannot be ranked against. Keep the query broad enough to hold the siblings you reorder.

## Remounts cost a round trip

\`onInitialize\` re-runs on every remount, and here that re-fetches the project and source records over the network. Keep it idempotent and cheap. The lifecycle itself is the same for both descriptors — see [**Memory**](?path=/story/task-grid-strategies-memory--overview), under *Keeping data across remounts*.

The only hook this descriptor has no parameter for is \`onGetControlId\`; the grid generates a UUID instead. To change what one of the native pieces does, see [**Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
