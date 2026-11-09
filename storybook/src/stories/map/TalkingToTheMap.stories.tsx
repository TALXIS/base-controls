import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { EnlargementExample, TourExample } from './mapExamples'

const DESCRIPTION = `
Your own code can decide which pins the map shows, draw components of its own in the map's box, move the view and reach the library's own map for anything else. From outside, the map's props hand your code the map; from a component inside it, hooks reach it directly. Try it below: drag the slider back to 1958 and watch the EU shrink to its six founders.

{{canvas: The EU through the years}}

## Change the pins

The map draws a pin for each of its provider's records that has a position, so the provider decides which pins there are. To show fewer, filter the provider and refresh it, as \`onYearChange\` does; the pins and the view follow when it loads.

## From outside the map

| Prop | Called | Use it to |
|---|---|---|
| \`onSetup(map)\` | With each new map, before it loads | Subscribe to what the map offers. |
| \`onLoad(map)\` | Once the modules have loaded; the map waits for a promise it returns | Read the modules, or load what you need first. |

A new \`key\` mounts a new map and calls both again; how mounts work is on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

| Member | Description |
|---|---|
| \`getPoint(record)\` | Where the record's pin goes, as \`{ latitude, longitude }\`; \`undefined\` when its position is not a number. |
| \`modules\` | The loaded modules: \`modules.get('library')\` is the map library. |
| \`services\` | \`get('provider')\`, the records' provider, and \`get('viewport')\`, which moves the view. |
| \`lifecycle\` | The mount's status and events: see [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |

## From inside the map

A component of yours goes in the map as a child and is drawn in the map's box, under the library's map, once the modules have loaded, as the example does for \`MemberCount\`. Inside it, and inside a pin or a popup, these hooks reach the map:

| Hook | Returns |
|---|---|
| \`useMap()\` | The map. Throws outside one. |
| \`useMapModule(name)\` | One of its modules, such as \`'library'\`. |
| \`useMapRecords()\` | The records that have a pin, drawing the component again each time the provider loads new data. |
| \`useMapRecord()\` | The record of the pin being drawn, inside a pin or its popup. |

## Move the view

\`map.services.get('viewport')\` asks the library to move its map. Its \`fit()\` asks for the view of the current pins, as **Show all** does below, and \`getView()\` returns that view without moving; the views it picks are under *Where the map looks* on [**Map**](?path=/docs/controls-map-get-started--overview).

## Reach the library's map

\`map.modules.get('library')\` is the library module, and its \`getInstance()\` returns the library's own map once it is drawn, \`undefined\` before: a Leaflet \`Map\` for \`ILeaflet\`, a \`google.maps.Map\` for \`IGoogleMaps\`. To act the moment it is drawn, listen to \`onInstanceReady\` on the module's \`events\`; \`IGoogleMaps\` also fires \`onPopupChanged\` with the record id of the open popup, or \`undefined\` once it closes.

{{story: A tour from west to east}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'In a DatasetControl', iconName: 'ViewList', href: '?path=/docs/controls-map-in-a-datasetcontrol--overview', text: 'Let views, quick find and a ribbon decide what the map shows.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-map-your-own-ui--overview', text: 'Pins and popups of your own.' },
    { title: 'RuntimeHost', iconName: 'Processing', href: '?path=/docs/controls-runtimehost-get-started--overview', text: 'The mount behind the map, and its status and events.' },
]

const meta = {
    title: 'Controls/Map/Talking to the map',
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

export const TheEuThroughTheYears: Story = {
    name: 'The EU through the years',
    render: () => renderStory(<EnlargementExample />),
}

export const ATourFromWestToEast: Story = {
    name: 'A tour from west to east',
    render: () => renderStory(<TourExample />),
    parameters: {
        docs: {
            description: {
                story: `A component under the map flies the library's own map from capital to capital, and **Show all** asks the viewport to fit every pin. Try: press **Next capital** a few times, then **Show all**.`,
            },
        },
    },
}
