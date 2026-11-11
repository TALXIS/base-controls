import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { DatesOnTheTimelineExample } from '../../../../task-grid/guide/features/datesOnTheTimelineExamples'

const STEP = 'Dates on the timeline'

const DESCRIPTION = `
{{block: progress}}

The team plans around a few dates: move-in day, the opening party, the Easter holiday and every weekend. Markers draw the dates, non-working days keep the bars off the holidays, and a tooltip says what each bar is.

{{canvas: Dates on the timeline}}

## How it works

This step adds three Gantt modules to the plan of [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview), and \`TaskDatasetControl.Settings\` to its header. In **Code**, the new lines carry \`//new:\`, and *calendar.ts* holds the dates.

| Module | Draws | Reads |
|---|---|---|
| \`createMemoryMarkersModule({ markers })\` | A line, with a chip on the scale, for today and for each marker | \`MILESTONES\`: an \`id\`, a \`text\` and a \`date\`, and optionally a \`color\` and a \`lineStyle\` |
| \`createMemoryNonWorkingDaysModule({ nonWorkingDays })\` | Weekends and the days you list, shaded | \`HOLIDAYS\`: an \`id\` and a \`date\`, and optionally an \`endDate\`, a \`description\` and a \`recurrence\` such as \`FREQ=YEARLY\` |
| \`createTaskTooltipModule({ statusColumnName })\` | The task's name, progress, dates and duration, under the pointer | The option set \`status\` of *office.ts*, drawn as a pill in its option's colour |

**Markers.** Today is marked unless \`today: { enableMarker: false }\` says otherwise, and so are the project's start and end once a project module is loaded, as in [**Templates and the project**](?path=/docs/controls-taskgrid-guide-features-templates-and-the-project--overview). *Go to today* scrolls to today's line.

**Non-working days.** A bar that is dragged or drawn so that it starts or ends on a non-working day moves on, in the direction it was dragged, until it starts and ends on working days; \`enableDropOnNonWorkingDays: true\` lets it stay. Dates the store already holds stay as they are, such as the catering's start on Easter Monday. Durations count working days only, as the tooltip shows. The shading shows once the scale shows single days, and *Hide non-working days* in \`TaskDatasetControl.Settings\` takes those days off the scale. Weekends are non-working unless \`enableWeekends: false\` says otherwise.

## Try it

- Press *Expand one level* twice, then rest the pointer on the bar of *Book the movers*: the tooltip shows its status, *Waiting*, with its progress, its dates and its 5 working days.
- Drag the bar of *Paint the meeting rooms* a few days later: wherever you drop it, it starts and ends on a working day.
- Click *Show on timeline* in the row of *Order the catering*: the scale shows its days, with Easter Monday and the weekends shaded and the *Opening party* marker on Friday 10 April.
- Open *Settings* and turn on *Hide non-working days*: the shaded days leave the scale.

## Remember

- Markers, non-working days and the tooltip are Gantt modules, in \`TaskGantt\`'s \`modules\`.
- The markers mark today, the project's start and end, and the dates you list.
- A bar the user drags or draws never starts or ends on a non-working day, and durations count working days only.
- The tooltip shows an option set column as a pill when \`statusColumnName\` names it.

Your plan has everything a team needs. Next, connect it to where your tasks really live.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Features/Dates on the timeline',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const DatesOnTheTimeline: Story = {
    name: 'Dates on the timeline',
    tags: ['!dev'],
    render: () => renderStory(<DatesOnTheTimelineExample />),
}
