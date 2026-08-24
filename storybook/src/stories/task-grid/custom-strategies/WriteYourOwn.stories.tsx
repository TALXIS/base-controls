import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Custom strategies/Write your own',
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
When neither shipped strategy fits — a REST API, GraphQL, SQL through a gateway — you can write your own. The grid does not care where records come from. Reach for this when you want the mutations to go through your own code from the start, or when the shipped strategies' shapes fight you; if you only need remote *loading*, the memory strategy already does that.

You need two pieces: a **descriptor** implementing \`ITaskGridDescriptor\`, and a **task strategy** implementing \`ITaskDataProviderStrategy\`. \`MemoryTaskStrategy\` in \`src/components/TaskGrid/strategies/memory/\` is the shortest complete implementation to read alongside this page — and \`MemoryTaskActions\` beside it holds the behaviour on its own, so you can call the parts that fit your data instead of rewriting them, and [**Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview) is worth reading first — if your records fit in memory, pointing \`MemoryTaskStrategy\` at your own loader gets you working CRUD without any of this.

Where the interfaces on this page are imported from is listed under [**Imports**](?path=/story/task-grid-custom-strategies--overview).

## The task strategy

This is where the work is. The grid calls these hooks; you decide what they mean.

| Method | Required | Description |
|--------|:--------:|-------------|
| \`onInitialize(provider)\` | ✅ | Load the initial data. Return \`{ columns, rawData, metadata }\`. Async — the grid shows its skeleton meanwhile. |
| \`onGetRawRecords(ids)\` | ✅ | Re-read specific records, to refresh rows after a change. |
| \`onGetAvailableColumns(options?)\` | ✅ | Columns offered in the *Edit columns* panel. |
| \`onGetAvailableRelatedColumns()\` | ✅ | Columns reachable through relationships. Return \`[]\` if you have none. |
| \`onCreateTask(params)\` | ✅ | Create one task where the sibling context says. Return the new raw record. |
| \`onDeleteTasks(taskIds)\` | ✅ | Delete tasks. Return which ids actually went. |
| \`onMoveTask(params)\` | ✅ | Reparent and/or reorder, between the siblings the provider resolved. |
| \`onRecordSave(record)\` | ✅ | Persist an edited record. Return which fields you wrote. |
| \`onIsRecordActive(recordId)\` | ✅ | Whether a task is active. Synchronous. |
| \`onOpenDatasetItems(refs, isTaskEntity)\` | ✅ | The user opened records — navigate, open a dialog, or no-op. |
| \`onDestroy?()\` | — | Called just before the provider is torn down, on unmount and on every remount. Its data is still readable, so this is the last chance to hand the current records to whoever keeps them. |
| \`onGetRootTaskId?()\` | — | Root the tree at one task. |

Templates are not part of the strategy in either direction: capturing one from a task and expanding one into tasks both belong to the \`ITemplateDataProvider\` you wrap in \`createTemplateModule\` and return from \`onGetModules\` — see [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview), under *The template data provider*.

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

### You do not have to write all of it

\`MemoryTaskActions\` and \`DataverseTaskActions\` are static classes with no state of their own: everything they need is a parameter. So the fiddly parts — LexoRank ranking between siblings, the parent-lookup shape, the cascade-delete walk over the unfiltered store, the *Edit columns* catalogue — are available to a strategy of your own:

\`\`\`ts
public async onDeleteTasks(taskIds: string[]) {
    await api.delete(taskIds)
    //keeps the local store and its hierarchy consistent, cascade included
    return MemoryTaskActions.deleteTasks({
        taskIds,
        records: this._records,
        metadata: this._metadata,
        nativeColumns: this._provider.getNativeColumns(),
        onGetRecord: id => this._provider.getRecordsMap()[id],
    })
}
\`\`\`

Worth checking each action's parameters before you implement its operation from scratch — several are pure functions over data you already hold. Note what they ask for: \`onGetRecord\` is the provider's record map, because an \`IRecord\` carries the reads (\`getValue\`, \`getNamedReference\`) *and* the writable store object through \`getRawData()\`.

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

**The provider works out where the task lands; you decide how order is expressed.** \`onMoveTask\` and \`onCreateTask\` both receive the same sibling context:

\`\`\`ts
interface ITaskSiblingContext {
    parentRecord?: IRecord           // undefined = top level
    siblings: IRecord[]              // every record under that parent, in order
    previousSibling?: IRecord        // the one it ends up after
    nextSibling?: IRecord            // and before
}
\`\`\`

Those neighbours are resolved over the **entire** dataset, not the rows the active view shows — which is the whole point. Ranking against a *visible* neighbour is how a reorder ends up colliding with a record the filter hid, and the collision is real: the rank steps by a fixed amount, so it can land exactly on the hidden row's value.

The same distinction is on the record tree, and it is worth knowing which side you are asking:

\`\`\`ts
const tree = provider.getRecordTree()

tree.view.getChildren(parentId)        // what the grid renders: filter, quick find, flat-list applied
tree.view.hasChildren(id)              // drives the expander
tree.view.getPosition(id)              // a rendered row position, for AG Grid transactions

tree.structure.getChildren(parentId)   // every child in the data, ordered
tree.structure.getDescendants(id)      // the whole subtree - what a cascading delete needs
tree.structure.getAncestorIds(id)      // root-to-self, the cycle guard for a move
tree.structure.getNeighbours(id, { exclude: movingId })
\`\`\`

Rule of thumb: \`view\` for anything the user looks at, \`structure\` for anything you write.

The ranks are not handed to you separately — read whatever you order by off the neighbours themselves. For the shipped lexicographic scheme:

\`\`\`ts
public async onMoveTask(params: ITaskMoveParams) {
    const { stackRank } = this._provider.getNativeColumns()
    await api.patch(params.movingTaskId, {
        parentid: params.parentRecord?.getRecordId() ?? null,
        stackrank: StackRank.between(
            params.previousSibling?.getValue(stackRank),
            params.nextSibling?.getValue(stackRank),
        ),
    })
    return this.onGetRawRecords([params.movingTaskId])
}
\`\`\`

If your records order by a server sequence or a numeric column, ignore both ranks, use \`previousSibling\` / \`nextSibling\` instead, and never import \`StackRank\` — \`lexorank\` then stays out of your bundle.

Two things you no longer have to handle: the moving record is already excluded from \`siblings\`, and a drop into the task's own subtree never reaches you — the provider refuses it and returns \`null\` itself.

## Views: two interfaces, split by feature

\`ISavedQueryStrategy\` is a single method — the system views, which are mandatory:

\`\`\`ts
public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
    return { onGetSystemQueries: async () => SYSTEM_QUERIES }
}
\`\`\`

Personal views are optional and live behind \`onGetModules\` — see [**Modules**](?path=/story/task-grid-modules--overview). Implement \`IUserQueryStrategy\` only if you have somewhere to persist them, then hand it to \`createUserQueryModule\`, which brings the view manager and the save dialogs with it. Omit the key and the feature is off, with no stubs to write:

| Method | Description |
|---|---|
| \`onGetUserQueries()\` | The user's personal views. |
| \`onIsUserQuery(queryId)\` | Whether an id is one of them, as opposed to a system view. Synchronous. |
| \`onCreateUserQuery(newQuery, currentQuery)\` | Persist a new view. Return its id, or \`null\` if cancelled. |
| \`onUpdateUserQuery(currentQuery)\` | Persist changes to an existing view, including a rename from the view manager. |
| \`onDeleteUserQueries(queryIds)\` | Delete views. Return which ids went. |

An \`ISavedQuery\` is \`{ id, name, columns }\` plus optional \`description\`, \`filtering\`, \`sorting\`, \`quickFindColumns\` and \`isFlatListEnabled\`. The columns array is what the view actually displays — include your hidden structural columns in every view.

\`MemoryUserQueryStrategy\` is 40 lines against a plain array, and \`TalxisUserQueryStrategy\` is the same shape against a table; either is worth reading before writing your own.

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
        return { onGetSystemQueries: async () => this._config.systemQueries }
    }

    //optional: omit it and the grid shows system views only
    public onGetModules(): ITaskGridModules {
        return {
            userQueries: createUserQueryModule({
                strategy: new MyUserQueryStrategy(),
                enableSaveAsNewQuery: true,
            }),
        }
    }

    public onGetGridParameters(): ITaskGridParameters {
        return { enableTaskEditing: true, enableRowDragging: true }
    }
}
\`\`\`

\`deps\` carries what the grid built for you — \`savedQueryDataProvider\`, \`customColumnsDataProvider\`, and the \`enableTaskEditing\` / \`enableInlineCreation\` flags — so the strategy does not have to be told twice. The memory strategy answers \`onGetAvailableColumns\` from the views it is handed, and never keeps a copy of them.

## Where the rest lives

The descriptor contract, the startup ordering and the template provider are on [**Custom strategies**](?path=/story/task-grid-custom-strategies--overview). Shipped pieces you can drop into the descriptor above are on [**Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview), and [**Memory**](?path=/story/task-grid-strategies-memory--overview) is the reference implementation to read alongside your own.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
