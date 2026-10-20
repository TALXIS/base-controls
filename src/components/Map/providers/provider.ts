import { ComponentType, ReactNode } from 'react';
import { IContext } from '@interfaces';
import { ITheme } from '@legacy';
import { IMapPinAppearance } from '../core/pinAppearance';
import { IMapDirections } from '../core/directions';
import { IMapGeocoder } from '../core/geocoding';
import { IMapViewport, IMapViewportRequest } from '../core/viewport';
import { IMapCoordinates } from '../core/coordinates';
import { IMapLabels } from '../labels';

/** What a pin standing for several records knows about the group behind it. Set by the clustering module. */
export interface IMapClusterInfo {
    /** How many records the pin stands for. Always exact. */
    count: number;
    /** Ids of those records in dataset order, up to a limit the module sets. */
    recordIds: string[];
    /** Zoom at which this group breaks apart, so clicking it can zoom in usefully. */
    expansionZoom: number;
}

export interface IMapLocation extends IMapCoordinates {
    /** Identifies this pin among `locations`. Opaque - a merged pin's id is the control's own. */
    id: string;
    /** Dataset record this pin was built from. Absent for a pin standing for several. */
    recordId?: string;
    /** Primary name of that record, for tooltips and popups instead of a raw record id. */
    label?: string;
    /**
     * The group this pin stands for, set only when several overlapping records were merged into it.
     * A provider draws such a pin with its `count` on it. Set instead of `recordId`, never alongside it.
     */
    cluster?: IMapClusterInfo;
    /**
     * How to draw this pin, when the control worked out something other than the default. Absent means the
     * shipped pin in the theme's primary colour.
     */
    pin?: IMapPinAppearance;
    /**
     * Route this pin belongs to, set by the routes module. A pin on a drawn route is never merged into a
     * cluster - a route's line must always connect pins the user can see.
     */
    routeId?: string;
}

/** Modifier keys held while a pin was activated, so the control can offer additive selection. */
export interface IMapClickModifiers {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
}

export interface IMapRoute {
    /** Value shared by every location on this route. */
    id: string;
    /** Locations in the order they should be visited. Providers connect them into a single line. */
    locations: IMapLocation[];
    /** Colour to draw the line in. Absent means the theme's primary. */
    color?: string;
    /**
     * The line to actually draw, following the road network, once a directions service has resolved it.
     * Absent means draw a straight line through `locations`.
     */
    path?: IMapCoordinates[];
}

/** A card the control wants anchored on the map. */
export interface IMapOpenCard {
    /** Id of the pin it belongs to. Also the card's key, and what `onCloseCard` is called with. */
    locationId: string;
    /** Where to anchor it. */
    coordinates: IMapCoordinates;
    content: ReactNode;
}

/**
 * Everything a provider receives from the Map control. Providers are thin renderers: the control decides
 * what to show and where to look, the provider only translates that into its own map API.
 */
export interface IMapProviderProps {
    /** Pins to render, in dataset order. */
    locations: IMapLocation[];
    /** Lines to render. Empty unless the routes module is on. */
    routes: IMapRoute[];
    /**
     * Where to look. Apply it whenever the object identity changes and do not recompute it - the control
     * holds the identity stable while the derived viewport does not change, so a refresh returning the same
     * records does not pull the map back from wherever the user panned to.
     */
    viewport: IMapViewportRequest;
    /** Ids of the pins to draw as selected. The control maps the dataset's selection onto them. */
    selectedLocationIds: string[];
    context: IContext;
    /** Theme of the host control, so provider chrome matches the rest of the app. */
    theme: ITheme;
    labels: IMapLabels;
    /** Call when the user activates a pin. The control turns it into a dataset selection. */
    onLocationClick: (location: IMapLocation, modifiers?: IMapClickModifiers) => void;
    /** Call when the user pans or zooms. The control reports it as the `Viewport` output. */
    onViewportChange: (viewport: IMapViewport) => void;
    /**
     * Cards to anchor. Empty unless the cards module is on. The control decides what a card contains; a
     * provider only anchors each at its point and calls `onCloseCard` when the user dismisses one.
     */
    openCards: IMapOpenCard[];
    /** Call with the card's `locationId` when the user dismisses it. */
    onCloseCard?: (locationId: string) => void;
    /** Whether this pin can be dragged. Providers that cannot drag may ignore it. */
    isPinDraggable?: (location: IMapLocation) => boolean;
    /** Call when a pin is dropped. The control moves the record to the new point. */
    onLocationDragEnd?: (location: IMapLocation, coordinates: IMapCoordinates) => void;
    /** Call when the user clicks empty map. The control creates a record there. Absent means do not offer it. */
    onMapClick?: (coordinates: IMapCoordinates) => void;
    /**
     * Whether the map draws points of interest of its own. Off by default; not every provider's tiles can
     * express it, and the ones that cannot simply ignore this.
     */
    showPointsOfInterest?: boolean;
}

/** The component that draws the map. */
export type IMapProvider = ComponentType<IMapProviderProps>;

/** Configuration a provider's factories are built from. An object, so it is not limited to a key. */
export interface IMapProviderConfig {
    /** Value of the parameter `apiKeyParameterName` names. Absent for a keyless provider. */
    apiKey?: string;
}

/** Builds a provider's geocoding service from the configuration the control resolved for it. */
export type IMapGeocoderFactory = (config: IMapProviderConfig) => IMapGeocoder;

/** Builds a provider's directions service from the configuration the control resolved for it. */
export type IMapDirectionsFactory = (config: IMapProviderConfig) => IMapDirections;

/**
 * A map provider the control can build on its own, from the configuration it resolved for it - what
 * `DefaultProvider`, `EnableProviderSwitching` and the `<Provider>ApiKey` parameters are resolved against.
 *
 * OpenStreetMap, HERE and Mapy.com ship built in. Google Maps ships as `googleMapsProvider` from
 * `.../Map/providers/google-maps`, because importing it pulls an optional peer dependency into the build.
 */
export interface IMapProviderDefinition {
    /** Public api - the value `DefaultProvider` and `MapProvider` carry, typed into the manifest by a maker. */
    id: string;
    /** Adds to the cache identity, for configuration the control cannot see. A change rebuilds the provider. */
    cacheKey?: string;
    /** Shown in the picker. Not translated, because provider names are proper nouns. */
    label: string;
    /** Parameter holding this provider's api key. Omit for a keyless provider; it is offered once the key is set. */
    apiKeyParameterName?: `${string}ApiKey`;
    /** Builds the component. Cached per `id`, api key and `cacheKey`; a change to any rebuilds it. */
    createProvider: (config: IMapProviderConfig) => IMapProvider;
    /**
     * Builds the provider's geocoding service, used by the geocoding, search and editing modules. Omit for
     * a provider that has none - the control borrows another configured provider's.
     */
    createGeocoder?: (config: IMapProviderConfig) => IMapGeocoder;
    /** Builds the provider's directions service, used by the routes module. Omit for a provider that has none. */
    createDirections?: (config: IMapProviderConfig) => IMapDirections;
}

/** One configured provider, built from its definition and the configuration the control resolved for it. */
export interface IMapProviderOption {
    /** The definition's `id`. Carried by the `MapProvider` parameter and output. */
    id: string;
    /** Shown in the picker, falling back to `id`. */
    label?: string;
    /** Kept at the same identity across renders - a fresh identity remounts the map. */
    provider: IMapProvider;
    geocoder?: IMapGeocoder;
    directions?: IMapDirections;
}
