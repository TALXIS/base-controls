import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttNonWorkingDaysExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The non-working days module shades weekends and the days you list, such as holidays, on the timeline, and leaves them out of every task's duration. Try it below: drag a bar onto a weekend.

{{canvas: Shade the holidays}}

## What it does

The days are shaded while the zoom shows single days, and pointing at one on the scale shows its description. Durations count only working time, and a bar dragged or drawn onto non-working days slides off them in the direction it moved. *Hide non-working days* in \`TaskDatasetControl.Settings\` takes them off the timeline, a choice kept per view and saved with user views.

## A non-working day

| Field | Description |
|---|---|
| \`id\` | Required. |
| \`date\` | Required. The first day, or of the first occurrence when it recurs. |
| \`endDate\` | The last day, included. Leave it out for a single day. |
| \`description\` | What the scale says when the day is pointed at. |
| \`recurrence\` | An <a href="https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html" target="_blank" rel="noreferrer">RRULE</a> starting at \`date\`, such as \`FREQ=YEARLY\`, \`FREQ=YEARLY;BYEASTER=-2\` for Good Friday, or \`FREQ=MONTHLY;BYDAY=-1FR\` for every month's last Friday. |
| \`data\` | Anything else the day carries. |

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
| \`createNonWorkingDaysModule\` | Weekends only, or a store of yours: \`onCreateStore\` returns a store with \`onLoadNonWorkingDays()\`, which returns the days. |

## Changing how it looks

\`createNonWorkingDaysModule\` and \`createMemoryNonWorkingDaysModule\` take \`components\`, read at mount. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`tooltip\` | \`onRenderCallout\`, \`onRenderContainer\`, \`onRenderDescription\` (with the whole \`day\`) | \`NonWorkingDaysUiTooltipComponents\` | What a shaded day on the scale says when pointed at |

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
