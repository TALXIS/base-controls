import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Descriptors/Anatomy',
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
The grid ships no data access. A **descriptor** is the one object you hand it, and it answers everything the
grid cannot answer for itself: which of your columns mean what, how tasks are loaded and changed, where the
views come from, and which optional features exist.

You will usually not write one. [**Memory**](?path=/story/task-grid-descriptors-memory--overview) and
[**Dataverse**](?path=/story/task-grid-descriptors-dataverse--overview) are configured through a parameter
object and cover both common cases. This page is the contract behind them — worth reading once, because it is
what makes the rest of the documentation make sense.

## Three things are required

\`\`\`ts
interface ITaskGridDescriptor {
    onGetFieldMapping: () => IFieldMapping
    onCreateTaskStrategy: (params: ITaskGridFactoryParams) => ITaskDataProviderStrategy
    onCreateSavedQueryStrategy: (params: ITaskGridFactoryParams) => ISavedQueryStrategy
    // …everything else is optional
}
\`\`\`

| Hook | Answers |
|---|---|
| \`onGetFieldMapping\` | Which columns carry structural meaning — the title, the parent lookup, the ordering attribute, the active/inactive attribute. |
| \`onCreateTaskStrategy\` | Loading tasks, and every change to them: create, delete, move, save, open. |
| \`onCreateSavedQueryStrategy\` | The system views, and with them the grid's column catalogue. At least one view is required. |

**The two strategies are not optional features — they are the grid.** Loading a task, reordering one, saving
an edit: all of it goes through the task strategy, and the grid has no fallback if it is missing. Both
shipped descriptors build them for you from what you configure, which is why you can get a working grid
without writing either.

## Everything else is a switch

Every remaining hook is optional, and each one turns something on by being answered:

| Hook | Effect when omitted |
|---|---|
| \`onGetModules\` | No optional features at all — see [**Modules**](?path=/story/task-grid-modules--overview). |
| \`onLoadDependencies\` | Nothing is awaited before the grid builds. Both shipped descriptors run their \`onInitialize\` here. |
| \`onGetGridParameters\` | Every flag in \`ITaskGridParameters\` is \`false\`. |
| \`onGetHeight\` | The grid fills its parent. |
| \`onGetControlId\` | A UUID is generated. |

That is the whole modularity story: **required strategies, optional modules, flags for the UI**. A feature you
did not ask for is not disabled — its code is not there.

### Views split along the same line

The required strategy covers *system* views only. Personal views are a module, so the two contracts are
separate:

\`\`\`ts
//required, from onCreateSavedQueryStrategy
interface ISavedQueryStrategy {
    onGetSystemQueries: () => Promise<ISavedQuery[]>
}

//optional, carried by the user-queries module
interface IUserQueryStrategy {
    onGetUserQueries: () => Promise<ISavedQuery[]>
    onIsUserQuery: (queryId: string) => boolean
    onCreateUserQuery: (newQuery: { name: string; description?: string }, currentQuery: ISavedQuery) => Promise<string | null>
    onUpdateUserQuery: (currentQuery: ISavedQuery) => Promise<string | null>
    onDeleteUserQueries: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>
}
\`\`\`

## What runs when

The order matters, because the strategies are built *after* configuration resolves:

1. \`onLoadDependencies()\` — awaited first. Anything async belongs here; on both shipped descriptors this is
   where \`onInitialize\` runs.
2. \`onGetModules({ services })\` — once per mount. Each module is registered as its builder returns it,
   which is what makes it reachable from everywhere else.
3. \`onCreateSavedQueryStrategy({ services })\`, then the saved-query provider loads the views.
4. \`onCreateTaskStrategy({ services })\`, then the strategy's own \`onInitialize\` loads the records.
5. The modules that read per task — dependencies, checklists — are refreshed for the tasks that loaded.

\`onGetFieldMapping()\` is read on demand rather than at a fixed point: it backs the \`nativeColumns\` service,
so it runs the first time anything asks for a column name.

Two things follow. Anything a strategy or module reads at *call* time already exists, which is why resolving
in methods works and resolving in constructors does not. And nothing is cached across remounts — see
[**Memory**](?path=/story/task-grid-descriptors-memory--overview), under *Keeping data across remounts*.

## Services

Strategies, providers and module builders are not handed a growing list of arguments. The grid builds one
**service locator** and passes it to all of them, in a params object with a \`services\` key. Each one stores
it and resolves what it needs when it needs it.

\`\`\`ts
interface ITaskGridServiceLocator {
    //throws when nothing registered it — for what your code cannot work without
    get<K extends keyof ITaskGridServiceMap>(key: K): ITaskGridServiceMap[K]
    //undefined when nothing registered it — for a feature that may simply be off
    find<K extends keyof ITaskGridServiceMap>(key: K): ITaskGridServiceMap[K] | undefined
    //runs the callback once the service exists, immediately if it already does
    whenAvailable<K extends keyof ITaskGridServiceMap>(key: K, callback: (service: ITaskGridServiceMap[K]) => void): void
    register<K extends keyof ITaskGridServiceMap>(key: K, resolve: () => ITaskGridServiceMap[K]): void
}
\`\`\`

Always registered: \`pcfContext\`, \`localizationService\`, \`descriptor\`, \`gridParameters\`,
\`nativeColumns\`, \`datasetControl\`, \`taskDataProvider\`, \`savedQueryDataProvider\`.

One key per registered module: \`userQueriesModule\`, \`templatesModule\`, \`customColumnsModule\`,
\`gridCustomizerModule\`, \`lookupManyModule\`, \`dependenciesModule\`, \`checklistModule\`. Leave a module out
and its key is simply absent, which is what \`find\` is for.

\`\`\`ts
//off when the module is not registered
const templates = services.find('templatesModule')?.provider
//this code only runs because the module exists, so get is the honest call
const checklist = services.get('checklistModule').provider
\`\`\`

### Store the locator, resolve in methods

\`\`\`ts
export class MyTaskStrategy implements ITaskDataProviderStrategy {
    private _services: ITaskGridServiceLocator

    constructor(params: IMyTaskStrategyParams) {
        this._services = params.services   //stored, not resolved
    }

    //a getter per dependency keeps the call sites readable
    private get _savedQueries() { return this._services.get('savedQueryDataProvider') }

    //resolved when the grid asks, not while this class was being built
    public async onGetAvailableColumns(): Promise<IColumn[]> {
        return this._savedQueries.getSystemQueries().flatMap(query => query.columns)
    }
}
\`\`\`

Resolvers are lazy, so a key can be registered before the thing behind it exists. A \`get\` from a constructor
may therefore throw where the same \`get\` from a method succeeds a moment later.

When you genuinely have to act from a constructor — subscribing to an event, say — use \`whenAvailable\`. It
fires immediately if the service is there and waits if it is not:

\`\`\`ts
constructor(params: IMyStrategyParams) {
    this._services = params.services
    this._services.whenAvailable('taskDataProvider', ({ taskEvents }) => {
        taskEvents.addEventListener('onAfterTasksDeleted', result => this._onTasksDeleted(result))
    })
}
\`\`\`

In React, \`useTaskGridServices()\` returns the same locator, so a custom cell renderer or command reaches the
providers without props. Imperative code inside the grid uses \`datasetControl.getServices()\`.

## Where to go next

- [**Memory**](?path=/story/task-grid-descriptors-memory--overview) and
  [**Dataverse**](?path=/story/task-grid-descriptors-dataverse--overview) — the shipped descriptors, every
  parameter.
- [**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview) — ready-made strategies
  for the TALXIS models.
- [**Modules**](?path=/story/task-grid-modules--overview) — the optional features and how registering one
  turns it on.
- [**Extending**](?path=/story/task-grid-extending--overview) — reusing a shipped piece, changing one
  behaviour, or writing a descriptor of your own.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
