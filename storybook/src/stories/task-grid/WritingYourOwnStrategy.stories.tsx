import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'

const DocsPlaceholder = () => <div style={{ display: 'none' }} />

const meta = {
    title: 'Task Grid/Get started/Writing your own strategy',
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
| \`onCreateTemplateFromTask(taskId)\` | ✅ | Capture a task subtree as a template, or return \`null\`. |
| \`onCreateTasksFromTemplate(templateId, parentTaskId?)\` | ✅ | Expand a template into tasks, or return \`null\`. |
| \`onOpenDatasetItems(refs, isTaskEntity)\` | ✅ | The user opened records — navigate, open a dialog, or no-op. |
| \`onGetRootTaskId?()\` | — | Root the tree at one task. |

Templates are required by the interface but may return \`null\` if you do not support them — the Dataverse strategy throws instead, which is equally valid when the feature is off.

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

- **Resolve derived values once.** Physical field names, editable column lists and similar all come from the mapping and metadata. Compute them here into one object rather than re-deriving them on every hook call.
- **Fail loudly if a hook runs first.** A private accessor that throws a clear "not initialized" message beats optional-chaining through half-built state.

### Raw records and the parent key

\`rawData\` is \`IRawRecord[]\` — plain objects keyed by column name. The one non-obvious convention is the parent lookup: the grid reads it from \`_<parentId>_value\`, following Dataverse. With \`parentId: 'parentid'\` mapped, a top-level task looks like:

\`\`\`ts
{ id: '1', subject: 'Website redesign', _parentid_value: null, stackrank: '0|100000:', statecode: 0 }
\`\`\`

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

\`deps\` carries what the grid built for you — \`templateDataProvider\`, \`customColumnsDataProvider\`, and the \`enableTaskEditing\` / \`enableInlineCreation\` flags — so the strategy does not have to be told twice.

## A shortcut worth knowing

If your data is already in memory, you do not need a new strategy at all. \`MemoryTaskStrategy\` takes an async callback, so you can point it at your own loader and keep the rest:

\`\`\`ts
public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
    return new MemoryTaskStrategy({
        onInitialize: async () => ({
            tasks: { records: await fetchMyTasks(), columns: COLUMNS, metadata: METADATA },
        }),
    }, deps)
}
\`\`\`

That gets you working create, delete, move, templates and editing against your own records — all client-side, with nothing written back. It is a good way to prototype the UI before committing to the persistence layer.

Go back to [**Descriptor**](?path=/story/task-grid-get-started-descriptor--overview) for the contract, or read [**Memory**](?path=/story/task-grid-memory--overview) for the reference implementation's parameters.
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
