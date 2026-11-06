import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { CustomPopupExample, CustomUiExample } from './mapExamples'

const DESCRIPTION = `
The map draws a few things through slots you can replace: its box, its loading and error states, and, through its library module, the map and each pin. Everything inside the box belongs to the map library, so a pin of your own is drawn with what that library draws. Leaflet draws a Fluent pin, \`MapUi.Marker\`, whose slots it takes under \`marker\`. Try it below: click one of the red pins.

{{canvas: Mark the large cities}}

## Changing how it looks

\`Map\` takes \`components\` for its own slots, and each library module takes \`components\` for the map's under \`map\` and the pins' under \`marker\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`Map\` | None | \`onRenderContainer\` | \`MapUiContainerComponents\` | The box the library draws in |
| \`Map\` | \`loading\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` | The loading state, until the map has loaded |
| \`Map\` | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load, such as a map without a library |
| \`createLeafletModule\` | \`map\` | \`onRenderMap\`, \`onRenderTileLayer\` | \`LeafletUiComponents\` | The react-leaflet map and its tiles |
| \`createLeafletModule\` | None | \`onRenderPopup\` | \`LeafletMarkersComponents\` | The popup a pin opens, showing the record's id |
| \`createLeafletModule\` | \`marker\` | \`onRenderContainer\`, \`onRenderPin\`, \`onRenderDot\` | \`MapUiMarkerComponents\` | Each pin, the Fluent pin \`MapUi.Marker\`: its box, the teardrop and its white centre |
| \`createGoogleMapsModule\` | \`map\` | \`onRenderMap\` | \`GoogleMapsUiComponents\` | The vis.gl map |
| \`createGoogleMapsModule\` | \`marker\` | \`onRenderMarker\` | \`GoogleMapsUiMarkerComponents\` | Each pin: a vis.gl marker |

To change the wording of the loading state and the error, see [**Localization**](?path=/docs/concepts-localization--overview).

## Your own pins

For Leaflet, the slots under \`marker\` are the Fluent pin's own and get a \`div\`'s props, and \`onRenderPopup\` gets react-leaflet's own \`Popup\` props. For Google Maps, \`onRenderMarker\` gets vis.gl's \`Marker\` props. A slot component reads the record of its pin with \`useMapRecord()\`, as \`CityPin\` and \`CityPopup\` do in the example, and hands the rest to the default slot.

\`onRenderPopup\` draws the popup a pin opens on click. Its content is drawn into Leaflet's popup, so a component of yours there can use hooks too: \`CityCard\` below reads its record and where it sits.

{{story: A popup of your own}}

## Plain UI

Each part is also exported as plain UI that takes only props, for a map with no provider behind it. A plain map does not move its view to its pins.

| Namespace | Holds |
|---|---|
| \`MapUi\` | \`Container\`: the map's box. \`Marker\`: the Fluent pin Leaflet draws, in \`color\` or the theme's primary colour, its tip at the bottom centre of its 32 by 40 box |
| \`LeafletUi\` | The Leaflet map over \`tileUrl\` and \`attribution\`, starting at \`defaultCenter\` and \`defaultZoom\`, with pins in its children. |
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
                story: `\`onRenderPopup\` keeps the default popup and puts \`CityCard\` inside it. Try: click a pin, then follow its link.`,
            },
        },
    },
}
