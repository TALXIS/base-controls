import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { ModuleUserQueriesExample } from '../../task-grid/ModuleUserQueriesExample'
import { ModuleTemplatesExample } from '../../task-grid/ModuleTemplatesExample'
import { ModuleLookupManyExample } from '../../task-grid/ModuleLookupManyExample'

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
            onGetUserQueriesModule: () => createUserQueryModule({
                strategy: new MemoryUserQueryStrategy({ userQueries }),
                enableQueryManager: true,
            }),
        },
    }),
})
\`\`\`

That grid has personal views and nothing else. The same four keys work on \`DataverseTaskGridDescriptor\`, which hands each builder the entity name and record id it needs.

Each builder takes the one thing only you can provide, plus a few switches for its commands:

| Builder | Required | Optional, all off by default |
|---|---|---|
| \`createUserQueryModule\` | \`strategy\` | \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\` |
| \`createTemplateModule\` | \`provider\` | — |
| \`createLookupManyModule\` | \`createDataProvider\` | — |
| \`createGridCustomizerModule\` | \`strategy\` | — |

Each builder is called with the grid's module context, which carries \`onGetTaskDataProvider\` — the templates provider needs it to describe the tasks a template expands into.

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
