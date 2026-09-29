import { IMapProvider } from '../provider';
import { createLeafletMapProvider } from '../leaflet';

/**
 * Styles the [HERE Raster Tile API v3](https://www.here.com/docs/category/raster-tile-api-v3) renders. The
 * authoritative list for an api key is what `GET https://maps.hereapi.com/v3/info` returns.
 */
export type IHereMapsStyle =
    | 'dem'
    | 'explore.day'
    | 'explore.night'
    | 'explore.satellite.day'
    | 'lite.day'
    | 'lite.night'
    | 'lite.satellite.day'
    | 'logistics.day'
    | 'logistics.night'
    | 'logistics.satellite.day'
    | 'satellite.day'
    | 'topo.day'
    | 'topo.night';

/** Layer a tile carries: the whole map, labels alone for stacking over imagery, no labels, or land only. */
export type IHereMapsResource = 'base' | 'background' | 'blank' | 'label';

export type IHereMapsFormat = 'png' | 'png8' | 'jpeg';

/** Edge length of a tile image. Both cover the same area, so 512 is the retina option, not a zoom shift. */
export type IHereMapsTileSize = 256 | 512;

/** Pixels per inch a tile is rendered for. Larger values scale up labels and road widths. */
export type IHereMapsPpi = 100 | 200 | 400;

export interface IHereMapsConfig {
    /** Sent as a query parameter on every tile request, so restrict it to the origins allowed to use it. */
    apiKey: string;
    /** Style rendered while the control theme is light. Defaults to `explore.day`. */
    style?: IHereMapsStyle;
    /** Style rendered while the control theme is dark. Defaults to `explore.night`. */
    darkStyle?: IHereMapsStyle;
    /**
     * Style rendered while the control is asked to hide points of interest. HERE's raster tiles carry no
     * switch for that, so the closest thing is a style that draws far fewer of them - `lite.day` by default.
     */
    lowPoiStyle?: IHereMapsStyle;
    /** The same, for a dark control theme. Defaults to `lite.night`. */
    lowPoiDarkStyle?: IHereMapsStyle;
    /** Layer of the map to request. Defaults to `base`. */
    resource?: IHereMapsResource;
    /** Image format. Defaults to `png8`, smallest for a vector drawn map. Prefer `jpeg` for satellite. */
    format?: IHereMapsFormat;
    /** Edge length of a tile image. Defaults to 512, which keeps the map sharp on a high density display. */
    size?: IHereMapsTileSize;
    ppi?: IHereMapsPpi;
    /** BCP 47 tag the labels use, e.g. `cs-CZ`. Defaults to what HERE picks for the region a tile covers. */
    lang?: string;
    /** Defaults to the HERE notice their terms require - reword, do not remove. */
    attribution?: string;
}

const TILE_ENDPOINT = 'https://maps.hereapi.com/v3';
//mercator is the only projection the api serves
const PROJECTION = 'mc';
const DEFAULT_STYLE: IHereMapsStyle = 'explore.day';
const DEFAULT_DARK_STYLE: IHereMapsStyle = 'explore.night';
const DEFAULT_RESOURCE: IHereMapsResource = 'base';
const DEFAULT_FORMAT: IHereMapsFormat = 'png8';
const DEFAULT_TILE_SIZE: IHereMapsTileSize = 512;
//deepest zoom the api serves, past the Leaflet default of 18
const MAX_ZOOM = 20;

const getAttribution = () => `&copy; ${new Date().getFullYear()} <a href="https://legal.here.com/terms" target="_blank" rel="noreferrer noopener">HERE</a>`;

const getTileLayerUrl = (config: IHereMapsConfig, style: IHereMapsStyle): string => {
    const parameters = new URLSearchParams({
        apiKey: config.apiKey,
        style,
        size: `${config.size ?? DEFAULT_TILE_SIZE}`
    });
    if (config.ppi) {
        parameters.set('ppi', `${config.ppi}`);
    }
    if (config.lang) {
        parameters.set('lang', config.lang);
    }
    const resource = config.resource ?? DEFAULT_RESOURCE;
    const format = config.format ?? DEFAULT_FORMAT;
    //the tile coordinates stay literal, Leaflet substitutes them
    return `${TILE_ENDPOINT}/${resource}/${PROJECTION}/{z}/{x}/{y}/${format}?${parameters.toString()}`;
};

/** Style with the fewest points of interest HERE draws, for a control asked to hide them. */
const DEFAULT_LOW_POI_STYLE: IHereMapsStyle = 'lite.day';
const DEFAULT_LOW_POI_DARK_STYLE: IHereMapsStyle = 'lite.night';

/** Picks the style for a theme and whether points of interest are wanted. */
const getStyle = (config: IHereMapsConfig, isDark: boolean, showPointsOfInterest: boolean): IHereMapsStyle => {
    if (!showPointsOfInterest) {
        return isDark
            ? config.lowPoiDarkStyle ?? DEFAULT_LOW_POI_DARK_STYLE
            : config.lowPoiStyle ?? DEFAULT_LOW_POI_STYLE;
    }
    return isDark ? config.darkStyle ?? DEFAULT_DARK_STYLE : config.style ?? DEFAULT_STYLE;
};

/**
 * Provider backed by the HERE Raster Tile API v3 - plain XYZ raster images, so an api key is the whole setup.
 * The one shipped provider with a real dark map: it swaps the HERE style rather than filtering the tiles.
 */
export const createHereMapsProvider = (config: IHereMapsConfig): IMapProvider => {
    return createLeafletMapProvider(({ theme, showPointsOfInterest }) => ({
        tileLayerUrl: getTileLayerUrl(config, getStyle(config, !!theme.isInverted, !!showPointsOfInterest)),
        attribution: config.attribution ?? getAttribution(),
        maxZoom: MAX_ZOOM,
        invertTilesInDarkTheme: false
    }));
};
