import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { LibrariesExample } from './mapExamples'

const DESCRIPTION = `
The map works out its pins and where to look, but a *map library* draws them, over the map tiles of a tile service. Two libraries come with the package, Leaflet and Google Maps, and each is a module the map loads plus an adapter that draws inside the map. Try it below: pick **Leaflet, CARTO light**, then paste a Google Maps API key and pick **Google Maps**.

{{canvas: Switch the library}}

## The libraries

| Module | Adapters | Draws with |
|---|---|---|
| \`createLeafletModule({ tileUrl?, attribution? })\` | \`<Leaflet>\` with \`<LeafletMarkers />\` | Leaflet, over OpenStreetMap tiles unless \`tileUrl\` and \`attribution\` name others. Needs no key |
| \`createGoogleMapsModule({ apiKey })\` | \`<GoogleMaps>\` with \`<GoogleMapsMarkers />\` | The Google Maps JavaScript API, under a key of yours |

The module goes in \`modules\` and its own adapter in the map's children. The map reads \`modules\` only as it mounts, so to switch libraries, mount it again with a new \`key\`, as the example does. Whichever library draws, the map moves the view the same way: see *Where the map looks* on [**Map**](?path=/docs/controls-map-get-started--overview).

## Leaflet

Leaflet needs its stylesheet, which your app imports once, with \`import 'leaflet/dist/leaflet.css'\`; without it, the tiles do not line up. \`tileUrl\` is a URL template with \`{z}\`, \`{x}\` and \`{y}\`, and optionally \`{s}\` for the tile server and \`{r}\` for sharper tiles on high-density screens. \`attribution\` is the HTML credit the tile service asks you to show.

## Google Maps

\`apiKey\` is a key for the Maps JavaScript API from the Google Cloud console. The map draws without Google's own buttons, such as zoom and Street View.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-map-your-own-ui--overview', text: 'Draw the pins of either library your own way.' },
    { title: 'Talking to the map', iconName: 'Plug', href: '?path=/docs/controls-map-talking-to-the-map--overview', text: 'Reach Leaflet\'s or Google\'s own map from your code.' },
    { title: 'Write a library', iconName: 'Code', href: '?path=/docs/controls-map-write-a-library--overview', text: 'Draw the map with a library of your own.' },
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

export const SwitchTheLibrary: Story = {
    name: 'Switch the library',
    render: () => renderStory(<LibrariesExample />),
}
