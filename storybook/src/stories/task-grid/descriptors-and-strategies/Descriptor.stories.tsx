import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'

const DocsPlaceholder = () => <div style={{ display: 'none' }} />

const meta = {
    title: 'Task Grid/Descriptors & Strategies/Descriptor',
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
Both shipped strategies, **Memory** and **Dataverse**, are just implementations of \`ITaskGridDescriptor\`.

The grid receives that descriptor through the \`taskGridDescriptor\` prop and calls its hooks as it starts up. Where the data comes from differs; the contract does not.

## The descriptor contract

A descriptor answers four questions the grid cannot answer on its own: which columns play which role, how to load and mutate tasks, how to load and persist saved views, and what to show in the save-view dialog.

| Method | Required | Description |
|--------|:--------:|-------------|
| \`onGetFieldMapping()\` | ✅ | Maps column roles to physical attribute names in your schema. |
| \`onCreateTaskStrategy(deps)\` | ✅ | Returns the strategy handling task CRUD, move, and template expansion. |
| \`onCreateSavedQueryStrategy()\` | ✅ | Returns the strategy that loads and persists saved views. |
| \`onCreateUserQueryDataProvider()\` | ✅ | Returns the \`IDataProvider\` backing the save-view dialog. |
| \`onLoadDependencies?()\` | — | Async hook called once **before** anything else. Resolve configuration and fetch here. |
| \`onGetHeight?()\` | — | Container height as a CSS string. Fills the parent when omitted. |
| \`onGetGridParameters?()\` | — | \`ITaskGridParameters\` feature flags. All flags default to \`false\`. |
| \`onCreateTemplateDataProvider?()\` | — | Enables template-based creation. Return an \`ITemplateDataProvider\` whose records are templates and which can capture a new one from a task. |
| \`onCreateLookupManyDataProvider?(params)\` | — | Supplies picker candidates for a lookup-many column. Called once per lookup-many cell. |
| \`onCreateCustomColumnsStrategy?()\` | — | Enables user-defined columns. |
| \`onCreateGridCustomizerStrategy?()\` | — | Deep-customizes AG Grid column definitions, renderers and row class rules. |
| \`onGetControlId?()\` | — | A stable DOM identifier. Auto-generated as a UUID when omitted. |

The optional hooks are feature switches, not just configuration: omit \`onCreateTemplateDataProvider\` and template creation disappears from the UI; omit \`onCreateCustomColumnsStrategy\` and custom columns are off.

### The template data provider

\`onCreateTemplateDataProvider\` returns an \`ITemplateDataProvider\` — an \`IDataProvider\`, because the picker lists its records, plus template creation:

\`\`\`ts
interface ITemplateDataProvider extends IDataProvider {
    templateEvents: IEventEmitter<ITemplateDataProviderEvents>
    createTemplateFromTask(task: IRecord): Promise<IRawRecord | null>
}
\`\`\`

Do not write the lifecycle plumbing yourself. Extend the \`TemplateDataProviderBase\` mixin over whatever provider your platform needs and implement a single hook:

\`\`\`ts
export class MyTemplateDataProvider extends TemplateDataProviderBase(MemoryDataProvider) {
    //return null when the user cancels; throw to report a failure
    protected async onCreateTemplateFromTask(task: IRecord) {
        return captureTemplate(task)
    }
}
\`\`\`

The mixin owns \`templateEvents\` and the error handling, which is what drives the grid's loading state and error dialog. \`MemoryTemplateDataProvider\` is the reference implementation; \`DataverseTemplateDataProvider\` is a stub whose capture is not implemented yet, which is why the Dataverse descriptor leaves templating off.

Note the split: capturing a template *from* a task belongs to this provider, while expanding one *into* tasks is the task strategy's \`onCreateTasksFromTemplate\`.

## \`onGetFieldMapping\`

The grid needs to know which of your columns carry structural meaning. Everything else it treats as ordinary data.

\`\`\`ts
public onGetFieldMapping(): IFieldMapping {
    return {
        subject: 'subject',       // display name; pinned left, never hidden
        parentId: 'parentid',     // parent lookup; drives the tree
        stackRank: 'stackrank',   // ordering; drives drag-and-drop
        stateCode: 'statecode',   // active/inactive; drives "hide inactive"
    }
}
\`\`\`

- **\`subject\`** — the title column. Always pinned left and never hidden by the control.
- **\`parentId\`** — the lookup pointing at the parent task. This alone produces the hierarchy; a row with no parent is top level.
- **\`stackRank\`** — the ordering attribute. Sorted by default, and rewritten when rows are dragged.
- **\`stateCode\`** — the active/inactive attribute, used by the *Hide inactive tasks* toggle.

At runtime the mapping is available to strategies as \`provider.getNativeColumns()\`, so a strategy never needs its own copy of these names.

## Ordering: what runs when

The sequence matters, because the strategies are created *after* configuration resolves:

1. \`onLoadDependencies()\` — awaited first. Anything async belongs here.
2. \`onCreateCustomColumnsStrategy()\`, then \`onCreateSavedQueryStrategy()\` and \`onGetFieldMapping()\`.
3. \`onCreateTemplateDataProvider()\`, then \`onCreateTaskStrategy(deps)\` — the template provider is handed to the task strategy through \`deps\`. Creating a template is the template provider's own operation: call \`createTemplateFromTask\` on it, not on the task provider.
4. The task strategy's own \`onInitialize(provider)\` runs, which is where it loads its records.

That ordering is why both shipped descriptors resolve everything in \`onLoadDependencies\` and cache it: by the time a \`onCreate*\` hook runs, its inputs must already be available. It is also why they throw a clear error rather than returning \`undefined\` when a hook is called before initialization.

## Stack rank, not row index

Ordering uses <a href="https://en.wikipedia.org/wiki/Lexicographical_order" target="_blank" rel="noreferrer">lexicographic</a> rank strings rather than integer positions, so moving one row rewrites one record instead of renumbering its siblings.

\`\`\`
task A   0|100000:
task B   0|100002:      ← drop C between A and B
task C   0|100001:      ← only this row is written
\`\`\`

Your strategy owns the rank arithmetic. Both shipped strategies use the \`lexorank\` package, which is already a dependency.

## In practice

If the grid renders but the shape is wrong, check these in order:

1. **Everything is flat** — \`parentId\` is not mapped to the attribute that actually holds the parent value, or the raw value is in a shape the lookup reader does not recognise. Dataverse records carry it under \`_<lookup>_value\`; a hand-built record can instead put an entity-reference array under the plain column name. A bare guid under the plain name is the one combination that does not work.
2. **Rows are in an unexpected order** — \`stackRank\` is unmapped, or the ranks are not comparable strings.
3. **Nothing renders and no error appears** — \`onLoadDependencies\` never resolved. It is awaited before the first provider is created, so a hanging promise there shows as an indefinite skeleton.
4. **A feature is missing from the ribbon** — its flag in \`onGetGridParameters\` defaults to \`false\`, or the optional hook that enables it is not implemented.

Once the mapping and the load order are right, the same descriptor shape works against any backend — go to [**Memory**](?path=/story/task-grid-descriptors-strategies-memory--overview), [**Dataverse**](?path=/story/task-grid-descriptors-strategies-dataverse--overview), or [**Writing your own strategy**](?path=/story/task-grid-descriptors-strategies-writing-your-own-strategy--overview).
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
