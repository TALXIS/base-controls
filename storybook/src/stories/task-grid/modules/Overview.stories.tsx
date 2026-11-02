import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../../grid/gridDocsPage'

const DESCRIPTION = `
Everything beyond the tree is a module. A task grid takes modules in two places:

\`\`\`tsx
const controlModules = React.useMemo(() => [
    createTaskDraggingModule(),
    createMemoryChecklistModule({ items: CHECKLIST_ITEMS }),
    createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'tasks.views' }),
], [])
const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule()], [])

<TaskDatasetControl modules={controlModules} onLoad={loadTasks}>
    <DatasetControl.Body>
        <TaskGrid modules={gridModules} />
    </DatasetControl.Body>
</TaskDatasetControl>
\`\`\`

The task modules below go in \`TaskDatasetControl\`'s \`modules\`, next to DatasetControl modules such as user views, and are read on every mount. \`TaskGrid\`'s \`modules\` take Grid modules (selection, sorting, filtering, cell selection, clipboard, the licence, the legacy client API; see [**Grid › Modules**](?path=/docs/grid-modules--overview)), with \`createTaskEditingModule()\` in place of the Grid's editing module. The [**Gantt**](?path=/docs/taskgrid-gantt-modules--overview) has modules of its own.

## The modules

A module that keeps data comes in variants: one per backend, and a base factory for a store of your own.

| Module | Description | Memory | Dataverse | TALXIS | Your own store |
|---|---|---|---|---|---|
| [**Project**](?path=/docs/taskgrid-modules-project--overview) | The project the tasks belong to. | \`createMemoryProjectModule\` | \`createDataverseProjectModule\` | | \`createProjectModule\` |
| [**Custom columns**](?path=/docs/taskgrid-modules-custom-columns--overview) | Columns users add to the tasks themselves. | \`createIndexedDbCustomColumnsModule\`, in the browser | | \`createTalxisCustomColumnsModule\` | \`createCustomColumnsModule\` |
| [**Lookup many**](?path=/docs/taskgrid-modules-lookup-many--overview) | Columns of many related records, such as assignees and tags. | \`createMemoryLookupManyModule\` | \`createDataverseLookupManyModule\` | | \`createLookupManyModule\` |
| [**Templates**](?path=/docs/taskgrid-modules-templates--overview) | Tasks created from a template, and saved as one. | \`createMemoryTemplatesModule\` | | | \`createTemplatesModule\` |
| [**Checklist**](?path=/docs/taskgrid-modules-checklist--overview) | Each task's checklist progress. | \`createMemoryChecklistModule\` | | \`createTalxisChecklistModule\` | \`createChecklistModule\` |
| [**Dependencies**](?path=/docs/taskgrid-modules-dependencies--overview) | Which tasks wait on which. | \`createMemoryDependenciesModule\` | \`createDataverseDependenciesModule\` | \`createTalxisDependenciesModule\` | \`createDependenciesModule\` |
| Dragging | Moving tasks by dragging their rows. See *Move* on [**Working with tasks**](?path=/docs/taskgrid-working-with-tasks--overview). | | | | |

User views come in the same variants: see *Where user views are kept* on [**DatasetControl › Views**](?path=/docs/datasetcontrol-views--overview).

*Memory* keeps the data in the page, starts over on every mount and pauses briefly like a server: right for prototypes, tests and these docs. *Dataverse* reads and writes tables you map to the module through the PCF context's Web API, and *TALXIS* is Dataverse with the TALXIS tables already mapped.

## Your own store

The base factory takes \`onCreateStore\`, which the module calls with the task runtime on every mount:

\`\`\`tsx
createChecklistModule({ onCreateStore: taskRuntime => new MyChecklistStore(taskRuntime) })
\`\`\`

A store implements the module's \`I…Store\`, listed on each module's page. Its writes are required, so throw "Not implemented." from one your backend lacks; an optional \`destroy()\` runs when the module goes.

## Columns from modules

Lookup many, Checklist, Dependencies and Custom columns add columns whose values are kept apart from the tasks. They show in Edit columns, and a view shows them by listing them by name. Their values load after the tasks, and their cells show a loading state until they arrive. A sort, filter or search on one of them waits for its values first.

Modules that draw something take \`components\` to change it (see *Changing how it looks* on each module's page), and every module's strings are labels (see [**Localization**](?path=/docs/taskgrid-localization--overview)).
`

const meta = {
    title: 'TaskGrid/Modules',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
        },
    },
} satisfies Meta

export default meta

export const Overview: StoryObj<typeof meta> = {
    name: 'Overview',
    render: () => <></>,
}
