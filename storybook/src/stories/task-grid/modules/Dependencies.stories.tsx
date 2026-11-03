import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { DependenciesExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A dependency says that one task waits on another. The dependencies module holds the tasks' dependencies, and shows how many each task has in a *Predecessors* and a *Successors* column. The [**Gantt**](?path=/docs/controls-taskgrid-gantt-modules-links--overview) draws them as links between the bars, and lets the user draw and delete them.

\`\`\`tsx
const controlModules = React.useMemo(() => [createMemoryDependenciesModule({ dependencies: DEPENDENCIES })], [])
\`\`\`

A view shows the columns by listing \`predecessors__virtual\` and \`successors__virtual\`, as \`Lookup.Simple\` columns. They are offered in Edit columns too.

{{story: Count the dependencies}}

## A dependency

| Field | Description |
|---|---|
| \`id\` | The dependency's id. |
| \`predecessorTaskId\` | The task that comes first. |
| \`successorTaskId\` | The task that waits on it. |
| \`type\` | \`'finishToStart'\`, \`'startToStart'\`, \`'finishToFinish'\` or \`'startToFinish'\`. |

A dependency joins two different tasks, once, without a cycle, and can change while \`enableEditing\` is on. While one saves, both its tasks show as saving; afterwards the store reads the tasks again, for dates the backend rescheduled. Deleting a task drops its dependencies.

## Where dependencies are kept

| Factory | Keeps the dependencies |
|---|---|
| \`createMemoryDependenciesModule\` | In memory. \`dependencies\` are the starting ones. |
| \`createDataverseDependenciesModule\` | In a Dataverse table of your own: two lookups to the task table, and an option set of the type. |
| \`createTalxisDependenciesModule\` | In TALXIS's \`talxis_taskdependency\` table. |
| \`createDependenciesModule\` | In a store of yours: \`onCreateStore\` returns an \`IDependenciesStore\`. |

Every factory also takes \`reloadOnEditorClosed\`, to read a task's dependencies again once its form closes (\`true\` for Dataverse and TALXIS), and \`components\` (see *Changing how it looks* below).

### Dataverse

\`\`\`tsx
createDataverseDependenciesModule({
    entityName: 'new_taskdependency',
    predecessorAttribute: 'new_predecessorid',
    successorAttribute: 'new_successorid',
    typeAttribute: 'new_type',
    dependencyTypeCodes: { 1: 'finishToStart', 2: 'startToStart', 3: 'finishToFinish', 4: 'startToFinish' },
})
\`\`\`

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

## Changing how it looks

Every dependencies factory takes \`components\`, read at mount. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`count\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderArrow\`, \`onRenderCount\` | \`DependencyCountComponents\` | The count in the *Predecessors* and *Successors* cells |

## From your code

\`taskRuntime.services.get('datasetControl').modules.find('dependencies')\` returns the module, with \`getPredecessors(taskId)\`, \`getSuccessors(taskId)\`, \`canCreateDependency(predecessorTaskId, successorTaskId)\`, \`createDependency(dependency)\`, \`updateDependency(dependencyId, { type })\` and \`deleteDependency(dependencyId)\`. \`events.onDependenciesChanged\` fires with the tasks whose dependencies changed.
`

const meta = {
    title: 'Controls/TaskGrid/Modules/Dependencies',
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

export const CountTheDependencies: Story = {
    name: 'Count the dependencies',
    render: () => renderStory(<DependenciesExample />),
    parameters: {
        docs: {
            description: {
                story: `Dependencies in memory: under every other parent, each task waits on the one before it. Try: delete a task and watch its neighbours' counts drop.`,
            },
        },
    },
}
