import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { MemoryTaskGrid } from '../../task-grid/MemoryTaskGrid'
import { ModuleCustomizerExample } from '../../task-grid/ModuleCustomizerExample'

const meta = {
    title: 'Task Grid/Modules',
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
Everything the grid can do beyond showing tasks is a **module**: personal views, task templates, user-defined columns, lookup-many pickers, and AG Grid customization. A module is one object carrying the implementation you supply, the UI that feature needs, and its own options.

A feature is on because its module is present. There is no separate flag for whether it exists — omit the key and neither the feature nor its UI is there.

Each grid below registers **exactly one** module, so you can see what that one module adds and what the grid looks like without the others.

## The five modules

| Key | Builder | You supply | What it turns on |
|---|---|---|---|
| \`userQueries\` | \`createUserQueryModule\` | an \`IUserQueryStrategy\` | The *My views* group in the view switcher, plus *Save as new view*, *Save changes to current view* and *Manage views*, and the two dialogs behind them. Also gated by \`enableViewSwitcher\`. |
| \`templates\` | \`createTemplateModule\` | an \`ITemplateDataProvider\` | *Create template from task* and *New from template*, in the **New** menu and in the per-row add-task button, plus the picker inside them. |
| \`customColumns\` | \`createCustomColumnsModule\` | an \`ICustomColumnsStrategy\` | The custom-columns *Edit Columns* panel in place of the plain one, custom-column values on records, and the create / edit / delete column commands. |
| \`gridCustomizer\` | \`createGridCustomizerModule\` | an \`IGridCustomizerStrategy\` | Column definitions, row class rules and one-time AG Grid setup. See [**Customizer**](?path=/story/task-grid-modules-customizer--overview). |
| \`lookupMany\` | \`createLookupManyModule\` | a \`createDataProvider\` callback | The multi-record picker on every column carrying \`metadata.LookupMany\`, and \`control.createLookupManyDataProvider()\`. |

## The builders and their options

Each builder takes the one thing only you can provide, and brings the rest itself.

| Builder | Required | Optional |
|---|---|---|
| \`createUserQueryModule\` | \`strategy\` | \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\` |
| \`createTemplateModule\` | \`provider\` | — |
| \`createCustomColumnsModule\` | \`strategy\` | \`enableCustomColumnCreation\`, \`enableCustomColumnEditing\`, \`enableCustomColumnDeletion\` |
| \`createGridCustomizerModule\` | \`strategy\` | — |
| \`createLookupManyModule\` | \`createDataProvider\` | — |

Every one of those six \`enable*\` options defaults to \`false\`. They are **not** \`ITaskGridParameters\` flags: they trim commands *within* a feature that is already on, and they live on the builder because the UI they gate arrives with it.

## Registering one

There are two ways in, depending on whose descriptor you are using.

### On a shipped descriptor

\`modules\` is a key on what \`onInitialize\` **resolves**, holding one \`onGetXModule\` builder per feature. The per-descriptor shapes are \`IMemoryModules\` and \`IDataverseModules\`.

\`\`\`ts
import {
    MemoryTaskGridDescriptor, createUserQueryModule, createTemplateModule,
    MemoryUserQueryStrategy, MemoryTemplateDataProvider,
} from '@talxis/base-controls'

//your own store, outside the callback - see Lifecycle below
let userQueries = []

const descriptor = new MemoryTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        records, metadata, fieldMapping, systemQueries,
        gridParameters: { enableViewSwitcher: true },
        modules: {
            onGetUserQueriesModule: () => createUserQueryModule({
                strategy: new MemoryUserQueryStrategy({ userQueries }),
                enableQueryManager: true,
            }),
            onGetTemplatesModule: () => createTemplateModule({
                provider: new MemoryTemplateDataProvider({ templates }),
            }),
            //customColumns, gridCustomizer and lookupMany omitted - those three features are off
        },
    }),
})
\`\`\`

The memory builders take no argument: they close over whatever \`onInitialize\` already resolved. The Dataverse builders each receive only the slice of context their own strategy reads — \`IDataverseUserQueriesContext\`, \`IDataverseCustomColumnsContext\`, \`IDataverseLookupManyContext\` — and the two that need nothing take no parameter. A builder that returns \`undefined\` leaves the feature off, exactly like omitting the key; that is how the grids below register one module each.

### On a descriptor you wrote

Implement the core hook \`ITaskGridDescriptor.onGetModules\` and return the module objects directly, under the plain keys. There is no \`onGetX\` wrapper here — that layer belongs to the shipped extensions.

\`\`\`ts
class MyTaskGridDescriptor implements ITaskGridDescriptor {
    public onGetModules(): ITaskGridModules {
        return {
            userQueries: createUserQueryModule({ strategy: this._userQueryStrategy }),
            lookupMany: createLookupManyModule({ createDataProvider: this._createLookupProvider }),
        }
    }
    //…
}
\`\`\`

Full contract on [**Custom strategies → Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview).

## What registering costs you

Importing a \`create*Module\` function is the only runtime edge from your code to that feature's UI. \`modules/interfaces.ts\` declares each module's shape without importing a single component, so \`createUserQueryModule\` is the one place the view manager and the save dialogs are named, \`createCustomColumnsModule\` the one place its panel is, and \`createLookupManyModule\` the one place the picker variants are.

A grid that never registers a module therefore does not ship it. That is also why those six \`enable*\` options could not have been grid parameters: a flag in core would have meant core knowing about the commands.

## Lifecycle, and what does not survive it

\`onGetModules()\` runs **once per control instance**, right after \`onLoadDependencies()\` and before the saved-query strategy is built. The resolved modules are then threaded into \`ITaskStrategyDeps\` and onto the control, and \`customColumns.provider.refresh()\` is awaited on the way.

But the grid rebuilds the whole control instance on remount — applying *Edit columns*, switching a view, closing the view manager, saving a record — and on a shipped descriptor \`onInitialize\` re-runs first. **Every module is rebuilt, so nothing inside one survives.** State lives in a store you own outside the callback, kept current through explicit write-backs:

\`\`\`ts
let userQueries = []

onGetUserQueriesModule: () => {
    const strategy = new MemoryUserQueryStrategy({ userQueries })
    const module = createUserQueryModule({ strategy, enableQueryManager: true })
    //write back on every mutation, so the next mount sees what this one did
    const syncStore = async () => { userQueries = await strategy.onGetUserQueries() }
    module.provider.events.addEventListener('onAfterUserQueryCreated', syncStore)
    module.provider.events.addEventListener('onAfterUserQueryUpdated', syncStore)
    module.provider.events.addEventListener('onAfterUserQueriesDeleted', syncStore)
    return module
}
\`\`\`

The task equivalent is the strategy's \`onDestroy\`, covered on [**Strategies → Memory**](?path=/story/task-grid-strategies-memory--overview). On teardown the control calls \`destroy()\` on the \`userQueries\`, \`customColumns\` and \`templates\` providers.

## Reading a module at runtime

From \`onReady\`, or from a component of your own through \`useTaskGridDatasetControl()\`:

| Call | Use it when |
|---|---|
| \`control.getModules()\` | The feature is optional to your code — deciding whether to offer a command. |
| \`control.getModule('templates')\` | Your code only exists *because* the module does. Throws, naming the missing key, rather than handing back \`undefined\`. |
| \`control.isUserQueriesEnabled()\` | You just need the boolean. |
| \`control.createLookupManyDataProvider(params)\` | Throws when no \`lookupMany\` module served that column. |

\`ITaskStrategyDeps.templateDataProvider\` and \`.customColumnsDataProvider\` are present exactly when the matching module is registered — that is the seam between a module and a task strategy.

## Where to go next

- [**Strategies → Memory**](?path=/story/task-grid-strategies-memory--overview) and [**Dataverse**](?path=/story/task-grid-strategies-dataverse--overview) — the builder shapes and context slices per descriptor.
- [**Customizations → Customizer**](?path=/story/task-grid-modules-customizer--overview) — writing the \`gridCustomizer\` strategy.
- [**Custom strategies → Write your own**](?path=/story/task-grid-custom-strategies-write-your-own--overview) — \`onGetModules\` on a hand-written descriptor.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const PersonalViews: Story = {
    name: 'userQueries',
    render: () => renderStory(<MemoryTaskGrid modules={['userQueries']} />),
    parameters: {
        docs: {
            description: {
                story: `
\`onGetUserQueriesModule: () => createUserQueryModule({ strategy: new MemoryUserQueryStrategy({ userQueries }), enableQueryManager: true, enableSaveAsNewQuery: true, enableSaveQueryChanges: true })\`

Open the view dropdown: **My views** now lists *My Open Tasks* and *High Priority* below the system views, and the three commands at the bottom — *Save as new view*, *Save changes to current view*, *Manage views* — come from the three \`enable*\` options. Save a new view and it appears in the list; the dialogs behind those commands arrived with the module.

Everything else here is unregistered, so **New** has no template commands and **Assigned To** and **Tags** render as plain text.
                `.trim(),
            },
        },
    },
}

