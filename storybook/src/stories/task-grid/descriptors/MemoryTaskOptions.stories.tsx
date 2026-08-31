import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Descriptors/Memory/Task options',
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
Anything that changes how *tasks* behave belongs to the task strategy, so it is passed where the strategy is built — in the \`onCreateTaskStrategy\` that \`onInitialize\` returns. \`MemoryTaskStrategy\` takes one required hook — \`onInitialize\`, resolving the store, the metadata and the columns — and an optional hook per operation beside it. The descriptor hands the callback the resolved \`records\` and \`metadata\` plus the grid's \`services\` — the locator every shipped strategy is built with, forwarded untouched:

\`\`\`ts
//returned from onInitialize, next to the data
onCreateTaskStrategy: ({ services, records, metadata }) => new MemoryTaskStrategy({
    //the one required hook: the store, the metadata and the columns to load with
    onInitialize: async provider => ({ rawData: records, metadata, columns: provider.getColumns() }),
    //a created task starts with every column of the active view null - make it look like a task
    onGetNewTaskDefaults: () => ({ statuscode: 1, priority: 1, percentcomplete: 0 }),
    //record is the grid's IRecord, so read through it - and loosely, since option-set values
    //normalise to strings
    onIsRecordActive: ({ record }) => record.getValue('statuscode') != 5,
    //defaults to a no-op; this is where a real app would navigate
    onOpenDatasetItems: async ({ entityReferences, isTaskEditingEnabled }) => null,
}),
\`\`\`

Hand back the \`metadata\` you were given, and for the records hand back what the previous mount ended with — see [**Your data, and who owns it**](#your-data-and-who-owns-it). The primary id, parent lookup and stack rank are always computed by the strategy and cannot be overridden. Omit the callback entirely and the descriptor builds a plain \`MemoryTaskStrategy\` over the same data.

### The hooks, and the defaults behind them

Each hook falls back to the matching \`MemoryTaskActions\` method and receives its exact parameters, so an override can wrap the default rather than replace it — see [**Extending**](?path=/story/task-grid-extending--overview), under *The actions classes*.

| Hook | Default | 
|---|---|
| \`onInitialize\` **(required)** | — resolves \`{ rawData, metadata, columns }\`. Called directly; there is no default. |
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

\`StackRank\` is exported, so a strategy of your own can rank the same way.

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
        const result = await super.onRecordSave(record)
        await persist(record, result.fields)
        return result
    }
}
\`\`\`

\`onCreateTask\`, \`onDeleteTasks\` and \`onMoveTask\` take the same shape. Return the subclass from \`onCreateTaskStrategy\` — see [**Extend a shipped strategy**](?path=/story/task-grid-extending-extend-a-shipped-strategy--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
