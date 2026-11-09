# Map

Renders the records of a bound dataset as pins on a map. The **core** reads coordinates off the records,
decides what a pin looks like, decides where the map looks, and hands all of that to a **provider** that
draws it. Everything else is a **module** the host turns on by passing it in, so a map ships only what it
uses.

```tsx
import { Map, createClusteringModule, createRoutesModule } from '@talxis/base-controls';
import { googleMapsProvider } from '@talxis/base-controls/dist/components/Map/providers/google-maps';

<Map
    context={pcfContext}
    parameters={{
        Dataset: dataset,
        LatitudeAttributeName: { raw: 'cds_addressid.cds_latitude' },
        LongitudeAttributeName: { raw: 'cds_addressid.cds_longitude' },
        GoogleApiKey: { raw: apiKey },
        DefaultProvider: { raw: 'google' }
    }}
    providers={[googleMapsProvider]}
    modules={{
        clustering: createClusteringModule(),
        routes: createRoutesModule({ attributes: { route: 'routeid', sequence: 'stopnumber' }, snapToRoads: true })
    }}
/>
```

A dataset and the two coordinate attributes are the only requirements. Without `providers` the map draws
keyless OpenStreetMap; without `modules` it draws pins, lets the user select them, and nothing else.

Run `npm run storybook` and open **Map** for a page per module, each with a live map.

## The core

### Props

| Prop | Type | |
|---|---|---|
| `context` | `IContext` | **Required.** The PCF context: user settings, and the theme. |
| `parameters` | `IMapParameters` | **Required.** Below. |
| `modules` | `IMapModules` | The features this map runs with. Absent means pins and selection only. |
| `providers` | `IMapProviderDefinition[]` | Providers on top of the built-in ones. How Google Maps is added. |
| `onResolvePin` | `(record) => IMapPinAppearance \| undefined` | Decides a pin's appearance in code. Wins over modules and `PinRules`. |
| `viewportOptions` | `IMapViewportOptions` | Overrides the defaults used when deriving where the map looks. |
| `components` | `Partial<IMapComponents>` | Replaces the status message or the provider picker. A module's UI is replaced through that module's `components` option. |
| `translations` | `IMapTranslations` | Overrides the core's labels. Each module takes its own through its options. |
| `onNotifyOutputChanged` | `(outputs: IMapOutputs) => void` | Fires on pan, zoom, and provider pick. |

### Parameters

PCF-shaped throughout, `{ raw }` and all. Everything but the first three is optional.

| Parameter | |
|---|---|
| `Dataset` | Records to draw. Loading is the host's job. |
| `LatitudeAttributeName`, `LongitudeAttributeName` | Where the coordinates are. Dot notation reaches across a lookup. |
| `AutoAddLinkedColumns` | Whether the control adds the column a dot notation path needs when the dataset lacks it. On by default. |
| `PinLoading` | Which records are drawn: `page`, the page the host loaded, or `all`, every page of the view on a copy of the dataset. Defaults to `page`. |
| `MaxRecords` | Records to load before stopping, while `PinLoading` is `all`. Defaults to 50 000. |
| `PinRules` | Pin rules as a JSON array; first match wins. The legacy MapPicker's `pinIcons` shape, without `svg`. |
| `ShowPointsOfInterest` | Whether the provider's own points of interest are drawn. Off by default. |
| `DefaultProvider` | Provider the map opens with. Defaults to `osm`. |
| `EnableProviderSwitching` | Whether the picker offers every configured provider. On by default. |
| `MapProvider` | The end user's pick, fed back to make it stick. |
| `HereApiKey`, `MapyApiKey`, `GoogleApiKey`, `<Provider>ApiKey` | Keys. A provider is offered once its key is set. |

### Outputs

| Output | |
|---|---|
| `Viewport` | What the provider is showing, reported on pan and zoom. |
| `MapProvider` | The provider the end user picked. |

## Modules

| Key | Built by | What it adds |
|---|---|---|
| `filter` | `createFilterModule({ attributes, scope, components })` | A panel of the values the records hold, to narrow the pins by |
| `geocoding` | `createGeocodingModule({ addressAttribute, maxRequests, saveCoordinates })` | Places records with an address but no coordinates |
| `routes` | `createRoutesModule({ attributes, snapToRoads, isRouteVisible })` | Lines through pins sharing a value, optionally snapped to roads |
| `clustering` | `createClusteringModule({ radius, maxZoom, maxLeaves })` | Overlapping pins drawn as one, with a count |
| `editing` | `createEditingModule({ allowDrag, allowCreate, addressAttributes })` | Move a record by dragging its pin, create one by clicking the map |
| `cards` | `createCardsModule({ rules, defaultCard, renderers, components })` | What a pin opens |
| `search` | `createSearchModule({ places, components })` | Quick find over the records, and places from the geo-coding service |
| `legend` | `createLegendModule({ html, webResourceName, components })` | A legend over the map |
| `userLocation` | `createUserLocationModule({ askBrowser, resolveFallback })` | Centre on the user while there is nothing else to show |
| `clientApi` | `createClientApiModule({ webResourceName, functionName })` | A Client API web resource deciding pin appearance |

