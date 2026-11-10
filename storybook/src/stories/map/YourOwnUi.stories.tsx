import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { BoardingPassExample, PostcardExample, RegionPinsExample } from './mapExamples'

const DESCRIPTION = `
The pins and the popups they open are drawn through slots you can replace, so a pin can take its record's colour, or a popup can show what matters about the record. Both Leaflet and Google Maps draw the same Fluent pin and the same popup card, so the slots you hand either component look the same in both. Try it below: open a pin with a star, one of the capitals of two million or more.

{{canvas: Pins in their region's colour}}

## Changing how it looks

\`LeafletMap\` and \`GoogleMap\` take one \`components\` with the map's own slots, the library's map under \`map\` and each pin under \`marker\`, while \`Map\` takes only the map's own; how slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| All three | Top level | \`onRenderContainer\` | \`MapUiContainerComponents\` | The map's box, which holds the library's map, the loading state and a failed load. |
| All three | \`loading\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` | The loading state, until the map has loaded. |
| All three | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load, such as a map without a library. |
| \`LeafletMap\` | \`map\` | \`onRenderMap\`, \`onRenderTileLayer\` | \`LeafletUiComponents\` | The react-leaflet map and its tiles. |
| \`GoogleMap\` | \`map\` | \`onRenderMap\` | \`GoogleMapsUiComponents\` | The vis.gl map. |
| Both | \`marker.pin\` | \`onRenderContainer\`, \`onRenderPin\`, \`onRenderDot\` | \`MapUiMarkerComponents\` | Each pin, \`Map.Ui.Marker\`: its box, the teardrop, and the white dot in it. A \`color\` in \`onRenderPin\`'s props fills the teardrop. |
| Both | \`marker.popup\` | \`onRender\`, with no props | \`Map.Popup.Renderer\` | The whole content of the popup a pin opens: see *Your own popup*. |
| Both | \`marker.popup.card\` | \`onRenderContainer\` | \`RecordCardComponents\` | The default popup's card. |
| Both | \`marker.popup.header\` | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\`: \`onRenderContainer\`; \`status\`: \`onRenderContainer\`, \`onRenderLabel\` | \`RecordCardHeaderComponents\`, \`RecordCardHeaderStartComponents\`, \`RecordCardHeaderEndComponents\`, \`RecordCardTitleComponents\`, \`OptionTagComponents\` | The default popup's header, with the record's name. |
| \`LeafletMap\` | \`marker.popup.container\` | \`onRenderContainer\`, with react-leaflet's \`Popup\` props | \`LeafletUiPopupComponents\` | Leaflet's popup, drawn as a Fluent callout. |
| \`GoogleMap\` | \`marker.popup.container\` | \`onRenderContainer\`, with vis.gl's \`InfoWindow\` props | \`GoogleMapsUiPopupComponents\` | Google's info window, drawn as a Fluent callout. |

To change the wording of the loading state and the error, see [**Localization**](?path=/docs/concepts-localization--overview).

## Your own pins

A slot under \`marker\` is drawn inside the pin, so a component of yours reads the pin's record with \`useMapRecord()\`, as \`RegionPin\` and \`CapitalDot\` do, and passes the props it gets on to what it draws.

## Your own popup

\`marker.popup.onRender\` replaces the popup's content with your own, composed from \`Map.Popup\`'s parts, which read the record of their pin, and the shared \`RecordCard\` parts, which take any value:

| Part | Draws |
|---|---|
| \`Map.Popup.Renderer\` | The default popup: the card with the header in it. Takes \`components\` as \`{ card, header }\`. |
| \`Map.Popup.Card\` | The box the content sits in. |
| \`Map.Popup.Header\` | The record's name; \`statusColumnName\` adds an option set column as a tag in its option's colour. |
| \`Map.Popup.FieldRows\` | Holds the field rows. |
| \`Map.Popup.FieldRow\` | One column under its display name, given \`columnName\` and an optional \`iconName\`; nothing while empty. |
| \`RecordCardFieldRow\`, \`RecordCardProgress\`, \`RecordCardDateRange\` | A row with a \`label\` and any value, a bar with \`percent\` and \`text\`, and a \`range\` with an optional \`duration\`, from the package root. |

{{story: A postcard for each capital}}

## A popup all your own

\`onRender\` can return anything, not only the parts. The popup's bubble keeps its shadow and corners, and inside it a component of yours draws what it likes with the hooks: here a boarding pass from Prague in the colour of the capital's region, with the distance and the flight time worked out from where both pins sit. It reads the theme with \`useTheme()\`, so it turns dark with the map.

{{story: A boarding pass for each capital}}

## Plain UI

Each part is also exported as plain UI that takes only props, for a map with no provider behind it. A plain map does not move its view to its pins.

| Namespace | Holds |
|---|---|
| \`Map.Ui\` | \`Container\`: the map's box. \`Marker\`: the Fluent pin, its tip at the bottom centre of its 32 by 40 box. \`MarkerPin\`: its teardrop, in an optional \`color\` or the theme's primary colour. \`Skeleton\`: a placeholder shaped like a \`DatasetControl\` with a map body: see [**In a DatasetControl**](?path=/docs/controls-map-in-a-datasetcontrol--overview). |
| \`LeafletUi\` | The Leaflet map over \`tileUrl\` and \`attribution\`, starting at \`defaultCenter\` and \`defaultZoom\`, with pins in its children. \`LeafletUi.Popup\`: Leaflet's popup as a Fluent callout, for inside a react-leaflet marker. |
| \`GoogleMapsUi\` | The Google map under \`mapId\`, starting at \`defaultCenter\` and \`defaultZoom\`, with pins in its children; it goes inside vis.gl's \`APIProvider\`. \`GoogleMapsUi.Popup\`: Google's info window as a Fluent callout, for an Advanced Marker. |
| From the package root | \`RecordCard\`, \`RecordCardHeader\` with \`RecordCardHeaderStart\` and \`RecordCardHeaderEnd\`, \`RecordCardTitle\`, \`RecordCardFieldRows\`, \`RecordCardFieldRow\`, \`RecordCardDateRange\`, \`RecordCardProgress\` and \`OptionTag\`: a record's summary, as the map's popups and the Gantt's tooltips draw it. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Pieces and slots', iconName: 'Puzzle', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'How slots work, and how to draw the default.' },
    { title: 'In a DatasetControl', iconName: 'ViewList', href: '?path=/docs/controls-map-in-a-datasetcontrol--overview', text: 'A popup that shows the columns the user picked.' },
    { title: 'Map libraries', iconName: 'MapLayers', href: '?path=/docs/controls-map-map-libraries--overview', text: 'Leaflet over the tiles you choose, or Google Maps under your key.' },
]

const meta = {
    title: 'Controls/Map/Your own UI',
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

export const PinsInTheirRegionsColour: Story = {
    name: 'Pins in their region\'s colour',
    render: () => renderStory(<RegionPinsExample />),
}

export const APostcardForEachCapital: Story = {
    name: 'A postcard for each capital',
    render: () => renderStory(<PostcardExample />),
    parameters: {
        docs: {
            description: {
                story: `\`Postcard\` puts the region tag, two rows and the capital's population against the largest one's in each popup. Try: open Rome's pin, then Berlin's.`,
            },
        },
    },
}

export const ABoardingPassForEachCapital: Story = {
    name: 'A boarding pass for each capital',
    render: () => renderStory(<BoardingPassExample />),
    parameters: {
        docs: {
            description: {
                story: `\`BoardingPass\` is drawn from scratch: a band in the region's colour, the route from Prague, and the distance and flight time. Try: open Lisbon's pin, then Helsinki's.`,
            },
        },
    },
}
