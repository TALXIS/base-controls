import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttComposedTooltipExample, GanttMilestoneTooltipExample, GanttTooltipExample, GanttTooltipPartExample, GanttTooltipSlotsExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
A tooltip tells the user what a bar is about when the pointer rests on it: by default the task's name and status, its progress, and when it runs. While a bar is dragged, the tooltip follows it with the dates it would get. Try it below: drag a bar and watch the tooltip's dates.

{{canvas: Point at a bar}}

## What it shows

The default tooltip shows the task's name, its progress when \`percentComplete\` is mapped, and its dates with the duration. With \`statusColumnName\`, an option set column such as a status, the header shows that option as a pill in its colour.

The dates are the ones the timeline draws, so they follow a bar while it is dragged. The duration is the mapped column's while the bar rests, and the one counted from the bar while it is dragged: see [**Dates and bars**](?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview).

## Compose the tooltip

\`components.onRender\` returns a tooltip of your own, composed from \`TaskTooltip\`'s parts in your order, starting with \`TaskTooltip.Callout\`. The module draws them for the bar under the pointer, so they need nothing passed in.

| Part | Shows |
|---|---|
| \`TaskTooltip.Callout\` | The callout beside the pointer. Holds the rest. |
| \`TaskTooltip.Header\` | The task's name, and its status with \`statusColumnName\`. |
| \`TaskTooltip.ProgressRow\` | \`percentComplete\` as a bar, an empty value as 0%; nothing when it is not mapped. |
| \`TaskTooltip.DateRangeRow\` | The start, the end and the duration on one line. |
| \`TaskTooltip.StartDateRow\`, \`EndDateRow\`, \`DurationRow\` | The same, one to a row; for a milestone, only the date it has. |
| \`TaskTooltip.FieldRows\` | Holds field rows. |
| \`TaskTooltip.FieldRow\` | Any column of the task, by \`columnName\`, with an optional \`iconName\`; nothing while it is empty. |
| \`TaskTooltip.Renderer\` | The default tooltip, to use as a part. |

{{story: Compose the tooltip}}

{{story: Milestones and dates one to a row}}

A part of your own reads the task with \`useTaskTooltip()\`, as \`EffortRow\` does below. The fields it returns are under *Reference*.

{{story: A part of your own}}

## Changing how it looks

\`createTaskTooltipModule\` takes the default tooltip's slots under the keys below, which \`onRender\` leaves unused, and \`TaskTooltip.Renderer\` takes the same keys. In a tooltip of your own, each part takes its slots as its \`components\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Part | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskTooltip.Callout\` | \`callout\` | \`onRender\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the pointer |
| \`TaskTooltip.Header\` | \`header\` | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\`: \`onRender\`; \`status\`: \`onRender\`, \`onRenderLabel\` | \`RecordCardHeaderComponents\`, \`RecordCardHeaderStartComponents\`, \`RecordCardHeaderEndComponents\`, \`RecordCardTitleComponents\`, \`OptionTagComponents\` | The name and the status pill |
| \`TaskTooltip.ProgressRow\` | \`progress\` | \`onRender\`, \`onRenderTrack\`, \`onRenderFill\`, \`onRenderText\` | \`RecordCardProgressComponents\` | The progress bar |
| \`TaskTooltip.DateRangeRow\` | \`dateRange\` | \`onRender\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`RecordCardDateRangeComponents\` | The dates and the duration |
| \`TaskTooltip.FieldRows\` | | \`onRender\` | \`RecordCardFieldRowsComponents\` | The box the field rows sit in |
| \`TaskTooltip.FieldRow\`, \`StartDateRow\`, \`EndDateRow\`, \`DurationRow\` | | \`onRender\`, \`onRenderIcon\`, \`onRenderLabel\`, \`onRenderValue\` | \`RecordCardFieldRowComponents\` | One row |

{{story: Restyle the default tooltip}}

To change what the duration row says, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| \`statusColumnName\` | \`string\` | None | An option set column the header shows as a pill in its option's colour. |
| \`components\` | \`ITaskTooltipComponents\` | Defaults | \`onRender\` for a tooltip of your own, or the default tooltip's slots. |

Every parameter is read at mount.

### useTaskTooltip

| Field | Description |
|---|---|
| \`record\` | The task's record. |
| \`span\` | Where the bar runs, \`{ start, end }\` with \`end\` exclusive, ahead of the record while the bar is dragged. Absent for a milestone. |
| \`milestone\` | A milestone's \`date\`, and the \`edges\` it came from. |
| \`duration\` | In minutes; absent for a milestone. |
| \`color\` | The colour the bar is drawn in. |
| \`task\` | DHTMLX's task for the bar. |
| \`gantt\` | The Gantt, with its services, as on [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview). |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Links', iconName: 'Link', href: '?path=/docs/controls-taskgrid-gantt-modules-links--overview', text: 'Dependencies between the bars, with a tooltip of their own.' },
    { title: 'Dates and bars', iconName: 'CalendarSettings', href: '?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview', text: 'Which tasks are bars, which are milestones, and how durations are counted.' },
    { title: 'Write a module', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-gantt-write-a-module--overview', text: 'Draw popups of your own over the chart.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Tooltip',
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

export const PointAtABar: Story = {
    name: 'Point at a bar',
    render: () => renderStory(<GanttTooltipExample />),
}

export const ComposeTheTooltip: Story = {
    name: 'Compose the tooltip',
    render: () => renderStory(<GanttComposedTooltipExample />),
    parameters: {
        docs: {
            description: {
                story: `A tooltip of the parts you choose, with two columns of the task. Try: move \`TaskTooltip.DateRangeRow\` above \`TaskTooltip.Header\` in **Code**.`,
            },
        },
    },
}

export const MilestonesAndDatesOneToARow: Story = {
    name: 'Milestones and dates one to a row',
    render: () => renderStory(<GanttMilestoneTooltipExample />),
    parameters: {
        docs: {
            description: {
                story: `The start, the end and the duration one to a row, for a bar and two milestones. Try: point at *Sign-off*, then at *Build the site*.`,
            },
        },
    },
}

export const APartOfYourOwn: Story = {
    name: 'A part of your own',
    render: () => renderStory(<GanttTooltipPartExample />),
    parameters: {
        docs: {
            description: {
                story: `A row that sets the effort spent against the estimate. Try: point at *Website Redesign*.`,
            },
        },
    },
}

export const RestyleTheDefaultTooltip: Story = {
    name: 'Restyle the default tooltip',
    render: () => renderStory(<GanttTooltipSlotsExample />),
    parameters: {
        docs: {
            description: {
                story: `The default tooltip without its progress text and its duration badge. Try: delete \`dateRange\` in **Code**.`,
            },
        },
    },
}
