import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'

const DESCRIPTION = `
Every prop, member, hook and slot of the map, in one place to look up.

## Map props

\`Map\` draws with a library module of your own; \`LeafletMap\` and \`GoogleMap\` take the same props with their library built in, as below.

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`fieldMapping\` | \`IMapFieldMapping\` | Required | Live | The columns that hold each record's position, as \`{ latitude, longitude }\`, in decimal degrees. See [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview). |
| \`modules\` | \`IMapModule[]\` | Required | At mount | Every module of the map, one of them named \`library\`; read on every mount. See [**A library of your own**](?path=/docs/controls-map-guide-advanced-a-library-of-your-own--overview). |
| \`onSetup\` | \`(map: IMap) => void\` | None | At mount | Gets each new map, before its modules load; subscribe to its events here. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`onReady\` | \`(map: IMap) => void\` | None | At mount | Called once per mount, when the map has loaded and is drawn. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`onLoad\` | \`(map: IMap) => void \\| Promise<void>\` | None | At mount | Called once per mount, after the modules have loaded; the map shows its loading state until a promise it returns settles. See [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview). |
| \`height\` | \`string\` | None | Live | A length, such as \`'480px'\`; left out, the map fills its parent, and is never less than 200 pixels tall. See [**Make it fit**](?path=/docs/controls-map-guide-basics-make-it-fit--overview). |
| \`className\` | \`string\` | None | Live | Added to the map's box. |
| \`components\` | \`IMapComponents\` | Defaults | Live | \`container\`, \`loading\` and \`errorMessage\`. See *Slots* below. |
| \`children\` | \`ReactNode\` | None | Live | Drawn in the map's box under the library's map, once the modules have loaded. See [**The EU through the years**](?path=/docs/controls-map-guide-your-data-the-eu-through-the-years--overview). |

The map takes no provider prop: it draws the provider around it, as [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) shows.

## LeafletMap props

Every prop of \`Map\`, with these changes and additions. Leaflet's stylesheet is your app's to import, as [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) shows.

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`tileUrl\` | \`string\` | OpenStreetMap's | Live | A URL template with \`{z}\`, \`{x}\` and \`{y}\`, and optionally \`{s}\` and \`{r}\`; a change mounts the map again. See [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview). |
| \`attribution\` | \`string\` | OpenStreetMap's | Live | The HTML credit the tile service asks you to show; a change mounts the map again. |
| \`modules\` | \`IMapModule[]\` | None | At mount | Further modules, loaded after Leaflet. |
| \`components\` | \`IMapComponents & ILeafletComponents\` | Defaults | Live | \`Map\`'s slots, plus \`map\` and \`marker\`. See *Slots* below. |

## GoogleMap props

Every prop of \`Map\`, with these changes and additions.

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`apiKey\` | \`string\` | Required | Live | A key for the Maps JavaScript API, from the Google Cloud console; a change mounts the map again. The page loads the API once, under the first key it is given. See [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview). |
| \`mapId\` | \`string\` | \`DEMO_MAP_ID\` | Live | A Map ID from *Map management*, which Google needs to draw the pins; \`DEMO_MAP_ID\` is for development only. A change mounts the map again. |
| \`modules\` | \`IMapModule[]\` | None | At mount | Further modules, loaded after Google Maps. |
| \`components\` | \`IMapComponents & IGoogleMapsComponents\` | Defaults | Live | \`Map\`'s slots, plus \`map\` and \`marker\`. See *Slots* below. |

## The map

\`onSetup\`, \`onReady\` and \`onLoad\` get the map, an \`IMap\`; inside anything the map draws, \`useMap()\` returns it. Each mount makes a new one. See [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview).

| Member | Description |
|---|---|
| \`getPoint(record)\` | Where the record's pin goes, as \`{ latitude, longitude }\`; \`undefined\` when either is not a number. |
| \`modules\` | The modules this mount loaded, by name, with \`get\`, \`find\`, \`has\` and \`observe\`; \`library\` is always among them. |
| \`services\` | \`get('provider')\` and \`get('viewport')\`. See *Services* below. |
| \`lifecycle\` | The mount's status, error and events, and \`remount()\`. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`loading\` | \`show(message?)\` covers the map's box until the function it returns is called. See *Run actions* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`execute(operation, parameters?)\`, \`executor\` | Runs an action of yours while the map's box is covered, and opens the error dialog when it throws. See *Run actions* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`parts\` | The parts drawn in the map, by key. See *Parts* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`notifications\` | The \`notifications\` part; throws unless a \`RuntimeNotificationBar\` is drawn among the map's children. See *Messages* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |

### Services

| Key | Type | Description |
|---|---|---|
| \`provider\` | \`IDataProvider\` | The provider whose records the map draws, the one around it as it mounts. |
| \`viewport\` | \`MapViewport\` | Works out the map's view. See *The viewport* below. |

### The viewport

\`map.services.get('viewport')\` works out where the map looks, the map's view, and asks the library to move there. It calls \`fit()\` itself each time the provider loads new data, and \`LeafletMap\` and \`GoogleMap\` call it once their map is drawn. Which view it picks is on [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview).

| Member | Description |
|---|---|
| \`fit()\` | Moves the map's view to the current pins; with none, to the user's approximate location. |
| \`getView()\` | The map's view for the current pins, without moving; \`undefined\` while no record has a position. |
| \`events\` | \`onViewRequested(request)\`, which fires each time the map's view should move, for the library to move its map there. |

| \`IMapViewRequest\` | Asks for |
|---|---|
| \`{ center, zoom }\` | \`center\`, an \`IMapPoint\` as \`{ latitude, longitude }\`, at the zoom level \`zoom\`: one pin, or the user's approximate location. |
| \`{ bounds, padding }\` | \`bounds\`, an \`IMapBounds\` as \`{ north, south, east, west }\` in degrees, with \`padding\` pixels clear around them: more than one pin. |

### The library module

\`map.modules.get('library')\`, or \`useMapModule('library')\` inside the map, returns it: an \`ILeaflet\` in \`LeafletMap\`, an \`IGoogleMaps\` in \`GoogleMap\`. See [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview).

| Member | On | Description |
|---|---|---|
| \`getInstance()\` | Every \`IMapLibrary\` | The library's own map: a Leaflet \`Map\` for \`ILeaflet\`, a \`google.maps.Map\` for \`IGoogleMaps\`; \`undefined\` until it is drawn. |
| \`events.onInstanceReady(instance)\` | \`ILeaflet\`, \`IGoogleMaps\` | Fires once the library has drawn its map, with that map. |
| \`events.onPopupChanged(recordId)\` | \`IGoogleMaps\` | Fires when a pin's popup opens or closes, with the record id of the open popup, or \`undefined\`. |

### A module

Pass modules in the map's \`modules\`. A module's \`onLoad\` gets the map.

| Member | Description |
|---|---|
| \`name\` | Unique within the map; a name listed twice fails the load. What \`onLoad\` returns is provided under it, for \`map.modules\` and \`useMapModule(name)\`. |
| \`priority\` | Optional, \`0\` by default. A lower one loads first, and modules of the same priority load at the same time; \`LeafletMap\` and \`GoogleMap\` load their library at \`-100\`. |
| \`onLoad(map, { signal })\` | Can be async; the map shows its loading state until every module has loaded. \`signal\` is aborted when the mount goes or another module fails. A throw fails the load, and the modules already loaded are destroyed. |
| \`onDestroy(instance)\` | Optional. Called as the mount goes, with what \`onLoad\` returned, the last loaded first. |

The map needs one module named \`library\`, whose \`onLoad\` returns an \`IMapLibrary\`: see [**A library of your own**](?path=/docs/controls-map-guide-advanced-a-library-of-your-own--overview). Declare what a module of yours returns on \`IMapModuleMap\` in \`declare module '@talxis/base-controls'\`, so \`map.modules.get(name)\` is typed.

## Hooks

Each works inside anything the map draws: its children, its pins and their popups.

| Hook | Returns |
|---|---|
| \`useMap()\` | The map; throws outside one. |
| \`useMapModule(name)\` | One of the map's modules, such as \`'library'\`; throws when it is not loaded. |
| \`useMapRecords()\` | The records that have a pin, drawing the component again each time the provider loads new data. |
| \`useMapRecord()\` | The record of the pin being drawn, inside a pin or its popup; throws outside one. |
| \`MapRecordContext\` | Not a hook: the React context \`useMapRecord()\` reads. Its \`Provider\` hands each pin of your own its record, as on [**A library of your own**](?path=/docs/controls-map-guide-advanced-a-library-of-your-own--overview). |

## Slots

\`LeafletMap\` and \`GoogleMap\` take one \`components\` with the map's slots, the library's map under \`map\`, and each pin and its popup under \`marker\`; \`Map\` takes only the first three keys. How slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| All three | \`container\` | \`onRender\` | \`MapUiContainerComponents\` | The map's box, which holds the library's map, the children, the loading state and a failed load |
| | \`loading\` | \`onRender\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` | The loading state, until the map has loaded |
| | \`errorMessage\` | \`onRender\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load, such as a map without a library |
| \`LeafletMap\` | \`map\` | \`onRender\`, \`onRenderTileLayer\` | \`LeafletUiComponents\` | The react-leaflet map and its tiles |
| \`GoogleMap\` | \`map\` | \`onRender\` | \`GoogleMapsUiComponents\` | The vis.gl map |
| Both | \`marker.pin\` | \`onRender\`, \`onRenderPin\`, \`onRenderDot\` | \`MapUiMarkerComponents\` | Each pin: its 32 by 40 box, the teardrop, and the dot in it; a \`color\` in \`onRenderPin\`'s props fills the teardrop. See [**Pins coloured by region**](?path=/docs/controls-map-guide-make-it-yours-pins-coloured-by-region--overview) |
| | \`marker.popup\` | \`onRender\`, with no props | \`Map.Popup.Renderer\` | The whole content of the popup a pin opens. See [**A postcard for each capital**](?path=/docs/controls-map-guide-make-it-yours-a-postcard-for-each-capital--overview) |
| | \`marker.popup.card\` | \`onRender\` | \`RecordCardComponents\` | The default popup's card; unused beside \`marker.popup.onRender\` |
| | \`marker.popup.header\` | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\`: \`onRender\`; \`status\`: \`onRender\`, \`onRenderLabel\` | \`RecordCardHeaderComponents\`, \`RecordCardHeaderStartComponents\`, \`RecordCardHeaderEndComponents\`, \`RecordCardTitleComponents\`, \`OptionTagComponents\` | The default popup's header, with the record's name; unused beside \`marker.popup.onRender\` |
| \`LeafletMap\` | \`marker.popup.container\` | \`onRender\`, with react-leaflet's \`Popup\` props | \`LeafletUiPopupComponents\` | Leaflet's popup around the content, drawn as a Fluent callout |
| \`GoogleMap\` | \`marker.popup.container\` | \`onRender\`, with vis.gl's \`InfoWindow\` props | \`GoogleMapsUiPopupComponents\` | Google's info window around the content, drawn as a Fluent callout |

The cover \`map.loading.show()\` draws and the dialog of a failed \`map.execute\` keep their defaults. To change the wording of the loading state and the error, see [**Localization**](?path=/docs/concepts-localization--overview).

## Popup parts

\`Map.Popup\` holds the parts a popup of your own is composed of. Each reads the record of the pin it is in, and throws outside a pin. See [**A postcard for each capital**](?path=/docs/controls-map-guide-make-it-yours-a-postcard-for-each-capital--overview).

| Part | Prop | Type | Default | Timing | Description |
|---|---|---|---|---|---|
| \`Map.Popup.Renderer\` | \`components\` | \`IMapPopupRendererComponents\` | Defaults | Live | The default popup, the card with the header in it; \`card\` and \`header\` take the slots of \`marker.popup.card\` and \`marker.popup.header\`. |
| \`Map.Popup.Card\` | \`children\` | \`ReactNode\` | None | Live | What the card holds. |
| | \`components\` | \`Partial<IRecordCardComponents>\` | Defaults | Live | \`onRender\`: the card's box. |
| \`Map.Popup.Header\` | \`statusColumnName\` | \`string\` | None | Live | An option set column, shown beside the name as a tag in its option's colour. |
| | \`components\` | \`IRecordCardHeaderPartsComponents\` | Defaults | Live | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\` and \`status\`, as in \`marker.popup.header\`. |
| \`Map.Popup.FieldRows\` | \`children\` | \`ReactNode\` | None | Live | The rows, one under another. |
| | \`components\` | \`Partial<IRecordCardFieldRowsComponents>\` | Defaults | Live | \`onRender\`: the box that holds the rows. |
| \`Map.Popup.FieldRow\` | \`columnName\` | \`string\` | Required | Live | The column, formatted, with its display name as the label; nothing while its value is empty. |
| | \`iconName\` | \`string\` | None | Live | A Fluent icon before the label. |
| | \`components\` | \`Partial<IRecordCardFieldRowComponents>\` | Defaults | Live | \`onRender\`, \`onRenderIcon\`, \`onRenderLabel\` and \`onRenderValue\`. |

## Plain UI

Each part of the map is also exported as plain UI, which takes only props, for a map with no provider behind it. A plain map works out neither its pins nor the map's view.

| Namespace | Holds |
|---|---|
| \`Map.Ui\`, also exported as \`MapUi\` | \`Container\`: the map's box, with \`height\`, \`className\` and \`components\`. \`Marker\`: the Fluent pin, its tip at the bottom centre of its 32 by 40 box. \`MarkerPin\`: its teardrop, in an optional \`color\` or the theme's primary colour. \`Skeleton\`: a placeholder shaped like a header over a map, with \`height\` and \`showHeader\`, for a \`DatasetControl\`'s \`components.skeleton.onRender\`; see [**A trip planner**](?path=/docs/controls-map-guide-your-data-a-trip-planner--overview). |
| \`LeafletUi\` | The Leaflet map over \`tileUrl\` and \`attribution\`, starting at \`defaultCenter\` and \`defaultZoom\`, with react-leaflet markers in its children. \`LeafletUi.Popup\`: Leaflet's popup as a Fluent callout, for inside a react-leaflet \`Marker\`. |
| \`GoogleMapsUi\` | The Google map under \`mapId\`, starting at \`defaultCenter\` and \`defaultZoom\`, with Advanced Markers in its children; it goes inside vis.gl's \`APIProvider\`, and draws dark on a dark theme. \`GoogleMapsUi.Popup\`: Google's info window as a Fluent callout, opened over its \`anchor\`, with \`onClose\`. |
| From the package root | \`RecordCard\`, \`RecordCardHeader\` with \`RecordCardHeaderStart\` and \`RecordCardHeaderEnd\`, \`RecordCardTitle\`, \`RecordCardFieldRows\`, \`RecordCardFieldRow\`, \`RecordCardDateRange\`, \`RecordCardProgress\` and \`OptionTag\`: a record's summary, as the map's popups and the Gantt's tooltips draw it. |
`

const meta = {
    title: 'Controls/Map/Reference',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

//a docs page needs a story, and this one has nothing to show
export const Overview: Story = {
    name: 'Overview',
    tags: ['!dev'],
    render: () => <></>,
}
