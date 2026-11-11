import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttLinksExample, GanttLinkTooltipExample, GanttMilestoneLinksExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
A link shows that one task waits on another, as an arrow from one bar to the next. The links module draws the dependencies that the task grid's Dependencies module holds, and lets the user draw and delete them on the chart. Try it below: drag from the end of one bar to the start of another.

{{canvas: Link the tasks}}

## What the user can do

| Gesture | Does |
|---|---|
| Drag from the handle at either end of a bar to another bar | Draws a link. The ends it joins decide its type: *finish to start*, *start to start*, *finish to finish* or *start to finish*. A link to the task itself, a duplicate, a cycle, or a link to a task that is saving is refused, and the text beside the pointer says why. |
| Double-click a link | Deletes it, once the user confirms. |
| Point at a link | Shows what it joins. See *The tooltip* below. |

Drawing and deleting links needs \`enableEditing\`; without it, the links are only shown. A milestone links like a bar does, and a link to a task without dates is not drawn until the task has some. While a link saves, its tasks show as saving.

{{story: Link to a milestone}}

## Where the dependencies come from

The links module keeps nothing of its own. It draws what the Dependencies module in \`TaskDatasetControl\`'s \`modules\` holds, kept in memory, in Dataverse, in TALXIS or in a store of yours, and a link the user draws or deletes is saved there: see [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview). Without a Dependencies module, the Gantt fails with an error saying so.

## The tooltip

By default, a link's tooltip shows its type, its two tasks and the dates it joins. To show something else, \`components.tooltip.onRender\` returns the whole tooltip, composed from \`LinkTooltip\`'s parts in your order, starting with \`LinkTooltip.Callout\`.

| Part | Shows |
|---|---|
| \`LinkTooltip.Callout\` | The callout beside the pointer. Holds the rest. |
| \`LinkTooltip.Header\` | The link's type. |
| \`LinkTooltip.FieldRows\` | Holds the rows. |
| \`LinkTooltip.PredecessorRow\`, \`SuccessorRow\` | The names of the two tasks, with an optional \`iconName\`. |
| \`LinkTooltip.DateRangeRow\` | The date the link leaves from and the date it arrives at. |
| \`LinkTooltip.Renderer\` | The default tooltip, to use as a part. |

A part of your own reads the link with \`useLinkTooltip()\`: its \`dependency\`, the \`predecessor\` and \`successor\` records, and the \`gantt\`, as \`SlackRow\` in the example does.

{{story: A tooltip of your own}}

## Changing how it looks

Under \`tooltip\`, \`createLinksModule\` takes the default tooltip's slots, which \`onRender\` leaves unused; in a tooltip of your own, each part takes the same slots as its \`components\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Part | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`LinkTooltip.Callout\` | \`tooltip.callout\` | \`onRender\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the pointer |
| \`LinkTooltip.Header\` | \`tooltip.header\` | \`header\`, \`headerStart\`, \`title\`: \`onRender\` | \`RecordCardHeaderComponents\`, \`RecordCardHeaderStartComponents\`, \`RecordCardTitleComponents\` | The link's type |
| \`LinkTooltip.FieldRows\` | \`tooltip.fieldRows\` | \`onRender\` | \`RecordCardFieldRowsComponents\` | The box the rows sit in |
| \`LinkTooltip.PredecessorRow\`, \`SuccessorRow\` | \`tooltip.predecessor\`, \`tooltip.successor\` | \`onRender\`, \`onRenderIcon\`, \`onRenderLabel\`, \`onRenderValue\` | \`RecordCardFieldRowComponents\` | The two tasks |
| \`LinkTooltip.DateRangeRow\` | \`tooltip.dateRange\` | \`onRender\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`RecordCardDateRangeComponents\` | The dates the link joins |

To change the link types' names and the reasons a link is refused, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`ILinksComponents\` | Defaults | Under \`tooltip\`: \`onRender\` for a tooltip of your own, or the default tooltip's slots. Read at mount. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Dependencies', iconName: 'Link', href: '?path=/docs/controls-taskgrid-modules-dependencies--overview', text: 'Where the dependencies are kept, and how to reach them from code.' },
    { title: 'Tooltip', iconName: 'Info', href: '?path=/docs/controls-taskgrid-gantt-modules-tooltip--overview', text: 'What a bar says when the pointer is on it, composed from parts.' },
    { title: 'Dates and bars', iconName: 'CalendarSettings', href: '?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview', text: 'Which tasks are bars, which are milestones, and which have no place yet.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Links',
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

export const LinkTheTasks: Story = {
    name: 'Link the tasks',
    render: () => renderStory(<GanttLinksExample />),
}

export const LinkToAMilestone: Story = {
    name: 'Link to a milestone',
    render: () => renderStory(<GanttMilestoneLinksExample />),
    parameters: {
        docs: {
            description: {
                story: `Two milestones, one already waiting on the testing. Try: draw a link from *Sign-off* to *Go live*.`,
            },
        },
    },
}

export const ATooltipOfYourOwn: Story = {
    name: 'A tooltip of your own',
    render: () => renderStory(<GanttLinkTooltipExample />),
    parameters: {
        docs: {
            description: {
                story: `A link tooltip composed from parts, one of them counting the days between the two tasks. Try: point at a link.`,
            },
        },
    },
}
