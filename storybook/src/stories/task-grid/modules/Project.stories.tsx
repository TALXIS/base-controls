import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ProjectExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
Tasks usually belong to a project, and several parts of a task grid need to know which one: to fill it in on new tasks, narrow lookups to it, or mark its start and end on the Gantt. The project module loads that project before the tasks, on every mount, and draws nothing itself. Try it below: change the project's \`name\` in **Code**.

{{canvas: Read the project}}

## What reads it

| Reader | What it reads |
|---|---|
| \`DataverseTaskStore\` | \`project\` in its FetchXML, and the task's lookup to the project, filled in on every new task. See [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). |
| \`createDataverseLookupManyModule\` | \`project\` in each column's FetchXML. See [**Lookup many**](?path=/docs/controls-taskgrid-modules-lookup-many--overview). |
| The Gantt's markers | The project's start and end, as two markers. See [**Markers**](?path=/docs/controls-taskgrid-gantt-modules-markers--overview). |
| The Gantt's *Zoom to fit* | The project's dates, when no task has any. |

## The project

| Field | Description |
|---|---|
| \`id\` | Required. |
| \`name\` | The project's name. |
| \`entityName\` | The table the project lives in. |
| \`startDate\`, \`endDate\` | \`Dayjs\` dates. |
| \`data\` | Anything else, such as the project's own columns. In FetchXML, its keys are fields of \`project\`. |

## Where the project is kept

| Factory | Parameters |
|---|---|
| \`createMemoryProjectModule\` | \`projects\`: a [**\`MemoryTable\`**](?path=/docs/controls-taskgrid-loading-tasks--overview) of projects as above, their dates as ISO strings; \`projectId\`: the one the grid shows. |
| \`createDataverseProjectModule\` | \`entityName\` and \`id\` of the project's record, \`startDateColumn\` and \`endDateColumn\` for its dates, and \`columns\`, more columns to read into \`data\`. |
| \`createProjectModule\` | \`createStore\`: a store with \`loadProject()\`, which returns the project. |

The example's *dataverse.ts* reads the project from Dataverse.

## From your code

\`control.modules.find('project')\` returns the module from the DatasetControl, as the example does on \`onReady\`. It has \`getId()\`, \`getName()\`, \`getEntityName()\`, \`getStartDate()\`, \`getEndDate()\` and \`getData()\`.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'Load the project\'s tasks from Dataverse with FetchXML.' },
    { title: 'Markers', iconName: 'Flag', href: '?path=/docs/controls-taskgrid-gantt-modules-markers--overview', text: 'The project\'s start and end marked on the Gantt.' },
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

export const ReadTheProject: StoryObj<typeof meta> = {
    name: 'Read the project',
    render: () => renderStory(<ProjectExample />),
}
