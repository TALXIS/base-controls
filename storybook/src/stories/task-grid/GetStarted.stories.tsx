import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { MemoryTaskGrid } from '../../task-grid/MemoryTaskGrid'

const meta = {
    title: 'Task Grid/Get started',
    tags: ['autodocs'],
    parameters: {
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
Task Grid is a hierarchical task-management grid built on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>. It renders tasks as a parent–child tree and brings the surrounding behaviour with it: drag-and-drop reordering, inline editing, saved views, quick find, custom columns and template-based task creation, working as one system.

The grid below is real. It runs on the in-memory strategy, so everything you do to it — reorder, edit, create, delete, switch views — is the same code path a production grid uses.

## What you get

- Render a task hierarchy with expand/collapse, without managing tree state yourself.
- Reorder rows by dragging, persisted through fractional ranks rather than reindexing every sibling.
- Keep saved views, quick find, column selection and inline editing coordinated across the grid.
- Swap the data source without touching the UI — the grid never talks to a server directly.

## Render it

The control ships no data access at all. Loading, saving, reordering and saved views are supplied by a **descriptor**, which is the single object you hand to the grid:

\`\`\`tsx
import { TaskGrid } from '@talxis/base-controls'

export const MyTaskGridPage = ({ pcfContext }) => (
    <TaskGrid
        pcfContext={pcfContext}
        taskGridDescriptor={descriptor}
    />
)
\`\`\`

### \`<TaskGrid />\` props

| Prop | Required | Description |
|------|:--------:|-------------|
| \`pcfContext\` | ✅ | A \`ComponentFramework.Context\`. Used for navigation, formatting, error dialogs and environment utilities. |
| \`taskGridDescriptor\` | ✅ | Your \`ITaskGridDescriptor\`. The single entry point for all data access and configuration. See [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview) for the contract. |
| \`labels?\` | — | Partial \`ITaskGridLabels\`. Any key you supply replaces the English default. |
| \`components?\` | — | Partial \`ITaskGridComponents\`. Replaces the skeleton loader, the command bar, or the renderer/editor of any cell. |
| \`onReady?\` | — | \`(control, taskDataProvider)\` — the grid's handle. See [**Reacting to the grid**](#reacting-to-the-grid). |
| \`onError?\` | — | \`(error, message)\` for every error the grid reports — tasks, views and templates alike. It still shows its own dialog. |
| event props | — | One per grid event, listed below. |

## Reacting to the grid

Every event the grid raises is a prop, so nothing needs a strategy or the imperative handle. They come in before/after pairs, and the "after" ones drop the prefix:

| Area | Props |
|---|---|
| Tasks | \`onBeforeTasksCreated\`, \`onTasksCreated\`, \`onBeforeTasksDeleted\`, \`onTasksDeleted\`, \`onBeforeTaskMoved\`, \`onTaskMoved\` |
| Data | \`onTaskDataUpdated\`, \`onRecordTreeUpdated\`, \`onBeforeRecordSaved\`, \`onRecordSaved\` |
| Opening records | \`onBeforeDatasetItemsOpened\`, \`onDatasetItemsOpened\` |
| Personal views | \`onBeforeUserQueryCreated\`, \`onUserQueryCreated\`, \`onBeforeUserQueryUpdated\`, \`onUserQueryUpdated\`, \`onBeforeUserQueriesDeleted\`, \`onUserQueriesDeleted\` |
| Templates | \`onBeforeTemplateCreated\`, \`onTemplateCreated\` |
| Errors | \`onError\`, which fans in the task, view and template errors |

A "created" or "updated" view prop receives \`null\` when the user cancelled the dialog, and the template props only fire when templates are enabled.

\`\`\`tsx
<TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    onRecordSaved={result => console.info('saved', result.recordId, result.fields)}
    onTasksDeleted={result => refreshMyKpis()}
    onError={(error, message) => logger.error(message, error)}
/>
\`\`\`

For anything the events cannot express — reloading, reading the selection, switching a view — take the handle. \`onReady\` hands you the control **and** its task data provider:

\`\`\`tsx
onReady={(control, taskDataProvider) => {
    //everything imperative: reload, read the selection, switch the view
    taskDataProvider.refresh()
    control.getSelectedRecordIds()
    control.changeSavedQuery(queryId)
}}
\`\`\`

Two things to keep in mind: the grid **rebuilds both objects** whenever it remounts — switching a view or saving a record does it — so \`onReady\` fires again each time and any handle you stored goes stale; and at that moment the dataset refresh has been started but not awaited, so the records are not loaded yet. Use the provider's own \`onLoading\` / \`onBeforeFirstDataLoaded\` if you need the loaded moment.

## Pick a strategy

Two descriptors ship with the package. Both satisfy the same contract, so the grid behaves identically — they differ only in where the records come from. Configure one and you are done; neither requires you to write a strategy.

### Memory

Records live in your own process: task CRUD, views, templates and lookup-many pickers all run against the arrays you hand it. \`onInitialize\` is async, so those arrays can be fetched from a remote first — and since the grid holds the whole task set client-side whichever strategy you pick, serving it from memory costs you nothing.

\`\`\`ts
import { MemoryTaskGridDescriptor } from '@talxis/base-controls'

const descriptor = new MemoryTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        records: [
            { taskid: '1', subject: 'Website redesign', parentid: null, stackrank: '0|100000:', statecode: 0 },
            { taskid: '2', subject: 'Wireframes', parentid: [{ id: { guid: '1' }, etn: 'demo_task' }], stackrank: '0|100000:', statecode: 0 },
        ],
        metadata: { PrimaryIdAttribute: 'taskid', LogicalName: 'demo_task' },
        fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
        systemQueries: [{ id: '00000000-0000-0000-0000-000000000000', name: 'All tasks', columns: COLUMNS }],
        gridParameters: { enableTaskEditing: true, enableRowDragging: true },
    }),
})
\`\`\`

All parameters, templates and lookup-many data: [**Strategies → Memory**](?path=/story/task-grid-strategies-memory--overview).

### Dataverse

Tasks are Dataverse rows and the grid should behave like a model-driven subgrid: FetchXML queries, saved views persisted per user, forms opened for create and edit, relationship columns associated on save.

\`\`\`ts
import { DataverseTaskGridDescriptor } from '@talxis/base-controls'

const descriptor = new DataverseTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        baseFetchXml: '<fetch><entity name="talxis_projecttask">…</entity></fetch>',
        fieldMapping: {
            subject: 'talxis_name',
            parentId: 'talxis_parentprojecttaskid',
            stackRank: 'talxis_stackrankstring',
        },
        systemQueries: [allTasksView],
        gridParameters: { enableTaskEditing: true, enableQueryManager: true },
    }),
})
\`\`\`

> Two features come from TALXIS models rather than your task entity — personal saved views (\`talxis_userquery\`) and custom columns (\`talxis_attributedefinition\`). Both are opt-in: you switch one on by handing the descriptor the strategy that implements it, so an environment without the model simply leaves the callback out. Covered on [**Strategies → Dataverse**](?path=/story/task-grid-strategies-dataverse--overview).

## Where to go next

- [**Customizations**](?path=/story/task-grid-customizations--overview) — feature flags, column metadata, labels, replaceable components, and the AG Grid customizer.
- [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview) — the descriptor contract, reusing individual shipped strategies, extending them, or writing your own.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<MemoryTaskGrid />),
}
