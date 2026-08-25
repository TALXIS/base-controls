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

- \`onCreateTaskStrategy\` — every task-level option, because they belong to the task strategy: new-task defaults, what counts as active, what happens on open, and on Dataverse the form ids, \`rootTaskId\` and the delete flags. Returned from \`onInitialize\` on both shipped descriptors, which hand the callback what they just resolved.
- **A hook per operation on the task strategy itself.** \`onCreateTask\`, \`onDeleteTasks\`, \`onMoveTask\`, \`onRecordSave\`, \`onIsRecordActive\`, \`onGetAvailableColumns\`, \`onGetAvailableRelatedColumns\`, \`onOpenDatasetItems\` — plus \`onGetFormParameters\` on Dataverse. Each receives the parameters of the matching action, so wrapping one is a forward rather than a rewrite. See [**the actions classes**](#the-actions-classes).
- \`modules\` — whether an optional feature exists at all. [**Modules**](?path=/story/task-grid-modules--overview) is the reference; nothing there needs a subclass.

## The descriptor contract

A descriptor answers three questions the grid cannot answer on its own: which columns play which role, how to load and mutate tasks, and where the saved views come from. Everything else is an optional hook, and each one is a feature switch — return an implementation and the feature exists.

| Method | Required | Description |
|--------|:--------:|-------------|
| \`onGetFieldMapping()\` | ✅ | Maps column roles to physical attribute names in your schema. |
| \`onCreateTaskStrategy(services)\` | ✅ | Returns the strategy handling task CRUD and move. \`services\` is the grid's service locator — forward it to a shipped strategy untouched. |
| \`onCreateSavedQueryStrategy()\` | ✅ | Returns the strategy that loads the system views. |
| \`onGetModules?(services)\` | — | Returns \`ITaskGridModules\` — the optional feature modules this grid runs with. Called once per mount, after \`onLoadDependencies\`. See [**Modules**](?path=/story/task-grid-modules--overview). |
| \`onLoadDependencies?()\` | — | Async hook called once **before** anything else. Resolve configuration and fetch here. |
| \`onGetHeight?()\` | — | Container height as a CSS string. Fills the parent when omitted. |
| \`onGetGridParameters?()\` | — | \`ITaskGridParameters\` feature flags. |
| \`onGetControlId?()\` | — | A stable DOM identifier. Auto-generated as a UUID when omitted. |

\`onGetModules\` is a feature switch rather than configuration: a module is on because it is present, so omitting a key takes the feature and its UI out. The shipped descriptors expose it as a \`modules\` key of \`onGetXModule\` builders on what \`onInitialize\` resolves — \`IMemoryModules\` and \`IDataverseModules\` — where a hand-written descriptor implements this hook directly.

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

Every flag in \`ITaskGridParameters\` defaults to \`false\` when \`onGetGridParameters\` is omitted or leaves it out.

### Which hooks each shipped descriptor implements

| Hook | \`MemoryTaskGridDescriptor\` | \`DataverseTaskGridDescriptor\` |
|---|:---:|:---:|
| \`onGetFieldMapping\` | ✅ | ✅ |
| \`onCreateTaskStrategy\` | ✅ | ✅ |
| \`onCreateSavedQueryStrategy\` | ✅ from \`systemQueries\` | ✅ from \`systemQueries\` |
| \`onGetModules\` | ✅ from the \`modules\` your \`onInitialize\` resolves, each builder given the locator | ✅ same, each builder given its context slice and the locator |
| \`onLoadDependencies\` | ✅ re-runs on every remount | ✅ re-runs on every remount |
| \`onGetHeight\` | ✅ | ✅ |
| \`onGetGridParameters\` | ✅ | ✅ |
| \`onGetControlId\` | — | — |

Both descriptors forward every optional hook to something you resolve, so you rarely need a subclass to switch a feature on — only to change what an already-wired piece *does*. The two gaps are the implementations that do not exist: no Dataverse template provider, and no in-memory custom-columns strategy.

## Ordering: what runs when

The sequence matters, because the strategies are created *after* configuration resolves:

1. \`onLoadDependencies()\` — awaited first. Anything async belongs here; on both shipped descriptors this is where \`onInitialize\` runs.
2. \`onGetModules(services)\` — once per control instance. Each builder registers what its module brings, which is what makes those providers reachable from everywhere else.
3. \`onCreateSavedQueryStrategy()\` and \`onGetFieldMapping()\`, then the saved-query provider refreshes.
4. \`onCreateTaskStrategy(services)\` — the strategy holds the locator and resolves what it needs when a method runs, so anything registered in step 2 is reachable. Creating a template is the template provider's own operation: call \`createTemplateFromTask\` on it, not on the task provider.
5. The task strategy's own \`onInitialize(provider)\` runs, which is where it loads its records. Both shipped strategies await *their* required \`onInitialize\` hook there, so what they run on can be fetched asynchronously too.

That ordering is why everything a module or strategy builder reads can assume it already exists. Neither descriptor caches across remounts — see [**Memory**](?path=/story/task-grid-strategies-memory--overview), under *Keeping data across remounts*.

## Services

Nothing is handed its dependencies through a growing parameter list. The grid builds one **service locator** and passes it to every strategy, provider and module builder; each class stores it and resolves what it needs at the moment it needs it.

\`\`\`ts
interface ITaskGridServiceLocator {
    //throws when nothing registered it — for what your code cannot work without
    get<K extends keyof ITaskGridServiceMap>(key: K): ITaskGridServiceMap[K]
    //undefined when nothing registered it — for a feature that may simply be off
    find<K extends keyof ITaskGridServiceMap>(key: K): ITaskGridServiceMap[K] | undefined
    //how a service is reached; the resolver runs on every get, so it may return something built later
    register<K extends keyof ITaskGridServiceMap>(key: K, resolve: () => ITaskGridServiceMap[K]): void
}
\`\`\`

The grid always registers \`pcfContext\`, \`localizationService\`, \`descriptor\`, \`gridParameters\`, \`nativeColumns\`, \`datasetControl\`, \`taskDataProvider\` and \`savedQueryDataProvider\`. The rest are the modules \`onGetModules\` resolved, each under its own key — \`userQueriesModule\`, \`templatesModule\`, \`customColumnsModule\`, \`gridCustomizerModule\`, \`lookupManyModule\`, \`dependenciesModule\`. What a module brings hangs off the module, so there is one entry per feature rather than two:

\`\`\`ts
//off when the module is not registered
const templates = services.find('templatesModule')?.provider
//the caller only exists because the module does, so get is the honest call
const customColumns = services.get('customColumnsModule').provider
\`\`\`

Leave a module out and its key is simply absent, which is what \`find\` is for.

**Resolve in methods, not in constructors.** Resolvers are lazy, so \`taskDataProvider\` is registered before it exists; a \`get\` while it is still being built throws with a named error, while the same \`get\` from a method a moment later succeeds. That is what makes the mutual reachability safe.

\`\`\`ts
export class MyTaskStrategy implements ITaskDataProviderStrategy {
    private _services: ITaskGridServiceLocator

    //one params object, with services on it - the shape every strategy and provider uses
    constructor(params: IMyTaskStrategyParams) {
        this._services = params.services   //stored, never resolved here
    }

    //a getter per dependency keeps the call sites readable
    private get _savedQueries() { return this._services.get('savedQueryDataProvider') }

    public onIsTaskEditingEnabled() {
        return this._services.get('gridParameters').enableTaskEditing ?? false
    }
}
\`\`\`

In React, \`useTaskGridServices()\` returns the same locator, so a custom cell renderer or command reaches the providers without any props. Imperative code inside the grid goes through \`datasetControl.getServices()\`.

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

The \`templates\` module wraps an \`ITemplateDataProvider\` — an \`IDataProvider\`, because the picker lists its records, plus the two template operations:

\`\`\`ts
interface ITemplateDataProvider extends IDataProvider {
    templateEvents: IEventEmitter<ITemplateDataProviderEvents>
    //capture a template from a task
    createTemplateFromTask(task: IRecord): Promise<IRawRecord | null>
    //expand one into tasks
    createTasksFromTemplate(params: ICreateTasksFromTemplateParams): Promise<IRawRecord[] | null>
}
\`\`\`

Do not write the lifecycle plumbing yourself. Extend the \`TemplateDataProviderBase\` mixin over whatever provider your platform needs and implement one hook per direction:

\`\`\`ts
export class MyTemplateDataProvider extends TemplateDataProviderBase(MemoryDataProvider) {
    //return null when the user cancels; throw to report a failure
    protected async onCreateTemplateFromTask(task: IRecord) {
        return captureTemplate(task)
    }

    //params carry the template id and the task it lands under, if any
    protected async onCreateTasksFromTemplate(params: ICreateTasksFromTemplateParams) {
        return buildTasks(params)
    }
}
\`\`\`

An expansion returns finished task raw records — ids, parent lookups and ordering included — and the grid adds them; the task strategy is not involved and never hears about templates. Everything you need to describe a task is on the \`ITaskDataProvider\` the provider reaches through the locator it is constructed with — \`services.get('taskDataProvider')\`.

The mixin owns \`templateEvents\` and the error handling, which is what drives the grid's loading state and error dialog. \`MemoryTemplateDataProvider\` is the reference implementation — see [**Memory**](?path=/story/task-grid-strategies-memory--overview), under *Templates*; \`DataverseTemplateDataProvider\` implements neither direction.

## Imports

Everything is on the package root — the classes, the contracts you implement, and the types they mention. There are no subpath imports to learn:

\`\`\`ts
import {
    //classes
    MemoryTaskStrategy, MemoryTaskActions, MemoryUserQueryStrategy, MemoryTemplateDataProvider,
    StackRank,
    DataverseTaskStrategy, DataverseTaskActions, TalxisUserQueryStrategy,
    TemplateDataProviderBase, MemoryLookupManyDataProviderFactory, DataverseLookupManyDataProviderFactory,
    //the module builders
    createUserQueryModule, createTemplateModule,
    createGridCustomizerModule, createLookupManyModule,
    //the locator, inside a React component
    useTaskGridServices,
} from '@talxis/base-controls'

import type {
    //the descriptor contract and what it hands you
    ITaskGridDescriptor, ITaskGridServiceLocator, ITaskGridServiceMap, ITaskGridFactoryParams, IFieldMapping, ITaskGridParameters, ITaskGridLabels,
    ICreateTasksFromTemplateParams,
    //the strategies and providers
    ITaskDataProviderStrategy, ITaskDataProvider, IRecordTree, IRecordTreeView, IRecordStructure,
    ITaskSiblingContext, ITaskMoveParams, ITaskCreateParams, ITaskTemplateExpansionParams,
    ISavedQuery, ISavedQueryStrategy, IUserQueryStrategy, ISavedQueryDataProvider,
    ITemplateDataProvider,
    IGridCustomizerStrategy, IGridCustomizer,
    //the module contracts
    ITaskGridModules, IUserQueryModule, ITemplateModule,
    IGridCustomizerModule, ILookupManyModule,
    //per-extension params and contexts
    IMemoryTaskGridDescriptorParams, IMemoryTaskGridDescriptorInitializeResult, IMemoryStrategyContext, IMemoryTaskStrategyParams, IMemoryModules,
    IDataverseTaskGridDescriptorParams, IDataverseTaskGridDescriptorInitializeResult, IDataverseStrategyContext, IDataverseTaskStrategyParams, IDataverseModules,
} from '@talxis/base-controls'
\`\`\`

## Troubleshooting

1. **Everything is flat** — \`parentId\` is not mapped to the attribute that actually holds the parent value, or the raw value is in a shape the lookup reader does not recognise. Dataverse records carry it under \`_<lookup>_value\`; a hand-built record can instead put an entity-reference array under the plain column name. A bare guid under the plain name is the one combination that does not work.
2. **Rows are in an unexpected order** — \`stackRank\` is unmapped, or the ranks are not comparable strings. See [**Memory**](?path=/story/task-grid-strategies-memory--overview), under *Ordering*.
3. **Nothing renders and no error appears** — \`onLoadDependencies\` never resolved. It is awaited before the first provider is created, so a hanging promise there shows as an indefinite skeleton.
4. **A feature is missing from the ribbon** — either its flag in \`onGetGridParameters\` defaults to \`false\`, or the module that provides it was never registered. A flag and a module are separate switches: the flag controls the UI, the module controls whether the feature exists at all, so both have to be in place.
5. **\`No <service> is registered\`** — something resolved a service with \`get\` that only exists when a module registers it. Either register the module, or switch the call site to \`find\` and handle the feature being off. The same error during startup means a constructor resolved a service instead of waiting for the method that needs it.
6. **A Dataverse grid never leaves the skeleton at all** — a startup read failed against a TALXIS model that is not in the environment: \`talxis_attributedefinition\` when the custom-columns module is registered, \`talxis_userquery\` when the user-queries one is. Neither read is error-wrapped. Drop the builder for the feature you have no model for.

Then pick a route: [**Reuse a shipped strategy**](?path=/story/task-grid-custom-strategies-reuse-a-shipped-strategy--overview), [**Extend a shipped strategy**](?path=/story/task-grid-custom-strategies-extend-a-shipped-strategy--overview), or [**Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
