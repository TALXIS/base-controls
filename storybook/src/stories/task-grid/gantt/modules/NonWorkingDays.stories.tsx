import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttNonWorkingDaysExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The non-working days module shades weekends and the days you list, such as holidays, on the timeline, and leaves them out of every task's duration. Try it below: zoom in until the scale shows days, then drag a bar onto a weekend.

{{canvas: Shade the holidays}}

## What it does

The days are shaded while the zoom shows single days, and pointing at one on the scale shows its description. Durations count only working time, and a bar dragged or drawn onto non-working days slides off them in the direction it moved. *Hide non-working days* in \`TaskDatasetControl.Settings\` takes them off the timeline while it shows single days, a choice kept per view and saved with user views.

## A non-working day

| Field | Default | Description |
|---|---|---|
| \`id\` | Required | |
| \`date\` | Required | A \`Dayjs\`: the first day, or that of the first occurrence when it recurs. |
| \`endDate\` | The \`date\` | The last day, included. |
| \`description\` | None | What the scale says when the day is pointed at. |
| \`recurrence\` | None | An <a href="https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html" target="_blank" rel="noreferrer">RRULE</a> starting at \`date\`, such as \`FREQ=YEARLY\`, \`FREQ=YEARLY;BYEASTER=-2\` for Good Friday, or \`FREQ=MONTHLY;BYDAY=-1FR\` for every month's last Friday. |
| \`data\` | None | Anything else the day carries, read back with the module's \`getNonWorkingDays(date)\`. |

## Options

| Option | Default | Description |
|---|---|---|
| \`enableWeekends\` | \`true\` | Saturdays and Sundays are non-working days. |
| \`isVisibleByDefault\` | \`true\` | Shows the days until the user hides them. |
| \`enableDropOnNonWorkingDays\` | \`false\` | Lets a bar land on non-working days. |
| \`components\` | Defaults | See *Changing how it looks* below. |

## Where non-working days are kept

| Factory | Days |
|---|---|
| \`createMemoryNonWorkingDaysModule\` | \`nonWorkingDays\`: the days. |
| \`createNonWorkingDaysModule\` | Weekends only, or a store of yours: \`createStore\` returns a store with \`loadNonWorkingDays()\`, which returns the days. The chart does not wait for them. |

The module's \`reload()\` reads the store again and redraws the chart: reach the module by its name, \`nonWorkingDays\`, as on [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview).

## Changing how it looks

\`createNonWorkingDaysModule\` and \`createMemoryNonWorkingDaysModule\` take \`components\`, read at mount. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`tooltip\` | \`onRenderCallout\`, \`onRenderContainer\`, \`onRenderDescription\` (with the day's \`id\` and \`description\` as \`day\`) | \`NonWorkingDaysUiTooltipComponents\` | What a shaded day on the scale says when pointed at |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Editing on the timeline', iconName: 'Edit', href: '?path=/docs/controls-taskgrid-gantt-modules-editing-on-the-timeline--overview', text: 'Move and resize bars, and draw new tasks.' },
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
