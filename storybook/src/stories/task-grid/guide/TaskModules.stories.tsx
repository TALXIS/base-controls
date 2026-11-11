import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GuideNavigation } from '../../../task-grid/guide/GuideSteps'
import { ChecklistExample, CustomColumnsExample, DependenciesExample, LookupManyExample, OwnStoreExample as OwnModuleStoreExample, ProjectExample, TemplatesExample } from '../../../task-grid/guide/featuresExamples'

const DESCRIPTION = `
A task module adds data the tasks carry beside their own columns, kept in memory, in Dataverse, in TALXIS or in a store of your own. Each section adds one module; their factories and parameters are on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

## Project

Whatever a plan needs beside its own columns, such as assignees, checklists or dependencies, comes as a task module in \`TaskDatasetControl\`'s \`modules\`. Each comes as one factory per backend, listed on [**Reference**](?path=/docs/controls-taskgrid-reference--overview), and the next steps use the memory ones.

The project module loads the project the tasks belong to on every mount. \`DataverseTaskStore\` reads it as \`project\` in its FetchXML, the Gantt marks its start and end, and your code reads it with \`useDatasetControlModule('project')\`, as the example's header does.

Try: set \`projectId\` to \`'mobile'\`.

{{story: Project}}

## Custom columns

Users add columns such as a risk or a budget themselves, without anyone changing the task table, and each one is drawn, edited, sorted and filtered like any column of its data type. The module's \`enableCreation\` and \`enableDeletion\` offer *Add custom column* and a delete command in *Edit columns*.

The modules that add columns, this one, Lookup many, Checklist and Dependencies, offer them in *Edit columns*, and a view shows one when it lists it by name. Their values load after the tasks.

Try: open *Edit columns* and pick *Add custom column*.

{{story: Custom columns}}

## Lookup many

A lookup-many column holds several related records for each task, such as the people assigned to it or its tags, drawn as pills and picked in a searchable editor over the cell. With cell editing on, each pick saves on its own, and with \`createFilteringModule()\` in \`TaskGrid\`, the column's menu filters by its records.

In Dataverse and TALXIS, each column reads its records through a relationship of the task table.

Try: double-click a *Tags* cell and pick a tag.

{{story: Lookup many}}

## Templates

A template is a task with its subtasks, kept so that the same work can be planned again in one go. The module adds *From template* under *New* and to each row's **+**, both needing \`enableCreation\`, and *Save as template* for the one selected task.

There is no Dataverse or TALXIS templates module: keep templates in your own backend, as the step *Modules over your own backend* shows.

Try: open *New* and pick *From template*.

{{story: Templates}}

## Checklist

The *Checklist* column shows how far each task's checklist has got, as *done/total*, while the items are edited where they are kept, such as in the task's form. In TALXIS, the items come from each task's \`talxis_checklistjson\` column.

Try: set \`isCompleted\` of *Get the sign-off* to \`true\`.

{{story: Checklist}}

## Dependencies

A dependency says that one task waits on another, such as testing on the build. The module counts them in a *Predecessors* and a *Successors* column, and refuses one that links a task to itself, repeats one or closes a loop. Dependencies change only while \`enableEditing\` is on, and deleting a task deletes its dependencies.

The Gantt draws them as arrows, in the step *Links*.

Try: delete a task and watch its neighbours' counts drop.

{{story: Dependencies}}

## Modules over your own backend

Each base factory, such as \`createTaskChecklistModule\`, takes \`createStore\`, which the module calls with the task runtime on every mount. It returns an object that implements the module's store interface; throw from a write your backend does not support. Every interface is on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

A store of yours that works each task's checklist out from its dates, effort and progress.

{{story: Modules over your own backend}}

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Task modules',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { navigation: () => <GuideNavigation current='Task modules' /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Project: Story = {
    name: 'Project',
    tags: ['!dev'],
    render: () => renderStory(<ProjectExample />),
}

export const CustomColumns: Story = {
    name: 'Custom columns',
    tags: ['!dev'],
    render: () => renderStory(<CustomColumnsExample />),
}

export const LookupMany: Story = {
    name: 'Lookup many',
    tags: ['!dev'],
    render: () => renderStory(<LookupManyExample />),
}

export const Templates: Story = {
    name: 'Templates',
    tags: ['!dev'],
    render: () => renderStory(<TemplatesExample />),
}

export const Checklist: Story = {
    name: 'Checklist',
    tags: ['!dev'],
    render: () => renderStory(<ChecklistExample />),
}

export const Dependencies: Story = {
    name: 'Dependencies',
    tags: ['!dev'],
    render: () => renderStory(<DependenciesExample />),
}

export const ModulesOverYourOwnBackend: Story = {
    name: 'Modules over your own backend',
    tags: ['!dev'],
    render: () => renderStory(<OwnModuleStoreExample />),
}
