import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { TemplatesCallExample, TemplatesExample, TemplatesLookExample, TemplatesStoreExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A template is a task with its subtasks, kept so that the same work can be planned again in one go, such as onboarding a new colleague. The templates module adds *From template* to the ribbon's *New* and to each row's **+**, and *Save as template* for the selected task. Try it below: open *New* and pick *From template*.

{{canvas: Create tasks from a template}}

## What the user can do

| Command | Where | Needs | Does |
|---|---|---|---|
| *From template* | Under *New* in the ribbon | \`enableCreation\` | Creates a template's tasks at the top level, from a searchable list of the templates. |
| *From template* | In the menu of an active task's **+** | \`enableCreation\` | Creates a template's tasks under that task. |
| *Save as template* | In the ribbon, with one task selected | A store that saves templates | Saves the task and all its subtasks as a template named after it, with the values of the columns the view shows. |

Both run under the loading overlay. Tasks created from a template show under their parent, which opens, and the grid scrolls to the first of them. To change the overlay's messages, see [**Localization**](?path=/docs/concepts-localization--overview).

## In memory

\`createMemoryTemplatesModule\` keeps the templates in the \`templates\` [**\`MemoryTable\`**](?path=/docs/controls-taskgrid-loading-tasks--overview), keyed by \`id\`, the ones the user saves included. It creates their tasks in \`tasks\`, the table the grid's \`MemoryTaskStore\` reads. A template holds:

| Field | Description |
|---|---|
| \`id\` | Required. |
| \`name\` | Required. Listed in the picker, and the subject of the template's own task. |
| \`data\` | The column values of its own task, by column name. |
| \`children\` | Its subtasks, each with \`data\` and \`children\` of its own. |

## In Dataverse and TALXIS

There is no templates module for Dataverse or TALXIS: write a store over the place your app keeps its templates, as below.

## Your own store

\`createTemplatesModule({ createStore })\` takes a store of yours, which lists the templates and creates their tasks. Without \`createTemplate\`, there is no *Save as template*.

{{story: Templates from your own store}}

## From your code

\`useDatasetControlModule('templates')\`, or \`modules.get('templates')\` on the DatasetControl, returns the module. \`createTasksFromTemplate(templateId, parentId?)\` creates a template's tasks at the top level, or under a task, and returns them; it returns \`null\` while \`enableCreation\` is off. \`createTemplateFromTask(task)\` saves a task and its subtasks as a template.

{{story: Create tasks from your code}}

## Changing how it looks

Every templates factory takes \`components\`, read at mount. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`selector\` | \`onRender\` | \`TemplatesUiRecordSelectorFrameComponents\` | The box the template picker is drawn in |
| \`list\` | \`onRenderRecord\` | \`TemplatesUiRecordListComponents\` | The button of a template in the picker |

{{story: Change the template list}}

## Reference

| Factory | Parameter | Description |
|---|---|---|
| Every one | \`components\` | See *Changing how it looks* above. |
| \`createMemoryTemplatesModule\` | \`templates\` | Required. The templates, keyed by \`id\`. |
| | \`tasks\` | Required. The table the template's tasks are created in. |
| \`createTemplatesModule\` | \`createStore\` | Required. Called with the task runtime on every mount. |

### Your own store

| Method | Description |
|---|---|
| \`createTemplatesProvider()\` | A provider over the templates, searched by the picker. Made each time the picker opens. |
| \`createTasks({ templateId, parentRecord, stackRank })\` | Creates the template's tasks: its own task under \`parentRecord\`, or at the top level without it, at \`stackRank\`, and the rest under it. Returns \`{ records }\` with every task created, or \`null\` when there were none or the user cancelled. |
| \`createTemplate({ name, tree })\` | Optional. Saves a task and its subtasks as a template: \`tree\` is \`{ data, children }\`, each child the same. |
| \`destroy()\` | Optional. Called when the mount goes. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'Create, edit, delete and move tasks one at a time.' },
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'The memory tables the templates and their tasks are kept in.' },
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-datasetcontrol-parts-ribbon--overview', text: 'The commands the ribbon shows, and how to add your own.' },
]

const meta = {
    title: 'Controls/TaskGrid/Modules/Templates',
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
type Story = StoryObj<typeof meta>

export const CreateTasksFromATemplate: Story = {
    name: 'Create tasks from a template',
    render: () => renderStory(<TemplatesExample />),
}

export const TemplatesFromYourOwnStore: Story = {
    name: 'Templates from your own store',
    render: () => renderStory(<TemplatesStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `Release checklists from a store of yours, each created as a release task with its steps under it. Try: open the menu of a row's **+** and pick *From template*.`,
            },
        },
    },
}

export const CreateTasksFromYourCode: Story = {
    name: 'Create tasks from your code',
    render: () => renderStory(<TemplatesCallExample />),
    parameters: {
        docs: {
            description: {
                story: `A header button that creates a sprint from a template at the end of the tasks. Try: press *Plan a sprint*.`,
            },
        },
    },
}

export const ChangeTheTemplateList: Story = {
    name: 'Change the template list',
    render: () => renderStory(<TemplatesLookExample />),
    parameters: {
        docs: {
            description: {
                story: `The default template button with an icon of your own. Try: open *New* and pick *From template*.`,
            },
        },
    },
}
