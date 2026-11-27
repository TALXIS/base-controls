import { IAddress } from '@talxis/client-libraries';
import {
    DEFAULT_GEOCODING_LIMIT,
    getAddressLabel,
    IMapGeocoder,
    IMapPlace
} from '../../core/geocoding';
import { IMapGeocoderFactory } from '../provider';
import { withGeocodingCache } from '../geocodingCache';
import { buildUrl, getJson } from '../../core/http';
import { IMapCoordinates } from '../../core/coordinates';

const GEOCODE_URL = 'https://geocode.search.hereapi.com/v1/geocode';
const REVERSE_GEOCODE_URL = 'https://revgeocode.search.hereapi.com/v1/revgeocode';

export interface IHereAddress {
    label?: string;
    countryCode?: string;
    countryName?: string;
    state?: string;
    county?: string;
    city?: string;
    district?: string;
    subdistrict?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
}

export interface IHereGeocodeItem {
    title?: string;
    address?: IHereAddress;
    position?: { lat: number; lng: number };
}

export interface IHereGeocodeResponse {
    items?: IHereGeocodeItem[];
}

/**
 * Maps one HERE geocoding item onto a place.
 *
 * HERE reports a three letter country code, which is kept as it comes rather than guessed down to two.
 */
export const getHerePlace = (item: IHereGeocodeItem): IMapPlace | undefined => {
    const position = item.position;
    if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
        return undefined;
    }
    const source = item.address ?? {};
    const address: IAddress = {
        latitude: position.lat,
        longitude: position.lng,
        text: source.label ?? item.title,
        country: source.countryName,
        countryCode: source.countryCode,
        administrativeArea: source.state,
        region: source.county,
        locality: source.city,
        subLocality: source.district ?? source.subdistrict,
        street: source.street,
        streetNumber: source.houseNumber,
        postalCode: source.postalCode
    };
    return {
        coordinates: { latitude: position.lat, longitude: position.lng },
        address,
        label: source.label || item.title || getAddressLabel(address)
    };
};

/** Reads the places out of a HERE geocoding response. */
export const getHerePlaces = (response: IHereGeocodeResponse): IMapPlace[] =>
    (response.items ?? []).map(getHerePlace).filter((place): place is IMapPlace => !!place);

/** Builds the HERE geocoder, backed by the Geocoding and Search API v7; answers the same lookup only once. */
/** Lookups run at once for a set of records, which a keyed service prices rather than paces. */
const PARALLEL_REQUESTS = 4;

export const createHereMapsGeocoder: IMapGeocoderFactory = ({ apiKey = '' }): IMapGeocoder => withGeocodingCache({
    maxConcurrentRequests: PARALLEL_REQUESTS,
    geocode: async (query, options) => {
        if (!query.trim()) {
            return [];
        }
        const response = await getJson<IHereGeocodeResponse>(
            buildUrl(GEOCODE_URL, {
                q: query,
                lang: options?.language,
                limit: options?.limit ?? DEFAULT_GEOCODING_LIMIT,
                apiKey
            }),
            { signal: options?.signal }
        );
        return getHerePlaces(response);
    },
    reverseGeocode: async (coordinates: IMapCoordinates, options) => {
        const response = await getJson<IHereGeocodeResponse>(
            buildUrl(REVERSE_GEOCODE_URL, {
                at: `${coordinates.latitude},${coordinates.longitude}`,
                lang: options?.language,
                limit: 1,
                apiKey
            }),
            { signal: options?.signal }
        );
        return getHerePlaces(response)[0] ?? null;
    }
});
