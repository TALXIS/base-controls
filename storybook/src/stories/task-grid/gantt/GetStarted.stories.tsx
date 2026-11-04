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

The Gantt has its own entry, \`@talxis/base-controls/gantt\`, so a task grid without one never loads DHTMLX. It needs the \`startDate\` and \`endDate\` of the field mapping: see [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview).

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

With \`duration\` mapped, the Gantt writes it along with the dates: the working minutes between them, a day counted as \`hoursPerDay\` hours, [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) left out. A change on the timeline saves like an edit in the grid. The Gantt does not schedule tasks itself: see *Rescheduled dates* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview).

## Zoom and navigation

Zoom with \`TaskGantt.ZoomSlider\`, Ctrl+wheel or a pinch, and drag the empty timeline to scroll it. The ribbon gains *Zoom to fit* and *Go to today*, and every subject cell *Show on timeline*. With a \`stateKey\`, the zoom and the split's width are kept per view and saved with user views.

## Changing how it looks

\`TaskGantt\`, \`TaskGantt.Split\` and \`TaskGantt.ZoomSlider\` take \`components\`, and so do the Gantt modules that draw something: see *Changing how it looks* on each module's page. How slots work: [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGantt\` | \`chart\` | \`onRenderContainer\`, \`onRenderChart\` | | The chart's box |
| | \`overlay\` | \`onRenderContainer\` | | The overlay while the tasks load |
| | \`skeleton\` | \`onRenderContainer\`, \`onRenderSkeleton\` | \`GanttUiSkeletonComponents\` | The placeholder before the chart is drawn |
| \`TaskGantt.Split\` | Top level | \`onRenderContainer\`, \`onRenderGridPane\`, \`onRenderGanttPane\`, \`onRenderHandle\` | | The two panes and the handle between them |
| \`TaskGantt.ZoomSlider\` | Top level | \`onRenderContainer\`, \`onRenderSlider\`, \`onRenderZoomButton\` | | The slider and its buttons |

## Reference

### Props

| Component | Prop | Default | Description |
|---|---|---|---|
| \`TaskGantt\` | \`modules\` | Required | The Gantt's modules. A library module is required. At mount. |
| | \`stateKey\` | None | Where the zoom is kept, per view. |
| | \`timelineLimits\` | Today ± 25 years | \`{ start?, end? }\`, how far the timeline scrolls. Widened to fit the tasks. |
| | \`components\` | Defaults | See *Changing how it looks* below. |
| \`TaskGantt.Split\` | \`children\` | Required | The \`TaskGrid\`, then the \`TaskGantt\`. |
| | \`defaultGanttSize\` | \`60\` | The Gantt's share of the width, in percent. |
| | \`stateKey\` | None | Where the user's width is kept, per view. |
| | \`components\` | Defaults | See *Changing how it looks* below. |
| \`TaskGantt.ZoomSlider\` | \`components\` | Defaults | See *Changing how it looks* below. |

The Gantt's strings are labels: see [**Localization**](?path=/docs/concepts-localization--overview).

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
