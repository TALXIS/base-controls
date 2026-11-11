import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { GanttDateStatesExample, GanttDateTimeExample, GanttDurationExample, GanttMixedDatesExample, GanttSummaryExample } from '../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The Gantt places every task by its start and end: a bar for a task that runs over time, a milestone diamond for a task with a single date, and an empty row for a task it cannot place yet. Each task is drawn from its own two date columns, and what the user drags on the timeline is written back to them. Try it below: give *Book the venue* a *Start Date* in the grid.

{{canvas: Bars, milestones and empty rows}}

## Bars, milestones and empty rows

| The task has | It is drawn as | Dragged, it |
|---|---|---|
| A start and a later end | A bar from the start to the end | Moves, and its ends change one date each |
| The same day as start and end, in date-only columns | A one-day bar | Moves, and its ends change one date each |
| Only a start, or only an end | A milestone at that date | Moves, and saves only the column it has |
| The same moment as start and end, with a time of day | A milestone | Moves, and saves both columns |
| No dates, or an end before its start | An empty row | Cannot be dragged; Alt+drag draws its dates, as on [**Editing on the timeline**](?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview) |

A milestone counts as much as a bar does. It can carry links, *Zoom to fit* fits it, the timeline always reaches it, the tooltip shows its date without a duration, and *Show on timeline* zooms to its day. It cannot be resized.

## Date-only and date-and-time columns

Each end of a task reads its own column, so the start and the end may be of different kinds.

| The column is | Its date means |
|---|---|
| Date only | The whole day: an end counts to the end of that day |
| Date and time | The moment it holds |

A dragged end snaps by its own column too: see *Snapping* on [**Editing on the timeline**](?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview). The timeline zooms in to hours only while either column holds a time of day.

{{story: Date and time}}

{{story: A time on the start only}}

## Durations

The Gantt counts a task's duration from its bar: the time from the start to the end, in which a day counts at most the \`hoursPerDay\` hours that \`onLoad\` returns (see [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview)). With 8-hour days, a date-only task from Monday to Friday takes 40 hours, or five days. With the [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) module, the days it covers are left out.

With \`duration\` in the field mapping, every date the Gantt saves writes the counted duration with it. Without it, the duration is counted only for what the Gantt shows, such as the tooltip. Moving a milestone leaves the duration column as it is.

{{story: Duration column}}

## Summary rows

A task with subtasks is drawn from its own start and end, like any other task: the Gantt does not work them out from its subtasks. Dragging a subtask leaves its parent's bar where it is, and dragging the parent moves only the parent. When your backend reschedules parents after a save, their new dates show up: see *Rescheduled dates* on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview).

{{story: Summary rows}}

## Reference

### The schedule service

How the Gantt reads and writes a task's dates is the \`schedule\` service, which a module reaches with \`gantt.services.get('schedule')\` (see [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview)). A span's \`end\` is exclusive: the day after a date-only end.

| Member | Returns |
|---|---|
| \`getPlacement(record)\` | \`{ kind: 'span', span }\`, \`{ kind: 'milestone', date, edges }\` with the columns the date came from, or \`undefined\` for an empty row. |
| \`getSpan(record)\` | The bar's \`{ start, end }\`, or \`undefined\` for a milestone or an empty row. |
| \`getDate(record, edge)\` | The \`'start'\` or \`'end'\` column's date, or \`undefined\`. |
| \`getRange(records)\` | The span from the earliest start to the latest end, milestones included. |
| \`getDuration(record)\` | The mapped duration in minutes, or else the one counted from the bar. |
| \`calculateDuration(span, record?)\` | The minutes counted for a span, as under *Durations* above. |
| \`save(record, span)\`, \`saveMilestone(record, date, edges)\` | Writes the dates, and the duration with \`save\`, saved as an edit in the grid is. |
| \`formatSpan(span)\`, \`formatDate(date, edge)\`, \`formatDuration(minutes)\` | Text as the columns show it. |
| \`hasTimeOfDay()\` | Whether either date column holds a time of day. |
| \`getColumnLabels()\` | The display names of the start and end columns. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Editing on the timeline', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, and draw new tasks and missing dates.' },
    { title: 'Zoom and navigation', iconName: 'ZoomIn', href: '?path=/docs/controls-taskgrid-gantt-zoom-and-navigation--overview', text: 'From years down to hours, and back to today.' },
    { title: 'Non-working days', iconName: 'Calendar', href: '?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview', text: 'Weekends and holidays, left out of every duration.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Dates and bars',
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

export const BarsMilestonesAndEmptyRows: Story = {
    name: 'Bars, milestones and empty rows',
    render: () => renderStory(<GanttDateStatesExample />),
}

export const DateAndTime: Story = {
    name: 'Date and time',
    render: () => renderStory(<GanttDateTimeExample />),
    parameters: {
        docs: {
            description: {
                story: `Tasks with a time of day on both dates, one of them a milestone. Try: zoom in until the scale shows hours, then point at *Doors open*.`,
            },
        },
    },
}

export const ATimeOnTheStartOnly: Story = {
    name: 'A time on the start only',
    render: () => renderStory(<GanttMixedDatesExample />),
    parameters: {
        docs: {
            description: {
                story: `A start with a time of day and a date-only end, so each bar runs from its start time to the end of its last day. Try: zoom in to hours and drag the start of a bar, then its end.`,
            },
        },
    },
}

export const DurationColumn: Story = {
    name: 'Duration column',
    render: () => renderStory(<GanttDurationExample />),
    parameters: {
        docs: {
            description: {
                story: `A mapped duration with 8-hour days, written with every date the Gantt saves. Try: drag the end of *Build the site* a day later and watch *Duration*.`,
            },
        },
    },
}

export const SummaryRows: Story = {
    name: 'Summary rows',
    render: () => renderStory(<GanttSummaryExample />),
    parameters: {
        docs: {
            description: {
                story: `A parent drawn from its own dates, which end before its last subtask does. Try: drag *Write the copy* a week later and watch the parent's bar stay.`,
            },
        },
    },
}
