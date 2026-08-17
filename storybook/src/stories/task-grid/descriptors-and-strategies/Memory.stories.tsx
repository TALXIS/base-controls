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

Three things are required: the records, the field mapping, and at least one view.

\`\`\`ts
const descriptor = new MemoryTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        tasks: {
            records: [
                { taskid: '1', subject: 'Website redesign', _parentid_value: null, stackrank: '0|100000:', statecode: 0 },
                { taskid: '2', subject: 'Wireframes', _parentid_value: '1', stackrank: '0|100000:', statecode: 0 },
            ],
            columns: COLUMNS,
            metadata: { PrimaryIdAttribute: 'taskid', LogicalName: 'demo_task' },
        },
        fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
        systemQueries: [{ id: '00000000-0000-0000-0000-000000000000', name: 'All tasks', columns: COLUMNS }],
        gridParameters: { enableTaskEditing: true, enableRowDragging: true },
    }),
})
\`\`\`

Note that \`_parentid_value\` — not \`parentid\` — holds the parent. Raw records follow the Dataverse convention of exposing lookup values under \`_<lookup>_value\`, and the strategy derives that key from your \`parentId\` mapping.

## Dependencies resolve asynchronously

\`onInitialize\` is a promise, awaited once before anything is created. That is deliberate: seed data can be fetched, generated, or lazily imported, and the grid shows its own loading state while you do it.

These docs use a dynamic \`import()\` so the ~1300-line fixture stays out of the initial chunk:

\`\`\`ts
onInitialize: async () => {
    const { TASK_SOURCE, TEMPLATE_SOURCE } = await import('./memoryTaskData')
    return { tasks: TASK_SOURCE, /* … */ }
}
\`\`\`

Only \`height\` sits outside the callback, on the constructor argument, because the grid reads it to size the loading skeleton before your dependencies have resolved.

## Parameters

Required:

| Parameter | Description |
|---|---|
| \`tasks\` | The task entity as an \`IMemoryEntitySource\` — \`{ records, columns, metadata }\`. |
| \`fieldMapping\` | Column roles. See [**Descriptor**](?path=/story/task-grid-descriptors-strategies-descriptor--overview). |
| \`systemQueries\` | Built-in, non-deletable views. At least one is required. |

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

### \`IMemoryEntitySource\`

The same shape describes every in-memory entity — tasks, templates, and lookup candidates:

\`\`\`ts
interface IMemoryEntitySource {
    records: IRawRecord[]
    columns: IColumn[]
    metadata: IMemoryProviderEntityMetadata   // PrimaryIdAttribute is required
}
\`\`\`

> Your \`records\` array is never mutated. It is deep-cloned when the strategy initializes, so the same fixture can safely back several grids, survive remounts, and be returned from a cached \`import()\`.

Include your hidden structural columns (primary id, parent lookup, stack rank, state code) in \`columns\` — the grid needs their definitions even though it never displays them. Non-hidden columns are what the user can see, edit, and capture into a template.

## New task defaults

A created task starts with every known column \`null\`. Supply business defaults so a new row looks like a task rather than a row of empty cells:

\`\`\`ts
onGetNewTaskDefaults: () => ({
    statuscode: 1,
    priority: 1,
    percentcomplete: 0,
}),
\`\`\`

The primary id, parent lookup and stack rank are always computed by the strategy and cannot be overridden here.

## Templates

\`templates\` enables template-based creation. It is an \`IMemoryEntitySource\` plus a \`children\` map describing what each template expands into:

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

Each node's \`values\` may set **any** task column, and \`children\` nests to any depth. Creating a template *from* an existing task works in reverse: the task's visible column values are captured into \`values\`, and its subtree becomes \`children\`.

## Lookup-many columns

A column flagged \`metadata.LookupMany\` renders as a multi-record picker. \`lookupMany\` supplies the candidates, keyed by task column name:

\`\`\`ts
lookupMany: {
    assignedto: { records: PEOPLE, columns: PEOPLE_COLUMNS, metadata: PEOPLE_METADATA },
    tags: { records: TAGS, columns: TAGS_COLUMNS, metadata: TAGS_METADATA },
}
\`\`\`

The keys supply data only — whether a column *renders* as a picker comes from \`metadata.LookupMany\` on the column, and which picker variant from its custom control name. A column flagged lookup-many with no entry here throws, so the two are configured together. Try the **Assigned To** and **Tags** columns in the grid below.

## State is per instance

Each descriptor owns its own copy of the data. Two grids never share state, and a remount with a fresh descriptor starts from the seed again — which keeps tests order-independent.

Consequently, edits do **not** survive a remount. If you want a session to persist, hold one descriptor instance for its lifetime, as the docs pages do:

\`\`\`tsx
const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor(), [])
\`\`\`

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
