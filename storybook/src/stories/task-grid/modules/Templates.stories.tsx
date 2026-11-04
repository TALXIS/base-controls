import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { TemplatesExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A template is a task with subtasks, created again in one go. The templates module adds *From template* beside *New*, and *Save as template* for a selected task. Try it below: pick *From template* from the arrow next to *New*.

{{canvas: Create tasks from a template}}

## What the user can do

It needs \`enableCreation\` and \`TaskDatasetControl.Ribbon\`.

*From template* sits in the ribbon's *New* menu, for top-level tasks, and in the menu of a row's **+**, for subtasks; the user picks from a searchable list. *Save as template*, with one task selected, saves it and all its subtasks as a template named after it, when the store can save templates.

## Where templates are kept

| Factory | Keeps the templates |
|---|---|
| \`createMemoryTemplatesModule\` | In memory. \`templates\` are the starting templates, and \`database\` is the \`MemoryTaskDatabase\` the tasks are created in, the one the \`MemoryTaskStore\` reads. Templates saved by the user last as long as the module. |
| \`createTemplatesModule\` | In a store of yours: \`onCreateStore\` returns an \`ITemplatesStore\`. |

A memory template is a task: \`data\` holds its column values, and \`children\` its subtasks, each with \`data\` and \`children\` of its own. The template's own task is named after it.

## Changing how it looks

\`createTemplatesModule\` and \`createMemoryTemplatesModule\` take \`components\`, read at mount. How slots work: [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`selector\` | \`onRenderContainer\` | | The template picker's frame |
| \`list\` | \`onRenderRecord\` | | A template in the picker's list |

## Reference

### Your own store

| Method | Description |
|---|---|
| \`onCreateTemplatesProvider()\` | A provider over the templates, searched by the picker. Created each time it opens. |
| \`onCreateTasks({ templateId, parentRecord, stackRank })\` | Creates the template's tasks, its own task under \`parentRecord\` at \`stackRank\`. Returns \`{ records }\` with every task created, or \`null\` when cancelled. |
| \`onCreateTemplate({ name, tree })\` | Optional. Saves a task and its subtasks as a template. Without it, there is no *Save as template*. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Working with tasks', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-working-with-tasks--overview', text: 'Create, edit, delete and move tasks one at a time.' },
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'The memory database the templates create their tasks in.' },
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
