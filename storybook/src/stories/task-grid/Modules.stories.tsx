import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { ModuleUserQueriesExample } from '../../task-grid/ModuleUserQueriesExample'
import { ModuleTemplatesExample } from '../../task-grid/ModuleTemplatesExample'
import { ModuleLookupManyExample } from '../../task-grid/ModuleLookupManyExample'
import { ModuleDependenciesExample } from '../../task-grid/ModuleDependenciesExample'
import { ModuleChecklistExample } from '../../task-grid/ModuleChecklistExample'

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
The grid's optional features are **modules**. You list the ones you want on the descriptor; leave one out and it does not exist — there is no flag to turn it off.

| Module | What it adds | You supply |
|---|---|---|
| \`onGetUserQueriesModule\` | Personal views: *My views* in the view switcher, and the save and manage commands | where views are stored |
| \`onGetTemplatesModule\` | Task templates: *New from template*, and *Create template from task* | where templates are stored, and what they expand into |
| \`onGetLookupManyModule\` | Multi-record pickers on lookup-many columns | the candidate records |
| \`onGetDependenciesModule\` | The **Predecessors** and **Successors** columns: what each task waits on, and what waits on it | where dependencies are read from |
| \`onGetChecklistModule\` | The **Checklist** column: the items on each task, and whether they are done | where checklist items are read from |
| \`onGetCustomColumnsModule\` | User-defined columns, created and edited from *Edit columns* | where the column definitions and values live |
| \`onGetGridCustomizerModule\` | Direct access to AG Grid — see [**Customizer**](?path=/story/task-grid-modules-customizer--overview) | a customizer strategy |

## Turning one on

\`modules\` is part of what \`onInitialize\` returns. Each key is a function that builds its module:

\`\`\`ts
import { MemoryTaskGridDescriptor, createUserQueryModule, MemoryUserQueryStrategy } from '@talxis/base-controls'

const descriptor = new MemoryTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        records, metadata, fieldMapping, systemQueries,
        gridParameters: { enableViewSwitcher: true },
        modules: {
            onGetUserQueriesModule: ({ services }) => createUserQueryModule({
                strategy: new MemoryUserQueryStrategy({ userQueries, services }),
                services,
                enableQueryManager: true,
            }),
        },
    }),
})
\`\`\`

That grid has personal views and nothing else. All seven keys work on \`DataverseTaskGridDescriptor\` too, which hands each builder the entity name and record id it needs.

Each builder takes the one thing only you can provide, plus a few switches for its commands:

| Builder | Required | Optional, all off by default | Registered as |
|---|---|---|---|
| \`createUserQueryModule\` | \`strategy\`, \`services\` | \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\`, \`components\` | \`userQueriesModule\` |
| \`createTemplateModule\` | \`provider\` | \`components\` | \`templatesModule\` |
| \`createLookupManyModule\` | \`createDataProvider\`, \`services\` | \`components\` | \`lookupManyModule\` |
| \`createDependenciesModule\` | \`strategy\`, \`services\` | \`components\` | \`dependenciesModule\` |
| \`createChecklistModule\` | \`strategy\`, \`services\` | \`components\` | \`checklistModule\` |
| \`createCustomColumnsModule\` | \`strategy\`, \`services\` | \`enableCustomColumnCreation\`, \`enableCustomColumnEditing\`, \`enableCustomColumnDeletion\`, \`components\` | \`customColumnsModule\` |
| \`createGridCustomizerModule\` | \`strategy\` | — | \`gridCustomizerModule\` |

Whatever a builder returns is registered under that key, so a module and everything it brings is reachable from anywhere in the grid — \`services.find('templatesModule')?.provider\`. See [**Anatomy → Services**](?path=/story/task-grid-descriptors-anatomy--overview).

\`onGetCustomColumnsModule\` is the one module with no in-memory implementation: \`TalxisCustomColumnsStrategy\` is the only strategy that ships for it, so it needs the TALXIS models and has no live demo here. See [**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview).

## Overriding a module's UI

A module brings its own UI, and \`components\` replaces any part of it. Each member is an \`onRender…\`
method taking that component's props:

| Builder | Members |
|---|---|
| \`createChecklistModule\` | \`onRenderCell\` |
| \`createDependenciesModule\` | \`onRenderCell\` — \`props.direction\` says which of the two columns is rendering |
| \`createLookupManyModule\` | \`onRenderCell\` |
| \`createTemplateModule\` | \`onRenderTemplateSelector\` |
| \`createUserQueryModule\` | \`onRenderViewManager\`, \`onRenderCreateView\` |
| \`createCustomColumnsModule\` | \`onRenderEditColumns\` |

\`\`\`ts
onGetChecklistModule: ({ services }) => createChecklistModule({
    strategy: new MemoryChecklistStrategy({ items: CHECKLIST_ITEMS, services }),
    services,
    components: {
        onRenderCell: (props) => <MyChecklistCell {...props} />,
    },
}),
\`\`\`

Anything you leave out keeps the component the module ships, and each module's defaults are exported —
\`ChecklistComponents\`, \`DependenciesComponents\`, \`LookupManyModuleComponents\`, \`TemplateComponents\`,
\`UserQueryComponents\`, \`CustomColumnsComponents\` — so you can call one from inside your own component
to wrap the shipped rendering rather than reproduce it.

This is per module. To reach *every* data column's cell instead, use \`onRenderCellRenderer\` on the grid's
own \`components\` prop: see [**Customizations → Custom Components**](?path=/story/task-grid-customizations-custom-components--overview).

Every grid below runs **one** module, so you can see exactly what it adds. Flip **Code** to read the registration, and edit it — remove the module and the feature disappears from the grid.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const PersonalViews: Story = {
    name: 'Personal views',
    render: () => renderStory(<ModuleUserQueriesExample />),
    parameters: {
        docs: {
            description: {
                story: `
