import { createResultCache } from '../core/http';
import { IMapGeocoder, IMapPlace } from '../core/geocoding';
import { IMapCoordinates } from '../core/coordinates';

/**
 * Rounds coordinates to the precision a cache key needs, so two reads of the same pin share an entry -
 * precise to roughly a tenth of a metre.
 */
const getCoordinatesKey = (coordinates: IMapCoordinates): string =>
    `${coordinates.latitude.toFixed(6)},${coordinates.longitude.toFixed(6)}`;

/**
 * Wraps a geocoder so the same lookup is only ever made once. In flight calls are shared rather than
 * duplicated, which matters when a page of records all carry the same address - and a failed call is
 * forgotten, so a transient error does not become a permanent one.
 */
export const withGeocodingCache = (geocoder: IMapGeocoder, maxEntries = 500): IMapGeocoder => {
    const forward = createResultCache<Promise<IMapPlace[]>>(maxEntries);
    const reverse = createResultCache<Promise<IMapPlace | null>>(maxEntries);

    //everything the service says about itself passes through untouched; only the two lookups are wrapped
    return {
        ...geocoder,
        geocode: (query, options) => {
            const key = `${options?.language ?? ''}|${options?.limit ?? ''}|${query}`;
            const cached = forward.get(key);
            if (cached) {
                return cached;
            }
            const result = geocoder.geocode(query, options);
            forward.set(key, result);
            result.catch(() => forward.delete(key));
            return result;
        },
        reverseGeocode: (coordinates, options) => {
            const key = `${options?.language ?? ''}|${getCoordinatesKey(coordinates)}`;
            const cached = reverse.get(key);
            if (cached) {
                return cached;
            }
            const result = geocoder.reverseGeocode(coordinates, options);
            reverse.set(key, result);
            result.catch(() => reverse.delete(key));
            return result;
        }
    };
};
