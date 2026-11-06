import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { FilterExample, LeafletInstanceExample } from './mapExamples'

const DESCRIPTION = `
Your own code can decide which pins the map shows, follow when they change, and reach the library's own map for anything the map itself does not offer. From outside, the map's props hand your code the map; from a component of yours inside it, hooks reach it directly. Try it below: drag the slider to hide the smaller cities.

{{canvas: Hide the smaller cities}}

## Change the pins

The map draws a pin for each of its data provider's records that has a position, so the provider decides which pins there are. To show fewer, filter the provider and refresh it, as the example does; the pins and the view follow when it loads.

## From outside the map

| Prop | Called | Use it to |
|---|---|---|
| \`onSetup(map)\` | With each new map, before it loads | Subscribe to what the map offers |
| \`onLoad(map)\` | Once the modules have loaded; the map waits for a promise it returns | Read the modules, or load what you need first |

A remount, such as a new \`key\`, brings a new map and calls both again. How mounts work: [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

| Member | Description |
|---|---|
| \`getPoint(record)\` | Where the record's pin goes, as \`{ latitude, longitude }\`; \`undefined\` when its position is not a number. |
| \`modules\` | The loaded modules: \`modules.get('library')\` is the map library. |
| \`services\` | \`provider\`, the records' data provider, and \`viewport\`, which asks the library to move the view: see [**Write a library**](?path=/docs/controls-map-write-a-library--overview). |
| \`lifecycle\` | The mount's status and events: see [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |

## From inside the map

A component in the map's children, beside the adapter, is drawn in the map's box, under the map, as \`CityCount\` is in the example. \`useMap()\` returns the map, and \`useMapModule(name)\` one of its modules; both throw outside a map. \`useMapRecords()\` returns the records that have a pin and draws the component again when the provider loads new data.

## Reach the library's map

\`map.modules.get('library')\` returns the map library, and its \`getInstance()\` the library's own map once the adapter has drawn it: a Leaflet \`Map\` or a \`google.maps.Map\`, and \`undefined\` before. To follow the moment it is drawn, type the library as \`ILeaflet\` or \`IGoogleMaps\` and listen to \`onInstanceReady\` on its \`events\`.

{{story: Reach Leaflet}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'RuntimeHost', iconName: 'Processing', href: '?path=/docs/controls-runtimehost-get-started--overview', text: 'The mount behind the map, and its status and events.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-map-your-own-ui--overview', text: 'Draw your own pins, popups and box.' },
    { title: 'Write a library', iconName: 'Code', href: '?path=/docs/controls-map-write-a-library--overview', text: 'Draw the map with a library of your own.' },
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

export const HideTheSmallerCities: Story = {
    name: 'Hide the smaller cities',
    render: () => renderStory(<FilterExample />),
}

export const ReachLeaflet: Story = {
    name: 'Reach Leaflet',
    render: () => renderStory(<LeafletInstanceExample />),
    parameters: {
        docs: {
            description: {
                story: `\`onLoad\` follows the clicks on Leaflet's map, and a button inside the map moves it through \`useMapModule\`. Try: click anywhere on the map, then press **Show the world**.`,
            },
        },
    },
}
