import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttLinksExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The links module draws the task grid's dependencies as arrows between the bars, and lets the user draw and delete them. The dependencies come from the [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) module, which keeps them in memory, in Dataverse or in TALXIS: without it, the links module draws nothing. Try it below: drag from the end of one bar to the start of another.

{{canvas: Link the tasks}}

## What the user can do

With \`enableEditing\`:

- Dragging from the handle at either end of a bar to another bar draws a link. The ends it joins decide the type: *finish to start*, *start to start*, *finish to finish* or *start to finish*. A duplicate or a cycle is refused.
- Double-clicking a link and confirming deletes it.
- Pointing at a link shows what it joins.

While a link saves, its tasks show as saving.

## Options

| Option | Description |
|---|---|
| \`onRenderTooltip\` | A link's whole tooltip, composed from \`LinkTooltip\`'s parts: \`Callout\`, \`Header\`, \`FieldRows\`, \`PredecessorRow\`, \`SuccessorRow\` and \`DateRangeRow\`. |
| \`components\` | Slots of the default link tooltip. See *Changing how it looks* below. |

## Changing how it looks

\`createLinksModule\` takes \`components\` for the default link tooltip, read at mount, under \`tooltip\`; each part of \`LinkTooltip\` takes the same slots in its own \`components\`. How slots work: [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

| Key | Part | Slots | Default | Draws |
|---|---|---|---|---|
| \`tooltip.callout\` | \`LinkTooltip.Callout\` | \`onRenderCallout\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the link |
| \`tooltip.header\` | \`LinkTooltip.Header\` | \`onRenderContainer\`, \`onRenderTitle\` | \`TooltipUiHeaderComponents\` | The dependency's type |
| \`tooltip.fieldRows\` | \`LinkTooltip.FieldRows\` | \`onRenderContainer\` | \`TooltipUiFieldRowsComponents\` | The box the rows sit in |
| \`tooltip.predecessor\`, \`tooltip.successor\` | \`LinkTooltip.PredecessorRow\`, \`SuccessorRow\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderLabel\`, \`onRenderValue\` | \`TooltipUiFieldRowComponents\` | The two tasks |
| \`tooltip.dateRange\` | \`LinkTooltip.DateRangeRow\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`TooltipUiDateRangeComponents\` | The dates the link joins |

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
