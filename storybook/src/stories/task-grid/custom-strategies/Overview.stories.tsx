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
| One shipped behaviour is wrong for you | Supply the hook for that one operation — the shipped default stays available as a \`MemoryTaskActions\` / \`DataverseTaskActions\` method you can forward to. Then [**Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview). |
| You want a shipped *piece* in a different context — Dataverse tasks with in-memory views, memory tasks with your own loader | [**Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview). |
| Your records live in a REST API, GraphQL, SQL through a gateway | [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview). |

## Before you subclass anything

Several behaviours that look like they need a subclass are parameters on both shipped descriptors:

- \`onCreateTaskStrategy\` — every task-level option, because they belong to the task strategy: new-task defaults, what counts as active, what happens on open, and on Dataverse the form ids, \`rootTaskId\` and the delete flags. The descriptor hands the callback what it resolved, so you build the shipped strategy with your own options.
- **A hook per operation on the task strategy itself.** \`onCreateTask\`, \`onDeleteTasks\`, \`onMoveTask\`, \`onRecordSave\`, \`onIsRecordActive\`, \`onGetAvailableColumns\`, \`onGetAvailableRelatedColumns\`, \`onCreateTasksFromTemplate\`, \`onOpenDatasetItems\` — plus \`onGetFormParameters\` on Dataverse. Each receives the parameters of the matching action, so wrapping one is a forward rather than a rewrite. See [**the actions classes**](#the-actions-classes).
- \`onCreateUserQueryStrategy\`, \`onCreateTemplateDataProvider\`, \`onCreateCustomColumnsStrategy\` — whether those features exist at all.
- \`onCreateGridCustomizerStrategy\` — your AG Grid [**Customizer**](?path=/story/task-grid-customizations-customizer--overview).

Both parameter objects also carry the \`onCreate*\` callbacks that decide which optional features exist at all — personal views, templates, custom columns, the customizer. Supplying an implementation is the switch, and a feature you never mention costs nothing in your bundle.

## The descriptor contract

A descriptor answers three questions the grid cannot answer on its own: which columns play which role, how to load and mutate tasks, and where the saved views come from. Everything else is an optional hook, and each one is a feature switch — return an implementation and the feature exists.

| Method | Required | Description |
|--------|:--------:|-------------|
| \`onGetFieldMapping()\` | ✅ | Maps column roles to physical attribute names in your schema. |
| \`onCreateTaskStrategy(deps)\` | ✅ | Returns the strategy handling task CRUD, move, and template expansion. |
| \`onCreateSavedQueryStrategy()\` | ✅ | Returns the strategy that loads the system views. |
| \`onCreateUserQueryStrategy?()\` | — | Returns the \`IUserQueryStrategy\` that reads and persists **personal** views. Called when the grid builds its saved-query provider; omit it and personal views are off. |
| \`onLoadDependencies?()\` | — | Async hook called once **before** anything else. Resolve configuration and fetch here. |
| \`onGetHeight?()\` | — | Container height as a CSS string. Fills the parent when omitted. |
| \`onGetGridParameters?()\` | — | \`ITaskGridParameters\` feature flags. |
| \`onCreateTemplateDataProvider?()\` | — | Enables template-based creation. Return an \`ITemplateDataProvider\` whose records are templates and which can capture a new one from a task. |
| \`onCreateLookupManyDataProvider?(params)\` | — | Supplies picker candidates for a lookup-many column. Called once per lookup-many cell. |
| \`onCreateCustomColumnsStrategy?()\` | — | Enables user-defined columns. |
| \`onCreateGridCustomizerStrategy?()\` | — | Deep-customizes AG Grid column definitions, renderers and row class rules. |
| \`onGetControlId?()\` | — | A stable DOM identifier. Auto-generated as a UUID when omitted. |

The optional hooks are feature switches, not just configuration: omit \`onCreateTemplateDataProvider\` and template creation disappears from the UI; omit \`onCreateCustomColumnsStrategy\` and custom columns are off; omit \`onCreateUserQueryStrategy\` and the view switcher lists system views only.

Note how the saved-query contract splits along the same line — \`ISavedQueryStrategy\` is only \`onGetSystemQueries\`, and the four personal-view operations live on \`IUserQueryStrategy\`:

\`\`\`ts
interface IUserQueryStrategy {
    onGetUserQueries: () => Promise<ISavedQuery[]>
    onIsUserQuery: (queryId: string) => boolean
    onCreateUserQuery: (newQuery: { name: string; description?: string }, currentQuery: ISavedQuery) => Promise<string | null>
    onUpdateUserQuery: (currentQuery: ISavedQuery) => Promise<string | null>
    onDeleteUserQueries: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>
}
\`\`\`

Every flag in \`ITaskGridParameters\` defaults to \`false\` when \`onGetGridParameters\` is omitted or leaves it out. (The interface's own JSDoc claims \`true\` — it is wrong; the factory reads \`?? false\`.)

### Which hooks each shipped descriptor implements

| Hook | \`MemoryTaskGridDescriptor\` | \`DataverseTaskGridDescriptor\` |
|---|:---:|:---:|
| \`onGetFieldMapping\` | ✅ | ✅ |
| \`onCreateTaskStrategy\` | ✅ | ✅ |
| \`onCreateSavedQueryStrategy\` | ✅ from \`systemQueries\` | ✅ from \`systemQueries\` |
| \`onCreateUserQueryStrategy\` | ✅ your param → \`MemoryUserQueryStrategy\` | ✅ your param → \`DataverseUserQueryStrategy\` |
| \`onLoadDependencies\` | ✅ resolves once, cached | ✅ re-runs on every remount |
| \`onGetHeight\` | ✅ | ✅ |
| \`onGetGridParameters\` | ✅ | ✅ |
| \`onCreateLookupManyDataProvider\` | ✅ your param → \`MemoryLookupManyDataProviderFactory\` | ✅ your param → \`DataverseLookupManyDataProviderFactory\` |
| \`onCreateTemplateDataProvider\` | ✅ your param → \`MemoryTemplateDataProvider\` | ✅ your param; nothing Dataverse-side ships |
| \`onCreateGridCustomizerStrategy\` | ✅ forwards your param | ✅ forwards your param |
| \`onCreateCustomColumnsStrategy\` | ✅ your param; nothing in-memory ships | ✅ your param → \`DataverseCustomColumnsStrategy\` |
| \`onGetControlId\` | — | — |

Both descriptors forward every optional hook to a parameter of the same name, so you rarely need a subclass to switch a feature on — only to change what an already-wired piece *does*. The two gaps left are the implementations that do not exist: no Dataverse template provider, and no in-memory custom-columns strategy.

## Ordering: what runs when

The sequence matters, because the strategies are created *after* configuration resolves:

1. \`onLoadDependencies()\` — awaited first. Anything async belongs here.
2. \`onCreateCustomColumnsStrategy()\`, then \`onCreateSavedQueryStrategy()\` with \`onCreateUserQueryStrategy()\` beside it, and \`onGetFieldMapping()\`.
3. \`onCreateTemplateDataProvider()\`, then \`onCreateTaskStrategy(deps)\` — the template provider is handed to the task strategy through \`deps\`. Creating a template is the template provider's own operation: call \`createTemplateFromTask\` on it, not on the task provider.
4. The task strategy's own \`onInitialize(provider)\` runs, which is where it loads its records. Both shipped strategies await *their* required \`onInitialize\` hook there, so what they run on can be fetched asynchronously too — their behaviour hooks are plain functions on the constructor argument and are called later, per operation.

That is why a \`onCreate*\` hook must be able to assume its inputs already exist. The memory descriptor throws a clear error when one runs before \`onLoadDependencies\` resolved, rather than quietly handing back \`undefined\`. It is also the reason the two differ on caching: the memory descriptor resolves \`onInitialize\` once and reuses it, so its records survive remounts, while the Dataverse one re-resolves each time and re-fetches from the server.

## The actions classes

Both shipped task strategies are thin. The behaviour lives in a static class next to each one — \`MemoryTaskActions\` and \`DataverseTaskActions\` — and every strategy hook is "call the override if there is one, otherwise call the action". Two consequences worth knowing:

- **An override is a wrapper, not a reimplementation.** Because the hook receives exactly the action's parameters, the shipped behaviour is one call away: \`MemoryTaskActions.deleteTasks(params)\`. No \`super\`, no subclass, no copied logic.
- **The pieces are usable on their own.** Writing a strategy from scratch does not mean rewriting the ranking, the parent lookups or the cascade-delete walk — call the action for the parts that fit your data and implement only what does not.

\`\`\`ts
//the shipped default for one operation, from a strategy of your own
public onIsRecordActive(recordId: string): boolean {
    return MemoryTaskActions.isRecordActive({
        record: this._provider.getRecordsMap()[recordId],
        nativeColumns: this._provider.getNativeColumns(),
    })
}
\`\`\`

Each action's parameters are exported alongside it (\`IMemoryTaskCreateParams\`, \`IDataverseTaskMoveParams\`, …), so an override can name what it receives.

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

Everything is on the package root — the classes, the contracts you implement, and the types they mention. There are no subpath imports to learn:

\`\`\`ts
import {
    //classes
    MemoryTaskStrategy, MemoryTaskActions, MemoryUserQueryStrategy, MemoryTemplateDataProvider,
    StackRank,
    DataverseTaskStrategy, DataverseTaskActions, DataverseUserQueryStrategy, DataverseCustomColumnsStrategy,
    TemplateDataProviderBase, MemoryLookupManyDataProviderFactory, DataverseLookupManyDataProviderFactory,
} from '@talxis/base-controls'

import type {
    //the descriptor contract and what it hands you
    ITaskGridDescriptor, ITaskStrategyDeps, IFieldMapping, ITaskGridParameters, ITaskGridLabels,
    //the strategies and providers
    ITaskDataProviderStrategy, ITaskDataProvider, IRecordTree, IRecordTreeView, IRecordStructure,
    ITaskSiblingContext, ITaskMoveParams, ITaskCreateParams, ITaskTemplateExpansionParams,
    ISavedQuery, ISavedQueryStrategy, IUserQueryStrategy, ISavedQueryDataProvider,
    ICustomColumnsStrategy, ITemplateDataProvider,
    IGridCustomizerStrategy, IGridCustomizer,
    //per-extension params and contexts
    IMemoryTaskGridDescriptorParams, IMemoryTaskGridDescriptorInitializeResult, IMemoryStrategyContext, IMemoryTaskStrategyParams,
    IDataverseTaskGridDescriptorParams, IDataverseTaskGridDescriptorInitializeResult, IDataverseStrategyContext, IDataverseTaskStrategyParams,
} from '@talxis/base-controls'
\`\`\`

Both task strategies also export the parameters of every hook — \`IMemoryTaskCreateParams\`, \`IDataverseTaskMoveParams\`, \`IFormParameters\` and the rest — so an override can name what it receives and forward it to the matching \`MemoryTaskActions\` / \`DataverseTaskActions\` method.

## Troubleshooting

1. **Everything is flat** — \`parentId\` is not mapped to the attribute that actually holds the parent value, or the raw value is in a shape the lookup reader does not recognise. Dataverse records carry it under \`_<lookup>_value\`; a hand-built record can instead put an entity-reference array under the plain column name. A bare guid under the plain name is the one combination that does not work.
2. **Rows are in an unexpected order** — \`stackRank\` is unmapped, or the ranks are not comparable strings.
3. **Nothing renders and no error appears** — \`onLoadDependencies\` never resolved. It is awaited before the first provider is created, so a hanging promise there shows as an indefinite skeleton.
4. **A feature is missing from the ribbon** — its flag in \`onGetGridParameters\` defaults to \`false\`, or the optional hook that enables it returned nothing. The getters AND the two, so both have to be in place.
5. **A Dataverse grid never leaves the skeleton at all** — a startup read failed against a TALXIS model that is not in the environment: \`talxis_attributedefinition\` when a custom-columns strategy is wired, \`talxis_userquery\` when a user-query strategy is. Neither read is error-wrapped. Drop the callback for the feature you have no model for.

Then pick a route: [**Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview), [**Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview), or [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
