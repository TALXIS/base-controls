import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { TilesExample } from './mapExamples'

const DESCRIPTION = `
The map works out its pins and where to look, but a *map library* draws them: Leaflet over the map tiles of a tile service you pick, or Google Maps under an API key of yours. Each library is a module you hand to the map, and the pins, the popups and the view behave the same whichever one draws them. Try it below: pick **CARTO Dark Matter** under **Leaflet tiles**.

{{canvas: Choose the tiles}}

## The libraries

| Module | Draws with |
|---|---|
| \`createLeafletModule({ tileUrl?, attribution?, components? })\` | Leaflet, over OpenStreetMap's tiles unless \`tileUrl\` and \`attribution\` name others. Needs no key. |
| \`createGoogleMapsModule({ apiKey, mapId?, components? })\` | The Google Maps JavaScript API, under your key. The map shows its loading state until the API has loaded. |

The module goes in \`modules\`, and \`components\` replaces its slots: see [**Your own UI**](?path=/docs/controls-map-your-own-ui--overview). The map reads \`modules\` only as it mounts, so to switch libraries or tiles, mount it again with a new \`key\`, as \`mountKey\` in the example's \`LibraryPicker.tsx\` does.

## Leaflet

Your app imports Leaflet's stylesheet once, with \`import 'leaflet/dist/leaflet.css'\`; without it, the tiles do not line up.

| Parameter | Default | Description |
|---|---|---|
| \`tileUrl\` | OpenStreetMap's | A URL template with \`{z}\`, \`{x}\` and \`{y}\`, and optionally \`{s}\` for the tile server and \`{r}\` for sharper tiles on high-density screens. |
| \`attribution\` | OpenStreetMap's | The HTML credit the tile service asks you to show. |

## Google Maps

| Parameter | Default | Description |
|---|---|---|
| \`apiKey\` | Required | A key for the Maps JavaScript API, from the Google Cloud console. |
| \`mapId\` | \`DEMO_MAP_ID\` | A Map ID from *Map management* in the same Google Cloud project, which ties the map to the style Google keeps for it. Google needs one to draw Advanced Markers, which the pins are; \`DEMO_MAP_ID\` is Google's shared ID for development, so create your own for production. |

The Maps API loads once per page, under the key of the first Google map, so a later map with another key still uses the first. The map draws without Google's own buttons, such as zoom and Street View, and a click on the map closes the open popup, as in Leaflet.

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
