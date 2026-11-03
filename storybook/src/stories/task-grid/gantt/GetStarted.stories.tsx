import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { GanttShowcaseExample } from '../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The Gantt draws the task grid's tasks on a timeline, row for row with the grid beside it: same order, same tree, same scroll. It is drawn with <a href="https://dhtmlx.com/docs/products/dhtmlxGantt/" target="_blank" rel="noreferrer">DHTMLX Gantt</a>, and everything beyond the bars is a module: dragging bars, drawing tasks, links, markers, non-working days and tooltips.

Below are the sample projects. Try: zoom with the slider or Ctrl+wheel, drag a bar or its ends, hold Ctrl and drag over a row to draw a task, drag from the end of one bar to another to link them, and point at a bar. Open **Code** to read and edit the source.

{{canvas: Overview}}

## Basic usage

\`\`\`tsx
import { createLibraryModule, TaskGantt } from '@talxis/base-controls/gantt'

const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    startDate: 'scheduledstart',
    endDate: 'scheduledend',
}

const ganttModules = [createLibraryModule()]

<TaskDatasetControl onLoad={loadTasks} height='600px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <TaskGantt.ZoomSlider />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
\`\`\`

The Gantt has its own entry, \`@talxis/base-controls/gantt\`, so a task grid without one never loads DHTMLX. It needs \`startDate\` and \`endDate\` in the task grid's field mapping (see [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview)) and a library module (see [**Modules**](?path=/docs/controls-taskgrid-gantt-modules--overview)). \`TaskGantt.Split\` puts it beside the grid, with a handle between them.

## What it draws

| A task | Is drawn as |
|---|---|
| with a start and an end | a bar, filled as far as \`percentComplete\` |
| that starts and ends at the same time | a milestone diamond |
| with subtasks, while the tree is shown | a thinner summary bar |
| missing a date, or ending before it starts | nothing |

Names stay in the grid. Started, done, inactive, locked and saving tasks each have a look of their own.

## Dates

| Date columns | The end date is | Bars snap to | Zoom goes down to |
|---|---|---|---|
| both date only | the task's last day | whole days | days |
| either with a time of day | the moment it ends | 15 minutes to 12 hours, by zoom | hours |

With \`duration\` mapped, the Gantt writes it along with the dates: the working minutes between them, a day counted as \`hoursPerDay\` hours, [**non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) left out. A change on the timeline saves like an edit in the grid, and dates the backend rescheduled come back once it has saved. The Gantt does not schedule tasks itself.

## Zoom and navigation

Zoom with \`TaskGantt.ZoomSlider\`, Ctrl+wheel or a pinch, and drag the empty timeline to scroll it. The ribbon gains *Zoom to fit* and *Go to today*, and every subject cell *Show on timeline*. With a \`stateKey\`, the zoom and the split's width are kept per view and saved with user views.

## Props

| Component | Prop | Default | Description |
|---|---|---|---|
| \`TaskGantt\` | \`modules\` | Required | The Gantt's modules. A library module is required. Read at mount. |
| | \`stateKey\` | None | Where the zoom is kept, per view. |
| | \`timelineLimits\` | Today ± 25 years | \`{ start?, end? }\`, how far the timeline scrolls. Widened to fit the tasks. |
| | \`components\` | Defaults | See *Changing how it looks* below. |
| \`TaskGantt.Split\` | \`children\` | Required | The \`TaskGrid\`, then the \`TaskGantt\`. |
| | \`defaultGanttSize\` | \`60\` | The Gantt's share of the width, in percent. |
| | \`stateKey\` | None | Where the user's width is kept, per view. |
| | \`components\` | Defaults | See *Changing how it looks* below. |
| \`TaskGantt.ZoomSlider\` | \`components\` | Defaults | See *Changing how it looks* below. |

The Gantt's strings are labels: see [**Localization**](?path=/docs/concepts-localization--overview).

## Changing how it looks

\`TaskGantt\`, \`TaskGantt.Split\` and \`TaskGantt.ZoomSlider\` take \`components\`, and so do the Gantt modules that draw something: see *Changing how it looks* on each module's page. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGantt\` | \`chart\` | \`onRenderContainer\`, \`onRenderChart\` | | The chart's box |
| | \`overlay\` | \`onRenderContainer\` | | The overlay while the tasks load |
| | \`skeleton\` | \`onRenderContainer\`, \`onRenderSkeleton\` | \`GanttUiSkeletonComponents\` | The placeholder before the chart is drawn |
| \`TaskGantt.Split\` | Top level | \`onRenderContainer\`, \`onRenderGridPane\`, \`onRenderGanttPane\`, \`onRenderHandle\` | | The two panes and the handle between them |
| \`TaskGantt.ZoomSlider\` | Top level | \`onRenderContainer\`, \`onRenderSlider\`, \`onRenderZoomButton\` | | The slider and its buttons |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-gantt-modules--overview', text: 'The library, and every feature on top: take only the ones you need.' },
    { title: 'Editing on the timeline', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, draw new tasks, and select them from the chart.' },
    { title: 'Markers', iconName: 'Flag', href: '?path=/docs/controls-taskgrid-gantt-modules-markers--overview', text: 'Today, the project\'s start and end, and dates of your own.' },
    { title: 'Non-working days', iconName: 'Calendar', href: '?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview', text: 'Weekends and holidays, shaded and left out of durations, once or every year.' },
    { title: 'Tooltip', iconName: 'Info', href: '?path=/docs/controls-taskgrid-gantt-modules-tooltip--overview', text: 'What a bar says when the pointer is on it, composed from parts.' },
    { title: 'Links', iconName: 'Link', href: '?path=/docs/controls-taskgrid-gantt-modules-links--overview', text: 'Dependencies drawn between the bars, and drawn by the user.' },
    { title: 'Write a module', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-gantt-write-a-module--overview', text: 'Colour bars, relabel the scale, and draw over the chart.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Get started',
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

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<GanttShowcaseExample />),
}