export const Templates: Story = {
    name: 'templates',
    render: () => renderStory(<MemoryTaskGrid modules={['templates']} />),
    parameters: {
        docs: {
            description: {
                story: `
\`onGetTemplatesModule: () => createTemplateModule({ provider: new MemoryTemplateDataProvider({ templates }) })\`

**New** now offers *New from template*, and the per-row add-task button offers it too — the picker inside both is the module's own component. Select a row and *Create template from task* captures its subtree back into the provider, so the new template shows up in the picker.

The view dropdown has no *My views* group and no save commands: \`userQueries\` is not registered here.
                `.trim(),
            },
        },
    },
}

export const CustomColumns: Story = {
    name: 'customColumns',
    render: () => renderStory(<MemoryTaskGrid modules={['customColumns']} />),
    parameters: {
        docs: {
            description: {
                story: `
\`onGetCustomColumnsModule: () => createCustomColumnsModule({ strategy: new MemoryCustomColumnsStrategy(), enableCustomColumnCreation: true, enableCustomColumnEditing: true, enableCustomColumnDeletion: true })\`

Open *Edit columns*. This is the module's panel rather than the plain one: it carries a **Create Custom Column** command, and each custom column gets edit and delete commands of its own — the three \`enable*\` options above. Create one, add it to the view, and it behaves like any other column, values included.

Nothing in-memory ships with the package, so the strategy here is a small one written for the docs — which is the point of the module: the panel and the commands come from it, the storage is yours.
                `.trim(),
            },
        },
    },
}

