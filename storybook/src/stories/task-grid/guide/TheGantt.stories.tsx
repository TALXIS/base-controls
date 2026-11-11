import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GanttDatesExample, GanttPlanExample } from '../../../task-grid/guide/TheGanttExamples'

const DESCRIPTION = `
At the end of this step your task grid has a Gantt chart beside it: every task as a bar on a timeline that the user zooms, drags and links. The chart shares the grid's rows, tree and editing, so a change in one shows in the other, and each feature on top of the bars is a module you add. Try it below: drag a bar a week later, then hold Ctrl and drag along an empty stretch of a row.

{{canvas: Plan on the timeline}}

## The modules

The bars are all the chart draws on its own; the rest comes from the modules in \`TaskGantt\`'s \`modules\`, each a factory from \`@talxis/base-controls/gantt\`. Some read a task module, which goes in \`TaskDatasetControl\`'s \`modules\`: see [**Features**](?path=/docs/controls-taskgrid-guide-features--overview).

| Module | Factory | Adds | Needs |
|---|---|---|---|
| Library | \`createLibraryModule()\`, \`createProLibraryModule({ Gantt })\` | DHTMLX Gantt, which draws the chart | Nothing; without it the control shows an error |
| Bar dragging | \`createBarDraggingModule()\` | Moving and resizing bars | \`enableEditing\`, and \`createTaskEditingModule()\` in \`TaskGrid\` |
| Task drawing | \`createTaskDrawingModule()\` | New tasks drawn on a row, and dates drawn on an empty row | \`enableCreation\` for new tasks; for dates, what bar dragging needs |
| Task selection | \`createTaskSelectionModule()\` | Selecting bars, and opening a task with a double-click | \`createRowSelectionModule()\` in \`TaskGrid\`, for the grid to show the selection |
| Tooltip | \`createTaskTooltipModule()\` | What a bar says under the pointer | Nothing |
| Markers | \`createMarkersModule()\`, \`createMemoryMarkersModule({ markers })\` | Today, the project's start and end, and dates of your own | A project module, for the project's dates |
| Non-working days | \`createNonWorkingDaysModule()\`, \`createMemoryNonWorkingDaysModule({ nonWorkingDays })\` | Weekends and holidays, shaded and left out of durations | \`TaskDatasetControl.Settings\`, for the user to hide them |
| Links | \`createLinksModule()\` | Dependencies as arrows, drawn and deleted on the chart | A dependencies module; without one the control shows an error |

Every parameter of these factories is on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

## Add the Gantt

Put \`TaskGantt.Split\` in the body of the \`TaskDatasetControl\`, with the \`TaskGrid\` first and the \`TaskGantt\` second, and \`TaskGantt.ZoomSlider\` in the header if you want one. The chart reads each task's dates from \`startDate\` and \`endDate\` in the field mapping \`onLoad\` returns, and the control shows an error while either is missing.

\`createLibraryModule()\` draws with the free build of <a href="https://dhtmlx.com/docs/products/dhtmlxGantt/" target="_blank" rel="noreferrer">DHTMLX Gantt</a>, under the MIT licence, installed with the library. With a DHTMLX PRO licence, pass your build to \`createProLibraryModule({ Gantt })\` and import its stylesheet yourself, as *pro.ts* in the example does; every module works the same with either build.

## How dates become bars

Each end of a task reads its own column. A date-only column means the whole day, so an end counts to the end of that day; a date-and-time column means the moment it holds, and the timeline zooms in to hours only while either column holds a time of day.

| The task has | The chart draws |
|---|---|
| A start and a later end | A bar from the start to the end |
| The same day on both, in date-only columns | A one-day bar |
| Only a start, or only an end | A milestone at that date; a date-only end sits at the end of its day |
| The same moment on both, with a time of day | A milestone |
| No dates, or an end before its start | An empty row |

{{story: Bars, milestones and empty rows}}

A bar fills as far as the task's \`percentComplete\`. A task with subtasks is a thinner summary bar, drawn from its own dates rather than worked out from its subtasks. With \`duration\` in the field mapping, every date the chart saves writes the duration too, counted from the bar in days of the \`hoursPerDay\` that \`onLoad\` returns; the non-working days module leaves its days out.

## Zoom and move along the timeline

| To | The user |
|---|---|
| Zoom | Drags \`TaskGantt.ZoomSlider\`, turns the wheel over the timeline while holding Ctrl, or pinches on a touchpad. The scale goes from quarters down to hours |
| Scroll | Drags the empty timeline, or uses its scroll bar |
| Fit tasks | Clicks *Zoom to fit* in \`TaskDatasetControl.Ribbon\`: the selected tasks, or every task |
| Find today | Clicks *Go to today* in \`TaskDatasetControl.Ribbon\` |
| Find a task | Clicks *Show on timeline* in the task's subject cell |

The chart fits every task as it mounts. With a \`stateKey\`, \`TaskGantt\` keeps its zoom in each view's state instead, and a \`stateKey\` on \`TaskGantt.Split\` keeps the user's width. \`timelineLimits\` narrows how far the timeline scrolls, 25 years either side of today by default. To zoom from your code, see *A Gantt module* on [**From your code**](?path=/docs/controls-taskgrid-guide-from-your-code--overview).

## Edit on the timeline

| Gesture | Does | Module |
|---|---|---|
| Drag a bar, or one of its ends | Moves the task, or changes that date; a milestone only moves | Bar dragging |
| Ctrl+drag along a row | Draws a new task over the span, right before that row's task and under the same parent | Task drawing |
| Alt+drag along an empty row, Option+drag on a Mac | Draws the dates of a task without subtasks that has none | Task drawing |
| Click, Ctrl+click, Shift+click | Selects the task, adds it to the selection, or selects every task from the last one clicked | Task selection |
| Shift+drag | Selects every bar under the band | Task selection |
| Double-click a bar | Opens the task | Task selection |

The dates are saved once a bar is dropped, as an edit in the grid is, and a locked or saving task stays still. A dragged end snaps to whole days in a date-only column, and in a date-and-time column to the finest of 15 minutes up to 12 hours that the zoom leaves room for; with non-working days, it also slides off them.

## Tooltip, markers and non-working days

The tooltip shows the task's name, its progress and its dates, with its status as a pill when you pass \`statusColumnName\`, and it follows a bar while the bar is dragged. To draw a tooltip of your own, see [**Make it yours**](?path=/docs/controls-taskgrid-guide-make-it-yours--overview).

The markers module marks today, the project's start and end when a project module is loaded, and your own markers, each with an \`id\`, a \`text\`, a \`date\`, and an optional \`color\` and \`lineStyle\`. The non-working days module takes Saturdays and Sundays, unless \`enableWeekends\` is \`false\`, and your own days, each with an \`id\`, a \`date\`, and an optional \`endDate\`, \`description\` and \`recurrence\`, an <a href="https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html" target="_blank" rel="noreferrer">RRULE</a> such as \`FREQ=YEARLY\`.

Both come ready to use, in memory or from your own backend:

| Factory | Reads |
|---|---|
| \`createMarkersModule()\`, \`createNonWorkingDaysModule()\` | Nothing: today and the project's dates, or weekends |
| \`createMemoryMarkersModule({ markers })\`, \`createMemoryNonWorkingDaysModule({ nonWorkingDays })\` | A \`MemoryTable\`, dates as ISO strings, as in the example |
| \`createMarkersModule({ createStore })\`, \`createNonWorkingDaysModule({ createStore })\` | A store you make from the task runtime on every mount, with an async \`loadMarkers()\` or \`loadNonWorkingDays()\` |

The chart does not wait for a store: what it loads shows up once it arrives, and when it fails, the user sees an error and the chart goes on without it.

## Links

The links module draws what the dependencies module holds, and saves there what the user draws. Without a dependencies module in \`TaskDatasetControl\`'s \`modules\`, the control shows an error saying so.

To link two tasks, the user drags from the handle at either end of a bar to another bar, and the two ends decide the type: *finish to start*, *start to start*, *finish to finish* or *start to finish*. A link to the task itself, a duplicate or a cycle is refused, and a double-click on a link deletes it once the user confirms. Drawing and deleting need \`enableEditing\`; without it, the links are only shown.

## Where next

**Next:** [**Make it yours**](?path=/docs/controls-taskgrid-guide-make-it-yours--overview), to colour the rows and bars and draw your own tooltip.
`

const meta = {
    title: 'Controls/TaskGrid/Guide/The Gantt',
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
type Story = StoryObj<typeof meta>

export const PlanOnTheTimeline: Story = {
    name: 'Plan on the timeline',
    render: () => renderStory(<GanttPlanExample />),
}

export const BarsMilestonesAndEmptyRows: Story = {
    name: 'Bars, milestones and empty rows',
    render: () => renderStory(<GanttDatesExample />),
    parameters: {
        docs: {
            description: {
                story: `A bar, a one-day bar, two milestones and two empty rows. Try: hold Alt, or Option on a Mac, and drag along the row of *Book the venue*.`,
            },
        },
    },
}
