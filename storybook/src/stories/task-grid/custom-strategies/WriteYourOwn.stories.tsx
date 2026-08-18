import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'

const DocsPlaceholder = () => <div style={{ display: 'none' }} />

const meta = {
    title: 'Task Grid/Descriptors & Strategies/Writing your own strategy',
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
When neither shipped strategy fits — a REST API, GraphQL, SQL through a gateway — you write your own. The grid does not care where records come from.

You need two pieces: a **descriptor** implementing \`ITaskGridDescriptor\`, and a **task strategy** implementing \`ITaskDataProviderStrategy\`. \`MemoryTaskStrategy\` in \`src/components/TaskGrid/extensions/memory/\` is the shortest complete implementation to read alongside this page.

## The task strategy

This is where the work is. The grid calls these hooks; you decide what they mean.

| Method | Required | Description |
|--------|:--------:|-------------|
| \`onInitialize(provider)\` | ✅ | Load the initial data. Return \`{ columns, rawData, metadata }\`. Async — the grid shows its skeleton meanwhile. |
| \`onGetRawRecords(ids)\` | ✅ | Re-read specific records, to refresh rows after a change. |
| \`onGetAvailableColumns(options?)\` | ✅ | Columns offered in the *Edit columns* panel. |
| \`onGetAvailableRelatedColumns()\` | ✅ | Columns reachable through relationships. Return \`[]\` if you have none. |
| \`onCreateTask(parentTaskId?)\` | ✅ | Create one task, optionally under a parent. Return the new raw record. |
| \`onDeleteTasks(taskIds)\` | ✅ | Delete tasks. Return which ids actually went. |
| \`onMoveTask(movingId, targetId, position)\` | ✅ | Reparent and/or reorder. \`position\` is \`'above'\`, \`'below'\` or \`'child'\`. |
| \`onRecordSave(record)\` | ✅ | Persist an edited record. Return which fields you wrote. |
| \`onIsRecordActive(recordId)\` | ✅ | Whether a task is active. Synchronous. |
| \`onCreateTasksFromTemplate(templateId, parentTaskId?)\` | ✅ | Expand a template into tasks, or return \`null\`. |
| \`onOpenDatasetItems(refs, isTaskEntity)\` | ✅ | The user opened records — navigate, open a dialog, or no-op. |
| \`onGetRootTaskId?()\` | — | Root the tree at one task. |

\`onCreateTasksFromTemplate\` is required by the interface but may return \`null\` if you do not support templates — the Dataverse strategy throws instead, which is equally valid when the feature is off. Capturing a template *from* a task is not part of the strategy: it belongs to the \`ITemplateDataProvider\` you return from \`onCreateTemplateDataProvider\`.

### \`onInitialize\` is your setup hook

It receives the \`ITaskDataProvider\` and is the first thing called. Grab what you need from the provider here, because most of it is not available at construction time:

\`\`\`ts
public async onInitialize(provider: ITaskDataProvider) {
    this._provider = provider
    this._taskTree = provider.getRecordTree()
    //the field mapping the descriptor returned - do not keep your own copy
    const fieldMapping = provider.getNativeColumns()
    const records = await fetch('/api/tasks').then(response => response.json())
    return {
        columns: provider.getColumns(),
        rawData: records,
        metadata: { PrimaryIdAttribute: 'id' },
    }
}
\`\`\`

Two things worth copying from the memory strategy:

- **Keep only what you were handed.** Store the provider and whatever your own loader resolved, and derive the rest on access — field names from \`provider.getNativeColumns()\`, columns from \`provider.getColumns()\`, the hierarchy from \`provider.getRecordTree()\`. A snapshot of derived values goes stale as soon as the user switches a view.
- **Do not duplicate what another provider owns.** \`deps\` hands you the saved-query, template and custom-columns providers; read through them instead of keeping a second copy of their data.

### Raw records and the parent key

\`rawData\` is \`IRawRecord[]\` — plain objects keyed by column name. The one non-obvious part is the parent lookup, because the grid resolves it through \`record.getValue(parentId)\` and the underlying reader accepts more than one raw shape. With \`parentId: 'parentid'\` mapped, either of these works:

\`\`\`ts
//entity-reference array under the plain column name - what the memory strategy writes
{ id: '2', subject: 'Wireframes', parentid: [{ id: { guid: '1' }, etn: 'demo_task' }], stackrank: '0|100000:', statecode: 0 }

//Dataverse Web API shape - what a FetchXML response gives you for free
{ id: '2', subject: 'Wireframes', _parentid_value: '1', stackrank: '0|100000:', statecode: 0 }
\`\`\`

Top-level tasks hold \`null\`. What does *not* work is a bare guid under the plain column name (\`parentid: '1'\`) — with no lookup annotation alongside it, the reader treats the value as an array and throws.

### Ordering

\`onMoveTask\` owns the rank arithmetic. The \`lexorank\` package is already a dependency, and the pattern is:

- \`'child'\` — reparent, then rank before the target's existing children.
- \`'above'\` / \`'below'\` — rank between the target and its neighbour on that side.

Read siblings from your own store rather than the visible tree when computing ranks, or a row hidden by the active view can collide with a new rank. Use the tree for *display order* — that is what "above" and "below" mean to the user — and exclude the moving record so it is never ranked against itself.

## The saved-query strategy

\`ISavedQueryStrategy\` handles views. If you do not persist views, return the system views and let the mutators throw or no-op:

| Method | Description |
|---|---|
| \`onGetSystemQueries()\` | Built-in views. At least one required. |
| \`onGetUserQueries()\` | The user's personal views. |
| \`onCreateUserQuery(newQuery, currentQuery)\` | Persist a new view. Return its id, or \`null\` if cancelled. |
| \`onUpdateUserQuery(currentQuery)\` | Persist changes to an existing view. |
| \`onDeleteUserQueries(queryIds)\` | Delete views. Return which ids went. |

An \`ISavedQuery\` is \`{ id, name, columns }\` plus optional \`filtering\`, \`sorting\`, \`quickFindColumns\` and \`isFlatListEnabled\`. The columns array is what the view actually displays — include your hidden structural columns in every view.

## Wiring it up

The descriptor is mostly plumbing once the strategies exist:

\`\`\`ts
export class MyTaskGridDescriptor implements ITaskGridDescriptor {
    public async onLoadDependencies() {
        this._config = await loadConfig()
    }

    public onGetFieldMapping(): IFieldMapping {
        return { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' }
    }

    public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
        return new MyTaskStrategy(deps)
    }

    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        return new MySavedQueryStrategy()
    }

    public onCreateUserQueryDataProvider(): IDataProvider {
        return new MemoryDataProvider({ /* backs the save-view dialog */ })
    }

    public onGetGridParameters(): ITaskGridParameters {
        return { enableTaskEditing: true, enableRowDragging: true }
    }
}
\`\`\`

\`deps\` carries what the grid built for you — \`savedQueryDataProvider\`, \`templateDataProvider\`, \`customColumnsDataProvider\`, and the \`enableTaskEditing\` / \`enableInlineCreation\` flags — so the strategy does not have to be told twice. The memory strategy leans on all three: it answers \`onGetAvailableColumns\` from the views, expands templates through the template provider, and never keeps a copy of either.

## A shortcut worth knowing

If your data is already in memory, you do not need a new strategy at all. \`MemoryTaskStrategy\` takes an async callback, so you can point it at your own loader and keep the rest:

\`\`\`ts
public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
    return new MemoryTaskStrategy({
        onInitialize: async () => ({
            records: await fetchMyTasks(),
            metadata: METADATA,
        }),
    }, deps)
}
\`\`\`

That gets you working create, delete, move, templates and editing against your own records — all client-side, with nothing written back. It is a good way to prototype the UI before committing to the persistence layer.

Go back to [**Descriptor**](?path=/story/task-grid-descriptors-strategies-descriptor--overview) for the contract, or read [**Memory**](?path=/story/task-grid-descriptors-strategies-memory--overview) for the reference implementation's parameters.
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
