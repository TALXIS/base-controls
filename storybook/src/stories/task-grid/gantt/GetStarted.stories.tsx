import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { GanttBasicExample, GanttShowcaseExample } from '../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The Gantt draws the task grid's tasks on a timeline, row for row with the grid beside it: same order, same tree, same scroll. It is drawn with <a href="https://dhtmlx.com/docs/products/dhtmlxGantt/" target="_blank" rel="noreferrer">DHTMLX Gantt</a>, and dragging bars, drawing tasks, links, markers and tooltips each come from a module you add (see [**Modules**](?path=/docs/controls-taskgrid-gantt-modules--overview)). Try it below: drag a bar to another week.

{{canvas: Overview}}

## Add a Gantt

{{story: Bars beside the grid}}

\`TaskGantt\` and its modules come from their own entry, \`@talxis/base-controls/gantt\`, so a task grid without a Gantt never loads DHTMLX; the rest comes from \`@talxis/base-controls\`. \`TaskGantt.Split\` puts the \`TaskGrid\` and the \`TaskGantt\` side by side in the body, and \`TaskGantt.ZoomSlider\` goes in the header. The Gantt needs \`startDate\` and \`endDate\` in the field mapping: see *Field mapping* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview).

## What it draws

| A task | Is drawn as |
|---|---|
| with a start and an end | a bar, filled as far as \`percentComplete\` |
| that starts and ends at the same time | a milestone diamond |
| with subtasks, while the tree is shown | a thinner summary bar |
| missing a date, or ending before it starts | nothing, until the user draws its dates (see [**Editing on the timeline**](?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview)) |

Names stay in the grid. Started, done, inactive, locked and saving tasks each have a look of their own.

## Dates

| Date columns | The end date is | Bars snap to | Zoom goes down to |
|---|---|---|---|
| both date only | the task's last day | whole days | days |
| either with a time of day | the moment it ends | 15 minutes to a day, by zoom | hours |

With \`duration\` mapped, the Gantt writes it along with the dates: the working minutes between them, with a day of the \`hoursPerDay\` hours that \`onLoad\` returns, and [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) left out. A change on the timeline is written as an edit in the grid is, and saves straight away with \`createTaskEditingModule()\` in \`TaskGrid\`. The Gantt does not schedule tasks itself: see *Rescheduled dates* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview).

## Zoom and navigation

Zoom with \`TaskGantt.ZoomSlider\`, Ctrl+wheel or a pinch, and drag the empty timeline to scroll it. The ribbon gains *Zoom to fit*, which fits the selected tasks or every task the grid shows, and *Go to today*, and the subject cell of every task with a date *Show on timeline*. To zoom to dates of your own, call \`zoomToRange({ start, end })\` on the Gantt's \`zooming\` service. With a \`stateKey\` on \`TaskGantt\` and on \`TaskGantt.Split\`, the zoom and the split's width are kept per view, and user views save them.

## Changing how it looks

\`TaskGantt\`, \`TaskGantt.Split\` and \`TaskGantt.ZoomSlider\` take \`components\`, and so do the Gantt modules that draw something: see *Changing how it looks* on each module's page. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGantt\` | \`chart\` | \`onRenderContainer\`, \`onRenderChart\` | \`GanttUiChartComponents\` | The chart's box; \`onRenderChart\` must pass on its \`ref\` |
| | \`overlay\` | \`onRenderContainer\` | \`GanttUiOverlayComponents\` | The overlay while the tasks load |
| | \`skeleton\` | \`onRenderContainer\`, \`onRenderSkeleton\` | \`GanttUiSkeletonComponents\` | The placeholder before the chart is drawn |
| \`TaskGantt.Split\` | Top level | \`onRenderContainer\`, \`onRenderGridPane\`, \`onRenderGanttPane\`, \`onRenderHandle\` | \`GridGanttUiSplitComponents\` | The two panes and the handle between them |
| \`TaskGantt.ZoomSlider\` | Top level | \`onRenderContainer\`, \`onRenderSlider\`, \`onRenderZoomButton\` | \`GanttUiZoomSliderComponents\` | The slider and its buttons |

## Reference

### Props

| Component | Prop | Type | Default | Timing | Description |
|---|---|---|---|---|---|
| \`TaskGantt\` | \`modules\` | \`IGanttModule[]\` | Required | At mount | The Gantt's modules, a library module among them. |
| | \`stateKey\` | \`string\` | None | At mount | Where the zoom is kept, per view. |
| | \`timelineLimits\` | \`{ start?: Dayjs, end?: Dayjs }\` | Today ± 25 years | Live | How far the timeline scrolls. Widened to fit the tasks. |
| | \`components\` | \`ITaskGanttComponents\` | Defaults | Live | See *Changing how it looks* above. |
| \`TaskGantt.Split\` | \`children\` | Two elements | Required | Live | The \`TaskGrid\`, then the \`TaskGantt\`. |
| | \`defaultGanttSize\` | \`number\` | \`60\` | At mount | The Gantt's share of the width, in percent, until the user drags the handle. |
| | \`stateKey\` | \`string\` | None | At mount | Where the user's width is kept, per view. |
| | \`components\` | \`Partial<IGridGanttUiSplitComponents>\` | Defaults | Live | See *Changing how it looks* above. |
| \`TaskGantt.ZoomSlider\` | \`components\` | \`Partial<IGanttUiZoomSliderComponents>\` | Defaults | Live | See *Changing how it looks* above. |

To change the Gantt's strings, see [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-gantt-modules--overview', text: 'The library, and every feature on top: take only the ones you need.' },
    { title: 'Editing on the timeline', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, draw new tasks, and select them from the chart.' },
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
