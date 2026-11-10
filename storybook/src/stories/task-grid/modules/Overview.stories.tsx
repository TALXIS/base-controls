import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ModulesExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A task grid has the tree and its commands built in; everything beyond them, such as dragging, assignees, checklists, dependencies or templates, is a module you add. Each module brings one feature and, when it keeps data, reads and writes it in the backend you choose: memory, Dataverse, TALXIS or a store of your own. Try it below: drag a task onto another.

{{canvas: Modules in both places}}

## Where modules go

A task grid takes modules in two places, both read at mount:

| Prop | Takes |
|---|---|
| \`TaskDatasetControl\`'s \`modules\` | The task modules below, and DatasetControl modules such as user views. |
| \`TaskGrid\`'s \`modules\` | Grid modules (see the Grid's [**Modules**](?path=/docs/controls-grid-modules--overview)), with \`createTaskEditingModule()\` in place of the Grid's editing module. Grouping and totals are left out. |

The Gantt has modules of its own: see the Gantt's [**Modules**](?path=/docs/controls-taskgrid-gantt-modules--overview).

## The modules

A module that keeps data comes in variants: one per backend, and a base factory for a store of your own.

| Module | Description | Memory | Dataverse | TALXIS | Your own store |
|---|---|---|---|---|---|
| [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) | The project the tasks belong to. | \`createMemoryProjectModule\` | \`createDataverseProjectModule\` | | \`createProjectModule\` |
| [**Custom columns**](?path=/docs/controls-taskgrid-modules-custom-columns--overview) | Columns users add to the tasks themselves. | \`createIndexedDbCustomColumnsModule\`, in the browser | | \`createTalxisCustomColumnsModule\` | \`createCustomColumnsModule\` |
| [**Lookup many**](?path=/docs/controls-taskgrid-modules-lookup-many--overview) | Columns of many related records, such as assignees and tags. | \`createMemoryLookupManyModule\` | \`createDataverseLookupManyModule\` | | \`createLookupManyModule\` |
| [**Templates**](?path=/docs/controls-taskgrid-modules-templates--overview) | Tasks created from a template, and saved as one. | \`createMemoryTemplatesModule\` | | | \`createTemplatesModule\` |
| [**Checklist**](?path=/docs/controls-taskgrid-modules-checklist--overview) | Each task's checklist progress. | \`createMemoryTaskChecklistModule\` | | \`createTalxisTaskChecklistModule\` | \`createTaskChecklistModule\` |
| [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) | Which tasks wait on which. | \`createMemoryDependenciesModule\` | \`createDataverseDependenciesModule\` | \`createTalxisDependenciesModule\` | \`createDependenciesModule\` |
| Dragging | Moving tasks by dragging their rows. See *Dragging* on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). | | | | |

*Memory* keeps the data in the page, in [**\`MemoryTable\`**](?path=/docs/controls-taskgrid-loading-tasks--overview)s you create and keep, pausing briefly like a server. *Dataverse* reads and writes tables you map to the module through the PCF context's Web API, and *TALXIS* is Dataverse with the TALXIS tables already mapped. User views come in the same variants: see *Where views are kept* on [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview).

## Your own store

The base factory takes \`createStore\`, which the module calls with the task runtime on every mount; the checklist in the example uses one. A store implements the module's \`I…Store\`, listed on each module's page. Its writes are required, so throw "Not implemented." from one your backend lacks; an optional \`destroy()\` runs when the module goes.

## Columns from modules

Lookup many, Checklist, Dependencies and Custom columns add columns whose values are kept apart from the tasks. They show in *Edit columns*, and a view shows them by listing them by name. Their values load after the tasks, and their cells show a loading state until they arrive. A sort, filter or search on one of them waits for its values first; the Checklist and Dependencies columns cannot be sorted or filtered.

Modules that draw something take \`components\` to change it (see *Changing how it looks* on each module's page), and every module's strings are labels (see [**Localization**](?path=/docs/concepts-localization--overview)).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Project', iconName: 'ProjectCollection', href: '?path=/docs/controls-taskgrid-modules-project--overview', text: 'The project the tasks belong to, read by the other modules and the Gantt.' },
    { title: 'Lookup many', iconName: 'People', href: '?path=/docs/controls-taskgrid-modules-lookup-many--overview', text: 'Assignees, tags and other columns of many related records.' },
    { title: 'Dependencies', iconName: 'Link', href: '?path=/docs/controls-taskgrid-modules-dependencies--overview', text: 'Which tasks wait on which, counted in the grid and drawn on the Gantt.' },
]

const meta = {
    title: 'Controls/TaskGrid/Modules',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta

export const ModulesInBothPlaces: StoryObj<typeof meta> = {
    name: 'Modules in both places',
    render: () => renderStory(<ModulesExample />),
}
