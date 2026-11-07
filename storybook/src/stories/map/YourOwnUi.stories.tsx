import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { CustomPopupExample, CustomUiExample } from './mapExamples'

const DESCRIPTION = `
The map draws a few things through slots you can replace: its box, its loading and error states, and, through its library module, the map and each pin. Everything inside the box belongs to the map library, so a pin of your own is drawn with what that library draws. Leaflet draws a Fluent pin, \`MapUi.Marker\`, and a popup built from the shared record card, the one the Gantt's tooltips use. Try it below: click one of the red pins.

{{canvas: Mark the large cities}}

## Changing how it looks

\`Map\` takes \`components\` for its own slots, and each library module takes \`components\` for the map's under \`map\`, and under \`marker\` the pin's under \`pin\` and the popup's under \`popup\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`Map\` | None | \`onRenderContainer\` | \`MapUiContainerComponents\` | The box the library draws in |
| \`Map\` | \`loading\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` | The loading state, until the map has loaded |
| \`Map\` | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load, such as a map without a library |
| \`createLeafletModule\` | \`map\` | \`onRenderMap\`, \`onRenderTileLayer\` | \`LeafletUiComponents\` | The react-leaflet map and its tiles |
| \`createLeafletModule\` | \`marker.pin\` | \`onRenderContainer\`, \`onRenderPin\`, \`onRenderDot\` | \`MapUiMarkerComponents\` | Each pin, the Fluent pin \`MapUi.Marker\`: its box, the teardrop and its white centre |
| \`createLeafletModule\` | \`marker.popup\` | \`onRender\`, with no props | \`MapPopup.Renderer\` | The whole content of the popup a pin opens; see *Your own popup* |
| \`createLeafletModule\` | \`marker.popup.container\` | \`onRenderContainer\` | \`LeafletUiPopupComponents\` | Leaflet's popup, drawn as a Fluent callout |
| \`createLeafletModule\` | \`marker.popup.card\` | \`onRenderContainer\` | \`RecordCardComponents\` | The default popup's card |
| \`createLeafletModule\` | \`marker.popup.header\` | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\`: \`onRenderContainer\`; \`status\`: the tag's slots | \`RecordCardHeaderComponents\` and the parts' own | The default popup's header: the record's name, and its status tag |
| \`createGoogleMapsModule\` | \`map\` | \`onRenderMap\` | \`GoogleMapsUiComponents\` | The vis.gl map |
| \`createGoogleMapsModule\` | \`marker\` | \`onRenderMarker\` | \`GoogleMapsUiMarkerComponents\` | Each pin: a vis.gl marker |

To change the wording of the loading state and the error, see [**Localization**](?path=/docs/concepts-localization--overview).

## Your own pins

For Leaflet, \`marker.pin.onRenderPin\` gets the teardrop's props, \`{ color }\`, and the other slots under \`marker.pin\` and \`marker.popup\` get an element's props. For Google Maps, \`onRenderMarker\` gets vis.gl's \`Marker\` props. A slot component reads the record of its pin with \`useMapRecord()\`, as \`CityPin\` and \`CityTitle\` do in the example, and hands the rest to the default slot.

## Your own popup

The popup a Leaflet pin opens is composed of \`MapPopup\`'s parts, each reading the record of its pin:

| Part | Draws |
|---|---|
| \`MapPopup.Renderer\` | The default popup: the card with the header in it. Takes \`components\` as \`{ card, header }\` |
| \`MapPopup.Card\` | The box the content sits in, \`RecordCard\` |
| \`MapPopup.Header\` | The record's name; \`statusColumnName\` adds an option set column as a coloured tag |
| \`MapPopup.FieldRows\` | Holds the field rows |
| \`MapPopup.FieldRow\` | One column under its display name, given \`columnName\` and an optional \`iconName\`; nothing while empty |

\`components.marker.popup.onRender\` replaces the default with a popup of your own, composed from these parts and from the shared \`RecordCard\` parts, which take any value. It is drawn inside Leaflet's popup, so hooks work there: \`CityPopup\` below reads where its pin sits.

{{story: A popup of your own}}

## Plain UI

Each part is also exported as plain UI that takes only props, for a map with no provider behind it. A plain map does not move its view to its pins.

| Namespace | Holds |
|---|---|
| \`MapUi\` | \`Container\`: the map's box. \`Marker\`: the Fluent pin Leaflet draws, its tip at the bottom centre of its 32 by 40 box. \`MarkerPin\`: its teardrop, in an optional \`color\` or the theme's primary colour |
| \`LeafletUi\` | The Leaflet map over \`tileUrl\` and \`attribution\`, starting at \`defaultCenter\` and \`defaultZoom\`, with pins in its children. \`LeafletUi.Popup\`: Leaflet's popup as a Fluent callout, for inside a react-leaflet marker |
| Shared, from the package root | \`RecordCard\`, \`RecordCardHeader\` with \`RecordCardHeaderStart\` and \`RecordCardHeaderEnd\`, \`RecordCardTitle\`, \`RecordCardFieldRows\`, \`RecordCardFieldRow\`, \`RecordCardDateRange\`, \`RecordCardProgress\`: a record's summary, as the map's popups and the Gantt's tooltips draw it |
| \`GoogleMapsUi\` | The Google map, starting at \`defaultCenter\` and \`defaultZoom\`, with pins in its children; render it inside vis.gl's \`APIProvider\`. \`GoogleMapsUi.Marker\`: one pin at \`position\` |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Pieces and slots', iconName: 'Puzzle', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'How slots work, and how to draw the default.' },
    { title: 'Map libraries', iconName: 'MapLayers', href: '?path=/docs/controls-map-map-libraries--overview', text: 'Draw with Leaflet or Google Maps, over the tiles you choose.' },
    { title: 'Write a library', iconName: 'Code', href: '?path=/docs/controls-map-write-a-library--overview', text: 'Draw the whole map with a library of your own.' },
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

export const MarkTheLargeCities: Story = {
    name: 'Mark the large cities',
    render: () => renderStory(<CustomUiExample />),
}

export const APopupOfYourOwn: Story = {
    name: 'A popup of your own',
    render: () => renderStory(<CustomPopupExample />),
    parameters: {
        docs: {
            description: {
                story: `\`marker.popup.onRender\` composes the popup from \`MapPopup\`'s parts, with the city's role as the header's tag, a \`RecordCardFieldRow\` and a link. Try: click a pin, then follow its link.`,
            },
        },
    },
}
