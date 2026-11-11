import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ModulesExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A task grid draws the tasks as a tree, and everything else a plan needs, such as assignees, checklists, dependencies or templates, comes as a *module* you add. A module brings one feature and, when it keeps data, reads and writes it through a store: in memory, in Dataverse, in TALXIS or in a backend of your own. Try it below: drag a task onto another.

{{canvas: Modules in both places}}

## Where modules go

The modules on this page go in \`TaskDatasetControl\`'s \`modules\`, and every mount loads them anew, before \`onLoad\`. Which prop takes grid and Gantt modules is on [**How it works**](?path=/docs/controls-taskgrid-how-it-works--overview), under *Modules in three places*. Two modules keep no data: \`createTaskDraggingModule()\` moves tasks by dragging their rows, and \`createTaskEditingModule()\` edits cells in place; both are on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview).

## Which factory to use

Every module that keeps data comes as one factory per backend, and a base factory that takes a store of your own. The name is what \`modules.get(name)\` on the DatasetControl and \`useDatasetControlModule(name)\` find the module by (see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)).

| Module | Name | Memory | Dataverse | TALXIS | Your own store |
|---|---|---|---|---|---|
| [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) | \`project\` | \`createMemoryProjectModule\` | \`createDataverseProjectModule\` | The Dataverse one | \`createProjectModule\` |
| [**Custom columns**](?path=/docs/controls-taskgrid-modules-custom-columns--overview) | \`customColumns\` | \`createMemoryCustomColumnsModule\` | None | \`createTalxisCustomColumnsModule\` | \`createCustomColumnsModule\` |
| [**Lookup many**](?path=/docs/controls-taskgrid-modules-lookup-many--overview) | \`lookupMany\` | \`createMemoryLookupManyModule\` | \`createDataverseLookupManyModule\` | The Dataverse one | \`createLookupManyModule\` |
| [**Templates**](?path=/docs/controls-taskgrid-modules-templates--overview) | \`templates\` | \`createMemoryTemplatesModule\` | None | None | \`createTemplatesModule\` |
| [**Checklist**](?path=/docs/controls-taskgrid-modules-checklist--overview) | \`taskChecklist\` | \`createMemoryTaskChecklistModule\` | None | \`createTalxisTaskChecklistModule\` | \`createTaskChecklistModule\` |
| [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) | \`dependencies\` | \`createMemoryDependenciesModule\` | \`createDataverseDependenciesModule\` | \`createTalxisDependenciesModule\` | \`createDependenciesModule\` |

The example's *dataverse.ts* builds the task modules of a model-driven app on TALXIS.

## What each backend needs

*Memory* keeps the data in [**\`MemoryTable\`s**](?path=/docs/controls-taskgrid-loading-tasks--overview) that you create and keep outside the control, so it outlives every mount; each module's page lists its tables. Loads and writes pause briefly, as a server would.

*Dataverse* and *TALXIS* read and write through the PCF context's Web API, so they run in a PCF control, and the ones that keep data for each task need the tasks to come from Dataverse, such as through \`DataverseTaskStore\`. Each needs the tables below.

| Factory | Needs |
|---|---|
| \`createDataverseProjectModule\` | The project's table and record id, and the columns of its dates. |
| \`createDataverseLookupManyModule\` | For each column, a 1:N or N:N relationship of the task table, or a link table of your own, and FetchXML for the records offered. Saving through a relationship calls \`Xrm.WebApi\`, which a model-driven app provides. |
| \`createDataverseDependenciesModule\` | A table of your own with two lookups to the task table and an option set of the type. |
| \`createTalxisCustomColumnsModule\` | \`talxis_attributedefinition\` and \`talxis_attributevalue\`, a relationship from the task table to \`talxis_attributevalue\`, and \`Xrm\` of a model-driven app. |
| \`createTalxisTaskChecklistModule\` | \`talxis_checklistjson\` on the task table. |
| \`createTalxisDependenciesModule\` | \`talxis_taskdependency\`. |

## Your own store

Every base factory takes \`createStore\`, which the module calls with the task runtime on every mount. The store implements the module's interface, listed on the module's page, where an example has one of its own; its optional \`destroy()\` runs when the mount goes. Throw an error from a write your backend does not support.

## Columns from modules

Lookup many, Custom columns, Checklist and Dependencies add columns. *Edit columns* offers them, and a view shows one when it lists it by name, as the example does; the module fills in the rest. Their values load after the tasks, while their cells show a loading state, and a sort, filter or search on one of them waits for its values. The Checklist and Dependencies columns cannot be sorted or filtered.

To change the texts the modules show, see [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Lookup many', iconName: 'People', href: '?path=/docs/controls-taskgrid-modules-lookup-many--overview', text: 'Assignees, tags and other columns of many related records.' },
    { title: 'Dependencies', iconName: 'Link', href: '?path=/docs/controls-taskgrid-modules-dependencies--overview', text: 'Which tasks wait on which, counted in the grid and drawn on the Gantt.' },
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'Editing in place and dragging, the two modules that keep no data.' },
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
