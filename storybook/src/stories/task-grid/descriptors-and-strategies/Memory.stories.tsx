import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { MemoryTaskGrid } from '../../../task-grid/MemoryTaskGrid'

const meta = {
    title: 'Task Grid/Descriptors & Strategies/Memory',
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
\`MemoryTaskGridDescriptor\` runs the grid entirely from records you hand it — no server, no \`Xrm.WebApi\`, no network.

It is the strategy powering every grid in these docs, including the one below. Reorder a row, edit a cell, create a task from a template: it all works, and none of it leaves the browser.

Use it for local development, tests, demos, and as the reference implementation to read before writing your own strategy.

\`\`\`ts
import { MemoryTaskGridDescriptor } from '@talxis/base-controls'
\`\`\`

## Minimal setup

Four things are required: the records, the entity metadata, the field mapping, and at least one view.

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

There is no \`columns\` parameter. Column definitions live on the views (\`systemQueries\` / \`userQueries\`), which is what lets switching a view change what the grid shows.

## Dependencies resolve asynchronously

\`onInitialize\` is a promise, awaited once before anything is created. That is deliberate: seed data can be fetched, generated, or lazily imported, and the grid shows its own loading state while you do it.

These docs use a dynamic \`import()\` so the ~1300-line fixture stays out of the initial chunk:

\`\`\`ts
onInitialize: async () => {
    const { TASKS, ENTITY_METADATA, TEMPLATE_SOURCE } = await import('./memoryTaskData')
    return { records: TASKS, metadata: ENTITY_METADATA, /* … */ }
}
\`\`\`

Only \`height\` sits outside the callback, on the constructor argument, because the grid reads it to size the loading skeleton before your dependencies have resolved.

## Parameters

Required:

| Parameter | Description |
|---|---|
| \`records\` | The task records, as \`IRawRecord[]\`. |
| \`metadata\` | Task entity metadata. \`PrimaryIdAttribute\` is required; \`LogicalName\` is recommended. |
| \`fieldMapping\` | Column roles. See [**Descriptor**](?path=/story/task-grid-descriptors-strategies-descriptor--overview). |
| \`systemQueries\` | Built-in, non-deletable views — and the source of every column definition. At least one is required. |

Optional:

| Parameter | Description |
|---|---|
| \`userQueries\` | Initial personal views. Editable and deletable at runtime. |
| \`templates\` | Task templates plus the hierarchy each expands into. Omit to disable the feature. |
| \`lookupMany\` | Candidate records for lookup-many columns, keyed by column name. |
| \`gridParameters\` | Feature flags. See [**Customizations**](?path=/story/task-grid-customizations--overview). |
| \`onGetNewTaskDefaults\` | Field values for newly created tasks. |
| \`onIsRecordActive\` | Whether a task counts as active. Defaults to \`record[stateCode] === 0\`. |
| \`onOpenDatasetItems\` | Called when the user opens a task. Defaults to a no-op. |
| \`onCreateGridCustomizerStrategy\` | Supplies your own AG Grid customizer. |

> **The \`records\` array is the store.** It is written into rather than copied — creating, deleting, editing and moving mutate it in place, the way those operations would hit a server. Pass a \`structuredClone\` of a shared fixture when two grids need to stay independent.

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

## New task defaults

A created task starts with every column of the active view set to \`null\`. Supply business defaults so a new row looks like a task rather than a row of empty cells:

\`\`\`ts
onGetNewTaskDefaults: () => ({
    statuscode: 1,
    priority: 1,
    percentcomplete: 0,
}),
\`\`\`

The primary id, parent lookup and stack rank are always computed by the strategy and cannot be overridden here.

## Templates

\`templates\` enables template-based creation. It is an \`IMemoryEntitySource\` plus a \`children\` map describing what each template expands into. The descriptor hands it to \`MemoryTemplateDataProvider\`, which owns it from then on — the task strategy reads templates through that provider rather than from its own dependencies:

\`\`\`ts
templates: {
    records: [{ templateid: 'tpl-1', subject: 'Bug fix' }],
    columns: TEMPLATE_COLUMNS,
    metadata: { PrimaryIdAttribute: 'templateid', PrimaryNameAttribute: 'subject' },
    children: {
        'tpl-1': [
            { values: { subject: 'Reproduce the issue', priority: 2 } },
            {
                values: { subject: 'Implement fix' },
                children: [{ values: { subject: 'Write regression test' } }],
            },
        ],
    },
}
\`\`\`

Each node's \`values\` may set **any** task column, and \`children\` nests to any depth. Creating a template *from* an existing task works in reverse: the task's visible column values are captured into \`values\`, and its subtree becomes \`children\`. That capture lives in \`MemoryTemplateDataProvider\` — the \`ITemplateDataProvider\` the descriptor builds from \`templates\` — and it pushes into the same \`records\` array, so a template made at runtime survives the grid's remounts like everything else.

## Lookup-many columns

A column flagged \`metadata.LookupMany\` renders as a multi-record picker. \`lookupMany\` supplies the candidates, keyed by task column name:

\`\`\`ts
lookupMany: {
    assignedto: { records: PEOPLE, columns: PEOPLE_COLUMNS, metadata: PEOPLE_METADATA },
    tags: { records: TAGS, columns: TAGS_COLUMNS, metadata: TAGS_METADATA },
}
\`\`\`

The keys supply data only — whether a column *renders* as a picker comes from \`metadata.LookupMany\` on the column, and which picker variant from its custom control name. A column flagged lookup-many with no entry here throws, so the two are configured together. Try the **Assigned To** and **Tags** columns in the grid below.

## The descriptor is the persistence layer

The grid rebuilds its whole control instance on every remount — switching a view does it, and so does saving one — which recreates the providers and both strategies. The strategies therefore keep **no** data: they read and write the arrays they were handed, and the descriptor is what holds those arrays for the session.

Two consequences worth knowing:

- **Resolve once.** \`onInitialize\` is awaited a single time; later remounts reuse the resolved result. Returning fresh arrays on each call would be equivalent to wiping the database between renders.
- **Keep one descriptor** for as long as the session should last, and build it in \`useMemo\` (or outside the component) rather than inline in JSX:

\`\`\`tsx
const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor(), [])
\`\`\`

A new descriptor starts from the seed again, which is what keeps tests order-independent.

## Limits

This is a development and demo strategy. It holds every record in memory and scans its task map for sibling ranks on insert, so it is built for fixture-sized data — hundreds of rows, not hundreds of thousands. There is no server, so nothing is persisted anywhere.
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
