import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { BasicTaskGridExample } from '../../../task-grid/BasicTaskGridExample'

const meta = {
    title: 'Task Grid/Strategies/Memory',
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
| AG Grid customizer | yours | \`modules.onGetGridCustomizerModule\` returns one |

Those last five are **modules**, and \`modules\` is part of what \`onInitialize\` resolves. [**Modules**](?path=/story/task-grid-modules--overview) covers what each one turns on, the builder options, and the bundle consequence.

Both descriptors accept the same modules, so the difference is which implementations ship: memory brings a user-query strategy and a template provider, Dataverse brings a user-query strategy but no template provider. And \`onInitialize\` is async, so the records can come from a server. It is a complete, production-usable descriptor; see [**Using it in production**](#using-it-in-production).

\`\`\`ts
import { MemoryTaskGridDescriptor } from '@talxis/base-controls'
\`\`\`

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

## Dependencies resolve asynchronously

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

> **\`onInitialize\` runs on every remount**, and the \`onCreateTaskStrategy\` and \`modules\` it returns are rebuilt from whatever it just resolved. Guard the expensive or stateful part behind a flag of your own, so a remount reads the current store instead of re-fetching and discarding every view the user created since:
>
> \`\`\`ts
> let isSeeded = false
> let userQueries: ISavedQuery[] = []
>
> return new MemoryTaskGridDescriptor({
>     onInitialize: async () => {
>         if (!isSeeded) {
>             userQueries = await loadMyViews()
>             isSeeded = true
>         }
>         return {
>             records, metadata, fieldMapping, systemQueries,
>             modules: {
>                 onGetUserQueriesModule: () => {
>                     const strategy = new MemoryUserQueryStrategy({ userQueries })
>                     const module = createUserQueryModule({ strategy })
>                     //write the strategy's current state back into the store on every mutation,
>                     //rather than relying on it mutating the array it was constructed with
>                     const syncStore = async () => { userQueries = await strategy.onGetUserQueries() }
>                     module.provider.events.addEventListener('onAfterUserQueryCreated', syncStore)
>                     module.provider.events.addEventListener('onAfterUserQueryUpdated', syncStore)
>                     module.provider.events.addEventListener('onAfterUserQueriesDeleted', syncStore)
>                     return module
>                 },
>             },
>         }
>     },
> })
> \`\`\`

> **The \`records\` array is a seed, not a store.** The provider copies it and owns the data from then on: creating, deleting, editing and moving all happen on *its* records, and your array is never written to. Two grids can therefore share a fixture — though a \`structuredClone\` still keeps their record *objects* independent, since edits write through to them.
>
> **Nothing survives a remount by itself**, and the grid remounts when *Edit columns* is applied, a view is switched, or the view manager closes. The task strategy's \`onDestroy\` hook is the seam: it hands you the records as they are just before the provider drops them, so you can give them back on the next \`onInitialize\`.
>
> \`\`\`ts
> let records = SEED
>
> //returned from onInitialize, alongside the data
> onCreateTaskStrategy: ({ deps, metadata }) => new MemoryTaskStrategy({
>     onInitialize: async provider => ({ rawData: records, metadata, columns: provider.getColumns() }),
>     onDestroy: params => records = params.rawData,
> }, deps),
> \`\`\`
>
> Leave \`onDestroy\` out and every remount starts from the seed again — which is occasionally what you want, and otherwise a puzzling data loss.

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

## Task options

Anything that changes how *tasks* behave belongs to the task strategy, so it is passed where the strategy is built — in the \`onCreateTaskStrategy\` that \`onInitialize\` returns. \`MemoryTaskStrategy\` takes one required hook — \`onInitialize\`, resolving the store, the metadata and the columns — and an optional hook per operation beside it. The descriptor hands the callback the resolved \`records\` and \`metadata\` plus the grid's \`deps\`:

\`\`\`ts
//returned from onInitialize, next to the data
onCreateTaskStrategy: ({ deps, records, metadata }) => new MemoryTaskStrategy({
    //the one required hook: the store, the metadata and the columns to load with
    onInitialize: async provider => ({ rawData: records, metadata, columns: provider.getColumns() }),
    //a created task starts with every column of the active view null - make it look like a task
    onGetNewTaskDefaults: () => ({ statuscode: 1, priority: 1, percentcomplete: 0 }),
    //record is the grid's IRecord, so read through it - and loosely, since option-set values
    //normalise to strings
    onIsRecordActive: ({ record }) => record.getValue('statuscode') != 5,
    //defaults to a no-op; this is where a real app would navigate
    onOpenDatasetItems: async ({ entityReferences, isTaskEditingEnabled }) => null,
}, deps),
\`\`\`

Hand back the \`metadata\` you were given, and for the records hand back what the previous mount ended with — see \`onDestroy\` below. The primary id, parent lookup and stack rank are always computed by the strategy and cannot be overridden. Omit the callback entirely and the descriptor builds a plain \`MemoryTaskStrategy\` over the same data.

### The hooks, and the defaults behind them

Each hook falls back to the matching \`MemoryTaskActions\` method and receives its exact parameters, so an override can wrap the default rather than replace it — see [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview), under *The actions classes*.

| Hook | Default | 
|---|---|
| \`onInitialize\` **(required)** | — resolves \`{ rawData, metadata, columns }\`. Called directly; there is no default. |
| \`onDestroy\` | — called before the provider is dropped, with the current records. No default; this is your only chance to keep them. |
| \`onGetNewTaskDefaults\` | no defaults — a new task is every view column set to \`null\` |
| \`onIsRecordActive\` | \`MemoryTaskActions.isRecordActive\` — \`record[stateCode] == 0\` |
| \`onGetAvailableColumns\` | \`MemoryTaskActions.getAvailableColumns\` — the union of every view's columns |
| \`onGetAvailableRelatedColumns\` | \`MemoryTaskActions.getAvailableRelatedColumns\` — none; in-memory data has no relationship metadata |
| \`onCreateTask\` | \`MemoryTaskActions.createTask\` — builds a record ranked before every sibling, filtered out or not; the provider adds it |
| \`onDeleteTasks\` | \`MemoryTaskActions.deleteTasks\` — resolves the subtree to delete; the provider removes it |
| \`onMoveTask\` | \`MemoryTaskActions.moveTask\` — rewrites the parent lookup and takes \`StackRank.between\` of the siblings the provider resolved |
| \`onRecordSave\` | \`MemoryTaskActions.saveRecord\` — writes the dirty fields onto the stored record |
| \`onOpenDatasetItems\` | \`MemoryTaskActions.openDatasetItems\` — a no-op; there is no form to navigate to |

So persisting to a server is a hook away, with the local store kept in step by the action:

\`\`\`ts
onRecordSave: async params => {
    const result = MemoryTaskActions.saveRecord(params)
    await api.patch(result.recordId, result.fields)
    return result
},
\`\`\`

So persisting to a server is a hook away, with the local store kept in step by the action.

## Templates

Register \`createTemplateModule\` from \`modules.onGetTemplatesModule\` and template-based creation appears in the ribbon. \`MemoryTemplateDataProvider\` takes the template source — an \`IMemoryEntitySource\` plus a \`children\` map describing what each template expands into — and the task side it reads columns, metadata and hierarchy from, which the builder is handed on its \`context\`:

\`\`\`ts
const templates = {
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

//returned from onInitialize
modules: {
    onGetTemplatesModule: context => createTemplateModule({
        provider: new MemoryTemplateDataProvider({ templates, onGetTaskDataProvider: context.onGetTaskDataProvider }),
    }),
},
\`\`\`

Each node's \`values\` may set **any** task column, and \`children\` nests to any depth. Capturing a template *from* a task works in reverse: the task's visible column values become \`values\`, and its subtree becomes \`children\`.

The provider copies the source and writes into nothing you handed it, so a template captured at runtime lives in the provider until you store it — see *Keeping data across remounts* below. The contract behind both directions is on [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview), under *The template data provider*.

## Lookup-many columns

\`MemoryLookupManyDataProviderFactory\` turns an \`IMemoryEntitySource\` into the provider a picker wants — one per column, chosen by column name:

\`\`\`ts
const SOURCES: Record<string, IMemoryEntitySource> = {
    assignedto: { records: PEOPLE, columns: PEOPLE_COLUMNS, metadata: PEOPLE_METADATA },
    tags: { records: TAGS, columns: TAGS_COLUMNS, metadata: TAGS_METADATA },
}

//returned from onInitialize
modules: {
    onGetLookupManyModule: () => createLookupManyModule({
        createDataProvider: ({ column }) => {
            const source = SOURCES[column.name]
            return source && MemoryLookupManyDataProviderFactory.create(source)
        },
    }),
},
\`\`\`

The factory copies the records array before handing it over, so deleting inside a picker cannot mutate the one you keep.

What makes a column render as a picker at all is its \`metadata.LookupMany\` — see [**Customizations**](?path=/story/task-grid-customizations--overview), under *Column metadata*. Try **Assigned To** and **Tags** in the grid below.

## Ordering: stack ranks

Ordering uses <a href="https://en.wikipedia.org/wiki/Lexicographical_order" target="_blank" rel="noreferrer">lexicographic</a> rank strings rather than integer positions, so moving one row rewrites one record instead of renumbering its siblings. Drag a row in the grid below and only that row's \`stackrank\` changes:

\`\`\`
task A   0|100000:
task B   0|100002:      ← drop C between A and B
task C   0|100001:      ← only this row is written
\`\`\`

The data provider decides *where* a row lands — it resolves the parent and the siblings on either side over the whole dataset, so a filtered-out row cannot be ranked over — and hands those records to the operation. Reading the rank off them and turning it into a new one is one call, and both shipped strategies make it:

\`\`\`ts
StackRank.between(
    params.previousSibling?.getValue(nativeColumns.stackRank),
    params.nextSibling?.getValue(nativeColumns.stackRank),
)
\`\`\`

\`StackRank\` is exported, and it is the only thing that imports \`lexorank\` — a strategy that orders some other way never pulls it in.

## Keeping data across remounts

The grid rebuilds its control instance whenever it remounts — switching a view does it, so does saving a record — and that calls \`onInitialize\` again. Nothing in the grid holds your data between those calls, so the store is yours to keep. Three things follow.

**Seed once, behind a flag of your own.** Return the *current* value of your store on every call, not a freshly generated one:

\`\`\`ts
let isSeeded = false
let records: IRawRecord[] = []

onInitialize: async () => {
    if (!isSeeded) {
        records = await fetchSeedRecords()
        isSeeded = true
    }
    return { records, /* … */ }
}
\`\`\`

Returning fresh arrays every time, with no guard, wipes the data on every remount.

**Keep one descriptor** for as long as the session should last — build it in \`useMemo\`, or outside the component, never inline in JSX. A new descriptor starts from the seed again.

\`\`\`tsx
const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor(), [])
\`\`\`

**Write mutations back.** The seam differs per feature:

| Data | How it gets back to you |
|---|---|
| Tasks | \`MemoryTaskStrategy\`'s \`onDestroy\` hands you the current records just before the provider is dropped: \`onDestroy: params => records = params.rawData\` |
| Templates | Subscribe to the provider's \`onAfterTemplateCreated\` and keep the snapshot \`getTemplateSource()\` returns |
| Personal views | Subscribe to the module provider's events and pull the strategy's current state |

\`\`\`ts
const strategy = new MemoryUserQueryStrategy({ userQueries })
const module = createUserQueryModule({ strategy, enableQueryManager: true })
const syncStore = async () => { userQueries = await strategy.onGetUserQueries() }
module.provider.events.addEventListener('onAfterUserQueryCreated', syncStore)
module.provider.events.addEventListener('onAfterUserQueryUpdated', syncStore)
module.provider.events.addEventListener('onAfterUserQueriesDeleted', syncStore)

const provider = new MemoryTemplateDataProvider({ templates, onGetTaskDataProvider })
provider.templateEvents.addEventListener('onAfterTemplateCreated', () => { templates = provider.getTemplateSource() })
\`\`\`

## Using it in production

**\`onInitialize\` is async, so the records can come from anywhere.** Fetch them, map them into \`IRawRecord[]\`, and return them:

\`\`\`ts
onInitialize: async () => {
    const response = await fetch('/api/projects/42/tasks')
    return {
        records: (await response.json()).map(toRawRecord),
        metadata: { PrimaryIdAttribute: 'id', LogicalName: 'my_task' },
        fieldMapping: FIELD_MAPPING,
        systemQueries: SYSTEM_QUERIES,
        gridParameters: { enableTaskEditing: true, enableRowDragging: true },
    }
},
\`\`\`

**Holding everything client-side is not a memory-strategy compromise — the grid requires it.** The hierarchy, the *hide inactive* toggle and the rank arithmetic all need the complete task set, so there is no server-side paging to opt into. The Dataverse strategy loads its FetchXML with \`loadAllRecords: true\` for the same reason.

**To persist writes**, subclass \`MemoryTaskStrategy\` and wrap the mutating hooks — they are prototype methods, so \`super\` works:

\`\`\`ts
class MyTaskStrategy extends MemoryTaskStrategy {
    public async onRecordSave(record: IRecord) {
        const changedFields = await super.onRecordSave(record)
        await persist(record, changedFields)
        return changedFields
    }
}
\`\`\`

\`onCreateTask\`, \`onDeleteTasks\` and \`onMoveTask\` take the same shape. Return the subclass from \`onCreateTaskStrategy\` — see [**Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview).

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
