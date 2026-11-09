import { IAddress } from '@talxis/client-libraries';
import {
    DEFAULT_GEOCODING_LIMIT,
    getAddressLabel,
    IMapGeocoder,
    IMapPlace
} from '../../core/geocoding';
import { withGeocodingCache } from '../geocodingCache';
import { buildUrl, createRequestQueue, getJson } from '../../core/http';
import { IMapCoordinates } from '../../core/coordinates';

const SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Smallest gap between calls to the public Nominatim service, whose usage policy caps them at one a second
 * and blocks an origin that ignores it. One queue serves the whole page, because the cap is per origin.
 */
const NOMINATIM_MINIMUM_INTERVAL_MS = 1000;

const nominatimQueue = createRequestQueue(NOMINATIM_MINIMUM_INTERVAL_MS);

/**
 * Addresses one view may spend on the public instance. Its policy calls a long run of lookups heavy use and
 * asks that bulk geo-coding go to an instance of your own, so a view that needs more than this is a view
 * whose coordinates belong on the records rather than a bigger number here.
 */
const NOMINATIM_MAX_BULK_REQUESTS = 25;

/** How the control identifies itself to Nominatim, which refuses a caller it cannot attribute. */
const DEFAULT_APPLICATION_NAME = '@talxis/base-controls Map (https://github.com/TALXIS/base-controls)';

export interface INominatimAddress {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    suburb?: string;
    city_district?: string;
    district?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    region?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
}

export interface INominatimResult {
    lat?: string;
    lon?: string;
    display_name?: string;
    address?: INominatimAddress;
}

export interface INominatimGeocoderConfig {
    /** Service to call. Point this at your own Nominatim instance to escape the public usage policy. */
    searchUrl?: string;
    reverseUrl?: string;
    /**
     * Identifies the calling application, which the public instance requires and answers 403 without. Sent
     * as a `User-Agent`; a browser drops that header and identifies the page through `Referer` instead, so
     * this only takes effect where the control runs outside one.
     */
    applicationName?: string;
    /**
     * Whether the service may be asked as someone types. Defaults to `false`, because the public instance's
     * usage policy forbids an auto-complete built on it. Only turn it on for an instance you run.
     */
    allowsTypeAhead?: boolean;
    /**
     * Addresses one set of records may spend. Defaults to a number the public instance's policy tolerates,
     * which is far below what the control would otherwise resolve. Only raise it for an instance you run.
     */
    maxBulkRequests?: number;
    /**
     * Lookups to run at once. Defaults to `1`: the public instance's policy asks that a run of them be
     * single threaded, and the one-call-a-second gate below would serialize them anyway.
     */
    maxConcurrentRequests?: number;
}

/**
 * Maps one Nominatim result onto a place.
 *
 * Nominatim names the settlement level differently by country, so each component reads the first of the
 * keys that carries a value.
 */
export const getNominatimPlace = (result: INominatimResult): IMapPlace | undefined => {
    const latitude = parseFloat(result.lat ?? '');
    const longitude = parseFloat(result.lon ?? '');
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return undefined;
    }
    const source = result.address ?? {};
    const address: IAddress = {
        latitude,
        longitude,
        text: result.display_name,
        country: source.country,
        countryCode: source.country_code?.toUpperCase(),
        administrativeArea: source.state ?? source.region,
        region: source.county,
        locality: source.city ?? source.town ?? source.village ?? source.municipality,
        subLocality: source.suburb ?? source.city_district ?? source.neighbourhood ?? source.district,
        street: source.road ?? source.pedestrian,
        streetNumber: source.house_number,
        postalCode: source.postcode
    };
    return {
        coordinates: { latitude, longitude },
        address,
        label: result.display_name || getAddressLabel(address)
    };
};

/**
 * Builds the OpenStreetMap geocoder, backed by Nominatim.
 *
 * The public service is rate limited to one call a second by its usage policy, which this client enforces,
 * and refuses a caller it cannot attribute - so every call identifies the application. Its policy also
 * forbids driving it from an auto-complete, so the geocoder declines type-ahead and is only asked once a
 * query is submitted, and calls a long run of lookups heavy use, so it takes only a small part of a view's
 * addresses. Production traffic belongs on your own instance, configured through `searchUrl` and
 * `reverseUrl` - one of those lifts every restriction here, so a private instance may raise all three.
 */
export const createNominatimGeocoder = (config: INominatimGeocoderConfig = {}): IMapGeocoder => {
    const searchUrl = config.searchUrl ?? SEARCH_URL;
    const reverseUrl = config.reverseUrl ?? REVERSE_URL;
    const headers = { 'User-Agent': config.applicationName ?? DEFAULT_APPLICATION_NAME };

    return withGeocodingCache({
        allowsTypeAhead: config.allowsTypeAhead ?? false,
        maxBulkRequests: config.maxBulkRequests ?? NOMINATIM_MAX_BULK_REQUESTS,
        maxConcurrentRequests: config.maxConcurrentRequests ?? 1,
        geocode: async (query, options) => {
            if (!query.trim()) {
                return [];
            }
            const results = await nominatimQueue(() => getJson<INominatimResult[]>(
                buildUrl(searchUrl, {
                    q: query,
                    format: 'jsonv2',
                    addressdetails: 1,
                    limit: options?.limit ?? DEFAULT_GEOCODING_LIMIT,
                    'accept-language': options?.language
                }),
                { signal: options?.signal, headers }
            ));
            return results.map(getNominatimPlace).filter((place): place is IMapPlace => !!place);
        },
        reverseGeocode: async (coordinates: IMapCoordinates, options) => {
            const result = await nominatimQueue(() => getJson<INominatimResult>(
                buildUrl(reverseUrl, {
                    lat: coordinates.latitude,
                    lon: coordinates.longitude,
                    format: 'jsonv2',
                    addressdetails: 1,
                    'accept-language': options?.language
                }),
                { signal: options?.signal, headers }
            ));
            return getNominatimPlace(result) ?? null;
        }
    });
};
