import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { DependenciesExample, DependenciesLinkExample, DependenciesLookExample, DependenciesStoreExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A dependency says that one task waits on another, such as testing waiting on the build. The dependencies module keeps the tasks' dependencies, counts them in a *Predecessors* and a *Successors* column, and checks every new one, while the Gantt's [**Links**](?path=/docs/controls-taskgrid-gantt-modules-links--overview) module draws them between the bars and lets the user draw new ones. Try it below: delete a task and watch its neighbours' counts drop.

{{canvas: Count the dependencies}}

## A dependency

| Field | Description |
|---|---|
| \`id\` | The dependency's id, given by the store. |
| \`predecessorTaskId\` | The task that comes first. |
| \`successorTaskId\` | The task that waits on it. |
| \`type\` | \`'finishToStart'\`, \`'startToStart'\`, \`'finishToFinish'\` or \`'startToFinish'\`: which end of the successor waits on which end of the predecessor. |

## What the user sees

*Predecessors* counts what a task waits on, and *Successors* what waits on it. *Edit columns* offers both, and a view shows them when it lists \`PREDECESSORS_COLUMN_NAME\` and \`SUCCESSORS_COLUMN_NAME\`. Neither can be edited, sorted or filtered; dependencies are drawn on the Gantt or written from your code. To change the columns' titles, see [**Localization**](?path=/docs/concepts-localization--overview).

Dependencies change only while \`enableEditing\` is on, and a new one is refused when it links a task to itself, repeats one, or closes a loop. While a dependency saves, its two tasks and the tasks that wait on them stay as they are, and the Gantt shows them as saving; then the grid reads the dates the backend changed (see *Rescheduled dates* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview)).

Deleting a task drops its dependencies from the grid, but the store is not asked to delete them: the memory table keeps them, so they load again on the next mount.

## In memory

\`createMemoryDependenciesModule\` keeps the dependencies in the \`dependencies\` [**\`MemoryTable\`**](?path=/docs/controls-taskgrid-loading-tasks--overview), keyed by \`id\`.

## In Dataverse

\`createDataverseDependenciesModule\` keeps them in a table of your own, with two lookups to the task table and an option set of the type; \`dependencyTypeCodes\` maps every value of the option set to the type it stands for, and a value it leaves out fails the load. It reads a task's dependencies again once the task's form closes. The example's *dataverse.ts* sets it up.

## In TALXIS

\`createTalxisDependenciesModule\` is the Dataverse module with TALXIS's \`talxis_taskdependency\` table already mapped, so it takes only \`reloadOnEditorClosed\` and \`components\`.

## Your own store

\`createDependenciesModule({ createStore })\` takes a store of yours. Its methods are under *Reference* below; when the store only reads, throw from the writes and leave \`enableEditing\` off, as this one does.

{{story: Dependencies your backend works out}}

## From your code

\`useDatasetControlModule('dependencies')\`, or \`modules.get('dependencies')\` on the DatasetControl, returns the module:

| Member | Description |
|---|---|
| \`getDependencies()\`, \`getPredecessors(taskId)\`, \`getSuccessors(taskId)\` | Every dependency, what a task waits on, and what waits on it. |
| \`getCreateDependencyRefusal(predecessorTaskId, successorTaskId)\` | \`'self'\`, \`'duplicate'\` or \`'cycle'\` when the dependency would be refused, \`undefined\` when it would not. \`canCreateDependency\` answers the same as a boolean. |
| \`createDependency({ predecessorTaskId, successorTaskId, type })\` | Creates a dependency and returns it, or \`null\` when it is refused or \`enableEditing\` is off. |
| \`updateDependency(dependencyId, { type })\`, \`deleteDependency(dependencyId)\` | Change and delete one; \`false\` when there is no such dependency or \`enableEditing\` is off. |
| \`isEditable()\` | Whether dependencies can change, which \`enableEditing\` decides. |
| \`reload(taskIds?)\`, \`getError()\` | Load again, every loaded task's when no ids are given, and what the last load threw. |
| \`events.onDependenciesChanged(taskIds)\` | Fires with the tasks whose dependencies changed, at either end. |

{{story: Link tasks from your code}}

## Changing how it looks

Every dependencies factory takes \`components\`, read at mount. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`count\` | \`onRender\`, \`onRenderIcon\`, \`onRenderArrow\`, \`onRenderCount\` | \`DependenciesUiCountComponents\` | The count in a *Predecessors* or *Successors* cell: its box, its icon, its arrow and its number |

{{story: Bold the higher counts}}

## Reference

| Factory | Parameter | Default | Description |
|---|---|---|---|
| Every one | \`reloadOnEditorClosed\` | \`false\`; \`true\` for Dataverse and TALXIS | Reads a task's dependencies again once its form closes. |
| | \`components\` | The defaults | See *Changing how it looks* above. |
| \`createMemoryDependenciesModule\` | \`dependencies\` | Required | The dependencies, keyed by \`id\`. |
| \`createDataverseDependenciesModule\` | \`entityName\` | Required | The dependency table. |
| | \`predecessorAttribute\`, \`successorAttribute\` | Required | Its two lookups to the task table. |
| | \`typeAttribute\` | Required | Its option set of the type. |
| | \`dependencyTypeCodes\` | Required | Every value of that option set, and the type it stands for. |
| \`createDependenciesModule\` | \`createStore\` | Required | Called with the task runtime on every mount. |

### Your own store

| Method | Description |
|---|---|
| \`loadDependencies(taskIds)\` | Every dependency with any of these tasks at either end. |
| \`createDependency({ predecessorTaskId, successorTaskId, type })\` | Creates a dependency and returns it with its \`id\`. |
| \`updateDependency(dependency)\` | Saves a dependency whose type changed. |
| \`deleteDependency(dependencyId)\` | Deletes a dependency. |
| \`destroy()\` | Optional. Called when the mount goes. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Links', iconName: 'Link', href: '?path=/docs/controls-taskgrid-gantt-modules-links--overview', text: 'The dependencies drawn between the bars, and drawn by the user.' },
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'How dates a backend reschedules after a save come back.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-modules--overview', text: 'Every task module, and what each backend needs.' },
]

const meta = {
    title: 'Controls/TaskGrid/Modules/Dependencies',
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

export const CountTheDependencies: Story = {
    name: 'Count the dependencies',
    render: () => renderStory(<DependenciesExample />),
}

export const DependenciesYourBackendWorksOut: Story = {
    name: 'Dependencies your backend works out',
    render: () => renderStory(<DependenciesStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A store of yours that makes each task wait on every sibling that ends before it starts.`,
            },
        },
    },
}

export const LinkTasksFromYourCode: Story = {
    name: 'Link tasks from your code',
    render: () => renderStory(<DependenciesLinkExample />),
    parameters: {
        docs: {
            description: {
                story: `A header button that links the two selected tasks, or says why the link is refused. Try: link two tasks, then link them again.`,
            },
        },
    },
}

export const BoldTheHigherCounts: Story = {
    name: 'Bold the higher counts',
    render: () => renderStory(<DependenciesLookExample />),
    parameters: {
        docs: {
            description: {
                story: `The count drawn in bold where a task has more than one predecessor or successor.`,
            },
        },
    },
}
