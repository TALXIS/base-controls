import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { GanttBasicExample, GanttLookExample, GanttShowcaseExample } from '../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
A Gantt chart shows when each task runs, as a bar along a timeline. The Gantt sits beside a task grid and shares its rows, its tree, its scroll and its editing, so a task changed in one changes in the other. Try it below: drag a bar to another week.

{{canvas: Overview}}

## Add a Gantt

{{story: Bars beside the grid}}

\`TaskGantt\` and its modules come from their own entry, \`@talxis/base-controls/gantt\`, the only one that loads <a href="https://dhtmlx.com/docs/products/dhtmlxGantt/" target="_blank" rel="noreferrer">DHTMLX Gantt</a>; the rest comes from \`@talxis/base-controls\`. Put the \`TaskGrid\` and the \`TaskGantt\` in \`TaskGantt.Split\` in the body of a \`TaskDatasetControl\`, and \`TaskGantt.ZoomSlider\` in its header if you want one.

| The Gantt needs | Without it |
|---|---|
| \`startDate\` and \`endDate\` in the field mapping, as under *Field mapping* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview) | The whole control shows an error saying so. |
| A library module, \`createLibraryModule()\` or \`createProLibraryModule({ Gantt })\`, in \`modules\` | The whole control shows an error saying so. |
| A \`TaskGrid\` in the same \`TaskDatasetControl\` | The chart is not drawn. |

Everything else the chart does, such as dragging bars, drawing links or marking holidays, comes from a module you add: see [**Modules**](?path=/docs/controls-taskgrid-gantt-modules--overview).

## What it draws

Each row of the grid has a row on the timeline, in the same order, and the task's name stays in the grid. A task is drawn as a bar, a milestone diamond or an empty row, depending on its dates: see [**Dates and bars**](?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview). While the tree is shown, a task with subtasks is a thinner summary bar.

A bar fills as far as the task's \`percentComplete\`. Inactive, locked and saving tasks each have a look of their own, and the row under the pointer is highlighted on both sides.

The user zooms and moves along the timeline with the slider, the wheel and the ribbon: see [**Zoom and navigation**](?path=/docs/controls-taskgrid-gantt-zoom-and-navigation--overview).

## Changing how it looks

\`TaskGantt\`, \`TaskGantt.Split\` and \`TaskGantt.ZoomSlider\` each take \`components\`; the modules that draw something take their own, listed on each module's page. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGantt\` | \`chart\` | \`onRender\`, \`onRenderChart\` | \`GanttUiChartComponents\` | The chart's box; \`onRenderChart\` has to pass on its \`ref\` |
| | \`overlay\` | \`onRender\` | \`GanttUiOverlayComponents\` | The cover over the chart while the tasks load |
| | \`skeleton\` | \`onRender\`, \`onRenderSkeleton\` | \`GanttUiSkeletonComponents\` | The placeholder until the chart is drawn |
| \`TaskGantt.Split\` | Top level | \`onRender\`, \`onRenderGridPane\`, \`onRenderGanttPane\`, \`onRenderHandle\` | \`GridGanttUiSplitComponents\` | The two panes and the handle between them |
| \`TaskGantt.ZoomSlider\` | Top level | \`onRender\`, \`onRenderSlider\`, \`onRenderZoomButton\` | \`GanttUiZoomSliderComponents\` | The slider and its zoom out and zoom in buttons |

{{story: Zoom slider without buttons}}

To change the Gantt's strings, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

### Props

| Component | Prop | Type | Default | Timing | Description |
|---|---|---|---|---|---|
| \`TaskGantt\` | \`modules\` | \`IGanttModule[]\` | Required | At mount | The Gantt's modules, a library module among them. |
| | \`stateKey\` | \`string\` | None | At mount | Where the zoom is kept in each view. See [**Zoom and navigation**](?path=/docs/controls-taskgrid-gantt-zoom-and-navigation--overview). |
| | \`timelineLimits\` | \`{ start?: Dayjs, end?: Dayjs }\` | Today ± 25 years | Live | How far the timeline scrolls, widened to fit the tasks. |
| | \`components\` | \`ITaskGanttComponents\` | Defaults | Live | See *Changing how it looks* above. |
| \`TaskGantt.Split\` | \`children\` | Two elements | Required | Live | The \`TaskGrid\`, then the \`TaskGantt\`. |
| | \`defaultGanttSize\` | \`number\` | \`60\` | At mount | The Gantt's share of the width, in percent, until the user drags the handle. |
| | \`stateKey\` | \`string\` | None | At mount | Where the user's width is kept in each view. |
| | \`components\` | \`Partial<IGridGanttUiSplitComponents>\` | Defaults | Live | See *Changing how it looks* above. |
| \`TaskGantt.ZoomSlider\` | \`components\` | \`Partial<IGanttUiZoomSliderComponents>\` | Defaults | Live | See *Changing how it looks* above. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Dates and bars', iconName: 'CalendarSettings', href: '?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview', text: 'Which tasks are bars, which are milestones, and how durations are counted.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-gantt-modules--overview', text: 'Every Gantt feature, and where each one keeps its data.' },
    { title: 'Write a module', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-gantt-write-a-module--overview', text: 'Colour bars, add class names and styles, and draw over the chart.' },
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

export const BarsBesideTheGrid: Story = {
    name: 'Bars beside the grid',
    render: () => renderStory(<GanttBasicExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample tasks with nothing but the library module. Try: drag the handle between the grid and the timeline.`,
            },
        },
    },
}

export const ZoomSliderWithoutButtons: Story = {
    name: 'Zoom slider without buttons',
    render: () => renderStory(<GanttLookExample />),
    parameters: {
        docs: {
            description: {
                story: `The zoom slider with its \`onRenderZoomButton\` slot drawing nothing. Try: delete \`components\` in **Code** to bring the buttons back.`,
            },
        },
    },
}
