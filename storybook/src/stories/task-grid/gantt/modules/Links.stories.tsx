import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttLinksExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The links module draws the task grid's dependencies as arrows between the bars, and lets the user draw and delete them. The dependencies come from the [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) module, which keeps them in memory, in Dataverse or in TALXIS: without it, the Gantt fails to load with an error saying so. Try it below: drag from the end of one bar to the start of another.

{{canvas: Link the tasks}}

## What the user can do

| Gesture | Does |
|---|---|
| Drag from the handle at either end of a bar to another bar | Draws a link. The ends it joins decide the type: *finish to start*, *start to start*, *finish to finish* or *start to finish*. A duplicate, a cycle or a link to a task that is saving is refused, and its tooltip says why while it is drawn. |
| Double-click a link | Deletes it, once the user confirms |
| Point at a link | Shows what it joins |

Drawing and deleting links needs \`enableEditing\`. While a link saves, its tasks show as saving.

## Options

| Option | Description |
|---|---|
| \`components\` | Under \`tooltip\`: \`onRender\`, a link's whole tooltip composed from \`LinkTooltip\`'s parts (\`Callout\`, \`Header\`, \`FieldRows\`, \`PredecessorRow\`, \`SuccessorRow\`, \`DateRangeRow\`), or the default tooltip's slots (see *Changing how it looks* below), which \`onRender\` leaves unused. |

\`onRender\` returns the parts in your order, starting with \`LinkTooltip.Callout\`, as on [**Tooltip**](?path=/docs/controls-taskgrid-gantt-modules-tooltip--overview). A part of your own reads the link with \`useLinkTooltip()\`: its \`dependency\`, and the \`predecessor\` and \`successor\` records.

## Changing how it looks

\`createLinksModule\` takes \`components\` for the default link tooltip, read at mount, under \`tooltip\`; each part of \`LinkTooltip\` takes the same slots in its own \`components\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Part | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`LinkTooltip.Callout\` | \`tooltip.callout\` | \`onRender\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the link |
| \`LinkTooltip.Header\` | \`tooltip.header\` | \`header\`, \`headerStart\`, \`title\`: \`onRender\` | \`RecordCardHeaderComponents\`, \`RecordCardHeaderStartComponents\`, \`RecordCardTitleComponents\` | The dependency's type |
| \`LinkTooltip.FieldRows\` | \`tooltip.fieldRows\` | \`onRender\` | \`RecordCardFieldRowsComponents\` | The box the rows sit in |
| \`LinkTooltip.PredecessorRow\`, \`SuccessorRow\` | \`tooltip.predecessor\`, \`tooltip.successor\` | \`onRender\`, \`onRenderIcon\`, \`onRenderLabel\`, \`onRenderValue\` | \`RecordCardFieldRowComponents\` | The two tasks |
| \`LinkTooltip.DateRangeRow\` | \`tooltip.dateRange\` | \`onRender\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`RecordCardDateRangeComponents\` | The dates the link joins |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Dependencies', iconName: 'Link', href: '?path=/docs/controls-taskgrid-modules-dependencies--overview', text: 'Where the dependencies are kept, and how to reach them from code.' },
    { title: 'Tooltip', iconName: 'Info', href: '?path=/docs/controls-taskgrid-gantt-modules-tooltip--overview', text: 'What a bar says when the pointer is on it, composed from parts.' },
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
