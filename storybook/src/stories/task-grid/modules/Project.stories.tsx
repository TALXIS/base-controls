import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../../grid/gridDocsPage'

const DESCRIPTION = `
The project module loads the project the tasks belong to, before the tasks load on every mount. It draws nothing itself: other parts read it.

\`\`\`tsx
const controlModules = React.useMemo(() => [
    createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
], [])

<TaskDatasetControl modules={controlModules} onLoad={loadTasks}>...</TaskDatasetControl>
\`\`\`

## What reads it

| Reader | What it reads |
|---|---|
| \`DataverseTaskStore\` | \`project\` in its FetchXML, and the task's lookup to the project, filled in on every new task. See [**Loading tasks**](?path=/docs/taskgrid-loading-tasks--overview). |
| \`createDataverseLookupManyModule\` | \`project\` in each column's FetchXML. See [**Lookup many**](?path=/docs/taskgrid-modules-lookup-many--overview). |
| The Gantt's markers | The project's start and end, as two markers. See [**Gantt › Markers**](?path=/docs/taskgrid-gantt-modules-markers--overview). |
| The Gantt's *Zoom to fit* | The project's dates, when no task has any. |
| Your code | \`taskRuntime.services.get('datasetControl').modules.find('project')\`, with \`getId()\`, \`getName()\`, \`getEntityName()\`, \`getStartDate()\`, \`getEndDate()\` and \`getData()\`. |

## The project

| Field | Description |
|---|---|
| \`id\` | Required. |
| \`name\` | The project's name. |
| \`entityName\` | The table the project lives in. |
| \`startDate\`, \`endDate\` | \`Dayjs\` dates. |
| \`data\` | Anything else, such as the project's own columns. In FetchXML, its keys are fields of \`project\`. |

## Where it comes from

| Factory | Parameters |
|---|---|
| \`createMemoryProjectModule\` | \`project\`: the project above. |
| \`createDataverseProjectModule\` | \`entityName\` and \`id\` of the project's record, \`startDateColumn\` and \`endDateColumn\` for its dates, and \`columns\`, more columns to read into \`data\`. |
| \`createProjectModule\` | \`onCreateStore\`: a store with \`onLoadProject()\`, which returns the project. |

\`\`\`tsx
createDataverseProjectModule({ entityName: 'msdyn_project', id: projectId, startDateColumn: 'msdyn_scheduledstart', endDateColumn: 'msdyn_finish', columns: ['msdyn_customer'] })
\`\`\`

`

const meta = {
    title: 'TaskGrid/Modules/Project',
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
