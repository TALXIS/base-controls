import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttTooltipExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The tooltip module shows what a bar is about when the pointer rests on it: by default the task's name and status, its progress, and when it runs. While a bar is dragged, the tooltip follows it with the dates it would get. Try it below: drag a bar and watch the tooltip's dates.

{{canvas: Compose the tooltip}}

## Options

| Option | Description |
|---|---|
| \`statusColumnName\` | An option set column, shown in the header as a pill in its option's colour. |
| \`components\` | \`onRender\`, the whole tooltip composed from \`TaskTooltip\`'s parts (see *Parts* below), or the default tooltip's slots (see *Changing how it looks*), which \`onRender\` leaves unused. |

## Parts

\`components.onRender\` returns the parts you want, in your order, starting with \`TaskTooltip.Callout\`. The module draws them for the hovered or dragged bar, so they need no wrapper.

| Part | Description |
|---|---|
| \`TaskTooltip.Callout\` | The callout beside the bar. Holds the rest. |
| \`TaskTooltip.Header\` | The task's name, and its status with \`statusColumnName\`. |
| \`TaskTooltip.ProgressRow\` | \`percentComplete\` as a bar. Nothing when it is not mapped or empty. |
| \`TaskTooltip.DateRangeRow\` | The start, end and duration on one line. |
| \`TaskTooltip.StartDateRow\`, \`EndDateRow\`, \`DurationRow\` | The same, one per row. |
| \`TaskTooltip.FieldRows\` | Holds field rows. |
| \`TaskTooltip.FieldRow\` | Any column of the task, by \`columnName\`, with an optional \`iconName\`. Nothing while the value is empty. |
| \`TaskTooltip.Renderer\` | The default tooltip, to use as a part. |

The date rows show the dates as the timeline draws them, so they follow a bar while it is dragged. A part of your own reads the task with \`useTaskTooltip()\`: its \`record\`, its \`span\` and \`duration\` as the timeline draws them, and its bar's \`color\`.

## Changing how it looks

\`createTaskTooltipModule\` takes \`components\` for the default tooltip, read at mount, and \`TaskTooltip.Renderer\` takes the same keys. In a tooltip of your own, each part takes its own slots as \`components\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Part | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskTooltip.Callout\` | \`callout\` | \`onRender\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the bar |
| \`TaskTooltip.Header\` | \`header\` | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\`: \`onRender\`; \`status\`: \`onRender\`, \`onRenderLabel\` | \`RecordCardHeaderComponents\`, \`RecordCardHeaderStartComponents\`, \`RecordCardHeaderEndComponents\`, \`RecordCardTitleComponents\`, \`OptionTagComponents\` | The name and the status pill |
| \`TaskTooltip.ProgressRow\` | \`progress\` | \`onRender\`, \`onRenderTrack\`, \`onRenderFill\`, \`onRenderText\` | \`RecordCardProgressComponents\` | The progress bar |
| \`TaskTooltip.DateRangeRow\` | \`dateRange\` | \`onRender\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`RecordCardDateRangeComponents\` | The dates and the duration |
| \`TaskTooltip.FieldRows\` | | \`onRender\` | \`RecordCardFieldRowsComponents\` | The box the field rows sit in |
| \`TaskTooltip.FieldRow\`, \`StartDateRow\`, \`EndDateRow\`, \`DurationRow\` | | \`onRender\`, \`onRenderIcon\`, \`onRenderLabel\`, \`onRenderValue\` | \`RecordCardFieldRowComponents\` | One row of the tooltip |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Links', iconName: 'Link', href: '?path=/docs/controls-taskgrid-gantt-modules-links--overview', text: 'Dependencies between the bars, with a tooltip of their own.' },
    { title: 'Write a module', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-gantt-write-a-module--overview', text: 'Draw your own content over the chart.' },
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

export const ComposeTheTooltip: Story = {
    name: 'Compose the tooltip',
    render: () => renderStory(<GanttTooltipExample />),
}