Every option is documented on its `create<Name>Module` function. Each module owns its strings (overridden
through its `labels` option), its UI (replaced through its `components` option), its tests and its story.

### How a module works

A module is a set of optional **stage hooks** the core calls in a fixed order, for every module in
`MAP_MODULE_ORDER`, in one render pass:

| Stage | Receives | Returns | Used by |
|---|---|---|---|
| `useModuleState` | the module context | state other modules can `read`, a pin resolver, a fallback location, attribute paths | editing, client API, user location |
| `useRecords` | the records | the records to draw | filter |
| `usePins` | the placed pins, `placeRecords` | pins with more placed, routes filled | geocoding, routes |
| `useDrawnLocations` | the pins, the visible viewport | the pins to hand the provider | clustering |
| `useProviderProps` | what the provider will receive | the same, added to | cards, editing |
| `useOverlay` | the view context | chrome for a corner of the map | search, filter, legend |
| `useStatus` | the view context | the status message to show | geocoding, editing |

Because the stages are React hooks, the set of modules has to stay the same for the lifetime of one mount;
a changed set remounts the map. Building the module objects every render is fine, and so is a module's
options changing - only adding or removing a module is a remount.

Two modules talk through `read`: the cards module reads the editing module's state to offer deletion of a
record the map created. Modules run in `MAP_MODULE_ORDER`, so a module can only read one that comes
before it.

### Writing one

Put it in `modules/<name>/` with a `create<Name>Module` that takes one options object and returns an
`IMapModule`, its strings in `labels.ts` resolved through `useModuleLabels`, its UI in kebab-case
component folders with the replaceable parts declared as `I<Name>Components` in `components/components.tsx`
next to their defaults, and a story under `Map/Modules`. Add its key to `IMapModules` and its place in
`MAP_MODULE_ORDER`.

Settings are options, not manifest parameters: `createRoutesModule({ ... })` rather than a
`RouteAttributeName` parameter. Only the core reads the manifest. A host driven by one maps its parameters
onto those options in `descriptors/`, the way the TaskGrid wires a backend through its own `descriptors/`
folder - so the mapping ships and versions with the modules rather than living in the host. Such a host
pulls every module into its build, because a maker may have configured any of them; a host that names the
modules it wants in code pulls only those.

## Providers

| Provider | Id | Renders | Geo-codes | Snaps routes to roads | Hides points of interest |
|---|---|:-:|:-:|:-:|:-:|
| OpenStreetMap (default, keyless) | `osm` | ✅ | Nominatim | OSRM | — |
| HERE | `here` | ✅ | ✅ | ✅ | approximated |
| Mapy.com | `mapy` | ✅ | ✅ | ✅ | — |
| Google Maps | `google` | ✅ | ✅ | Routes API | ✅ |

Rendering, geo-coding and directions are three separate capabilities, and a provider missing one borrows it
from another configured provider. Google Maps is not built in because importing it pulls an optional peer
dependency; pass `googleMapsProvider` through `providers`. Likewise the Adaptive Card renderer lives at
`modules/cards/map-card/adaptive-card`, because `adaptivecards` is optional, and the Form base control
renderer at `modules/cards/map-card/form-card`, because it brings the Form control with it.

A provider of your own is an `IMapProviderDefinition`: an `id`, a `label`, the `apiKeyParameterName` its
key is read from, and `createProvider` returning a component that takes `IMapProviderProps`. Its factories
take an `IMapProviderConfig` rather than a bare api key, and a definition carrying configuration of its own
gives a `cacheKey` so a change rebuilds it. `provider.ts` documents every prop a provider receives; the
shipped Leaflet provider is the reference implementation.

## Where things are

```
Map.tsx          the core: records → pins → viewport → provider, with the modules run in between
interfaces.ts    IMap, IMapParameters, IMapOutputs
labels.ts        the core's strings
core/            what the core computes with, and its own hooks
providers/       the provider seam and the shipped providers
modules/         interfaces.ts is the module contract; one folder per module
descriptors/     manifest parameters mapped onto modules, deep-imported by a host that needs it
testing/         fakes the tests build records and datasets from
```
