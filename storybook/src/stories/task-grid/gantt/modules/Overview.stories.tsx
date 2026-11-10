import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttModulesExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The Gantt itself lines the tasks up on a timeline; dragging bars, drawing links, marking today and the rest come from modules, as on the task grid (see the task grid's [**Modules**](?path=/docs/controls-taskgrid-modules--overview)). You pass them to \`TaskGantt\`'s \`modules\`, and it loads them on every mount, the library first. Try it below: delete \`createLinksModule()\` in **Code**.

{{canvas: Pick the features}}

## The modules

| Module | Factory | Needs | Description |
|---|---|---|---|
| Library | \`createLibraryModule()\`, \`createProLibraryModule({ Gantt })\` | | DHTMLX Gantt itself. Required. See *The library* below. |
| [**Editing on the timeline**](?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview) | \`createBarDraggingModule()\` | \`enableEditing\` | Moving and resizing bars. |
| | \`createTaskDrawingModule()\` | \`enableCreation\`, \`enableEditing\` | Drawing a new task with Ctrl+drag, and the dates of a task that has none. |
| | \`createTaskSelectionModule()\` | | Selecting tasks from the chart, in the grid's selection. |
| [**Markers**](?path=/docs/controls-taskgrid-gantt-modules-markers--overview) | \`createMarkersModule()\`, \`createMemoryMarkersModule()\` | The [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module, for the project's markers | Today, the project's start and end, and dates of your own. |
| [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) | \`createNonWorkingDaysModule()\`, \`createMemoryNonWorkingDaysModule()\` | \`TaskDatasetControl.Settings\`, to hide them | Weekends and holidays, shaded and left out of durations. |
| [**Tooltip**](?path=/docs/controls-taskgrid-gantt-modules-tooltip--overview) | \`createTaskTooltipModule()\` | | What a bar says when the pointer is on it. |
| [**Links**](?path=/docs/controls-taskgrid-gantt-modules-links--overview) | \`createLinksModule()\` | The [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) module | Dependencies drawn between the bars, and drawn by the user. |
| Your own | An \`IGanttModule\` | | See [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview). |

Every factory above comes from \`@talxis/base-controls/gantt\`. The task modules some of them need, such as Project and Dependencies, come from \`@talxis/base-controls\` and go in \`TaskDatasetControl\`'s \`modules\`, as in the example.

\`createMarkersModule\` and \`createNonWorkingDaysModule\` take a \`createStore(taskRuntime)\` for a store of your own, as the task modules do: see *Your own store* on the task grid's [**Modules**](?path=/docs/controls-taskgrid-modules--overview). Their memory variants take the data itself.

## The library

\`createLibraryModule()\` brings the free build of DHTMLX Gantt, with its stylesheet. Everything on these pages works with it.

To use your own DHTMLX Gantt PRO licence, pass its \`Gantt\` export to \`createProLibraryModule\` instead, and import its stylesheet yourself, as the example's *pro.ts* does. \`createLibraryModule\` imports the free build and its stylesheet, and a production build that tree-shakes leaves both out when you use only \`createProLibraryModule\`; a dev server still loads them. A module of your own reads which build is loaded with \`getLibrary()\`: see [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Editing on the timeline', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, draw new tasks, and select them from the chart.' },
    { title: 'Links', iconName: 'Link', href: '?path=/docs/controls-taskgrid-gantt-modules-links--overview', text: 'Dependencies drawn between the bars, and drawn by the user.' },
    { title: 'Write a module', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-gantt-write-a-module--overview', text: 'Colour bars, relabel the scale, and draw over the chart.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules',
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

export const PickTheFeatures: StoryObj<typeof meta> = {
    name: 'Pick the features',
    render: () => renderStory(<GanttModulesExample />),
}
