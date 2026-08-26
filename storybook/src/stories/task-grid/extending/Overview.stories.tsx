import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../docsOnlyStory'

const meta = {
    title: 'Task Grid/Extending',
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
Neither shipped descriptor is a subclassing exercise — [**Memory**](?path=/story/task-grid-descriptors-memory--overview) and [**Dataverse**](?path=/story/task-grid-descriptors-dataverse--overview) are configured entirely through a parameter object, and that is where you should stay for as long as it works.

This section is for when it stops working: you need one shipped piece somewhere else, you need to change a behaviour no parameter reaches, or your data lives somewhere neither descriptor covers.

## Which route to take

| Situation | Route |
|---|---|
| One shipped behaviour is wrong for you | Supply the hook for that one operation — the shipped default stays available as a \`MemoryTaskActions\` / \`DataverseTaskActions\` method you can forward to. Then [**Extend a shipped strategy**](?path=/story/task-grid-extending-extend-a-shipped-strategy--overview). |
| You want a shipped *piece* in a different context — Dataverse tasks with in-memory views, memory tasks with your own loader | [**Reuse a shipped strategy**](?path=/story/task-grid-extending-reuse-a-shipped-strategy--overview). |
| Your records live in a REST API, GraphQL, SQL through a gateway | [**Write your own**](?path=/story/task-grid-extending-write-your-own--overview). |

## Before you subclass anything

Several behaviours that look like they need a subclass are parameters on both shipped descriptors:

- \`onCreateTaskStrategy\` — every task-level option, because they belong to the task strategy: new-task defaults, what counts as active, what happens on open, and on Dataverse the form ids, \`rootTaskId\` and the delete flags. Returned from \`onInitialize\` on both shipped descriptors, which hand the callback what they just resolved.
- **A hook per operation on the task strategy itself.** \`onCreateTask\`, \`onDeleteTasks\`, \`onMoveTask\`, \`onRecordSave\`, \`onIsRecordActive\`, \`onGetAvailableColumns\`, \`onGetAvailableRelatedColumns\`, \`onOpenDatasetItems\` — plus \`onGetFormParameters\` on Dataverse. Each receives the parameters of the matching action, so wrapping one is a forward rather than a rewrite. See [**the actions classes**](#the-actions-classes).
- \`modules\` — whether an optional feature exists at all. [**Modules**](?path=/story/task-grid-modules--overview) is the reference; nothing there needs a subclass.

## The descriptor contract

[**Descriptors → Anatomy**](?path=/story/task-grid-descriptors-anatomy--overview) has it in full: the three
required hooks, the optional ones, what runs when, and the service locator every strategy is handed. Read it
first — everything below assumes it.

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

Both descriptors forward every optional hook to something you resolve, so you rarely need a subclass to switch a feature on — only to change what an already-wired piece *does*. Two implementations simply do not exist: there is no Dataverse template provider, and no in-memory custom-columns strategy — [**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview) is the only one that ships for custom columns.

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

The mixin owns \`templateEvents\` and the error handling, which is what drives the grid's loading state and error dialog. \`MemoryTemplateDataProvider\` is the reference implementation — see [**Memory**](?path=/story/task-grid-descriptors-memory--overview), under *Templates*; \`DataverseTemplateDataProvider\` implements neither direction.

## Adding a column of your own

A strategy or module that needs a column the views do not declare registers a hook on the saved-query
provider. The hook runs against every view the grid serves, and \`applyColumn\` adds the column or fills in
what a stored view left out:

\`\`\`ts
import { applyColumn } from '@talxis/base-controls'

constructor(params: IMyStrategyParams) {
    this._services = params.services
    //from a constructor, so wait for the provider rather than resolving it
    this._services.whenAvailable('savedQueryDataProvider', provider => {
        provider.registerHook(query => applyColumn(query, {
            name: 'my_column',
            dataType: DataTypes.SingleLineText,
            displayName: 'My column',
            isHidden: true,
        }))
    })
}
\`\`\`

Two things to know:

- **Register before the first \`refresh\`.** A hook only reaches the views produced after it was registered,
  and the grid refreshes the provider once during startup — right after the modules are built, which is why
  the constructor is the place.
- **\`isVirtual\` decides whether the value is fetched.** A virtual column is left out of the query, so it is
  right for a cell that reads a provider and wrong for one that needs a value off the record. This is how
  \`TalxisChecklistStrategy\` gets its JSON column loaded while the module's own display column stays virtual.

Anything the view already states wins, so a user who renamed or resized the column keeps their version.

## Imports

Everything is on the package root — the classes, the contracts you implement, and the types they mention. There are no subpath imports to learn:

\`\`\`ts
import {
    //classes
    MemoryTaskStrategy, MemoryTaskActions, MemoryUserQueryStrategy, MemoryTemplateDataProvider,
    StackRank,
    DataverseTaskStrategy, DataverseTaskActions, TalxisUserQueryStrategy,
    TemplateDataProviderBase, MemoryLookupManyDataProviderFactory, DataverseLookupManyDataProviderFactory,
    //the Talxis platform strategies
    TalxisTaskDependencyStrategy, TalxisChecklistStrategy, TalxisCustomColumnsStrategy,
    //the module builders
    createUserQueryModule, createTemplateModule, createGridCustomizerModule, createLookupManyModule,
    createDependenciesModule, createChecklistModule, createCustomColumnsModule,
    //the shipped module strategies
    MemoryTaskDependencyStrategy, DataverseTaskDependencyStrategy, MemoryChecklistStrategy,
    //adding a column from a strategy of your own
    applyColumn,
    //the locator, inside a React component
    useTaskGridServices,
} from '@talxis/base-controls'

import type {
    //the descriptor contract and what it hands you
    ITaskGridDescriptor, ITaskGridServiceLocator, ITaskGridServiceMap, ITaskGridFactoryParams, IFieldMapping, ITaskGridParameters, ITaskGridLabels,
    ICreateTasksFromTemplateParams,
    //the strategies and providers
    ITaskDataProviderStrategy, ITaskDataProvider, IRecordTree, IRecordTreeView, IRecordStructure,
    ITaskSiblingContext, ITaskMoveParams, ITaskCreateParams,
    ISavedQuery, ISavedQueryStrategy, IUserQueryStrategy, ISavedQueryDataProvider,
    ITemplateDataProvider,
    IGridCustomizerStrategy, IGridCustomizer,
    //the module contracts
    ITaskGridModules, IUserQueryModule, ITemplateModule,
    IGridCustomizerModule, ILookupManyModule, IDependenciesModule, IChecklistModule, ICustomColumnsModule,
    //what the module strategies implement
    ITaskDependencyStrategy, ITaskDependency, IChecklistStrategy, IChecklistItem, ICustomColumnsStrategy,
    //the saved-query provider, for a column of your own
    SavedQueryHook,
    //per-extension params and contexts
    IMemoryTaskGridDescriptorParams, IMemoryTaskGridDescriptorInitializeResult, IMemoryStrategyContext, IMemoryTaskStrategyParams, IMemoryModules,
    IDataverseTaskGridDescriptorParams, IDataverseTaskGridDescriptorInitializeResult, IDataverseStrategyContext, IDataverseTaskStrategyParams, IDataverseModules,
} from '@talxis/base-controls'
\`\`\`

## Troubleshooting

1. **Everything is flat** — \`parentId\` is not mapped to the attribute that actually holds the parent value, or the raw value is in a shape the lookup reader does not recognise. Dataverse records carry it under \`_<lookup>_value\`; a hand-built record can instead put an entity-reference array under the plain column name. A bare guid under the plain name is the one combination that does not work.
2. **Rows are in an unexpected order** — \`stackRank\` is unmapped, or the ranks are not comparable strings. See [**Memory**](?path=/story/task-grid-descriptors-memory--overview), under *Ordering*.
3. **Nothing renders and no error appears** — \`onLoadDependencies\` never resolved. It is awaited before the first provider is created, so a hanging promise there shows as an indefinite skeleton.
4. **A feature is missing from the ribbon** — either its flag in \`onGetGridParameters\` defaults to \`false\`, or the module that provides it was never registered. A flag and a module are separate switches: the flag controls the UI, the module controls whether the feature exists at all, so both have to be in place.
5. **\`No <service> is registered\`** — something resolved a service with \`get\` that only exists when a module registers it. Either register the module, or switch the call site to \`find\` and handle the feature being off. The same error during startup means a constructor resolved a service instead of waiting for the method that needs it.
6. **A Dataverse grid never leaves the skeleton at all** — a startup read failed against a TALXIS model that is not in the environment: \`talxis_attributedefinition\` when the custom-columns module is registered, \`talxis_userquery\` when the user-queries one is. Neither read is error-wrapped. Drop the builder for the feature you have no model for.

Then pick a route: [**Reuse a shipped strategy**](?path=/story/task-grid-extending-reuse-a-shipped-strategy--overview), [**Extend a shipped strategy**](?path=/story/task-grid-extending-extend-a-shipped-strategy--overview), or [**Write your own**](?path=/story/task-grid-extending-write-your-own--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
