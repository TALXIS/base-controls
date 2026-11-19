import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { YourFirstMapExample } from '../../../../map/guide/basics/yourFirstMapExamples'

const STEP = 'Your first map'

const DESCRIPTION = `
{{block: progress}}

The guide plans a trip round the capitals of the EU, starting from Prague. This first step puts the capitals on a map: each is a record in a provider, and the map draws a pin where its latitude and longitude point.

{{canvas: Your first map}}

## How it works

A map needs your records, a provider that holds them, and the names of the columns that hold each position.

| In the code | What it is |
|---|---|
| \`CAPITALS\` | 26 of the 27 capitals, each with its \`name\`, and its \`lat\` and \`lng\` in decimal degrees. Zagreb joins them in *Try it*. |
| \`cities\` | The provider: a \`MemoryDataProvider\` that holds the capitals in memory. \`metadata\` names a capital's id and name columns, \`columns\` describes the columns, and \`refresh()\` loads it once. |
| \`FIELD_MAPPING\` | The columns that hold each capital's latitude and longitude, as \`{ latitude, longitude }\`. |
| \`DataProviderScope\` | Hands \`cities\` to the map inside it. |
| \`LeafletMap\` | The map, drawn with Leaflet over OpenStreetMap's tiles. Leaflet is one of two *map libraries*, which [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview) compares. |
| \`height\` | How tall the map is; [**Make it fit**](?path=/docs/controls-map-guide-basics-make-it-fit--overview) sizes it to its space. |

**The map's provider.** The map takes no provider prop: it draws the provider around it, a \`DataProviderScope\` here, or a \`DatasetControl\` whose body it is, as [**A trip planner**](?path=/docs/controls-map-guide-your-data-a-trip-planner--overview) shows. Outside both, it throws. How a provider loads, filters and searches is on [**Data providers**](?path=/docs/concepts-data-providers--overview).

**Pins.** \`fieldMapping\` names the latitude and longitude columns, in decimal degrees. A value may be a number or a string such as \`'50.0755'\`; a record whose latitude or longitude is not a number gets no pin. The pins follow every load of the provider, so a search, a filter or a refresh changes them.

**The map's view.** Where the map looks is *the map's view*, and the map picks it from the pins, whichever library draws it:

| Pins | The map's view |
|---|---|
| None | The user's approximate location at zoom 8, looked up from their IP address at \`get.geojs.io\`. Until then, or when the lookup fails, Czechia at zoom 6. |
| One | Centred on the pin, at zoom 15. |
| More | All of them, with 48 pixels clear around them. |

It moves again each time the provider loads new data; in between, the user pans and zooms as they like.

**Leaflet's stylesheet.** Your app imports it once, with \`import 'leaflet/dist/leaflet.css'\`; without it, the tiles do not line up. The docs already import it. Like every control, the map also needs the root providers from [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview); the examples already have them.

## Try it

- In \`data.ts\`, add \`{ name: 'Zagreb', lat: 45.815, lng: 15.9819 },\` to \`CAPITALS\`: a pin appears in Croatia, between Ljubljana and Budapest.
- Change Nicosia's \`lat\` to \`'unknown'\`: its pin goes, and the map's view moves to fit the rest.
- Delete every capital but Prague: the map centres on Prague at zoom 15, close enough to see its streets.

## Remember

- The map draws the provider around it, and takes none of its own.
- \`fieldMapping\` names the columns that hold each position.
- The map's view fits the pins on every load.
- Your app imports Leaflet's stylesheet once.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Basics/Your first map',
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

export const YourFirstMap: Story = {
    name: 'Your first map',
    tags: ['!dev'],
    render: () => renderStory(<YourFirstMapExample />),
}