export const LookupMany: Story = {
    name: 'lookupMany',
    render: () => renderStory(<MemoryTaskGrid modules={['lookupMany']} />),
    parameters: {
        docs: {
            description: {
                story: `
\`onGetLookupManyModule: () => createLookupManyModule({ createDataProvider: ({ column }) => MemoryLookupManyDataProviderFactory.create(SOURCES[column.name]) })\`

**Assigned To** and **Tags** are the two columns carrying \`metadata.LookupMany\`, and they now render as multi-record pickers — personas for the first, coloured tags for the second, chosen by each column's control name. Click one to add or remove records; the candidates are what \`createDataProvider\` returned for that column.

Compare with the grids above, where the same two columns are plain text: without the module the column simply falls back to its default renderer.
                `.trim(),
            },
        },
    },
}

export const GridCustomizer: Story = {
    name: 'gridCustomizer',
    render: () => renderStory(<ModuleCustomizerExample />),
    parameters: {
        docs: {
            description: {
                story: `
\`onGetGridCustomizerModule: () => createGridCustomizerModule({ strategy })\`

The one module with no UI of its own — it hands your strategy the grid's own AG Grid instance instead. The strategy here paints the subject cell of every high-priority task through a formatting expression, which is why some rows are already coloured before you touch anything.

Column definitions, row class rules and one-time setup all go through the same strategy: [**Customizations → Customizer**](?path=/story/task-grid-modules-customizer--overview) is the reference, with four live examples.
                `.trim(),
            },
        },
    },
}
