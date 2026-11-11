import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ChecklistExample, ChecklistLookExample, ChecklistReloadExample, ChecklistStoreExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A checklist is the short list of steps a task is done with, such as *Write the brief* and *Get the sign-off*. The checklist module shows how far each task's checklist has got, as *done/total* in a *Checklist* column, while the items themselves are edited where they are kept, such as in the task's form. Try it below: set \`isCompleted\` of *Get the sign-off* to \`true\` in **Code**.

{{canvas: Show checklist progress}}

## What the user sees

The *Checklist* column shows the done and the total items of each task, with an icon that changes once every item is done; a task without items shows an empty cell. *Edit columns* offers the column, and a view shows it when it lists \`TASK_CHECKLIST_COLUMN_NAME\`. The column cannot be edited, sorted or filtered. To change its title, see [**Localization**](?path=/docs/concepts-localization--overview).

## In memory

\`createMemoryTaskChecklistModule\` reads the items from the \`items\` [**\`MemoryTable\`**](?path=/docs/controls-taskgrid-loading-tasks--overview), keyed by \`id\`: \`{ id, taskId, name, isCompleted }\`, each naming the task it belongs to.

## In TALXIS

\`createTalxisTaskChecklistModule\` reads each task's items from its \`talxis_checklistjson\` column, a JSON array of \`{ id, name, isCompleted }\`, which it loads with the tasks whatever the view shows. A task whose JSON does not parse shows no items. It reads the items again once the task's form closes. There is no other Dataverse variant: write a store, as below, for items kept elsewhere.

## Your own store

\`createTaskChecklistModule({ createStore })\` takes a store whose \`loadItems(taskIds)\` returns the items of each task, by task id; a task left out has none. The store is made with the task runtime, so it can read the tasks themselves, as this one does.

{{story: Checklists from your own store}}

## Read the items again

The module reads a task's items once, after the tasks load. When they change elsewhere, \`reload(taskIds?)\` on the module reads them again, every loaded task's when no ids are given; reach the module with \`useDatasetControlModule('taskChecklist')\`, or \`modules.get('taskChecklist')\` on the DatasetControl. With \`reloadOnEditorClosed\`, the module does it itself once the task's form closes, with a task store that opens forms, such as \`DataverseTaskStore\`.

{{story: Read the items again}}

## Changing how it looks

Every checklist factory takes \`components\`, read at mount. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`progress\` | \`onRender\`, \`onRenderIcon\`, \`onRenderText\` | \`TaskChecklistUiProgressComponents\` | The progress in a cell: its box, its icon and its *done/total* |

{{story: Change the progress}}

## Reference

| Factory | Parameter | Default | Description |
|---|---|---|---|
| Every one | \`reloadOnEditorClosed\` | \`false\`; \`true\` for TALXIS | Reads a task's items again once its form closes. |
| | \`components\` | The defaults | See *Changing how it looks* above. |
| \`createMemoryTaskChecklistModule\` | \`items\` | Required | The items, keyed by \`id\`. |
| \`createTaskChecklistModule\` | \`createStore\` | Required | Called with the task runtime on every mount; returns a store with \`loadItems(taskIds)\` and an optional \`destroy()\`. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Dependencies', iconName: 'Link', href: '?path=/docs/controls-taskgrid-modules-dependencies--overview', text: 'Which tasks wait on which, counted in the grid.' },
    { title: 'Custom columns', iconName: 'TripleColumnEdit', href: '?path=/docs/controls-taskgrid-modules-custom-columns--overview', text: 'Columns users add to the tasks themselves.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-modules--overview', text: 'Every task module, and what each backend needs.' },
]

const meta = {
    title: 'Controls/TaskGrid/Modules/Checklist',
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

export const ShowChecklistProgress: Story = {
    name: 'Show checklist progress',
    render: () => renderStory(<ChecklistExample />),
}

export const ChecklistsFromYourOwnStore: Story = {
    name: 'Checklists from your own store',
    render: () => renderStory(<ChecklistStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A checklist that a store of yours works out from each task's dates, effort and progress. Try: add an item that is done when the task has a \`description\`.`,
            },
        },
    },
}

export const ReadTheItemsAgain: Story = {
    name: 'Read the items again',
    render: () => renderStory(<ChecklistReloadExample />),
    parameters: {
        docs: {
            description: {
                story: `A header button that ticks an item in the \`items\` table, then reloads that task's checklist. Try: press *Tick the next item*.`,
            },
        },
    },
}

export const ChangeTheProgress: Story = {
    name: 'Change the progress',
    render: () => renderStory(<ChecklistLookExample />),
    parameters: {
        docs: {
            description: {
                story: `The progress without its icon, its count followed by a word.`,
            },
        },
    },
}
