import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Descriptors/Memory/Feature data',
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
Each optional feature reads its data from its own memory implementation. Registering the module is what
turns the feature on — see [**Modules**](?path=/story/task-grid-modules--overview) — and this page is where
that module's data comes from when you are running on memory.

None of these arrays is ever written to; see
[**Your data**](?path=/story/task-grid-descriptors-memory-your-data--overview).

## Templates

Register \`createTemplateModule\` from \`modules.onGetTemplatesModule\` and template-based creation appears in the ribbon. \`MemoryTemplateDataProvider\` takes the template source — an \`IMemoryEntitySource\` plus a \`children\` map describing what each template expands into — and the grid's \`services\`, which is how it reaches the task side it reads columns, metadata and hierarchy from:

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
    onGetTemplatesModule: ({ services }) => createTemplateModule({
        provider: new MemoryTemplateDataProvider({ templates, services }),
    }),
},
\`\`\`

Each node's \`values\` may set **any** task column, and \`children\` nests to any depth. Capturing a template *from* a task works in reverse: the task's visible column values become \`values\`, and its subtree becomes \`children\`.

The provider copies the source and writes into nothing you handed it, so a template captured at runtime lives in the provider until you store it — see *Keeping data across remounts* below. The contract behind both directions is on [**Extending**](?path=/story/task-grid-extending--overview), under *The template data provider*.

## Lookup-many columns

\`MemoryLookupManyDataProviderFactory\` turns an \`IMemoryEntitySource\` into the provider a picker wants — one per column, chosen by column name:

\`\`\`ts
const SOURCES: Record<string, IMemoryEntitySource> = {
    assignedto: { records: PEOPLE, columns: PEOPLE_COLUMNS, metadata: PEOPLE_METADATA },
    tags: { records: TAGS, columns: TAGS_COLUMNS, metadata: TAGS_METADATA },
}

//returned from onInitialize
modules: {
    onGetLookupManyModule: ({ services }) => createLookupManyModule({
        createDataProvider: ({ column }) => {
            const source = SOURCES[column.name]
            return source && MemoryLookupManyDataProviderFactory.create({ source, services })
        },
    }),
},
\`\`\`

The factory copies the records array before handing it over, so deleting inside a picker cannot mutate the one you keep.

What makes a column render as a picker at all is its \`metadata.LookupMany\` — see [**Customizations**](?path=/story/task-grid-customizations--overview), under *Column metadata*. Try **Assigned To** and **Tags** in the grid below.

## Task dependencies

A dependency is a pair of task ids and the type of link between them:

\`\`\`ts
const DEPENDENCIES: ITaskDependency[] = [
    { id: 'dep-01', predecessorTaskId: '1', successorTaskId: '2', type: 'finishToStart' },
    { id: 'dep-02', predecessorTaskId: '2', successorTaskId: '3', type: 'startToStart' },
]

//returned from onInitialize
modules: {
    onGetDependenciesModule: ({ services }) => createDependenciesModule({
        strategy: new MemoryTaskDependencyStrategy({ dependencies: DEPENDENCIES, services }),
        services,
    }),
},
\`\`\`

The strategy is asked once per mount, and only for the tasks the grid has loaded — a dependency counts when either of its ends is one of them, so a link pointing at a task outside the grid still arrives. It deletes from the array too: removing a task removes the rows that pointed at it, the way a cascade delete would on a real backend, and the provider is refreshed so the cells at the other end of those rows update. Hand it the array you keep for the session rather than a shared fixture.

Registering the module is what creates the **Predecessors** and **Successors** columns; they are the grid's, and they arrive hidden. See [**Modules → Task dependencies**](?path=/story/task-grid-modules--dependencies) for the columns, and [**Customizations**](?path=/story/task-grid-customizations--overview) under *Columns the grid owns* for how they behave.

## Task checklists

A checklist item is a name and whether it is done. They are handed over keyed by task id — which task an
item is under is the map, not a field on the item:

\`\`\`ts
const CHECKLIST_ITEMS: Record<string, IChecklistItem[]> = {
    '2': [
        { id: 'chk-01', name: 'Collect requirements', isCompleted: true },
        { id: 'chk-02', name: 'Interview stakeholders', isCompleted: false },
    ],
}

//returned from onInitialize
modules: {
    onGetChecklistModule: ({ services }) => createChecklistModule({
        strategy: new MemoryChecklistStrategy({ items: CHECKLIST_ITEMS, services }),
        services,
    }),
},
\`\`\`

The strategy is read-only and never writes to the map you hand it, so a fixture can be shared between
grids. It is asked only for the tasks the grid has loaded, and answers with just those.

Registering the module is what creates the **Checklist** column, which shows \`done/total\` for each task.
See [**Modules → Task checklists**](?path=/story/task-grid-modules--checklist).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
