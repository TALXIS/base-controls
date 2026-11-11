import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { StoreLogExample, ThreePlacesExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
A task grid works in three layers: a *store* that reads and writes the tasks wherever you keep them, a *task provider* that holds every task of the view in the page and works out the tree, and the parts that draw it. Sorting, filtering, searching and expanding the tree all happen in the page, and only what the user changes goes back to the store. Try it below: sort by *Due*, then rename a task, and watch which calls reach the store.

{{canvas: Watch the store at work}}

## The layers

| Layer | You give it | It does |
|---|---|---|
| Store | A \`MemoryTaskStore\`, a \`DataverseTaskStore\` or an \`ITaskStore\` of your own, from \`onLoad\` | Loads every task of the view once per mount, and saves what the user creates, edits, moves and deletes. |
| Task provider | Nothing: \`TaskDatasetControl\` builds it over your store | Holds the tasks in the page, builds the tree, and sorts, filters and searches it. It is the provider every part draws, as on any DatasetControl. |
| Task runtime | The \`enable…\` props and the modules | Runs *New*, *Edit* and *Delete* through the provider and the store, and is how your code and modules reach the rest. |
| Parts | \`TaskGrid\`, \`TaskGantt\` and the DatasetControl parts | Draw the tasks and the controls around them. |

The store is set up on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview), the task runtime is on [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview), and the parts are on [**TaskGrid**](?path=/docs/controls-taskgrid-get-started--overview).

## What reaches the store

| The user | The task provider | The store gets |
|---|---|---|
| Opens the control, or switches the view | Is built anew, over a new store | \`load()\`, once |
| Sorts, filters or searches, or expands and collapses tasks | Works the tree out again in the page | Nothing |
| Creates a task | Shows it at once, its row loading | \`createTask()\`, then the row fills in from what it returns |
| Edits a cell, or drags a task | Shows the change | \`saveTask()\` |
| Deletes tasks | Asks first, and takes them out once the store has deleted them | \`deleteTasks()\`, the deepest level first |
| Creates, saves or deletes | Merges in what the backend changed on its own | \`synchronize()\`, when the store has it: see *Rescheduled dates* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview) |

## One runtime per mount

\`TaskDatasetControl\` runs on a DatasetControl's runtime, so each load mounts it anew: picking a view, saving *Edit columns*, \`reload()\` and *Try again* each bring a new task runtime and a new task provider, over the store your \`onLoad\` returns, as the log above shows. Keep what has to outlive a mount, such as a \`MemoryTable\`, outside \`onLoad\`. How mounts work is on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview), and what starts a load on [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview).

## Modules in three places

A task grid takes modules in three places, each read at mount:

| Prop | Takes | Such as |
|---|---|---|
| \`TaskDatasetControl\`'s \`modules\` | Task modules, which work with the tasks whatever draws them, and DatasetControl modules | Dragging, dependencies, templates, user views |
| \`TaskGrid\`'s \`modules\` | Grid modules, which change what the grid does; grouping and totals are left out | Row selection, \`createTaskEditingModule()\`, sorting, filtering |
| \`TaskGantt\`'s \`modules\` | Gantt modules, which change what the timeline does | The library, bar dragging, links |

{{story: A module in each place}}

The task modules and their backends are on [**Modules**](?path=/docs/controls-taskgrid-modules--overview), the Gantt's on its own [**Modules**](?path=/docs/controls-taskgrid-gantt-modules--overview), and how to write one on [**Write a module**](?path=/docs/controls-taskgrid-write-a-module--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'The stores, the field mapping and dates the backend changed.' },
    { title: 'Talking to the task grid', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'Reach the task runtime and the task provider from your code.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-write-a-module--overview', text: 'A task module and a grid module of your own.' },
]

const meta = {
    title: 'Controls/TaskGrid/How it works',
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

export const WatchTheStoreAtWork: Story = {
    name: 'Watch the store at work',
    render: () => renderStory(<StoreLogExample />),
}

export const AModuleInEachPlace: Story = {
    name: 'A module in each place',
    render: () => renderStory(<ThreePlacesExample />),
    parameters: {
        docs: {
            description: {
                story: `Dragging on the control, selection and editing on the grid, and bar dragging on the Gantt. Try: drag a bar to another week, then drag a row onto another task.`,
            },
        },
    },
}
