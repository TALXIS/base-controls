import { IMapBounds, IMapCoordinates } from './coordinates';

/** What a map is showing, as a provider reports it and the `Viewport` output carries it. */
export interface IMapViewport {
    /** Point the map is centered on. */
    center: IMapCoordinates;
    /** Zoom that belongs to `center`. */
    zoom: number;
    /** Box the map currently covers, whichever way the viewport was derived. */
    bounds?: IMapBounds;
}

/** Where the control asks a provider to look. Handed down; never what a provider reports back. */
export interface IMapViewportRequest extends IMapViewport {
    /** Box to fit, in preference to `center` and `zoom`. Set only when derived from several locations. */
    bounds?: IMapBounds;
    /** Pixels to keep between `bounds` and the map's edge when fitting. */
    padding?: number;
}

export interface IMapViewportOptions {
    fallbackCenter?: IMapCoordinates;
    fallbackZoom?: number;
    /** Zoom for a single location, since fitting bounds around one point collapses to maximum zoom. */
    singleLocationZoom?: number;
    /** Zoom for an approximate location. Deliberately low - such a location can be off by a city or two. */
    approximateLocationZoom?: number;
    /** Zoom for a location precise enough to trust, such as one the device reported. */
    preciseLocationZoom?: number;
    padding?: number;
}

export const DEFAULT_MAP_VIEWPORT_OPTIONS: Required<IMapViewportOptions> = {
    //Czechia, used only when there is nothing better to center on
    fallbackCenter: { latitude: 49.8175, longitude: 15.4730 },
    fallbackZoom: 6,
    singleLocationZoom: 15,
    approximateLocationZoom: 8,
    preciseLocationZoom: 14,
    padding: 48
};

/**
 * The smallest box containing every coordinate. Sets that cross the antimeridian are not detected and
 * produce a box spanning the long way around.
 */
const getMapBounds = (coordinates: IMapCoordinates[]): IMapBounds | undefined => {
    if (coordinates.length === 0) {
        return undefined;
    }
    let north = coordinates[0].latitude;
    let south = coordinates[0].latitude;
    let east = coordinates[0].longitude;
    let west = coordinates[0].longitude;
    for (const coordinate of coordinates) {
        north = Math.max(north, coordinate.latitude);
        south = Math.min(south, coordinate.latitude);
        east = Math.max(east, coordinate.longitude);
        west = Math.min(west, coordinate.longitude);
    }
    return { north, south, east, west };
};

//rough inverse of the Web Mercator zoom math, for providers that cannot fit bounds themselves
const getZoomForSpan = (span: number, worldSpan: number, maxZoom: number): number => {
    if (span <= 0) {
        return maxZoom;
    }
    return Math.max(0, Math.min(maxZoom, Math.floor(Math.log2(worldSpan / span))));
};

/** The single place the control decides where to look, so every provider stays a thin renderer. */
export const getMapViewport = (coordinates: IMapCoordinates[], options?: IMapViewportOptions): IMapViewportRequest => {
    const { fallbackCenter, fallbackZoom, singleLocationZoom, padding } = { ...DEFAULT_MAP_VIEWPORT_OPTIONS, ...options };
    if (coordinates.length === 0) {
        return { center: fallbackCenter, zoom: fallbackZoom, padding };
    }
    if (coordinates.length === 1) {
        return {
            center: { latitude: coordinates[0].latitude, longitude: coordinates[0].longitude },
            zoom: singleLocationZoom,
            padding
        };
    }
    const bounds = getMapBounds(coordinates)!;
    if (bounds.north === bounds.south && bounds.east === bounds.west) {
        return {
            center: { latitude: bounds.north, longitude: bounds.east },
            zoom: singleLocationZoom,
            padding
        };
    }
    return {
        center: {
            latitude: (bounds.north + bounds.south) / 2,
            longitude: (bounds.east + bounds.west) / 2
        },
        zoom: Math.min(
            getZoomForSpan(bounds.east - bounds.west, 360, singleLocationZoom),
            getZoomForSpan(bounds.north - bounds.south, 180, singleLocationZoom)
        ),
        bounds,
        padding
    };
};

/** Viewport for a location the control resolved rather than derived from pins, zoomed to how much the location can be trusted. */
export const getResolvedLocationViewport = (
    coordinates: IMapCoordinates & { isPrecise?: boolean },
    options?: IMapViewportOptions
): IMapViewportRequest => {
    const { approximateLocationZoom, preciseLocationZoom, padding } = { ...DEFAULT_MAP_VIEWPORT_OPTIONS, ...options };
    return {
        center: { latitude: coordinates.latitude, longitude: coordinates.longitude },
        zoom: coordinates.isPrecise ? preciseLocationZoom : approximateLocationZoom,
        padding
    };
};

/** Pixels of map that must survive the fit padding, so the zoom math always has a positive span to work on. */
const MIN_PADDED_SPAN_PX = 32;

/**
 * Clamps a fit padding to the container it pads. A tile map subtracts the padding from the container size
 * before computing the zoom for bounds, and a container the browser is still laying out can be smaller than
 * twice the padding - the negative span then turns the zoom `NaN`, which poisons the map for good.
 */
export const getSafeFitPadding = (containerWidth: number, containerHeight: number, padding: number): number => {
    const room = Math.floor((Math.min(containerWidth, containerHeight) - MIN_PADDED_SPAN_PX) / 2);
    return Math.max(0, Math.min(padding, room));
};

/**
 * Whether a viewport is safe to hand to a map. Coordinates reach the control off an unvalidated dataset,
 * and a map asked to look at a value that is not a number answers with an invalid state it never recovers
 * from - so both directions are checked here.
 */
export const isFiniteMapViewport = (viewport: IMapViewportRequest): boolean => {
    const { center, zoom, bounds } = viewport;
    return Number.isFinite(center?.latitude)
        && Number.isFinite(center?.longitude)
        && Number.isFinite(zoom)
        && (!bounds || (
            Number.isFinite(bounds.north)
            && Number.isFinite(bounds.south)
            && Number.isFinite(bounds.east)
            && Number.isFinite(bounds.west)
        ));
};
