import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../../../grid/gridDocsPage'

const DESCRIPTION = `
The Gantt's features are modules, passed to \`TaskGantt\`'s \`modules\` and loaded in that order on every mount. A feature you leave out is not there at all.

\`\`\`tsx
import { createBarDraggingModule, createLibraryModule, createLinksModule, createTaskTooltipModule, TaskGantt } from '@talxis/base-controls/gantt'

const ganttModules = React.useMemo(() => [
    createLibraryModule(),
    createBarDraggingModule(),
    createTaskTooltipModule({ statusColumnName: 'statuscode' }),
    createLinksModule(),
], [])

<TaskGantt modules={ganttModules} />
\`\`\`

## The modules

| Module | Factory | Needs | Description |
|---|---|---|---|
| Library | \`createLibraryModule()\`, \`createProLibraryModule({ Gantt })\` | | DHTMLX Gantt itself. Required. See *The library* below. |
| [**Editing on the timeline**](?path=/docs/taskgrid-gantt-modules-editing-on-the-timeline--overview) | \`createBarDraggingModule()\` | \`enableEditing\` | Moving and resizing bars. |
| | \`createTaskDrawingModule()\` | \`enableCreation\` | Drawing a new task with Ctrl+drag. |
| | \`createTaskSelectionModule()\` | | Selecting tasks from the chart. |
| [**Markers**](?path=/docs/taskgrid-gantt-modules-markers--overview) | \`createMarkersModule()\`, \`createMemoryMarkersModule()\` | The [**Project**](?path=/docs/taskgrid-modules-project--overview) module, for the project's markers | Today, the project's start and end, and dates of your own. |
| [**Non-working days**](?path=/docs/taskgrid-gantt-modules-non-working-days--overview) | \`createNonWorkingDaysModule()\`, \`createMemoryNonWorkingDaysModule()\` | \`TaskDatasetControl.Settings\`, to hide them | Weekends and holidays, shaded and left out of durations. |
| [**Tooltip**](?path=/docs/taskgrid-gantt-modules-tooltip--overview) | \`createTaskTooltipModule()\` | | What a bar says when the pointer is on it. |
| [**Links**](?path=/docs/taskgrid-gantt-modules-links--overview) | \`createLinksModule()\` | The [**Dependencies**](?path=/docs/taskgrid-modules-dependencies--overview) module | Dependencies drawn between the bars, and drawn by the user. |
| Your own | An \`IGanttModule\` | | See [**Write a module**](?path=/docs/taskgrid-gantt-write-a-module--overview). |

\`createMarkersModule\` and \`createNonWorkingDaysModule\` take an \`onCreateStore(taskRuntime)\` for a store of your own, as the task modules do: see *Your own store* on [**Task grid › Modules**](?path=/docs/taskgrid-modules--overview). Their memory variants take the data itself.

## The library

\`createLibraryModule()\` brings the free build of DHTMLX Gantt, with its stylesheet. Everything on these pages works with it.

To use your own DHTMLX Gantt PRO licence, pass its \`Gantt\` export to \`createProLibraryModule\` instead, and import its stylesheet yourself:

\`\`\`tsx
//the Gantt export and the stylesheet of your PRO build
import { Gantt } from 'dhtmlx-gantt-pro'
import 'dhtmlx-gantt-pro/codebase/dhtmlxgantt.css'

const ganttModules = [createProLibraryModule({ Gantt }), createBarDraggingModule()]
\`\`\`

A module of yours reaches the build with \`gantt.getLibrary()\`.
`

const meta = {
    title: 'TaskGrid/Gantt/Modules',
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
