import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { DatasetControlExample, GetStartedExample } from './mapExamples'

const DESCRIPTION = `
Map shows the records of a data provider as pins on a map, each at the latitude and longitude two of its columns hold. The map works out the pins and where to look, and a *map library*, Leaflet, Google Maps or one of your own, draws them. Try it below: open **Code** and add Vienna, at 48.2082, 16.3738, to \`data.ts\`.

{{canvas: Pins from a data provider}}

## Set it up

Like every control, the map needs the root providers from [**Quick start**](?path=/docs/concepts-quick-start--overview). It takes no provider prop: it shows the provider around it, a \`DataProviderScope\` as in the example, or a \`DatasetControl\` whose body it sits in. See [**Data providers**](?path=/docs/concepts-data-providers--overview).

| Prop | Holds |
|---|---|
| \`fieldMapping\` | The columns that hold each record's position, as \`{ latitude, longitude }\`, in decimal degrees |
| \`modules\` | The map's modules, with one map library, such as \`createLeafletModule()\`. Without one, the map shows an error |

The map fills its parent, and is at least 200 pixels tall. A record whose latitude or longitude is not a number gets no pin. The pins are worked out again each time the provider loads records, so a search, a filter or a refresh moves them.

## Inside a DatasetControl

In a \`DatasetControl.Body\`, the map shows the control's provider, so the pins follow what the control loads.

{{story: Pins in a DatasetControl}}

## Where the map looks

The map moves its view itself, whichever library draws it:

| Pins | View |
|---|---|
| None | The user's approximate location at zoom 8, looked up from their IP address at \`get.geojs.io\`. Until then, or when the lookup fails, the library's starting view: Czechia, for Leaflet and Google Maps |
| One | Centred on the pin, at zoom 15 |
| More | All of them, with 48 pixels clear around them |

It moves again each time the pins are worked out again; in between, the user pans and zooms as they like.

## Reference

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`fieldMapping\` | \`IMapFieldMapping\` | Required | Live | The latitude and longitude columns, read each time the pins are worked out. |
| \`modules\` | \`IMapModule[]\` | Required | At mount | The map's modules, with one \`library\`. To change them, mount the map again with a new \`key\`. |
| \`onSetup\` | \`(map: IMap) => void\` | None | At mount | Called with each new map, before it loads: see [**Talking to the map**](?path=/docs/controls-map-talking-to-the-map--overview). |
| \`onLoad\` | \`(map: IMap) => void\`, or a promise | None | At mount | Called once the modules have loaded; the map waits for a promise it returns. |
| \`className\` | \`string\` | None | Live | A class for the map's box. |
| \`components\` | \`IMapComponents\` | Defaults | Live | See [**Your own UI**](?path=/docs/controls-map-your-own-ui--overview). |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Map libraries', iconName: 'MapLayers', href: '?path=/docs/controls-map-map-libraries--overview', text: 'Draw with Leaflet or Google Maps, over the tiles you choose.' },
    { title: 'Talking to the map', iconName: 'Plug', href: '?path=/docs/controls-map-talking-to-the-map--overview', text: 'Change, add or drop pins, and reach the library\'s own map.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-map-your-own-ui--overview', text: 'Draw your own pins, popups and box.' },
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

export const PinsInADatasetControl: Story = {
    name: 'Pins in a DatasetControl',
    render: () => renderStory(<DatasetControlExample />),
    parameters: {
        docs: {
            description: {
                story: `The quick find searches the city names, and the map shows only the cities it finds. Try: type Br in the search box.`,
            },
        },
    },
}
