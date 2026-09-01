import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Descriptors/Dataverse',
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

> There is no live grid on this page. Storybook mocks only \`Xrm.Utility.getGlobalContext()\` — \`Xrm.WebApi\` and \`getEntityMetadata\` are rejecting stubs, so this strategy cannot run outside a Dataverse host. That gap is exactly why the [**Memory**](?path=/story/task-grid-descriptors-memory--overview) strategy exists.

## Where to go next

This page is the setup: the environment it needs, the FetchXML, the field mapping and the parameters. The
rest is split out:

- [**Task options**](?path=/story/task-grid-descriptors-dataverse-task-options--overview) — delete
  behaviour and ordering.
- [**Feature data**](?path=/story/task-grid-descriptors-dataverse-feature-data--overview) — saved views,
  lookup-many columns, templates, dependencies and checklists.

## Environment prerequisites

The descriptor itself needs nothing but your task table and the FetchXML that queries it. Personal views,
dependencies, checklists and custom columns are each backed by a TALXIS model, and each one is **opt-in**: you
get it by registering its module. Say nothing and the model is never read, and the module's code never enters
your bundle.

Which model each needs, and the strategies that come pre-configured for them:
[**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview).

> Register a module whose model is **not** deployed and the grid sits on its loading skeleton and never
> renders: the read happens before the first provider is created, outside the grid's error handling. If a
> table is missing, leave its builder out.

Nothing stops you from answering a feature differently — return a strategy of your own, or one from another
extension, and views can live wherever you like. Task loading and saving keep using the shipped
\`DataverseTaskStrategy\`. See
[**Extending → Reuse a shipped strategy**](?path=/story/task-grid-extending-reuse-a-shipped-strategy--overview).

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
            onGetUserQueriesModule: ({ services, entityName, recordId, userId }) => createUserQueryModule({
                services,
                strategy: new TalxisUserQueryStrategy({
                    entityName,
                    recordId,
                    ownerId: userId,
                    services,
                }),
                enableQueryManager: true,
            }),
        },
        //the form ids, the delete behaviour and the root task are the strategy's options
        onCreateTaskStrategy: ({ services, fetchXml, sourceRecord }) => new DataverseTaskStrategy({
            onInitialize: async () => ({
                fetchXml,
                sourceRecord,
                editFormId,
                createFormId,
                isCascadeDeleteEnabled: true,
            }),
            //every other hook takes the parameters of the matching DataverseTaskActions method
            onGetFormParameters: (operation, parameters) => parameters,
        }),
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
| \`{{ project.id }}\` | GUID of the project the project module resolved. |
| \`{{ project.<attribute> }}\` | Any column that project carries in its \`data\`. |
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
| \`projectRecord?\` | — | The project these tasks belong to. Handed to the project and lookup-many builders; register the project module over it to reach the Liquid variables and the link new tasks get. |
| \`sourceRecord?\` | — | An additional record exposed to Liquid templates (a sprint or board, say). |
| \`userId?\` | — | Current user GUID. Pass it to the user-query strategy to scope personal views per user. |
| \`gridParameters?\` | — | Feature flags. See [**Customizations**](?path=/story/task-grid-customizations--overview). |
| \`onCreateTaskStrategy?\` | — | Returns the task strategy. Where the form ids, \`rootTaskId\`, the cascade-delete flags and the per-operation hooks live. |
| \`modules?\` | — | The feature modules, one \`onGetXModule\` builder per feature. See [**Modules**](?path=/story/task-grid-modules--overview); the Dataverse-specific shape is \`IDataverseModules\`. |

The one constructor parameter, next to \`onInitialize\`:

| Parameter | Required | Description |
|---|:--------:|---|
| \`height?\` | — | Container height. Read before the data resolves, to size the loading skeleton. |

## Remounts cost a round trip

\`onInitialize\` re-runs on every remount, and here that re-fetches the project and source records over the network. Keep it idempotent and cheap. The lifecycle itself is the same for both descriptors — see [**Memory → Your data**](?path=/story/task-grid-descriptors-memory-your-data--overview).

To change what one of the shipped pieces does, see [**Extend a shipped strategy**](?path=/story/task-grid-extending-extend-a-shipped-strategy--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
