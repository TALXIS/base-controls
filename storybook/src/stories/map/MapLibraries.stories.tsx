import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { TilesExample } from './mapExamples'

const DESCRIPTION = `
The map works out its pins and where to look, but a *map library* draws them: Leaflet over the map tiles of a tile service you pick, or Google Maps under an API key of yours. Each library has its own component, \`LeafletMap\` or \`GoogleMap\`, and the pins, the popups and the view behave the same whichever one draws them. Try it below: pick **CARTO Dark Matter** under **Leaflet tiles**.

{{canvas: Choose the tiles}}

## The libraries

| Component | Draws with |
|---|---|
| \`LeafletMap\` | Leaflet, over OpenStreetMap's tiles unless \`tileUrl\` and \`attribution\` name others. Needs no key. |
| \`GoogleMap\` | The Google Maps JavaScript API, under your \`apiKey\`. The map shows its loading state until the API has loaded. |

Both take every prop of \`Map\`, as listed on [**Map**](?path=/docs/controls-map-get-started--overview), and one \`components\` for the map's slots and the library's: see [**Your own UI**](?path=/docs/controls-map-your-own-ui--overview). The library is set up only as the map mounts, so to switch libraries or tiles, mount the map again, as the example's \`LibraryPicker.tsx\` does with a new component for each.

## Leaflet

Your app imports Leaflet's stylesheet once, with \`import 'leaflet/dist/leaflet.css'\`; without it, the tiles do not line up.

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`tileUrl\` | \`string\` | OpenStreetMap's | At mount | A URL template with \`{z}\`, \`{x}\` and \`{y}\`, and optionally \`{s}\` for the tile server and \`{r}\` for sharper tiles on high-density screens. |
| \`attribution\` | \`string\` | OpenStreetMap's | At mount | The HTML credit the tile service asks you to show. |

## Google Maps

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`apiKey\` | \`string\` | Required | At mount | A key for the Maps JavaScript API, from the Google Cloud console. |
| \`mapId\` | \`string\` | \`DEMO_MAP_ID\` | At mount | A Map ID from *Map management* in the same Google Cloud project, which ties the map to the style Google keeps for it. Google needs one to draw Advanced Markers, which the pins are; \`DEMO_MAP_ID\` is Google's shared ID for development, so create your own for production. |

The Maps API loads once per page, under the key of the first Google map, so a later map with another key still uses the first. The map draws without Google's own buttons, such as zoom and Street View, and a click on the map closes the open popup, as in Leaflet.

## A library of your own

To draw with another library, use \`Map\` itself. It takes \`modules\`, one of them named \`library\`, and draws that library's map as its child; without a \`library\` module it shows an error.

| You write | Does |
|---|---|
| A module \`{ name: 'library', onLoad }\`, typed \`IMapModule<'library'>\` | \`onLoad(map)\` returns an \`IMapLibrary\`, whose \`getInstance()\` returns your library's map. An optional \`onDestroy\` gets it back as the map unmounts. |
| A component in \`Map\`'s children | Draws your library's map, with a pin at \`map.getPoint(record)\` for each of \`useMapRecords()\`, and wraps each pin in \`MapRecordContext.Provider\` so \`useMapRecord()\` works inside it. |
| A listener to \`onViewRequested\` on \`map.services.get('viewport').events\` | Moves your library's map to the \`{ center, zoom }\` or \`{ bounds, padding }\` it is handed. Call the viewport's \`fit()\` once your map is drawn, for its first view. |

\`useMap()\` and \`useMapModule('library')\` reach the map and your module from the component; the rest of the hooks are on [**Talking to the map**](?path=/docs/controls-map-talking-to-the-map--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-map-your-own-ui--overview', text: 'Pins and popups of your own, drawn the same in both libraries.' },
    { title: 'Talking to the map', iconName: 'Plug', href: '?path=/docs/controls-map-talking-to-the-map--overview', text: 'Reach Leaflet\'s or Google\'s own map from your code.' },
    { title: 'Map', iconName: 'MapPin', href: '?path=/docs/controls-map-get-started--overview', text: 'The props, and where the map looks.' },
]

const meta = {
    title: 'Controls/Map/Map libraries',
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

export const ChooseTheTiles: Story = {
    name: 'Choose the tiles',
    render: () => renderStory(<TilesExample />),
}
