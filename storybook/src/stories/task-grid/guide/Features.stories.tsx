import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ChecklistExample, CustomColumnsExample, DependenciesExample, FeaturesExample, LookupManyExample, OwnStoreExample, ProjectExample, TemplatesExample } from '../../../task-grid/guide/featuresExamples'

const DESCRIPTION = `
Assignees, checklists, dependencies, templates and the other things a plan needs beside its own columns come as task modules, which you add to \`TaskDatasetControl\`'s \`modules\`. Each keeps its data in the backend you pick, in memory, Dataverse, TALXIS or a store of your own, and this page adds them one at a time. Try it below: double-click an *Assigned to* cell and pick a person.

{{canvas: Three features at once}}

## Which factory to use

Every module comes as one factory per backend:

| Module | The user gets | Memory | Dataverse | TALXIS | Your own store |
|---|---|---|---|---|---|
| Project | The project the tasks belong to | \`createMemoryProjectModule\` | \`createDataverseProjectModule\` | The Dataverse one | \`createProjectModule\` |
| Custom columns | Columns they add themselves | \`createMemoryCustomColumnsModule\` | None | \`createTalxisCustomColumnsModule\` | \`createCustomColumnsModule\` |
| Lookup many | Several related records in one column | \`createMemoryLookupManyModule\` | \`createDataverseLookupManyModule\` | The Dataverse one | \`createLookupManyModule\` |
| Templates | Tasks planned from a template | \`createMemoryTemplatesModule\` | None | None | \`createTemplatesModule\` |
| Checklist | Each task's checklist progress | \`createMemoryTaskChecklistModule\` | None | \`createTalxisTaskChecklistModule\` | \`createTaskChecklistModule\` |
| Dependencies | Tasks that wait on other tasks | \`createMemoryDependenciesModule\` | \`createDataverseDependenciesModule\` | \`createTalxisDependenciesModule\` | \`createDependenciesModule\` |

The memory modules keep their data in \`MemoryTable\`s that you create outside the control; the Dataverse and TALXIS ones read and write through the PCF context's Web API, so they run in a PCF control. Dragging and cell editing are modules too, with no data to keep: see [**Views, tree and editing**](?path=/docs/controls-taskgrid-guide-views-tree-and-editing--overview). All parameters: [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

Lookup many, Custom columns, Checklist and Dependencies add columns. *Edit columns* offers them, and a view shows one when it lists it by name, as the example does. Their values load after the tasks, and a sort, filter or search on one of them waits for its values. To change the texts the modules show, see [**Localization**](?path=/docs/concepts-localization--overview).

## Project

The project module loads the project the tasks belong to, before the tasks, on every mount. \`DataverseTaskStore\` reads it as \`project\` in its FetchXML and fills in the project lookup on new tasks, the Gantt marks its start and end, and your code reads it with \`useDatasetControlModule('project')\`, as the example's header does.

{{story: The project}}

In Dataverse and TALXIS, \`createDataverseProjectModule({ entityName, id, startDateColumn, endDateColumn })\` reads the project's record.

## Custom columns

Users add columns such as a risk or a budget themselves, without anyone changing the task table. Each one is drawn, edited, sorted and filtered like any column of its data type. The module's \`enableCreation\` and \`enableDeletion\` offer *Add custom column* and a delete command in *Edit columns*, and \`enableEditing\` an edit command, except on the memory module.

{{story: Add your own columns}}

In TALXIS, \`createTalxisCustomColumnsModule({ entityName, recordId })\` keeps the columns in \`talxis_attributedefinition\` and the values in \`talxis_attributevalue\`, and runs in a model-driven app.

## Lookup many

A lookup-many column holds several related records for each task, such as the people assigned to it or its tags, drawn as pills and picked in a searchable editor over the cell. With cell editing on, each pick saves on its own; with \`createFilteringModule()\` in \`TaskGrid\`, the column's menu filters by its records, and quick find searches their names when a view passes the column to \`setQuickFindColumns\`.

{{story: Assign people and tags}}

In Dataverse and TALXIS, \`createDataverseLookupManyModule({ columns })\` reads each column through a relationship of the task table, which the column names in \`navigationPropertyName\`, and offers the records its \`fetchXml\` selects.

## Templates

A template is a task with its subtasks, kept so that the same work can be planned again in one go. The module adds *From template* under *New* and to each row's **+**, both needing \`enableCreation\`, and *Save as template* for the one selected task. The memory module creates the tasks in the table the task store reads.

{{story: Create tasks from a template}}

There is no Dataverse or TALXIS module, so write a store over the place your app keeps its templates, as under *Your own store* below.

## Checklist

The *Checklist* column shows how far each task's checklist has got, as *done/total*, while the items are edited where they are kept, such as in the task's form. The column cannot be edited, sorted or filtered.

{{story: Show checklist progress}}

In TALXIS, \`createTalxisTaskChecklistModule()\` reads each task's items from its \`talxis_checklistjson\` column, and again once the task's form closes.

## Dependencies

A dependency says that one task waits on another, such as testing on the build. The module counts them in a *Predecessors* and a *Successors* column, and refuses a new one that links a task to itself, repeats one or closes a loop. Dependencies change only while \`enableEditing\` is on, and deleting a task deletes its dependencies. The Gantt draws them and lets the user draw new ones with its links module, which needs this module: see [**The Gantt**](?path=/docs/controls-taskgrid-guide-the-gantt--overview).

{{story: Count the dependencies}}

In Dataverse, \`createDataverseDependenciesModule({ entityName, predecessorAttribute, successorAttribute, typeAttribute, dependencyTypeCodes })\` keeps them in a table of your own; in TALXIS, \`createTalxisDependenciesModule()\` keeps them in \`talxis_taskdependency\`.

## Your own store

Each base factory, such as \`createTaskChecklistModule\`, takes \`createStore\`, which the module calls with the task runtime on every mount. It returns an object that implements the module's store interface; throw from a write your backend does not support. Every interface is on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

{{story: A checklist from your own store}}

## Where next

**Next:** [**The Gantt**](?path=/docs/controls-taskgrid-guide-the-gantt--overview)
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Features',
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
type Story = StoryObj<typeof meta>

export const ThreeFeaturesAtOnce: Story = {
    name: 'Three features at once',
    render: () => renderStory(<FeaturesExample />),
}

export const TheProject: Story = {
    name: 'The project',
    render: () => renderStory(<ProjectExample />),
    parameters: {
        docs: {
            description: {
                story: `A project kept in memory, read by a header of your own. Try: set \`projectId\` to \`'mobile'\`.`,
            },
        },
    },
}

