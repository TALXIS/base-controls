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
The task grid's optional features each come from a builder. You pass the ones you want to \`TaskGrid\` as \`features\`; leave one out and it does not exist — there is no flag to turn it off.

| Key | What it adds | Builder | You supply |
|---|---|---|---|
| \`userQueries\` | Personal views: *My views* in the view switcher, and the save and manage commands | \`createUserQueryModule\` | where views are stored |
| \`templates\` | Task templates: *New from template*, and *Create template from task* | \`createTemplateModule\` | where templates are stored, and what they expand into |
| \`lookupMany\` | Multi-record pickers on lookup-many columns | \`createLookupManyModule\` | the candidate records |
| \`dependencies\` | The **Predecessors** and **Successors** columns: what each task waits on, and what waits on it | \`createDependenciesModule\` | where dependencies are read from |
| \`checklist\` | The **Checklist** column: the items on each task, and whether they are done | \`createChecklistModule\` | where checklist items are read from |
| \`customColumns\` | User-defined columns, created and edited from *Edit columns* | \`createCustomColumnsModule\` | where the column definitions and values live |
| \`project\` | The project the tasks belong to, and the link every new task gets | \`createProjectModule\` | where the project is read from |
| \`custom\` | Your own features — see [*Your own feature*](#your-own-feature) below | — | the feature |

Beside them, \`modules\` takes the Grid's own modules that work with a task grid — \`sorting\`, \`filtering\`, \`aggregation\`, \`clipboard\`, \`cellSelection\`, \`editing\`, \`rowSelection\`, \`license\`, and your own in \`custom\`. See [**Grid → Modules**](?path=/docs/grid-modules--overview). Rows are selectable, and editable while the descriptor allows task editing; pass \`editing: undefined\` for a read-only grid. The row model and grouping are the task tree's own, so they are not offered.

## Turning one on

\`\`\`tsx
import { TaskGrid, createSortingModule, createUserQueryModule, MemoryUserQueryStrategy, type ITaskGridFeatures, type ITaskGridModules } from '@talxis/base-controls'

const modules: ITaskGridModules = {
    sorting: createSortingModule(),
}

const features: ITaskGridFeatures = {
    userQueries: createUserQueryModule({
        onCreateStrategy: ({ services }) => new MemoryUserQueryStrategy({ userQueries, services }),
        enableQueryManager: true,
    }),
}

<TaskGrid descriptor={descriptor} modules={modules} features={features} />
\`\`\`

That grid sorts and has personal views, and nothing else. \`modules\` and \`features\` are read once, at mount, so build them once.

Each builder takes the one thing only you can provide, plus a few switches for its commands:

| Builder | Required | Optional, all off by default | Registered as |
|---|---|---|---|
| \`createUserQueryModule\` | \`onCreateStrategy\` | \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\`, \`components\` | \`userQueriesModule\` |
| \`createTemplateModule\` | \`onCreateProvider\` | \`components\` | \`templatesModule\` |
| \`createLookupManyModule\` | \`createDataProvider\` | — | \`lookupManyModule\` |
| \`createDependenciesModule\` | \`onCreateStrategy\` | — | \`dependenciesModule\` |
| \`createChecklistModule\` | \`onCreateStrategy\` | — | \`checklistModule\` |
| \`createCustomColumnsModule\` | \`onCreateStrategy\` | \`enableCustomColumnCreation\`, \`enableCustomColumnEditing\`, \`enableCustomColumnDeletion\`, \`components\` | \`customColumnsModule\` |
| \`createProjectModule\` | \`onCreateStrategy\` | — | \`projectModule\` |

\`onCreateStrategy\` is called with the grid's \`services\` once per mount, so pass them on to the strategy you build. What a builder registers is reachable from anywhere in the grid — \`services.find('templatesModule')?.provider\`. See [**Anatomy → Services**](?path=/story/task-grid-descriptors-anatomy--overview).

On Dataverse, a strategy usually needs what the descriptor resolved — the task entity's name, the project record. Read it from the descriptor once the grid loads:

\`\`\`ts
userQueries: createUserQueryModule({
    onCreateStrategy: () => new TalxisUserQueryStrategy({ entityName: descriptor.getStrategyContext().entityName }),
}),
\`\`\`

\`customColumns\` is the one feature with no in-memory implementation: \`TalxisCustomColumnsStrategy\` is the only strategy that ships for it, so it needs the TALXIS models and has no live demo here. See [**Talxis platform**](?path=/story/task-grid-descriptors-talxis-platform--overview).

## Overriding a feature's UI

The features that bring dialogs and pickers take \`components\`, which replaces any part of them:

| Builder | Members |
|---|---|
| \`createTemplateModule\` | \`onRenderTemplateSelector\` |
| \`createUserQueryModule\` | \`onRenderViewManager\`, \`onRenderCreateView\` |
| \`createCustomColumnsModule\` | \`editColumns\` — the [**Edit columns**](?path=/docs/datasetcontrol-parts-edit-columns--overview) pieces, with the custom-column commands in them |

Anything you leave out keeps the component the feature ships. A feature's *column* — the checklist, the dependencies, a lookup-many picker — is a column like any other, and is replaced through \`colDefs\`: see [**Custom Components**](?path=/story/task-grid-customizations-custom-components--overview).

## Your own feature

A feature is a [**Grid module**](?path=/docs/grid-extending-write-a-module--overview) with one more step. \`onInitialize\` runs once per mount, before the first view loads, and reaches the task grid's services; \`onRegister\` runs each time the grid mounts — once per view — and reaches the Grid's:

\`\`\`ts
const auditFeature: ITaskGridFeature = {
    //the task grid's services: the runtime, the providers, the other features
    onInitialize: services => {
        services.get('datasetControl').events.addEventListener('onLoaded', provider => provider.addEventListener('onAfterRecordSaved', audit))
    },
    //the Grid's services, with the task grid's under \`taskGrid\`
    onRegister: runtime => {
        runtime.services.get('rows').registerRowClass('audited-row', ({ record }) => isAudited(record))
    },
}

<TaskGrid descriptor={descriptor} features={{ custom: [auditFeature] }} />
\`\`\`

Every view loads a task provider of its own, so a feature reaches \`taskDataProvider\` when it uses it, and listens to the DatasetControl's \`onLoaded\` to act on each one. Anything it keeps per view goes through \`moduleState(services, key)\`, which also saves it into a personal view. Something that needs only the grid — no \`onInitialize\` — is a plain Grid module and goes in \`modules.custom\`. Live examples: [**Customizations → Grid options**](?path=/story/task-grid-customizations-grid-options--overview).

Every grid below runs **one** feature, so you can see exactly what it adds. Flip **Code** to read the registration, and edit it — remove it and the feature disappears from the grid.
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
