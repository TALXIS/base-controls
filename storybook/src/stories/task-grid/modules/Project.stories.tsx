import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ProjectExample, ProjectStoreExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
Tasks usually belong to a project, and several parts of a task grid need to know which one: to fill it in on new tasks, offer only its people in a lookup, or mark its start and end on the Gantt. The project module loads that project before the tasks, on every mount, and draws nothing itself. Try it below: set \`projectId\` to \`'mobile'\` in **Code**.

{{canvas: Show the project}}

## What reads the project

| Reader | Reads |
|---|---|
| \`DataverseTaskStore\` | \`project\` in its FetchXML. On every new task it fills in the task table's lookup to the project's table, or, when there are several, the one its FetchXML filters on by the project's id; when it cannot tell which, the tasks fail to load. See [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). |
| \`createDataverseLookupManyModule\` | \`project\` in each column's FetchXML. See [**Lookup many**](?path=/docs/controls-taskgrid-modules-lookup-many--overview). |
| The Gantt's markers | Its start and end. See [**Markers**](?path=/docs/controls-taskgrid-gantt-modules-markers--overview). |
| The Gantt's *Zoom to fit* | Its dates, when no task has any. |
| Your code | \`useDatasetControlModule('project')\` inside the control, as the example's header does, or \`modules.get('project')\` on the DatasetControl. |

## The project

| Field | Description |
|---|---|
| \`id\` | Required. |
| \`name\` | The project's name. |
| \`entityName\` | The table the project lives in. \`DataverseTaskStore\` fills in the project lookup only when it is set. |
| \`startDate\`, \`endDate\` | \`Dayjs\` dates. |
| \`data\` | Anything else, such as more of the project's columns. In FetchXML, its keys are fields of \`project\`. |

The module hands them out through \`getId()\`, \`getName()\`, \`getEntityName()\`, \`getStartDate()\`, \`getEndDate()\` and \`getData()\`.

## In memory

\`createMemoryProjectModule\` reads the row \`projectId\` names from the \`projects\` [**\`MemoryTable\`**](?path=/docs/controls-taskgrid-loading-tasks--overview), a project as above with its dates as ISO strings. Without that row, the control fails to load.

## In Dataverse and TALXIS

\`createDataverseProjectModule\` reads the project's record through the PCF context's Web API: its primary name, the two date columns you name, and \`columns\` into \`data\`. The example's *dataverse.ts* reads the project and loads its tasks with \`{{ project.id }}\` in the FetchXML. A TALXIS project loads the same way.

## Your own store

\`createProjectModule({ createStore })\` takes a store whose \`loadProject()\` returns the project. It is called on every mount before the tasks load, so \`onLoad\` can read the project already.

{{story: A project from your own store}}

## Reference

| Factory | Parameter | Description |
|---|---|---|
| \`createMemoryProjectModule\` | \`projects\` | Required. A \`MemoryTable\` of projects, keyed by \`id\`. |
| | \`projectId\` | Required. The project the grid shows. |
| \`createDataverseProjectModule\` | \`entityName\` | Required. The project's table. |
| | \`id\` | Required. The project record's id. |
| | \`startDateColumn\`, \`endDateColumn\` | The columns holding its start and end. |
| | \`columns\` | More columns to read into \`data\`, by name. |
| \`createProjectModule\` | \`createStore\` | Required. Called with the task runtime on every mount; returns a store with \`loadProject()\` and an optional \`destroy()\`. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'Load the project\'s tasks from Dataverse with FetchXML.' },
    { title: 'Markers', iconName: 'Flag', href: '?path=/docs/controls-taskgrid-gantt-modules-markers--overview', text: 'The project\'s start and end marked on the Gantt.' },
    { title: 'Lookup many', iconName: 'People', href: '?path=/docs/controls-taskgrid-modules-lookup-many--overview', text: 'Offer only the project\'s people, with FetchXML that reads the project.' },
]

const meta = {
    title: 'Controls/TaskGrid/Modules/Project',
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

export const ShowTheProject: Story = {
    name: 'Show the project',
    render: () => renderStory(<ProjectExample />),
}

export const AProjectFromYourOwnStore: Story = {
    name: 'A project from your own store',
    render: () => renderStory(<ProjectStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A store of yours reads the project, and \`onLoad\` shows only the tasks under it. Try: set \`PROJECT_ID\` to \`'05000000-0000-0000-0000-000000000000'\`.`,
            },
        },
    },
}
