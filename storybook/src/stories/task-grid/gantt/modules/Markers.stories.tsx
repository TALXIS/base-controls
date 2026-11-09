import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttMarkersExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
A marker is a date marked on the timeline with a line, and a chip on the scale that names it. The markers module marks today, the project's start and end, and dates of your own, such as releases. Try it below: add a marker to \`RELEASES\` in **Code**.

{{canvas: Mark the releases}}

## A marker

| Field | Default | Description |
|---|---|---|
| \`id\` | Required | |
| \`text\` | Required | The chip's text. |
| \`date\` | Required | A \`Dayjs\`. |
| \`color\` | The theme's primary colour | The line's and the chip's colour. |
| \`lineStyle\` | \`'dotted'\` | \`'solid'\` or \`'dotted'\`. |

## Options

| Option | Default | Description |
|---|---|---|
| \`today\` | \`{ enableMarker: true }\`, in the theme's red | \`{ enableMarker?, color?, lineStyle? }\`, the marker of today. |
| \`project\` | \`{ enableMarkers: true }\` | \`{ enableMarkers?, color?, lineStyle? }\`, the markers of the project's start and end, from the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module. |
| \`components\` | Defaults | See *Changing how it looks* below. |

## Where markers are kept

| Factory | Markers |
|---|---|
| \`createMemoryMarkersModule\` | \`markers\`: the markers. |
| \`createMarkersModule\` | Today and the project only, or a store of yours: \`createStore\` returns a store with \`loadMarkers()\`, which returns the markers. The chart does not wait for them. |

The module's \`reload()\` reads the store again and redraws the markers: reach the module by its name, \`markers\`, as on [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview).

## Changing how it looks

\`createMarkersModule\` and \`createMemoryMarkersModule\` take \`components\`, read at mount. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`chip\` | \`onRenderChip\`, \`onRenderTooltip\` | \`MarkerUiChipComponents\` | A marker's chip on the scale, and what it says when pointed at |
| \`line\` | \`onRenderContainer\` | \`MarkerUiLineComponents\` | A marker's line over the chart |
| \`scale\`, \`track\`, \`column\`, \`layer\` | \`onRenderContainer\` | \`MarkerUiScaleComponents\`, \`MarkerUiTrackComponents\`, \`MarkerUiColumnComponents\`, \`MarkerUiLayerComponents\` | The boxes the chips and lines sit in |

Inside a slot, \`useMarker()\` returns the \`marker\` it draws and its \`left\` position, to change only some of them, as \`LaunchChip\` in the example does.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Project', iconName: 'ProjectCollection', href: '?path=/docs/controls-taskgrid-modules-project--overview', text: 'The project whose start and end the markers show.' },
    { title: 'Non-working days', iconName: 'Calendar', href: '?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview', text: 'Weekends and holidays, shaded and left out of durations.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Markers',
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

export const MarkTheReleases: Story = {
    name: 'Mark the releases',
    render: () => renderStory(<GanttMarkersExample />),
}
