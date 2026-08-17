import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'

const DocsPlaceholder = () => <div style={{ display: 'none' }} />

const meta = {
    title: 'Task Grid/Descriptors & Strategies/Dataverse',
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

> There is no live grid on this page. Storybook mocks only \`Xrm.Utility.getGlobalContext()\` — \`Xrm.WebApi\` and \`getEntityMetadata\` are rejecting stubs, so this strategy cannot run outside a Dataverse host. That gap is exactly why the [**Memory**](?path=/story/task-grid-descriptors-strategies-memory--overview) strategy exists.

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

## Liquid variables in FetchXML

\`baseFetchXml\` is a <a href="https://shopify.github.io/liquid/" target="_blank" rel="noreferrer">Liquid</a> template, rendered before the query runs. Two records are injected:

| Variable | Description |
|---|---|
| \`{{ project.id }}\` | GUID of the \`projectRecord\`, when one was supplied. |
| \`{{ project.<attribute> }}\` | Any raw attribute of that project record. |
| \`{{ currentRecord.id }}\` | GUID of the \`sourceRecord\`, when one was supplied. |
| \`{{ currentRecord.<attribute> }}\` | Any raw attribute of that source record. |

Both \`projectRecord\` and \`sourceRecord\` accept either a hydrated \`ISingleRecord\` or a plain \`{ entityName, id }\` reference — the descriptor fetches the record itself in the latter case.

## \`IDataverseFieldMapping\`

Extends the base mapping with one Dataverse-specific field:

| Property | Description |
|----------|-------------|
| \`projectId?\` | The project lookup on the task entity. When set, new tasks are pre-filled with the current project reference. |

\`stateCode\` is not part of this mapping — Dataverse always uses \`statecode\`, so the descriptor hard-codes it.

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

\`enableCustomColumnCreation\` and friends let users define columns at runtime, stored as \`talxis_attributedefinition\` and \`talxis_attributevalue\` rows. This part of the strategy is a work in progress.

## Extending it

\`DataverseTaskStrategy\` is exported and implements the full \`ITaskDataProviderStrategy\` against the Web API. Subclass it to override a single behaviour and return your subclass from \`onCreateTaskStrategy\`:

\`\`\`ts
class MyTaskStrategy extends DataverseTaskStrategy {
    public async onCreateTask(parentTaskId?: string) {
        const task = await super.onCreateTask(parentTaskId)
        // …post-process
        return task
    }
}
\`\`\`

If you are targeting something other than Dataverse, see [**Writing your own strategy**](?path=/story/task-grid-descriptors-strategies-writing-your-own-strategy--overview) instead.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<DocsPlaceholder />),
    parameters: {
        docs: {
            canvas: {
                className: 'docs-hidden-preview',
            },
        },
    },
}
