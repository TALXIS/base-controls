import { useRef } from 'react';
import deepEqual from 'fast-deep-equal/es6';
import { IMapDirections } from '../core/directions';
import { IMapGeocoder } from '../core/geocoding';
import { IMapProvider, IMapProviderOption } from './provider';

export interface IMapProviderSource extends Omit<IMapProviderOption, 'provider' | 'geocoder' | 'directions'> {
    /** Identifies the configuration behind `id`, defaulting to `id`. A changed key rebuilds everything below. */
    cacheKey?: string;
    createProvider: () => IMapProvider;
    /** Builds the geocoding service this provider offers. Omit for one that offers none. */
    createGeocoder?: () => IMapGeocoder;
    /** Builds the directions service this provider offers. Omit for one that offers none. */
    createDirections?: () => IMapDirections;
}

interface ICachedProvider {
    provider: IMapProvider;
    geocoder?: IMapGeocoder;
    directions?: IMapDirections;
}

/**
 * Keeps one provider, geocoder and directions service per cache key, so a host can rebuild its provider list
 * every render, or a maker edit one provider's api key, without remounting the map or resetting the geocoding
 * cache. Call once per render with the full list - it is rebuilt, not appended to, so a dropped key does not
 * stay alive.
 */
export const useMapProviderCache = () => {
    const cacheRef = useRef<{ [cacheKey: string]: ICachedProvider }>({});
    const optionsRef = useRef<IMapProviderOption[]>([]);

    return (sources: IMapProviderSource[]): IMapProviderOption[] => {
        const cache: { [cacheKey: string]: ICachedProvider } = {};
        const options = sources.map(({ id, label, cacheKey, createProvider, createGeocoder, createDirections }) => {
            const key = cacheKey ?? id;
            const cached = cacheRef.current[key] ?? {
                provider: createProvider(),
                geocoder: createGeocoder?.(),
                directions: createDirections?.()
            };
            cache[key] = cached;
            return { id, label, ...cached };
        });
        cacheRef.current = cache;
        if (!deepEqual(optionsRef.current, options)) {
            optionsRef.current = options;
        }
        return optionsRef.current;
    };
};
