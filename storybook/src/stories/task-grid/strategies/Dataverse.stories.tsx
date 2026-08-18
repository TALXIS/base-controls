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

Two features are backed by TALXIS models rather than by your task entity. Neither is needed for the grid itself — they are needed by the *strategy* this descriptor returns for that feature, which is why replacing the strategy removes the requirement (see [**Swapping a default strategy**](#swapping-a-default-strategy)).

| Feature | Model | Needed when |
|---|---|---|
| Personal saved views | \`talxis_userquery\` with \`talxis_userqueryid\`, \`talxis_name\`, \`talxis_description\`, \`talxis_layoutjson\`, \`talxis_returnedtypecode\`, \`talxis_recordid\`, \`ownerid\` | \`enableUserQueries\` is on. With the flag off the descriptor returns a stub instead and the table is never touched. |
| Custom columns | \`talxis_attributedefinition\`, \`talxis_attributevalue\`, \`talxis_attributeoption\` | Always, as the descriptor ships — see the note below. |

Both reads happen before the first provider is created and are not wrapped in the grid's error handling, so a missing model shows up the same way: the grid sits on its loading skeleton and never renders.

> **The custom-columns read is not gated by the \`enableCustomColumn*\` flags.** Those flags only control the ribbon commands. \`onCreateCustomColumnsStrategy\` returns a \`DataverseCustomColumnsStrategy\` unconditionally, and the grid refreshes it during startup, which queries \`talxis_attributedefinition\`. If that model is not in your environment, override the hook as below and the dependency is gone.

## Swapping a default strategy

The descriptor decides which strategy serves each feature, so anything you do not have a model for can be answered differently. Subclass it and override the hook:

\`\`\`ts
class MyDataverseDescriptor extends DataverseTaskGridDescriptor {
    //no talxis_attributedefinition in this environment - drop the feature entirely
    public onCreateCustomColumnsStrategy() {
        return undefined
    }

    //no talxis_userquery either - keep personal views for the session instead
    private _savedQueryStrategy = new MemorySavedQueryStrategy({
        onGetSystemQueries: async () => SYSTEM_QUERIES,
        userQueries: [],
    })

    public onCreateSavedQueryStrategy() {
        return this._savedQueryStrategy
    }

    //override this too, or the dialog still goes to talxis_userquery
    public onCreateUserQueryDataProvider() {
        return this._savedQueryStrategy.createDataProvider()
    }
}
\`\`\`

Returning \`undefined\` from \`onCreateCustomColumnsStrategy\` makes the grid skip the provider entirely — the hook is optional, so nothing downstream expects it. The same applies in the other direction: implement \`onCreateCustomColumnsStrategy\` with a strategy of your own and custom columns can be stored wherever you like. Task loading, saving, views and everything else keep using the shipped \`DataverseTaskStrategy\`.

More on this in [**Custom strategies → Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview), and [**Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview) if you would rather write the descriptor from scratch.

## Setup

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
        gridParameters: { enableTaskEditing: true, enableUserQueries: true },
    }),
})
\`\`\`

As with the memory strategy, everything resolves inside \`onInitialize\` — only \`height\` sits on the constructor argument, because the skeleton needs it first. The task entity name is derived from the FetchXML, so you never pass it separately.

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

| Parameter | Required | Description |
|---|:--------:|---|
| \`baseFetchXml\` | ✅ | FetchXML driving the initial load. May use the Liquid variables above. |
| \`fieldMapping\` | ✅ | Column roles, plus the optional \`projectId\` lookup. |
| \`systemQueries\` | ✅ | Non-deletable views in the view switcher. At least one. |
| \`projectRecord?\` | — | The project these tasks belong to. Injected into Liquid templates and pre-filled on create. |
| \`sourceRecord?\` | — | An additional record exposed to Liquid templates (a sprint or board, say). |
| \`userId?\` | — | Current user GUID. Required for personal saved views. |
| \`rootTaskId?\` | — | Roots the hierarchy at one task instead of showing all top-level rows. |
| \`editFormId?\` / \`createFormId?\` / \`bulkEditFormId?\` | — | Form GUIDs for the edit, create and bulk-edit dialogs. |
| \`enableCascadeDelete?\` | — | Deleting a task also deletes its children. Defaults to \`false\`. |
| \`enableDeletingTasksWithChildren?\` | — | Allows deleting tasks that have children. When \`false\`, they are excluded and an error is returned. |
| \`gridParameters?\` | — | Feature flags. See [**Customizations**](?path=/story/task-grid-customizations--overview). |

## Saved views

Set \`enableUserQueries\` and supply \`userId\`, and personal views are persisted as \`talxis_userquery\` rows, with the view's columns, filters and sorting serialized into \`talxis_layoutjson\`. System views come from \`systemQueries\` and are never written.

With \`enableUserQueries\` off, the descriptor returns a stub saved-query strategy: \`onGetUserQueries\` yields an empty list and creating, updating or deleting a view **throws**. Keep the view-manager flags consistent with it — \`enableQueryManager\`, \`enableSaveAsNewQuery\` and \`enableSaveQueryChanges\` should stay off too, or the ribbon offers commands that cannot complete.

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
- **\`controls[0].bindings.FetchXml\`** is the candidate query, and is **required**. It supports the same Liquid variables plus \`{{ task.id }}\` and \`{{ task.<attribute> }}\`, so a picker can be scoped to the row it sits on.
- **\`controls[0].name\`** picks the variant: \`LookupMany\`, \`PeopleLookupMany\`, or \`ColorfulLookupMany\`.

The column name itself is arbitrary — the relationship is identified by the navigation property, not the name.

## Custom columns

\`enableCustomColumnCreation\` and friends let users define columns at runtime, stored as \`talxis_attributedefinition\` and \`talxis_attributevalue\` rows.

\`DataverseCustomColumnsStrategy\` is explicitly a work in progress and says so in its own source. What that means in practice:

- Values persist only when the task entity **is** the Dataverse \`task\` table. \`onSaveValue\` hard-codes the \`/tasks(<id>)\` bind and the \`talxis_task_talxis_attributevalue_regardingobjectid\` navigation property, regardless of the entity your FetchXML targets.
- \`onGetRawRecord\` throws and \`onGetRawRecords\` returns an empty list, so anything that reads custom-column values outside the grid's own path gets nothing.
- The strategy is wired unconditionally, independently of the \`enableCustomColumn*\` flags. Turning the feature off in the UI does not remove the startup dependency on \`talxis_attributedefinition\` — [**overriding the hook**](#swapping-a-default-strategy) does.

Treat the flags as off for production until this settles.

## Templates

Not implemented. \`DataverseTemplateDataProvider\` exists but its capture throws, \`DataverseTaskStrategy.onCreateTasksFromTemplate\` throws, and the descriptor does not implement \`onCreateTemplateDataProvider\` — so the template commands stay out of the ribbon. See [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview) for the contract to implement, and [**Memory**](?path=/story/task-grid-strategies-memory--overview) for a working example.

## Ordering: stack ranks

Same scheme as the memory strategy: lexicographic rank strings through the \`lexorank\` package, so a drag rewrites one row rather than renumbering its siblings. The attribute you map to \`stackRank\` must be a text column. The [**Memory**](?path=/story/task-grid-strategies-memory--overview) page has the worked example.

## What this descriptor does not implement

Three optional hooks are absent, and each one is a feature you cannot switch on through parameters:

- **\`onCreateGridCustomizerStrategy\`** — there is no way to pass an \`IGridCustomizerStrategy\` to this descriptor, so the [**Customizer**](?path=/story/task-grid-customizations-customizer--overview) needs a descriptor of your own (or a subclass of this one).
- **\`onCreateTemplateDataProvider\`** — templates, as above.
- **\`onGetControlId\`** — the grid generates a UUID instead.

One behavioural difference from the memory descriptor is worth knowing: \`onLoadDependencies\` re-runs your \`onInitialize\` on **every remount** — and the grid remounts when a view changes or a record is saved — re-fetching the project and source records each time. Keep that callback idempotent and cheap; do not treat it as session state the way the memory descriptor's cached one can be treated.

Both gaps are closed the same way: [**Custom strategies → Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
