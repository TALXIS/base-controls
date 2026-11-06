import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { MapExample } from './mapExamples'

const DESCRIPTION = `
Map shows the records of a dataset as pins on a map, each at the latitude and longitude two of its columns hold. What draws the map is a *map provider*: Google Maps, or a component of your own. Try it below: open **Code** and add Vienna, at 48.2082, 16.3738, to \`data.ts\`.

{{canvas: Pins from a dataset}}

## Show records as pins

Like a PCF control, \`Map\` takes the PCF \`context\` and its \`parameters\`:

| Parameter | Holds |
|---|---|
| \`Dataset\` | The records, usually a \`Dataset\` over a data provider: see [**Data providers**](?path=/docs/concepts-data-providers--overview) |
| \`PinMetadata\` | The columns with each record's position: \`LatitudeAttributeName\` and \`LongitudeAttributeName\` |
| \`MapProvider\` | What draws the map |

A record whose position is not a number gets no pin. The map draws its pins again whenever the dataset loads new records.

## Map providers

\`createGoogleMapsProvider({ apiKey })\` draws the map with the Google Maps JavaScript API, under a key of yours. It shows one pin close up and fits more pins into view together; without pins, it centres on the user's approximate location, looked up from their IP address. Create it once, outside a render, as each call makes a new component.

A map provider of your own is any component that takes \`locations\`, each \`{ id, latitude, longitude }\` with the record's id. The example draws with Leaflet and OpenStreetMap this way, as Google Maps needs a key.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Where the records behind the pins come from.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'The context the map takes, inside and outside a PCF control.' },
]

const meta = {
    title: 'Controls/Map/Get started',
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

export const PinsFromADataset: Story = {
    name: 'Pins from a dataset',
    render: () => renderStory(<MapExample />),
}
