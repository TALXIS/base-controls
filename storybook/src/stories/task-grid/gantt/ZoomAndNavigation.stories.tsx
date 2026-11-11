import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { GanttScaleLabelsExample, GanttTimelineLimitsExample, GanttZoomExample, GanttZoomFromCodeExample, GanttZoomStateExample } from '../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The timeline shows anything from years down to single hours, and the user moves along it as on a map: zooming in and out, dragging it sideways, and jumping to the tasks that matter. The zoom is continuous, and the scale above the timeline changes its units as it goes, from quarters to months, weeks, days and hours. Try it below: select two tasks in the grid and click *Zoom to fit*.

{{canvas: Zoom and scroll}}

## What the user can do

| To | The user |
|---|---|
| Zoom | Drags \`TaskGantt.ZoomSlider\` or clicks its buttons, turns the wheel over the timeline while holding Ctrl, or pinches on a touchpad. |
| Scroll | Drags the empty timeline, or uses its scroll bar. |
| Fit tasks | Clicks *Zoom to fit* in the ribbon, which fits the selected tasks, or every task when none is selected. |
| Find today | Clicks *Go to today* in the ribbon. |
| Find a task | Clicks *Show on timeline* in the task's subject cell, which zooms to its bar, or to the day of a milestone. Tasks without dates do not get it. |

*Zoom to fit* and *Go to today* are added to \`TaskDatasetControl.Ribbon\`, so the header needs one. Their ids are \`ganttZoomToFit\` and \`ganttGoToToday\`, for the ribbon's \`hooks.commands\`: see [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview).

Unless it keeps a zoom, as under *Keep the zoom* below, the Gantt zooms to fit every task as it mounts. When no task has dates, it fits the dates of the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview), or else four weeks either side of today.

## Zoom from your code

The Gantt's \`zooming\` service zooms from your code; its members are under *Reference* below. Outside the Gantt, reach it through the DatasetControl, whose \`gantt\` part is the Gantt while it is drawn, as the example does; in a module, observe the service, as on [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview).

{{story: Zoom to dates of your own}}

## Label the scale

\`zooming.hooks.scaleLabel\` changes the label of each cell of the scale. A hook gets the built-in label in \`result.label\`, and the cell's \`date\`, \`unit\`, \`step\` and \`row\`: \`0\` for the scale's top row, \`1\` for its bottom one. The units of each zoom level are under *Reference* below.

{{story: Fiscal quarters on the scale}}

## Keep the zoom

Without a \`stateKey\`, a Gantt starts every mount by fitting the tasks. With one, it keeps its zoom and the date in the middle of the timeline in each view's state, so switching views and back puts them back (see [**State persistence**](?path=/docs/concepts-state-persistence--overview)). A \`stateKey\` on \`TaskGantt.Split\` keeps the user's width in the same way.

With [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview), a saved view stores the zoom and the width, and the Gantt starts from them when the user opens the view.

{{story: Keep the zoom per view}}

## Scroll range

The timeline scrolls 25 years either side of today. \`timelineLimits\` narrows that to the dates you give, and it always reaches far enough to show every task.

{{story: Limit the timeline}}

## Reference

### The zooming service

| Member | Description |
|---|---|
| \`zoomToFit()\` | Fits the selected tasks, or every task when none is selected. |
| \`zoomToRange({ start, end })\` | Zooms so the two \`Date\`s fill the timeline, centred on them. |
| \`showTask(record)\` | Zooms to the task's bar, or to the day of a milestone. |
| \`getPosition()\`, \`setPosition(position)\` | The zoom from \`0\`, the widest, to \`1\`, the closest, as the slider shows it. |
| \`getPixelsPerDay()\` | How wide a day is drawn. |
| \`isDayScaleVisible()\` | Whether the scale's columns are single days or hours. |
| \`events\` | \`onZoomChanged\`, after every change of zoom. |
| \`hooks.scaleLabel\` | See *Label the scale* above. |

\`jumpToToday()\` on the \`timeline\` service scrolls to today, as *Go to today* does.

### Zoom levels

From the widest to the closest, the scale's two rows show:

| Top row | Bottom row |
|---|---|
| \`year\` | \`quarter\` |
| \`year\` | \`month\`, step 2 |
| \`year\` | \`month\` |
| \`week\`, step 8 | \`week\`, step 2 |
| \`week\`, step 4 | \`week\` |
| \`week\`, step 4 | \`day\`, step 4 |
| \`day\`, step 14 | \`day\`, step 2 |
| \`week\` | \`day\` |
| \`day\` | \`hour\`, steps 12, 6, 3, 2 and 1, only while a date column holds a time of day |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Dates and bars', iconName: 'CalendarSettings', href: '?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview', text: 'Which tasks are bars, which are milestones, and which have no place yet.' },
    { title: 'Markers', iconName: 'Flag', href: '?path=/docs/controls-taskgrid-gantt-modules-markers--overview', text: 'Today, the project\'s start and end, and dates of your own on the timeline.' },
    { title: 'Write a module', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-gantt-write-a-module--overview', text: 'Reach the zooming service and the rest of the Gantt from a module.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Zoom and navigation',
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

export const ZoomAndScroll: Story = {
    name: 'Zoom and scroll',
    render: () => renderStory(<GanttZoomExample />),
}

export const ZoomToDatesOfYourOwn: Story = {
    name: 'Zoom to dates of your own',
    render: () => renderStory(<GanttZoomFromCodeExample />),
    parameters: {
        docs: {
            description: {
                story: `Two buttons that zoom the timeline to dates of their own. Try: click *First half of 2026*.`,
            },
        },
    },
}

export const FiscalQuartersOnTheScale: Story = {
    name: 'Fiscal quarters on the scale',
    render: () => renderStory(<GanttScaleLabelsExample />),
    parameters: {
        docs: {
            description: {
                story: `A module that labels the scale by a fiscal year starting in July. Try: zoom out until the scale shows quarters.`,
            },
        },
    },
}

export const KeepTheZoomPerView: Story = {
    name: 'Keep the zoom per view',
    render: () => renderStory(<GanttZoomStateExample />),
    parameters: {
        docs: {
            description: {
                story: `The zoom and the width kept in each view's state. Try: zoom in on *All tasks*, switch to *Planning*, then switch back.`,
            },
        },
    },
}

export const LimitTheTimeline: Story = {
    name: 'Limit the timeline',
    render: () => renderStory(<GanttTimelineLimitsExample />),
    parameters: {
        docs: {
            description: {
                story: `A timeline that scrolls from July 2025 to September 2026. Try: zoom in, then drag the empty timeline to the right until it stops.`,
            },
        },
    },
}
