import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { BasicTaskGridExample } from '../../../task-grid/BasicTaskGridExample'

const meta = {
    title: 'Task Grid/Descriptors/Memory',
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
\`MemoryTaskGridDescriptor\` runs the grid entirely from records you hand it. It has no data access of its own — no \`Xrm.WebApi\`, no fetch — so where the records came from is your business.

It is the strategy powering every grid in these docs, including the one below. Reorder a row, edit a cell, create a task from a template: it all works against the array you supplied.

It covers every feature the grid has a hook for, most of them through a dedicated strategy or provider:

| Feature | Handled by | On when |
|---|---|---|
| Task CRUD, move, reparent | \`MemoryTaskStrategy\` | always |
| System views | the descriptor, from \`systemQueries\` | always |
| Personal views, incl. create, rename and delete | \`MemoryUserQueryStrategy\`, wrapped by \`createUserQueryModule\` | \`modules.onGetUserQueriesModule\` returns one |
| Templates, both expanding one into tasks and capturing one from a task | \`MemoryTemplateDataProvider\`, wrapped by \`createTemplateModule\` | \`modules.onGetTemplatesModule\` returns one |
| Lookup-many pickers | \`MemoryLookupManyDataProviderFactory\`, one provider per column | \`modules.onGetLookupManyModule\` returns one |
| Task dependencies, in both directions | \`MemoryTaskDependencyStrategy\`, wrapped by \`createDependenciesModule\` | \`modules.onGetDependenciesModule\` returns one |
| Task checklists | \`MemoryChecklistStrategy\`, wrapped by \`createChecklistModule\` | \`modules.onGetChecklistModule\` returns one |
| AG Grid customizer | yours | \`modules.onGetGridCustomizerModule\` returns one |

Everything below the first two rows is a **module**, and \`modules\` is part of what \`onInitialize\` resolves. [**Modules**](?path=/story/task-grid-modules--overview) covers what each one turns on and its builder options.

Both descriptors accept the same modules; what differs is which implementations ship. Memory brings one for every module except custom columns, which needs the TALXIS models. And \`onInitialize\` is async, so the records can come from a server — this is a complete, production-usable descriptor; see [**Using it in production**](#using-it-in-production).

\`\`\`ts
import { MemoryTaskGridDescriptor } from '@talxis/base-controls'
\`\`\`

## Where to go next

This page is the setup: the data it needs, the field mapping and the parameters. The rest is split out:

- [**Task options**](?path=/story/task-grid-descriptors-memory-task-options--overview) — the task strategy's
  hooks, the actions behind them, ordering, and persisting to a server.
- [**Feature data**](?path=/story/task-grid-descriptors-memory-feature-data--overview) — templates,
  lookup-many candidates, dependencies and checklists.
- [**Your data**](?path=/story/task-grid-descriptors-memory-your-data--overview) — what the grid does and
  does not do to the arrays you pass, and how to keep what the user did.

## Minimal setup

Four things are required: the records, the entity metadata, the field mapping, and at least one view. \`onInitialize\` resolves all of it — and the task strategy and the feature modules with it. \`height\` is the only other constructor parameter, because the loading skeleton needs it before your data exists:

\`\`\`ts
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

Note the shape of the parent: an **entity-reference array** under the mapped \`parentId\` column, like any other lookup value in a memory record. A bare guid string will not do — the lookup reader would try to map over it. Top-level tasks hold \`null\`.

There is no \`columns\` parameter. Column definitions live on the views — the \`systemQueries\` above, plus any personal views your user-query strategy holds — which is what lets switching a view change what the grid shows.

## Field mapping

\`fieldMapping\` tells the grid which of your columns carry structural meaning. Everything else it treats as ordinary data.

\`\`\`ts
fieldMapping: {
    subject: 'subject',       // display name; pinned left, never hidden
    parentId: 'parentid',     // parent lookup; drives the tree
    stackRank: 'stackrank',   // ordering; drives drag-and-drop
    stateCode: 'statecode',   // active/inactive; drives "hide inactive"
}
\`\`\`

- **\`subject\`** — the title column. Always pinned left and never hidden by the control.
- **\`parentId\`** — the lookup pointing at the parent task. This alone produces the hierarchy; a row with no parent is top level.
- **\`stackRank\`** — the ordering attribute. Sorted by default, and rewritten when rows are dragged.
- **\`stateCode\`** — the active/inactive attribute, used by the *Hide inactive tasks* toggle.

At runtime the mapping is available to strategies as \`provider.getNativeColumns()\`, so a strategy never needs its own copy of these names.

> **Troubleshooting.** Everything renders flat → \`parentId\` is unmapped, or its raw value is a bare guid rather than the entity-reference array shown above. Rows come back in an unexpected order → \`stackRank\` is unmapped, or the ranks are not comparable strings.

## Loading data asynchronously

\`onInitialize\` is a promise, awaited once before anything is created. That is deliberate: seed data can be fetched, generated, or lazily imported, and the grid shows its own loading state while you do it.

That is also how you point it at a server: fetch in the callback and hand back the result. These docs use a dynamic \`import()\` instead, so the ~1300-line fixture stays out of the initial chunk:

\`\`\`ts
onInitialize: async () => {
    const { TASKS, ENTITY_METADATA, TEMPLATE_SOURCE } = await import('./memoryTaskData')
    return { records: TASKS, metadata: ENTITY_METADATA, /* … */ }
}
\`\`\`

\`height\` sits outside the callback because the grid reads it to size the loading skeleton before your data has resolved.

Because it is awaited before the first provider is created, a promise that never resolves here shows up as an indefinite skeleton with no error.

## Parameters

Resolved by \`onInitialize\`, and required:

| Parameter | Description |
|---|---|
| \`records\` | The task records, as \`IRawRecord[]\`. |
| \`metadata\` | Task entity metadata. \`PrimaryIdAttribute\` is required; \`LogicalName\` is recommended. |
| \`fieldMapping\` | Column roles. See [**Field mapping**](#field-mapping). |
| \`systemQueries\` | Built-in, non-deletable views — and the source of every column definition. At least one is required. |

Also resolved by \`onInitialize\`, all optional:

| Parameter | Description |
|---|---|
| \`onCreateTaskStrategy\` | Returns the task strategy, and with it every task-level option. See [**Task options**](#task-options). |
| \`modules\` | The feature modules, one \`onGetXModule\` builder per feature. See [**Modules**](?path=/story/task-grid-modules--overview); the memory-specific shape is \`IMemoryModules\`. |
| \`gridParameters\` | Feature flags. See [**Customizations**](?path=/story/task-grid-customizations--overview). |

The one constructor parameter that is *not* resolved by \`onInitialize\` is \`height\`.

> **\`onInitialize\` runs on every remount**, and the \`onCreateTaskStrategy\` and \`modules\` it returns are rebuilt from whatever it just resolved. Nothing in the grid keeps your data between those calls — see [**Keeping data across remounts**](#keeping-data-across-remounts), which is the one thing to get right before shipping this descriptor.

### \`IMemoryEntitySource\`

Templates and lookup-many candidates bring their own columns, so both are described by one shape:

\`\`\`ts
interface IMemoryEntitySource {
    records: IRawRecord[]
    columns: IColumn[]
    metadata: IMemoryProviderEntityMetadata   // PrimaryIdAttribute is required
}
\`\`\`

### Where task columns come from

The task entity is the exception: it has no \`columns\` of its own, because the grid takes its columns from the **active view** and the strategy reads them back off the provider. Two rules follow:

- **Every view must carry your hidden structural columns** (primary id, parent lookup, stack rank, state code). The grid needs their definitions even though it never displays them.
- **A column is only addable if some view mentions it.** The strategy answers *Edit columns* with the union of every system and user view's columns — first definition wins, so system views take precedence. A column no view knows about cannot be turned on. The fixture therefore puts the full list in every view and hides what that view does not show, the same shape a Dataverse saved-query layout produces:

\`\`\`ts
const getQueryColumns = (...visibleColumnNames: string[]): IColumn[] =>
    COLUMNS.map(column => ({
        ...column,
        isHidden: column.isHidden || !visibleColumnNames.includes(column.name),
    }))
\`\`\`

## Limits

- **Insert cost is linear in the sibling count.** Creating or moving a task scans the task map for sibling ranks. Fine for the hundreds-to-low-thousands of rows the grid is built for; not a plan for six-figure task sets.
- **No related-entity columns.** \`onGetAvailableRelatedColumns\` returns \`[]\`, so nothing reachable only through a relationship can be added to a view.
                `.trim(),
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
