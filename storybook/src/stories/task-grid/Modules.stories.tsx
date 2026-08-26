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

That grid has personal views and nothing else. The same five keys work on \`DataverseTaskGridDescriptor\`, which hands each builder the entity name and record id it needs.

Each builder takes the one thing only you can provide, plus a few switches for its commands:

| Builder | Required | Optional, all off by default | Registered as |
|---|---|---|---|
| \`createUserQueryModule\` | \`strategy\`, \`services\` | \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\` | \`userQueriesModule\` |
| \`createTemplateModule\` | \`provider\` | — | \`templatesModule\` |
| \`createLookupManyModule\` | \`createDataProvider\`, \`services\` | — | \`lookupManyModule\` |
| \`createDependenciesModule\` | \`strategy\`, \`services\` | — | \`dependenciesModule\` |
| \`createChecklistModule\` | \`strategy\`, \`services\` | — | \`checklistModule\` |
| \`createGridCustomizerModule\` | \`strategy\`, \`services\` | — | \`gridCustomizerModule\` |

Whatever a builder returns, the grid registers under that key, so a module — and everything it brings — is reachable from the rest of the grid: \`services.find('templatesModule')?.provider\`. That is also how a templates provider describes the tasks a template expands into, in the other direction: \`services.get('taskDataProvider')\`. See [**Custom strategies → Services**](?path=/story/task-grid-custom-strategies--overview).

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
**New** now offers *New from template*, and so does the **+** button on each row. Select a task and *Create template from task* saves its whole subtree as a new template, which then shows up in the picker — for the rest of the session, unless you keep it yourself: see [**Memory**](?path=/story/task-grid-strategies-memory--overview), under *Keeping data across remounts*.

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
Two columns arrive with the module: **Predecessors** — what a task waits on — and **Successors** — what waits on it. The tasks under *Website Redesign* are wired together here, so each shows a count for its direction; a task with none stays blank.

Both columns are the grid's, not yours: registering the module is what creates them, and they arrive hidden, offered in *Edit columns* under their own names. This grid's views name them, which is why they are on screen from the start. Neither sorts, filters nor edits — the cell reads the module rather than a value on the task.
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
One column arrives with the module: **Checklist**, showing how far a task's list has got as \`done/total\`. Expand *Website Redesign* to see all three states — *Discovery & Planning* is part-way at 2/3, *UX/UI Design* has not started at 0/2, and *Content Migration* is finished at 2/2, where the check turns green so a completed list reads without comparing the numbers. A task with no items stays blank.

The column is the grid's, not yours: registering the module is what creates it, and it arrives hidden, offered in *Edit columns* under its own name. This grid's views name it, which is why it is on screen from the start. It neither sorts, filters nor edits — the cell reads the module rather than a value on the task.

An item carries a \`name\`, an optional \`description\` and a \`status\` of \`active\` or \`complete\`, and belongs to exactly one task. That one-owner rule is why the provider is as small as it is: \`refresh(taskIds)\` writes only the tasks it was given, so a task nobody asked about keeps what it had, and a task whose items are all gone ends up with none.

The cell reads the module, not the task, and repaints from the provider's \`onAfterChecklistRefreshed\` event: it carries the tasks a refresh reloaded, and each cell watches for its own. Ticking an item off is not wired up yet — the column reports progress, it does not edit it.
                `.trim(),
            },
        },
    },
}
