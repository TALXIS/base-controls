import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ModulesExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
Everything beyond the tree is a module. A task grid takes modules in two places: \`TaskDatasetControl\`'s \`modules\` and \`TaskGrid\`'s.

{{story: Modules in both places}}

\`TaskGrid\` takes Grid modules (see [**Grid › Modules**](?path=/docs/controls-grid-modules--overview)), with \`createTaskEditingModule()\` in place of the Grid's editing module. The [**Gantt**](?path=/docs/controls-taskgrid-gantt-modules--overview) has modules of its own.

## The modules

A module that keeps data comes in variants: one per backend, and a base factory for a store of your own.

| Module | Description | Memory | Dataverse | TALXIS | Your own store |
|---|---|---|---|---|---|
| [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) | The project the tasks belong to. | \`createMemoryProjectModule\` | \`createDataverseProjectModule\` | | \`createProjectModule\` |
| [**Custom columns**](?path=/docs/controls-taskgrid-modules-custom-columns--overview) | Columns users add to the tasks themselves. | \`createIndexedDbCustomColumnsModule\`, in the browser | | \`createTalxisCustomColumnsModule\` | \`createCustomColumnsModule\` |
| [**Lookup many**](?path=/docs/controls-taskgrid-modules-lookup-many--overview) | Columns of many related records, such as assignees and tags. | \`createMemoryLookupManyModule\` | \`createDataverseLookupManyModule\` | | \`createLookupManyModule\` |
| [**Templates**](?path=/docs/controls-taskgrid-modules-templates--overview) | Tasks created from a template, and saved as one. | \`createMemoryTemplatesModule\` | | | \`createTemplatesModule\` |
| [**Checklist**](?path=/docs/controls-taskgrid-modules-checklist--overview) | Each task's checklist progress. | \`createMemoryChecklistModule\` | | \`createTalxisChecklistModule\` | \`createChecklistModule\` |
| [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) | Which tasks wait on which. | \`createMemoryDependenciesModule\` | \`createDataverseDependenciesModule\` | \`createTalxisDependenciesModule\` | \`createDependenciesModule\` |
| Dragging | Moving tasks by dragging their rows. See *Dragging* on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). | | | | |

User views come in the same variants: see *Where views are kept* on [**DatasetControl › User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview).

*Memory* keeps the data in the page, starts over on every mount and pauses briefly like a server: right for prototypes, tests and these docs. *Dataverse* reads and writes tables you map to the module through the PCF context's Web API, and *TALXIS* is Dataverse with the TALXIS tables already mapped.

## Your own store

The base factory takes \`onCreateStore\`, which the module calls with the task runtime on every mount; the checklist above uses one. A store implements the module's \`I…Store\`, listed on each module's page. Its writes are required, so throw "Not implemented." from one your backend lacks; an optional \`destroy()\` runs when the module goes.

## Columns from modules

Lookup many, Checklist, Dependencies and Custom columns add columns whose values are kept apart from the tasks. They show in Edit columns, and a view shows them by listing them by name. Their values load after the tasks, and their cells show a loading state until they arrive. A sort, filter or search on one of them waits for its values first.

Modules that draw something take \`components\` to change it (see *Changing how it looks* on each module's page), and every module's strings are labels (see [**Localization**](?path=/docs/concepts-localization--overview)).
`

const meta = {
    title: 'Controls/TaskGrid/Modules',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta

export const Overview: StoryObj<typeof meta> = {
    name: 'Overview',
    render: () => <></>,
}

export const ModulesInBothPlaces: StoryObj<typeof meta> = {
    name: 'Modules in both places',
    render: () => renderStory(<ModulesExample />),
    parameters: {
        docs: {
            description: {
                story: `Dragging, a checklist from a store of its own and user views in the control, with selection, editing and sorting in the grid. Try: drag a task, sort by *Checklist*, or save the view as your own.`,
            },
        },
    },
}
