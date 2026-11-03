import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GanttModulesExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The Gantt's features are modules, passed to \`TaskGantt\`'s \`modules\` and loaded in that order on every mount.

{{story: Pick the features}}

## The modules

| Module | Factory | Needs | Description |
|---|---|---|---|
| Library | \`createLibraryModule()\`, \`createProLibraryModule({ Gantt })\` | | DHTMLX Gantt itself. Required. See *The library* below. |
| [**Editing on the timeline**](?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview) | \`createBarDraggingModule()\` | \`enableEditing\` | Moving and resizing bars. |
| | \`createTaskDrawingModule()\` | \`enableCreation\` | Drawing a new task with Ctrl+drag. |
| | \`createTaskSelectionModule()\` | | Selecting tasks from the chart. |
| [**Markers**](?path=/docs/controls-taskgrid-gantt-modules-markers--overview) | \`createMarkersModule()\`, \`createMemoryMarkersModule()\` | The [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module, for the project's markers | Today, the project's start and end, and dates of your own. |
| [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) | \`createNonWorkingDaysModule()\`, \`createMemoryNonWorkingDaysModule()\` | \`TaskDatasetControl.Settings\`, to hide them | Weekends and holidays, shaded and left out of durations. |
| [**Tooltip**](?path=/docs/controls-taskgrid-gantt-modules-tooltip--overview) | \`createTaskTooltipModule()\` | | What a bar says when the pointer is on it. |
| [**Links**](?path=/docs/controls-taskgrid-gantt-modules-links--overview) | \`createLinksModule()\` | The [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) module | Dependencies drawn between the bars, and drawn by the user. |
| Your own | An \`IGanttModule\` | | See [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview). |

\`createMarkersModule\` and \`createNonWorkingDaysModule\` take an \`onCreateStore(taskRuntime)\` for a store of your own, as the task modules do: see *Your own store* on [**Task grid › Modules**](?path=/docs/controls-taskgrid-modules--overview). Their memory variants take the data itself.

## The library

\`createLibraryModule()\` brings the free build of DHTMLX Gantt, with its stylesheet. Everything on these pages works with it.

To use your own DHTMLX Gantt PRO licence, pass its \`Gantt\` export to \`createProLibraryModule\` instead, and import its stylesheet yourself:

\`\`\`tsx
import { Gantt } from 'dhtmlx-gantt-pro'
import 'dhtmlx-gantt-pro/codebase/dhtmlxgantt.css'

const ganttModules = [createProLibraryModule({ Gantt })]
\`\`\`

A module of yours reaches the build with \`gantt.getLibrary()\`.
`

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules',
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

export const Overview: StoryObj<typeof meta> = {
    name: 'Overview',
    render: () => <></>,
}

export const PickTheFeatures: StoryObj<typeof meta> = {
    name: 'Pick the features',
    render: () => renderStory(<GanttModulesExample />),
    parameters: {
        docs: {
            description: {
                story: `The library with bar dragging, the tooltip and links. Try: drag a bar and point at it, then delete \`createLinksModule()\` in **Code** and watch the links go.`,
            },
        },
    },
}
