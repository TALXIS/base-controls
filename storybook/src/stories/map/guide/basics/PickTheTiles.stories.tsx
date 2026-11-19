import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { PickTheTilesExample } from '../../../../map/guide/basics/pickTheTilesExamples'

const STEP = 'Pick the tiles'

const DESCRIPTION = `
{{block: progress}}

The same capitals over other tiles, or on Google's map.

{{canvas: Pick the tiles}}

## How it works

This step draws the map of [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) in two tabs, one for each map library. In **Code**, the new lines carry \`//new:\`.

**Map libraries.** The map works out the pins and the map's view, and a *map library* draws them: the map, the pins and the popups they open. \`LeafletMap\` and \`GoogleMap\` are the map with a library built in, and the pins, the popups and the map's view behave the same in both. To draw with another library, see [**A library of your own**](?path=/docs/controls-map-guide-advanced-a-library-of-your-own--overview).

| Component | Draws with | Props of its own |
|---|---|---|
| \`LeafletMap\` | Leaflet, over map tiles from a tile service. Leaflet needs no key, though some tile services ask for one in the URL. Your app imports Leaflet's stylesheet, as [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) shows. | \`tileUrl\`: a URL template with \`{z}\`, \`{x}\` and \`{y}\` in the order the service asks for, and optionally \`{s}\` for the tile server and \`{r}\` for sharper tiles on high-density screens. \`attribution\`: the HTML credit the tile service asks you to show. Both are OpenStreetMap's when left out. |
| \`GoogleMap\` | The Google Maps JavaScript API. The map shows its loading state until the API has loaded. | \`apiKey\`, required: a key for the Maps JavaScript API, from the Google Cloud console. \`mapId\`: a Map ID from *Map management* in the same project, which Google needs to draw the pins; left out, \`DEMO_MAP_ID\`, Google's shared ID for development. |

**A new library prop** mounts the map again: a change to \`tileUrl\`, \`attribution\`, \`apiKey\` or \`mapId\` draws a new map, whose view fits the pins again.

**The Google key.** The Maps API loads once per page, under the key of the first Google map, so a later key, on that map or another, is not used until the page reloads.

**Popups and themes.** In both, a click on the map closes the open popup. Google Maps draws without its own buttons, such as zoom and Street View, and turns dark on a dark theme. Leaflet's tiles stay as the tile service draws them, so for a dark app, pick dark tiles.

## Try it

- Under **Leaflet tiles**, pick **Esri Dark Gray**: dark tiles under the same pins.
- Open a pin, then click the map: the popup closes.
- Add \`{ key: 'imagery', text: 'Esri World Imagery', tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: ESRI },\` to \`TILES\`, then pick it: the capitals over satellite images.
- On **Google Maps**, paste a key of yours and press Enter: the same pins and popups on Google's map. The page keeps that key until it is reloaded.

## Remember

- A map library draws the map, and the pins, the popups and the map's view are the same in both.
- A new library prop mounts the map again.
- Google Maps needs a key, and a page uses the first one it gets.

Your map shows the capitals, fits the page and draws over the tiles you pick. Make it yours draws the pins and the popups your way.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Basics/Pick the tiles',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PickTheTiles: Story = {
    name: 'Pick the tiles',
    tags: ['!dev'],
    render: () => renderStory(<PickTheTilesExample />),
}