Open the view dropdown: **My views** lists the user's own views under the system ones, with *Save as new view*, *Save changes to current view* and *Manage views* below them. Save a new view and it appears in the list.

Drop the \`enableQueryManager\` line and *Manage views* goes away. Drop the whole module and so does the entire **My views** group.
                `.trim(),
            },
        },
    },
}

export const Templates: Story = {
    name: 'Task templates',
    render: () => renderStory(<ModuleTemplatesExample />),
    parameters: {
        docs: {
            description: {
                story: `
**New** now offers *New from template*, and so does the **+** button on each row. Select a task and *Create template from task* saves its whole subtree as a new template, which then shows up in the picker — for the rest of the session, unless you keep it yourself: see [**Memory → Your data**](?path=/story/task-grid-descriptors-memory-your-data--overview).

Note the view dropdown has no *My views* group here — that is the personal-views module, and this grid does not register it.
                `.trim(),
            },
        },
    },
}

export const LookupMany: Story = {
    name: 'Lookup-many pickers',
    render: () => renderStory(<ModuleLookupManyExample />),
    parameters: {
        docs: {
            description: {
                story: `
**Assigned To** and **Tags** are now multi-record pickers — people with avatars, tags with colours. Click one to add or remove records; the options are whatever \`createDataProvider\` returned for that column.

In the grids above, those same two columns are plain text: without the module they fall back to their default renderer.
                `.trim(),
            },
        },
    },
}

export const Dependencies: Story = {
    name: 'Task dependencies',
    render: () => renderStory(<ModuleDependenciesExample />),
    parameters: {
        docs: {
            description: {
                story: `
Two columns arrive with the module: **Predecessors** — what a task waits on — and **Successors** — what waits on it. The tasks under *Website Redesign* are linked here, so each shows a count for its direction; a task with no links stays blank.

Registering the module is what creates both columns. They arrive hidden and are offered in *Edit columns* under their own names; this grid's views name them, which is why they are on screen from the start. Neither can be sorted, filtered or edited, and there is no \`controls\` name to override — naming the column in a view is how you place it.
                `.trim(),
            },
        },
    },
}

export const Checklist: Story = {
    name: 'Task checklists',
    render: () => renderStory(<ModuleChecklistExample />),
    parameters: {
        docs: {
            description: {
                story: `
One column arrives with the module: **Checklist**, showing how far a task's list has got as \`done/total\`. Expand *Website Redesign* for all three states — *Discovery & Planning* part-way at 2/3, *UX/UI Design* not started at 0/2, and *Content Migration* finished at 2/2, where the check turns green so a completed list reads at a glance. A task with no items stays blank.

Registering the module is what creates the column. It arrives hidden and is offered in *Edit columns* under its own name; this grid's views name it, which is why it is on screen from the start. It cannot be sorted, filtered or edited — the column reports progress, it does not change it.

An item belongs to exactly one task, and carries what the column needs:

\`\`\`ts
interface IChecklistItem {
    id: string
    name: string
    isCompleted: boolean
}
\`\`\`

Which task an item is under is not on the item — the strategy hands its items back grouped by task id.
                `.trim(),
            },
        },
    },
}