export const AddYourOwnColumns: Story = {
    name: 'Add your own columns',
    render: () => renderStory(<CustomColumnsExample />),
    parameters: {
        docs: {
            description: {
                story: `A *Risk* and a *Budget* column the user started with. Try: open *Edit columns* and pick *Add custom column*.`,
            },
        },
    },
}

export const AssignPeopleAndTags: Story = {
    name: 'Assign people and tags',
    render: () => renderStory(<LookupManyExample />),
    parameters: {
        docs: {
            description: {
                story: `People, tags and teams, each column drawn its own way. Try: double-click a *Tags* cell and pick a tag.`,
            },
        },
    },
}

export const CreateTasksFromATemplate: Story = {
    name: 'Create tasks from a template',
    render: () => renderStory(<TemplatesExample />),
    parameters: {
        docs: {
            description: {
                story: `An onboarding template kept in memory. Try: open *New* and pick *From template*.`,
            },
        },
    },
}

export const ShowChecklistProgress: Story = {
    name: 'Show checklist progress',
    render: () => renderStory(<ChecklistExample />),
    parameters: {
        docs: {
            description: {
                story: `Checklist items of two tasks kept in memory. Try: set \`isCompleted\` of *Get the sign-off* to \`true\`.`,
            },
        },
    },
}

export const CountTheDependencies: Story = {
    name: 'Count the dependencies',
    render: () => renderStory(<DependenciesExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample dependencies, counted for each task. Try: delete a task and watch its neighbours' counts drop.`,
            },
        },
    },
}

export const AChecklistFromYourOwnStore: Story = {
    name: 'A checklist from your own store',
    render: () => renderStory(<OwnStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A store of yours that works each task's checklist out from its dates, effort and progress.`,
            },
        },
    },
}
