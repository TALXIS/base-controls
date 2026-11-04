import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { DependenciesExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A dependency says that one task waits on another. The dependencies module holds the tasks' dependencies and counts them in a *Predecessors* and a *Successors* column, and the Gantt's [**Links**](?path=/docs/controls-taskgrid-gantt-modules-links--overview) module draws them between the bars. Try it below: delete a task and watch its neighbours' counts drop.

{{canvas: Count the dependencies}}

## A dependency

| Field | Description |
|---|---|
| \`id\` | The dependency's id. |
| \`predecessorTaskId\` | The task that comes first. |
| \`successorTaskId\` | The task that waits on it. |
| \`type\` | \`'finishToStart'\`, \`'startToStart'\`, \`'finishToFinish'\` or \`'startToFinish'\`. |

A dependency joins two different tasks, once, without a cycle, and can change while \`enableEditing\` is on. While one saves, both its tasks show as saving. Deleting a task drops its dependencies.

## Where dependencies are kept

| Factory | Keeps the dependencies |
|---|---|
| \`createMemoryDependenciesModule\` | In memory. \`dependencies\` are the starting ones. |
| \`createDataverseDependenciesModule\` | In a Dataverse table of your own: two lookups to the task table, and an option set of the type. The example's *dataverse.ts* keeps them there. |
| \`createTalxisDependenciesModule\` | In TALXIS's \`talxis_taskdependency\` table. |
| \`createDependenciesModule\` | In a store of yours: \`onCreateStore\` returns an \`IDependenciesStore\`. |

Every factory also takes \`reloadOnEditorClosed\`, to read a task's dependencies again once its form closes (\`true\` for Dataverse and TALXIS), and \`components\` (see *Changing how it looks* below).

## From your code

\`taskRuntime.services.get('datasetControl').modules.find('dependencies')\` returns the module, with \`getPredecessors(taskId)\`, \`getSuccessors(taskId)\`, \`canCreateDependency(predecessorTaskId, successorTaskId)\`, \`createDependency(dependency)\`, \`updateDependency(dependencyId, { type })\` and \`deleteDependency(dependencyId)\`. \`events.onDependenciesChanged\` fires with the tasks whose dependencies changed.

## Changing how it looks

Every dependencies factory takes \`components\`, read at mount. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`count\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderArrow\`, \`onRenderCount\` | \`DependencyCountComponents\` | The count in the *Predecessors* and *Successors* cells |

## Reference

### Dataverse

| Parameter | Description |
|---|---|
| \`entityName\` | The dependency table. |
| \`predecessorAttribute\`, \`successorAttribute\` | Its two lookups to the task table. |
| \`typeAttribute\` | Its option set of the type. |
| \`dependencyTypeCodes\` | Every value of that option set, and the type it stands for. |

### Your own store

| Method | Description |
|---|---|
| \`onLoadDependencies(taskIds)\` | Every dependency with any of these tasks at either end. |
| \`onCreateDependency(dependency)\` | Creates a dependency and returns it with its \`id\`. |
| \`onUpdateDependency(dependency)\` | Saves a changed type. |
| \`onDeleteDependency(dependencyId)\` | Deletes a dependency. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Links', iconName: 'Link', href: '?path=/docs/controls-taskgrid-gantt-modules-links--overview', text: 'The dependencies drawn between the bars, and drawn by the user.' },
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'How dates a backend reschedules after a save come back.' },
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
