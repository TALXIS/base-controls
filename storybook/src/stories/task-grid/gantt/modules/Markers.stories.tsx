import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GanttMarkersExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
A marker is a date marked on the timeline with a line, and a chip on the scale that names it. The markers module marks today, the project's start and end, and dates of your own, such as releases.

\`\`\`tsx
const ganttModules = React.useMemo(() => [
    createLibraryModule(),
    createMemoryMarkersModule({ markers: [{ id: 'beta', text: 'Beta', date: dayjs('2025-12-01') }] }),
], [])
\`\`\`

{{story: Mark the releases}}

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
| \`today\` | \`{ enableMarker: true }\`, in red | \`{ enableMarker?, color?, lineStyle? }\`, the marker of today. |
| \`project\` | \`{ enableMarkers: true }\` | \`{ enableMarkers?, color?, lineStyle? }\`, the markers of the project's start and end, from the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module. |
| \`components\` | Defaults | See *Changing how it looks* below. |

## Where markers come from

| Factory | Markers |
|---|---|
| \`createMemoryMarkersModule\` | \`markers\`: the markers. |
| \`createMarkersModule\` | Today and the project only, or a store of yours: \`onCreateStore\` returns a store with \`onLoadMarkers()\`, which returns the markers. The chart does not wait for them. |

## Changing how it looks

\`createMarkersModule\` and \`createMemoryMarkersModule\` take \`components\`, read at mount. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`chip\` | \`onRenderChip\`, \`onRenderTooltip\` | \`MarkerUiChipComponents\` | A marker's chip on the scale, and what it says when pointed at |
| \`line\` | \`onRenderContainer\` | \`MarkerUiLineComponents\` | A marker's line over the chart |
| \`scale\`, \`track\`, \`column\`, \`layer\` | \`onRenderContainer\` | \`MarkerUiScaleComponents\`, \`MarkerUiTrackComponents\`, \`MarkerUiColumnComponents\`, \`MarkerUiLayerComponents\` | The boxes the chips and lines sit in |

Inside a slot, \`useMarker()\` returns the marker it draws, to change only some of them:

\`\`\`tsx
const LaunchChip = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { marker } = useMarker()
    if (marker.id !== 'launch') {
        return <div {...props} />
    }
    return <div {...props}><strong>{marker.text}</strong></div>
}

createMemoryMarkersModule({ markers, components: { chip: { onRenderChip: props => <LaunchChip {...props} /> } } })
\`\`\`
`

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Markers',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
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
    parameters: {
        docs: {
            description: {
                story: `Two releases, the project's start and end, and today. The launch chip counts the days. Try: zoom to fit, point at a chip, or add a marker to \`RELEASES\` in **Code**.`,
            },
        },
    },
}
