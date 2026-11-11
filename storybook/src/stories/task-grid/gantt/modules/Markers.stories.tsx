import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttMarkerChipExample, GanttMarkersExample, GanttMarkersReloadExample, GanttMarkersStoreExample, GanttTodayAndProjectExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
A marker picks out a date on the timeline, with a line down the chart and a chip on the scale that names it. The markers module marks today, the start and end of the project, and dates of your own, such as releases or reviews. Try it below: add a marker to \`RELEASES\` in **Code**.

{{canvas: Mark the releases}}

## A marker

| Field | Default | Description |
|---|---|---|
| \`id\` | Required | Unique among the markers. |
| \`text\` | Required | What the chip says. Pointing at the chip shows the text with the date. |
| \`date\` | Required | A \`Dayjs\`, or an ISO string in a memory table. |
| \`color\` | The theme's primary colour | The colour of the line and the chip. |
| \`lineStyle\` | \`'dotted'\` | \`'solid'\` or \`'dotted'\`. |

## Today and the project

Every markers module marks today, in the theme's red, unless \`today.enableMarker\` is \`false\`. With a [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module in \`TaskDatasetControl\`'s \`modules\`, it marks the project's start and end too, unless \`project.enableMarkers\` is \`false\`. Both take a \`color\` and a \`lineStyle\` of their own.

{{story: Today and the project}}

## Where markers are kept

| Factory | Marks |
|---|---|
| \`createMarkersModule()\` | Today and the project only. |
| \`createMemoryMarkersModule({ markers })\` | Also the rows of a \`MemoryTable\` you keep, as in the example at the top. |
| \`createMarkersModule({ createStore })\` | Also what a store of yours loads. |

A store is an object with an async \`loadMarkers()\` that returns the markers; when the module calls it, and what happens when it fails, is under *Where the data comes from* on [**Modules**](?path=/docs/controls-taskgrid-gantt-modules--overview). The example's *releasesStore.ts* loads the markers from a server.

{{story: Markers from your own store}}

After a change to where the markers are kept, call the module's \`reload()\` to draw them anew. Reach the module by its name, \`markers\`: from outside, through the DatasetControl's \`gantt\` part, as the example does, or in a module of your own, as on [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview).

{{story: Reload the markers}}

## Changing how it looks

\`createMarkersModule\` and \`createMemoryMarkersModule\` take \`components\` for every marker. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`chip\` | \`onRenderChip\`, \`onRender\` | \`MarkerUiChipComponents\` | The chip on the scale, and the tooltip that holds it |
| \`line\` | \`onRender\` | \`MarkerUiLineComponents\` | The line down the chart |
| \`scale\`, \`track\`, \`column\`, \`layer\` | \`onRender\` | \`MarkerUiScaleComponents\`, \`MarkerUiTrackComponents\`, \`MarkerUiColumnComponents\`, \`MarkerUiLayerComponents\` | The boxes the chips and lines sit in |

Inside a slot, \`useMarker()\` returns the \`marker\` it draws and its \`left\` position in pixels, so a slot can draw some markers its own way.

{{story: A chip of your own}}

To change what today's and the project's markers say, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| \`markers\` | \`MemoryTable<IMemoryMarker>\` | Required | \`createMemoryMarkersModule\` only. The markers, their dates as ISO strings. |
| \`createStore\` | \`(taskRuntime) => IMarkersStore\` | None | \`createMarkersModule\` only. Makes the store of the markers of your own. |
| \`today\` | \`{ enableMarker?, color?, lineStyle? }\` | \`{ enableMarker: true }\` | Today's marker. |
| \`project\` | \`{ enableMarkers?, color?, lineStyle? }\` | \`{ enableMarkers: true }\` | The project's start and end. |
| \`components\` | \`IMarkersComponents\` | Defaults | See *Changing how it looks* above. |

Every parameter is read at mount.

### The markers module

| Member | Description |
|---|---|
| \`getMarkers()\` | Today's, the project's and the store's markers. |
| \`reload()\` | Loads the store's markers again and draws every marker anew. |
| \`events\` | \`onMarkersChanged\`, after the markers change. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Project', iconName: 'ProjectCollection', href: '?path=/docs/controls-taskgrid-modules-project--overview', text: 'The project whose start and end the markers show.' },
    { title: 'Non-working days', iconName: 'Calendar', href: '?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview', text: 'Weekends and holidays, shaded and left out of durations.' },
    { title: 'Zoom and navigation', iconName: 'ZoomIn', href: '?path=/docs/controls-taskgrid-gantt-zoom-and-navigation--overview', text: 'Go to today, zoom to fit, and zoom to dates of your own.' },
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

export const TodayAndTheProject: Story = {
    name: 'Today and the project',
    render: () => renderStory(<GanttTodayAndProjectExample />),
    parameters: {
        docs: {
            description: {
                story: `Today and the project's start and end in colours of their own, with no markers of your own. Try: change the project's \`endDate\` in **Code**.`,
            },
        },
    },
}

export const MarkersFromYourOwnStore: Story = {
    name: 'Markers from your own store',
    render: () => renderStory(<GanttMarkersStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A store that marks a sprint review every other Friday. Try: change \`firstReview\` in **Code**.`,
            },
        },
    },
}

export const ReloadTheMarkers: Story = {
    name: 'Reload the markers',
    render: () => renderStory(<GanttMarkersReloadExample />),
    parameters: {
        docs: {
            description: {
                story: `A button that adds a release to the table and reloads the markers. Try: click *Add a hotfix release*.`,
            },
        },
    },
}

export const AChipOfYourOwn: Story = {
    name: 'A chip of your own',
    render: () => renderStory(<GanttMarkerChipExample />),
    parameters: {
        docs: {
            description: {
                story: `Chips that count the days to each release. Try: change the date of *Launch* in **Code**.`,
            },
        },
    },
}
