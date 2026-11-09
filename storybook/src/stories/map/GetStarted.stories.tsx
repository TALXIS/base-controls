import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { GetStartedExample } from './mapExamples'

const DESCRIPTION = `
A map shows records as pins, each at the latitude and longitude two of its columns hold, such as offices, customers or the capitals of the EU below. It reads the records from a data provider and works out where to look, while a *map library* draws the map and the pins: \`LeafletMap\` draws with Leaflet and \`GoogleMap\` with Google Maps. Try it below: open **Code** and add Oslo, at 59.9139, 10.7522, to \`CAPITALS\` in \`data.ts\`.

{{canvas: Pins from a data provider}}

## Set it up

Use \`LeafletMap\`, which needs only Leaflet's stylesheet, or \`GoogleMap\` with an \`apiKey\` of yours; each is the map with its library built in, as [**Map libraries**](?path=/docs/controls-map-map-libraries--overview) describes. Like every control, the map needs the root providers from [**Quick start**](?path=/docs/concepts-quick-start--overview). It takes no provider prop: it shows the provider around it, a \`DataProviderScope\` as in the example, or a \`DatasetControl\` it is the body of, as [**In a DatasetControl**](?path=/docs/controls-map-in-a-datasetcontrol--overview) shows. How providers load: [**Data providers**](?path=/docs/concepts-data-providers--overview).

| Prop | Holds |
|---|---|
| \`fieldMapping\` | The columns that hold each record's position, as \`{ latitude, longitude }\`, in decimal degrees. |
| \`children\` | Components of yours, drawn in the map's box under the library's map: see [**Talking to the map**](?path=/docs/controls-map-talking-to-the-map--overview). |

The map fills its parent: see [**Layout**](?path=/docs/controls-map-layout--overview). A record whose latitude or longitude is not a number gets no pin, and the pins follow each load of the provider, so a search, a filter or a refresh moves them.

## Where the map looks

The map moves the view itself, whichever library draws it:

| Pins | View |
|---|---|
| None | The user's approximate location at zoom 8, looked up from their IP address at \`get.geojs.io\`. Until then, or when the lookup fails, the library's starting view: Czechia at zoom 6. |
| One | Centred on the pin, at zoom 15. |
| More | All of them, with 48 pixels clear around them. |

It moves again each time the provider loads new data; in between, the user pans and zooms as they like.

## Reference

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`fieldMapping\` | \`IMapFieldMapping\` | Required | Live | The latitude and longitude columns. |
| \`children\` | \`ReactNode\` | None | Live | Drawn in the map's box under the library's map, once the modules have loaded. |
| \`modules\` | \`IMapModule[]\` | None; required on \`Map\` | At mount | Further modules, loaded after the library. On \`Map\`, every module, with one named \`library\`: see *A library of your own* on [**Map libraries**](?path=/docs/controls-map-map-libraries--overview). |
| \`onSetup\` | \`(map: IMap) => void\` | None | At mount | Called with each new map, before it loads: see [**Talking to the map**](?path=/docs/controls-map-talking-to-the-map--overview). |
| \`onLoad\` | \`(map: IMap) => void \\| Promise<void>\` | None | At mount | Called once the modules have loaded; the map waits for a promise it returns. |
| \`height\` | \`string\` | Fills its parent | Live | A length such as \`'480px'\`; left out, the map fills its parent: see [**Layout**](?path=/docs/controls-map-layout--overview). |
| \`className\` | \`string\` | None | Live | A class for the map's box. |
| \`components\` | \`IMapComponents\` and \`ILeafletComponents\` or \`IGoogleMapsComponents\` | Defaults | Live | The map's slots and the library's: see [**Your own UI**](?path=/docs/controls-map-your-own-ui--overview). |

\`LeafletMap\` and \`GoogleMap\` also take their library's own props, such as \`tileUrl\` and \`apiKey\`: see [**Map libraries**](?path=/docs/controls-map-map-libraries--overview). A change to them mounts the map again; to change anything else read at mount, mount it again with a new \`key\`.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Map libraries', iconName: 'MapLayers', href: '?path=/docs/controls-map-map-libraries--overview', text: 'Leaflet over the tiles you choose, or Google Maps under your key.' },
    { title: 'Talking to the map', iconName: 'Plug', href: '?path=/docs/controls-map-talking-to-the-map--overview', text: 'Decide which pins show, draw in the map\'s box and move the view.' },
    { title: 'In a DatasetControl', iconName: 'ViewList', href: '?path=/docs/controls-map-in-a-datasetcontrol--overview', text: 'Views, quick find, a ribbon and Edit columns around the map.' },
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

export const PinsFromADataProvider: Story = {
    name: 'Pins from a data provider',
    render: () => renderStory(<GetStartedExample />),
}
