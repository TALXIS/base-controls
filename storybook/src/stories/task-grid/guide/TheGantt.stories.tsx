import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GuideNavigation } from '../../../task-grid/guide/GuideSteps'
import { GanttDatesExample, GanttDecorationsExample, GanttEditingExample, GanttLinksExample, GanttSetupExample } from '../../../task-grid/guide/TheGanttExamples'

const DESCRIPTION = `
The Gantt draws the same tasks on a timeline, row for row with the grid. Its modules add editing on the timeline, a tooltip, markers, non-working days and links.

## Add the Gantt

\`TaskGantt\` draws the tasks on a timeline, row for row with the grid. Put \`TaskGantt.Split\` in the body with the \`TaskGrid\` first and the \`TaskGantt\` second, and give the field mapping \`startDate\` and \`endDate\`, without which the chart shows an error.

Every feature of the chart is a module in \`TaskGantt\`'s \`modules\`, from \`@talxis/base-controls/gantt\`. \`createLibraryModule()\` draws with the free build of <a href="https://dhtmlx.com/docs/products/dhtmlxGantt/" target="_blank" rel="noreferrer">DHTMLX Gantt</a>; with a PRO licence, pass your build to \`createProLibraryModule({ Gantt })\` and import its stylesheet, as *pro.ts* shows.

| To | The user |
|---|---|
| Zoom | Drags \`TaskGantt.ZoomSlider\`, or turns the wheel over the timeline while holding Ctrl |
| Scroll | Drags the empty timeline |
| Fit the tasks, or find today | Clicks *Zoom to fit* or *Go to today* in \`TaskDatasetControl.Ribbon\` |
| Find a task | Clicks *Show on timeline* in its subject cell |

Try: drag the zoom slider to the left, then click *Zoom to fit*.

{{story: Add the Gantt}}

## Dates and bars

A date-only column means the whole day, so an end counts to the end of that day; a date-and-time column means the moment it holds.

| The task has | The chart draws |
|---|---|
| A start and a later end | A bar from the start to the end |
| The same day on both, in date-only columns | A one-day bar |
| Only a start, or only an end | A milestone at that date |
| No dates, or an end before its start | An empty row |

A bar fills as far as the task's \`percentComplete\`, and a task with subtasks is a thinner summary bar drawn from its own dates. With \`duration\` in the field mapping, every date the chart saves writes the duration too.

Try: hold Alt, or Option on a Mac, and drag along the row of *Book the venue*.

{{story: Dates and bars}}

## Editing on the timeline

| Gesture | Does | Module |
|---|---|---|
| Drag a bar, or one of its ends | Moves the task, or changes that date | Bar dragging |
| Ctrl+drag along a row | Draws a new task over the span, right before that row's task | Task drawing |
| Alt+drag along an empty row | Draws the dates of a task without subtasks that has none | Task drawing |
| Click, Ctrl+click, Shift+drag | Selects the task, adds it, or selects every bar under the band | Task selection |
| Double-click a bar | Opens the task | Task selection |

The dates are saved once a bar is dropped, as an edit in the grid is, so bar dragging needs \`enableEditing\` and \`createTaskEditingModule()\` in \`TaskGrid\`. A dragged end snaps to whole days in a date-only column.

Try: drag the bar of *Checkout flow* a week later, then hold Ctrl and drag along an empty stretch of its row.

{{story: Editing on the timeline}}

## Tooltip, markers and non-working days

The tooltip shows the task's name, progress and dates, with its status as a pill when you pass \`statusColumnName\`. The markers module marks today, the project's start and end when a project module is loaded, and markers of your own. The non-working days module shades Saturdays, Sundays and days of your own, and leaves them out of durations.

\`createMarkersModule()\` and \`createNonWorkingDaysModule()\` need no data; the memory factories read a \`MemoryTable\`, and \`createStore\` reads your backend. What a marker and a non-working day hold, such as a yearly recurrence, is on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

Try: rest the pointer on a bar, then turn on *Hide non-working days* in the settings.

{{story: Tooltip, markers and non-working days}}

## Links

The links module draws what the dependencies module holds, and saves there what the user draws; without a dependencies module, the control shows an error.

The user drags from the handle at either end of a bar to another bar, and the two ends decide the type: *finish to start*, *start to start*, *finish to finish* or *start to finish*. A link to the task itself, a duplicate or a cycle is refused, and a double-click on a link deletes it once the user confirms. Drawing and deleting need \`enableEditing\`.

Try: drag from the end of one bar to the start of another, then double-click the new link.

{{story: Links}}

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/The Gantt',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { navigation: () => <GuideNavigation current='The Gantt' /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AddTheGantt: Story = {
    name: 'Add the Gantt',
    tags: ['!dev'],
    render: () => renderStory(<GanttSetupExample />),
}

export const DatesAndBars: Story = {
    name: 'Dates and bars',
    tags: ['!dev'],
    render: () => renderStory(<GanttDatesExample />),
}

export const EditingOnTheTimeline: Story = {
    name: 'Editing on the timeline',
    tags: ['!dev'],
    render: () => renderStory(<GanttEditingExample />),
}

export const TooltipMarkersAndNonWorkingDays: Story = {
    name: 'Tooltip, markers and non-working days',
    tags: ['!dev'],
    render: () => renderStory(<GanttDecorationsExample />),
}

export const Links: Story = {
    name: 'Links',
    tags: ['!dev'],
    render: () => renderStory(<GanttLinksExample />),
}
