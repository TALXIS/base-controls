import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { BasicTaskGridExample } from '../../task-grid/BasicTaskGridExample'
import { docsPageWithExample } from '../docsPageWithExample'

const DESCRIPTION = `
Task Grid is a hierarchical task-management grid built on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>. It renders tasks as a parent–child tree and brings the surrounding behaviour with it: drag-and-drop reordering, inline editing, saved views, quick find and template-based task creation, working as one system.

The grid below is real. It runs on the in-memory strategy, so everything you do to it — reorder, edit, create, delete, switch views — is the same code path a production grid uses. Flip **Code** to see what renders it, and edit it.

## What you get

- Render a task hierarchy with expand/collapse, without managing tree state yourself.
- Reorder rows by dragging, persisted through fractional ranks rather than reindexing every sibling.
- Keep saved views, quick find, column selection and inline editing coordinated across the grid.
- Swap the data source without touching the UI — the grid never talks to a server directly.

## Render it

The control ships no data access at all. Loading, saving, reordering and saved views are supplied by a **descriptor**, the single object you hand to the grid. The descriptor also decides which optional features exist, by listing the [**modules**](?path=/story/task-grid-modules--overview) it runs with:

\`\`\`tsx
import { TaskGrid } from '@talxis/base-controls'
import { PcfContextProvider } from '@talxis/base-controls/utils'

export const MyTaskGridPage = () => (
    <PcfContextProvider>
        <TaskGrid descriptor={descriptor} />
    </PcfContextProvider>
)
\`\`\`

The grid reads the \`ComponentFramework.Context\` — navigation, formatting, error dialogs — off \`PcfContextProvider\`, so render it inside one. Pass your host's context to the provider; without one it builds a sample context.

### \`<TaskGrid />\` props

| Prop | Required | Description |
|------|:--------:|-------------|
| \`descriptor\` | ✅ | Your \`ITaskGridDescriptor\`. The single entry point for all data access and configuration, and where the [**modules**](?path=/story/task-grid-modules--overview) are registered. See [**Extending**](?path=/story/task-grid-extending--overview) for the contract. |
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

Anything that can be cancelled reports it: a "created" or "updated" view prop receives \`null\` when the user closed the dialog, \`onTasksDeleted\` receives the per-task result, and \`onTaskMoved\` receives the changed records — or \`null\` when the task did not move, because the drop was refused or the strategy cancelled. The template props only fire when templates are enabled.

\`\`\`tsx
<TaskGrid
    descriptor={descriptor}
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

One thing to keep in mind: the grid **rebuilds both objects** whenever it remounts — switching a view or saving a record does it — so \`onReady\` fires again each time and any handle you stored goes stale. The records are already loaded when it fires; the control is not handed over until its first load has finished.

## Pick a descriptor

Two descriptors ship with the package. Both satisfy the same contract, so the grid behaves identically — they differ only in where the records come from. Configure one and you are done: neither asks you to write a strategy, even though supplying one is what a descriptor is for. See [**Descriptors → Anatomy**](?path=/story/task-grid-descriptors-anatomy--overview) for the contract they implement.

### Memory

Records live in your own process: task CRUD, views, templates, dependencies and lookup-many pickers all run against the arrays you hand it. \`onInitialize\` is async, so those arrays can be fetched from a remote first — and since the grid holds the whole task set client-side whichever strategy you pick, serving it from memory costs you nothing.

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

All parameters, templates, dependencies and lookup-many data: [**Descriptors → Memory**](?path=/story/task-grid-descriptors-memory--overview).

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
        gridParameters: { enableTaskEditing: true, enableViewSwitcher: true },
    }),
})
\`\`\`

> Personal saved views come from a TALXIS model rather than your task entity (\`talxis_userquery\`). They are opt-in: you switch them on by registering the module, so an environment without the model simply leaves that module out. Covered on [**Descriptors → Dataverse**](?path=/story/task-grid-descriptors-dataverse--overview).

## Where to go next

- [**Descriptors → Anatomy**](?path=/story/task-grid-descriptors-anatomy--overview) — what a descriptor must supply, what is optional, and how the grid's services fit together.
- [**Memory**](?path=/story/task-grid-descriptors-memory--overview) / [**Dataverse**](?path=/story/task-grid-descriptors-dataverse--overview) — every parameter of the descriptor you picked. [**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview) if you are on TALXIS.
- [**Modules**](?path=/story/task-grid-modules--overview) — what a module is, the seven that ship, and how registering one turns a feature on. A live grid per module.
- [**Customizations**](?path=/story/task-grid-customizations--overview) — feature flags, column metadata, labels, and replaceable components.
- [**Extending**](?path=/story/task-grid-extending--overview) — reusing a shipped strategy, changing one behaviour, or writing your own.
                `

const meta = {
    title: 'Task Grid/Get started',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: docsPageWithExample(DESCRIPTION),
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<BasicTaskGridExample />),
}
