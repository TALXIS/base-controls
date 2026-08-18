import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Custom strategies',
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
Neither shipped descriptor is a subclassing exercise — [**Memory**](?path=/story/task-grid-strategies-memory--overview) and [**Dataverse**](?path=/story/task-grid-strategies-dataverse--overview) are configured entirely through a parameter object, and that is where you should stay for as long as it works.

This section is for when it stops working: you need one shipped piece somewhere else, you need to change a behaviour no parameter reaches, or your data lives somewhere neither descriptor covers.

## Which route to take

| Situation | Route |
|---|---|
| One shipped behaviour is wrong for you | Check the constructor params first, then [**Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview). |
| You want a shipped *piece* in a different context — Dataverse tasks with in-memory views, memory tasks with your own loader | [**Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview). |
| Your records live in a REST API, GraphQL, SQL through a gateway | [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview). |

## Before you subclass anything

Several behaviours that look like they need a subclass are constructor parameters on \`MemoryTaskGridDescriptor\`:

- \`onGetNewTaskDefaults\` — field values for newly created tasks.
- \`onIsRecordActive\` — what counts as active.
- \`onOpenDatasetItems\` — what happens when the user opens a task.
- \`onCreateGridCustomizerStrategy\` — your AG Grid [**Customizer**](?path=/story/task-grid-customizations-customizer--overview).

\`IDataverseTaskGridDescriptorParams\` has none of these, which is why extending the Dataverse descriptor is a more common need than extending the memory one.

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
| \`onGetGridParameters?()\` | — | \`ITaskGridParameters\` feature flags. |
| \`onCreateTemplateDataProvider?()\` | — | Enables template-based creation. Return an \`ITemplateDataProvider\` whose records are templates and which can capture a new one from a task. |
| \`onCreateLookupManyDataProvider?(params)\` | — | Supplies picker candidates for a lookup-many column. Called once per lookup-many cell. |
| \`onCreateCustomColumnsStrategy?()\` | — | Enables user-defined columns. |
| \`onCreateGridCustomizerStrategy?()\` | — | Deep-customizes AG Grid column definitions, renderers and row class rules. |
| \`onGetControlId?()\` | — | A stable DOM identifier. Auto-generated as a UUID when omitted. |

The optional hooks are feature switches, not just configuration: omit \`onCreateTemplateDataProvider\` and template creation disappears from the UI; omit \`onCreateCustomColumnsStrategy\` and custom columns are off.

Every flag in \`ITaskGridParameters\` defaults to \`false\` when \`onGetGridParameters\` is omitted or leaves it out. (The interface's own JSDoc claims \`true\` — it is wrong; the factory reads \`?? false\`.)

### Which hooks each shipped descriptor implements

| Hook | \`MemoryTaskGridDescriptor\` | \`DataverseTaskGridDescriptor\` |
|---|:---:|:---:|
| \`onGetFieldMapping\` | ✅ | ✅ |
| \`onCreateTaskStrategy\` | ✅ | ✅ |
| \`onCreateSavedQueryStrategy\` | ✅ | ✅ |
| \`onCreateUserQueryDataProvider\` | ✅ | ✅ |
| \`onLoadDependencies\` | ✅ resolves once, cached | ✅ re-runs on every remount |
| \`onGetHeight\` | ✅ | ✅ |
| \`onGetGridParameters\` | ✅ | ✅ |
| \`onCreateLookupManyDataProvider\` | ✅ from \`lookupMany\` | ✅ from column metadata |
| \`onCreateTemplateDataProvider\` | ✅ | — capture is not implemented |
| \`onCreateGridCustomizerStrategy\` | ✅ forwards your param | — |
| \`onCreateCustomColumnsStrategy\` | — | ✅ unconditionally, WIP |
| \`onGetControlId\` | — | — |

The two dashes that matter: no customizer on Dataverse, and no custom columns on memory. Both need a descriptor of your own or a subclass.

## Ordering: what runs when

The sequence matters, because the strategies are created *after* configuration resolves:

1. \`onLoadDependencies()\` — awaited first. Anything async belongs here.
2. \`onCreateCustomColumnsStrategy()\`, then \`onCreateSavedQueryStrategy()\` and \`onGetFieldMapping()\`.
3. \`onCreateTemplateDataProvider()\`, then \`onCreateTaskStrategy(deps)\` — the template provider is handed to the task strategy through \`deps\`. Creating a template is the template provider's own operation: call \`createTemplateFromTask\` on it, not on the task provider.
4. The task strategy's own \`onInitialize(provider)\` runs, which is where it loads its records.

That is why a \`onCreate*\` hook must be able to assume its inputs already exist, and why both shipped descriptors throw a clear error rather than returning \`undefined\` when one is called too early. It is also the reason the two differ on caching: the memory descriptor resolves \`onInitialize\` once and reuses it, so its records survive remounts, while the Dataverse one re-resolves each time and re-fetches from the server.

## The template data provider

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

The mixin owns \`templateEvents\` and the error handling, which is what drives the grid's loading state and error dialog. \`MemoryTemplateDataProvider\` is the reference implementation; \`DataverseTemplateDataProvider\` is a stub whose capture throws.

Note the split: capturing a template *from* a task belongs to this provider, while expanding one *into* tasks is the task strategy's \`onCreateTasksFromTemplate\`.

## Imports

The extension classes are on the package root, but most of the *interfaces* you implement are not — they come from subpaths:

\`\`\`ts
//root barrel: every shipped class and its params interface
import { MemoryTaskStrategy, DataverseTaskStrategy, MemorySavedQueryStrategy } from '@talxis/base-controls'

//the contracts you implement
import type { ITaskGridDescriptor, ITaskStrategyDeps, IFieldMapping, ITaskGridParameters }
    from '@talxis/base-controls/components/TaskGrid'
import type { ITaskDataProviderStrategy, ITaskDataProvider, ISavedQuery, ISavedQueryStrategy, ITemplateDataProvider }
    from '@talxis/base-controls/components/TaskGrid/providers'
import type { IGridCustomizerStrategy, IGridCustomizer }
    from '@talxis/base-controls/components/TaskGrid/components/grid'
\`\`\`

A few things are not exported at all and have to be written as object literals or reached by file path: \`IDataverseSavedQueryStrategyParameters\`, \`IDataverseCustomColumnsStrategyParameters\`, the \`IFormParameters\` used by \`DataverseTaskStrategy\`'s \`form\` hook, and \`FetchXmlDataProviderFactory\`.

## Troubleshooting

1. **Everything is flat** — \`parentId\` is not mapped to the attribute that actually holds the parent value, or the raw value is in a shape the lookup reader does not recognise. Dataverse records carry it under \`_<lookup>_value\`; a hand-built record can instead put an entity-reference array under the plain column name. A bare guid under the plain name is the one combination that does not work.
2. **Rows are in an unexpected order** — \`stackRank\` is unmapped, or the ranks are not comparable strings.
3. **Nothing renders and no error appears** — \`onLoadDependencies\` never resolved. It is awaited before the first provider is created, so a hanging promise there shows as an indefinite skeleton.
4. **A feature is missing from the ribbon** — its flag in \`onGetGridParameters\` defaults to \`false\`, or the optional hook that enables it is not implemented.
5. **A Dataverse grid never leaves the skeleton at all** — a startup read failed against a TALXIS model that is not in the environment: \`talxis_attributedefinition\` as the descriptor ships, or \`talxis_userquery\` with \`enableUserQueries\` on. Neither read is error-wrapped. Override the hook that serves the feature and the read is gone.

Then pick a route: [**Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview), [**Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview), or [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
