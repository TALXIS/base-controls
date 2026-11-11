import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttModulesExample, GanttProLibraryExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
On its own, the Gantt only lines the tasks up on a timeline; every feature on top, from dragging bars to marking holidays, is a module you add. A feature you leave out is not loaded at all, and a feature that keeps data, such as markers or non-working days, lets you choose where that data comes from. Try it below: delete \`createLinksModule()\` in **Code**.

{{canvas: Pick the features}}

## The modules

Pass the modules to \`TaskGantt\`'s \`modules\`; the Gantt loads them on every mount, the library first. Every factory comes from \`@talxis/base-controls/gantt\`. The task modules some of them read, such as Project and Dependencies, come from \`@talxis/base-controls\` and go in \`TaskDatasetControl\`'s \`modules\`, as in the example: see the task grid's [**Modules**](?path=/docs/controls-taskgrid-modules--overview).

| Module | Factory | Needs | Adds |
|---|---|---|---|
| Library | \`createLibraryModule()\`, \`createProLibraryModule({ Gantt })\` | | DHTMLX Gantt, which draws the chart. Required. See *The library* below. |
| [**Editing on the timeline**](?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview) | \`createBarDraggingModule()\` | \`enableEditing\`, and \`createTaskEditingModule()\` in \`TaskGrid\` | Moving and resizing bars. |
| | \`createTaskDrawingModule()\` | \`enableCreation\` for new tasks; for dates, what bar dragging needs | Drawing new tasks, and the dates of tasks that have none. |
| | \`createTaskSelectionModule()\` | \`createRowSelectionModule()\` in \`TaskGrid\`, for the grid to show the selection | Selecting tasks on the chart. |
| [**Markers**](?path=/docs/controls-taskgrid-gantt-modules-markers--overview) | \`createMarkersModule()\`, \`createMemoryMarkersModule()\` | The [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module, for the project's start and end | Today, the project's start and end, and dates of your own. |
| [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) | \`createNonWorkingDaysModule()\`, \`createMemoryNonWorkingDaysModule()\` | \`TaskDatasetControl.Settings\`, for the user to hide them | Weekends and holidays, shaded and left out of durations. |
| [**Tooltip**](?path=/docs/controls-taskgrid-gantt-modules-tooltip--overview) | \`createTaskTooltipModule()\` | | What a bar says when the pointer is on it. |
| [**Links**](?path=/docs/controls-taskgrid-gantt-modules-links--overview) | \`createLinksModule()\` | A [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) module; without one, the Gantt fails with an error saying so | Dependencies drawn between the bars, and drawn by the user. |
| Your own | An \`IGanttModule\` | | See [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview). |

## Where the data comes from

Each feature that draws data comes ready to use, in memory, or from a backend of your own. Bar dragging, task drawing, task selection and the tooltip keep no data of their own: the dates they change are saved through the task store.

| Feature | Ready to use | In memory | Your own |
|---|---|---|---|
| Library | \`createLibraryModule()\`: the free build of DHTMLX Gantt | | \`createProLibraryModule({ Gantt })\`: your DHTMLX Gantt PRO build |
| Markers | \`createMarkersModule()\`: today, and the project's start and end | \`createMemoryMarkersModule({ markers })\` | \`createMarkersModule({ createStore })\` |
| Non-working days | \`createNonWorkingDaysModule()\`: weekends | \`createMemoryNonWorkingDaysModule({ nonWorkingDays })\` | \`createNonWorkingDaysModule({ createStore })\` |
| Links | | \`createMemoryDependenciesModule({ dependencies })\` | \`createDataverseDependenciesModule\`, \`createTalxisDependenciesModule\` or \`createDependenciesModule({ createStore })\`: see [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) |
| The project's markers | | \`createMemoryProjectModule\` | \`createDataverseProjectModule\` or \`createProjectModule\`: see [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) |

A memory module reads a \`MemoryTable\` of plain rows, its dates as ISO strings: see *Memory* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). A store of your own is an object with one async method, \`loadMarkers()\` or \`loadNonWorkingDays()\`, that the module calls on every mount and on its \`reload()\`. \`createStore\` is called on every mount with the task runtime, so a store can read the view's project. The chart does not wait for a store: what it loads shows up once it arrives, and when it fails, the user sees an error and the chart goes on without it. [**Markers**](?path=/docs/controls-taskgrid-gantt-modules-markers--overview) and [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) each show a store that runs on the page, and one that loads from a server.

## The library

The library module brings <a href="https://dhtmlx.com/docs/products/dhtmlxGantt/" target="_blank" rel="noreferrer">DHTMLX Gantt</a>, which draws the chart. Every module on these pages works the same with either build.

| | \`createLibraryModule()\` | \`createProLibraryModule({ Gantt })\` |
|---|---|---|
| Build | The free build, \`dhtmlx-gantt\`, under the MIT licence, installed with \`@talxis/base-controls\` | Your DHTMLX Gantt PRO build, under your DHTMLX licence: pass its \`Gantt\` export |
| Stylesheet | Imported for you | Import the PRO build's yourself |
| \`gantt.getLibrary().isPro\` | \`false\` | \`true\` |

PRO adds the features DHTMLX keeps for PRO licences, which a module of your own turns on with \`hooks.chartConfig\` and checks for with \`getLibrary().isPro\`: see [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview). \`createLibraryModule\` imports the free build and its stylesheet, so a production build that tree-shakes leaves both out when only \`createProLibraryModule\` is used; a dev server still loads them.

{{story: Use your PRO licence}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Editing on the timeline', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, draw new tasks, and select them on the chart.' },
    { title: 'Markers', iconName: 'Flag', href: '?path=/docs/controls-taskgrid-gantt-modules-markers--overview', text: 'Today, the project\'s start and end, and dates from a store of your own.' },
    { title: 'Write a module', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-gantt-write-a-module--overview', text: 'Colour bars, add class names and styles, and draw over the chart.' },
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
type Story = StoryObj<typeof meta>

export const PickTheFeatures: Story = {
    name: 'Pick the features',
    render: () => renderStory(<GanttModulesExample />),
}

export const UseYourProLicence: Story = {
    name: 'Use your PRO licence',
    render: () => renderStory(<GanttProLibraryExample />),
    parameters: {
        docs: {
            description: {
                story: `The free build drawing the chart, with the PRO library module in *pro.ts*. Try: open *pro.ts* in **Code**.`,
            },
        },
    },
}
