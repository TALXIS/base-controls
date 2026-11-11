import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import {
    GanttDropOnWeekendsExample, GanttNonWorkingDaysExample, GanttNonWorkingDayTooltipExample, GanttNonWorkingDaysStoreExample, GanttWeekendsExample, GanttWorkingDurationExample,
} from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
Non-working days are the days on which no one works on tasks, such as weekends and public holidays. The non-working days module shades them on the timeline, leaves them out of every duration, and keeps dragged bars from starting or ending on them. Try it below: zoom in until the scale shows days, then drag a bar onto a weekend.

{{canvas: Shade the holidays}}

## What it does

| Where | What happens |
|---|---|
| On the timeline | The days are shaded while the scale's columns are days or hours. Pointing at a shaded day on the scale shows its description. |
| In durations | Only working time counts, as on [**Dates and bars**](?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview). |
| When a bar is dragged or drawn | It slides off non-working days, in the direction it moved, so it neither starts nor ends on one, unless \`enableDropOnNonWorkingDays\` is \`true\`. |
| In \`TaskDatasetControl.Settings\` | *Hide non-working days* takes them off the timeline while its columns are days. User views save the choice, and a \`stateKey\` on \`TaskGantt\` keeps it in each view. |

Saturdays and Sundays are non-working days unless \`enableWeekends\` is \`false\`.

{{story: Weekends only}}

{{story: Bars that may land on weekends}}

{{story: Durations in working days}}

## A non-working day

| Field | Default | Description |
|---|---|---|
| \`id\` | Required | Unique among the days. |
| \`date\` | Required | A \`Dayjs\`, or an ISO string in a memory table: the first day, or that of the first occurrence when it recurs. |
| \`endDate\` | The \`date\` | The last day, included. |
| \`description\` | None | What the scale says when the day is pointed at. |
| \`recurrence\` | None | An <a href="https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html" target="_blank" rel="noreferrer">RRULE</a> starting at \`date\`, such as \`FREQ=YEARLY\`, \`FREQ=YEARLY;BYEASTER=-2\` for Good Friday, or \`FREQ=MONTHLY;BYDAY=-1FR\` for every month's last Friday. |
| \`data\` | None | Anything else the day carries, read back with the module's \`getNonWorkingDays(date)\`. |

## Where non-working days are kept

| Factory | Days |
|---|---|
| \`createNonWorkingDaysModule()\` | Weekends only. |
| \`createMemoryNonWorkingDaysModule({ nonWorkingDays })\` | Also the rows of a \`MemoryTable\` you keep, as in the example at the top. |
| \`createNonWorkingDaysModule({ createStore })\` | Also what a store of yours loads. |

A store is an object with an async \`loadNonWorkingDays()\` that returns the days; when the module calls it, and what happens when it fails, is under *Where the data comes from* on [**Modules**](?path=/docs/controls-taskgrid-gantt-modules--overview). The example's *calendarStore.ts* loads the days from a server.

{{story: Days from your own store}}

After a change to where the days are kept, call the module's \`reload()\` to draw them anew. Reach the module by its name, \`nonWorkingDays\`, as the markers are reached on [**Markers**](?path=/docs/controls-taskgrid-gantt-modules-markers--overview).

## Changing how it looks

\`createNonWorkingDaysModule\` and \`createMemoryNonWorkingDaysModule\` take \`components\` for the tooltip of a shaded day on the scale. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`tooltip\` | \`onRender\`, \`onRenderContainer\`, \`onRenderDescription\` | \`NonWorkingDaysUiTooltipComponents\` | The callout, the box inside it, and one line for each day that covers the date, which \`onRenderDescription\` gets as \`day\`: its \`id\` and \`description\` |

{{story: Describe the days}}

To change what the weekend and the setting say, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| \`nonWorkingDays\` | \`MemoryTable<IMemoryNonWorkingDay>\` | Required | \`createMemoryNonWorkingDaysModule\` only. The days, their dates as ISO strings. |
| \`createStore\` | \`(taskRuntime) => INonWorkingDaysStore\` | None | \`createNonWorkingDaysModule\` only. Makes the store of the days of your own. |
| \`enableWeekends\` | \`boolean\` | \`true\` | Saturdays and Sundays are non-working days. |
| \`isVisibleByDefault\` | \`boolean\` | \`true\` | Shows the days until the user hides them. |
| \`enableDropOnNonWorkingDays\` | \`boolean\` | \`false\` | Lets a dragged or drawn bar start or end on a non-working day. |
| \`components\` | \`INonWorkingDaysComponents\` | Defaults | See *Changing how it looks* above. |

Every parameter is read at mount.

### The nonWorkingDays module

| Member | Description |
|---|---|
| \`getNonWorkingDays(date)\` | The days that cover a date, the weekend among them. |
| \`isNonWorkingDay(date)\` | Whether any day covers the date. |
| \`isVisible()\`, \`setVisible(isVisible)\` | Whether the days are on the timeline, as *Hide non-working days* sets it. |
| \`reload()\` | Loads the store's days again and redraws the chart. |
| \`events\` | \`onVisibilityChanged(isVisible)\` and \`onNonWorkingDaysChanged\`. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Editing on the timeline', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, and draw new tasks.' },
    { title: 'Dates and bars', iconName: 'CalendarSettings', href: '?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview', text: 'How a task\'s duration is counted from its bar.' },
    { title: 'Markers', iconName: 'Flag', href: '?path=/docs/controls-taskgrid-gantt-modules-markers--overview', text: 'Today, the project\'s start and end, and dates of your own.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Non-working days',
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

export const ShadeTheHolidays: Story = {
    name: 'Shade the holidays',
    render: () => renderStory(<GanttNonWorkingDaysExample />),
}

export const WeekendsOnly: Story = {
    name: 'Weekends only',
    render: () => renderStory(<GanttWeekendsExample />),
    parameters: {
        docs: {
            description: {
                story: `The module with no store, so weekends are the only non-working days. Try: zoom in until the scale shows days, then turn on *Hide non-working days* in the settings menu.`,
            },
        },
    },
}

export const BarsThatMayLandOnWeekends: Story = {
    name: 'Bars that may land on weekends',
    render: () => renderStory(<GanttDropOnWeekendsExample />),
    parameters: {
        docs: {
            description: {
                story: `Weekends shaded and left out of durations, but open to dragged bars. Try: zoom in until the scale shows days, then drag a bar so it ends on a Saturday.`,
            },
        },
    },
}

export const DurationsInWorkingDays: Story = {
    name: 'Durations in working days',
    render: () => renderStory(<GanttWorkingDurationExample />),
    parameters: {
        docs: {
            description: {
                story: `A mapped duration of 8-hour working days, with weekends left out. Try: drag the end of *Write the brief* to the next Tuesday and watch *Duration*.`,
            },
        },
    },
}

export const DaysFromYourOwnStore: Story = {
    name: 'Days from your own store',
    render: () => renderStory(<GanttNonWorkingDaysStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A store of company days, some of them recurring. Try: add a day to what \`loadNonWorkingDays\` returns in **Code**.`,
            },
        },
    },
}

export const DescribeTheDays: Story = {
    name: 'Describe the days',
    render: () => renderStory(<GanttNonWorkingDayTooltipExample />),
    parameters: {
        docs: {
            description: {
                story: `Each description on the scale drawn with an icon. Try: zoom in until the scale shows days, then point at a shaded day on the scale.`,
            },
        },
    },
}
