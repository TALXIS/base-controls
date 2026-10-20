import { useMemo } from 'react';
import { IMapProvider } from '../provider';
import { createLeafletMapProvider } from '../leaflet';
import { getMapyProviderStyles } from './styles';

/**
 * Map sets the [Mapy.com Map Tiles API](https://developer.mapy.com/rest-api-mapy-cz/function/map-tiles/)
 * serves. `names-overlay` is labels and borders on transparency, meant to be stacked over imagery.
 */
export type IMapyMapset = 'basic' | 'outdoor' | 'winter' | 'aerial' | 'names-overlay';

/** Languages the tile labels use. Only affects zoom 6 and below - country and region names. */
export type IMapyLanguage = 'cs' | 'de' | 'el' | 'en' | 'es' | 'fr' | 'it' | 'nl' | 'pl' | 'pt' | 'ru' | 'sk' | 'tr' | 'uk';

export interface IMapyConfig {
    /** Sent as a query parameter on every tile request, so restrict it to the origins allowed to use it. */
    apiKey: string;
    /** Map set to render. Defaults to `basic`. */
    mapset?: IMapyMapset;
    /** Whether to request high density tiles. Defaults to `true`. Only `basic` and `outdoor` are served so. */
    retinaTiles?: boolean;
    /** Language of the tile labels. Defaults to the Mapy.com default of `cs`. */
    lang?: IMapyLanguage;
}

const TILE_ENDPOINT = 'https://api.mapy.com/v1/maptiles';
const COPYRIGHT_URL = 'https://api.mapy.com/copyright';
const LOGO_URL = 'https://mapy.com/';
//the variant with its own green background, legible on any map set and in either theme
const LOGO_IMAGE_URL = 'https://api.mapy.com/img/api/logo_green.svg';
const DEFAULT_MAPSET: IMapyMapset = 'basic';
//deepest zoom the api serves, past the Leaflet default of 18
const MAX_ZOOM = 20;
//the only map sets served at twice the resolution
const RETINA_MAPSETS: IMapyMapset[] = ['basic', 'outdoor'];

const getAttribution = (lang?: IMapyLanguage): string => {
    const others = lang === 'cs' ? 'a další' : 'and others';
    return `<a href="${COPYRIGHT_URL}" target="_blank" rel="noreferrer noopener">&copy; Seznam.cz a.s. ${others}</a>`;
};

const getTileLayerUrl = (config: IMapyConfig): string => {
    const mapset = config.mapset ?? DEFAULT_MAPSET;
    const isRetina = (config.retinaTiles ?? true) && RETINA_MAPSETS.includes(mapset);
    const parameters = new URLSearchParams({ apikey: config.apiKey });
    if (config.lang) {
        parameters.set('lang', config.lang);
    }
    //the tile coordinates stay literal, Leaflet substitutes them
    return `${TILE_ENDPOINT}/${mapset}/${isRetina ? '256@2x' : '256'}/{z}/{x}/{y}?${parameters.toString()}`;
};

/** Required over any map drawn from Mapy.com tiles: visible, at least 30px tall, and linking to mapy.com. */
const MapyLogo = () => {
    const styles = useMemo(() => getMapyProviderStyles(), []);

    return (
        <a className={styles.logo} href={LOGO_URL} target="_blank" rel="noreferrer noopener">
            <img className={styles.logoImage} src={LOGO_IMAGE_URL} alt="Mapy.com" />
        </a>
    );
};

/**
 * Provider backed by the Mapy.com Map Tiles API - plain XYZ raster images, so an api key is the whole setup.
 * The logo and copyright notice their licence requires are part of the provider, not the host's to remember.
 */
export const createMapyProvider = (config: IMapyConfig): IMapProvider => {
    const mapset = config.mapset ?? DEFAULT_MAPSET;

    return createLeafletMapProvider({
        tileLayerUrl: getTileLayerUrl(config),
        attribution: getAttribution(config.lang),
        maxZoom: MAX_ZOOM,
        //no dark map set, so dark themes filter the tiles - except aerial, where that makes a negative
        invertTilesInDarkTheme: mapset !== 'aerial',
        overlay: <MapyLogo />
    });
};
