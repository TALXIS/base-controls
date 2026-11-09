import { useCallback } from 'react';
import { IMapFallbackLocationResolver, IMapResolvedLocation } from '../../core/fallbackLocation';

/** How long the browser is given to answer before the fallback resolver is used instead. */
const GEOLOCATION_TIMEOUT_MS = 4000;

/** Asks the browser where the user is. */
const getBrowserLocation = (signal?: AbortSignal): Promise<IMapResolvedLocation | null> =>
    new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            resolve(null);
            return;
        }
        const onAbort = () => resolve(null);
        signal?.addEventListener('abort', onAbort, { once: true });
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                isPrecise: true
            }),
            //a decline is an answer, not a failure - the caller falls back to whatever else it has
            () => resolve(null),
            { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_TIMEOUT_MS }
        );
    });

export interface IUseUserLocation {
    /** Resolver used when the browser has no position, typically the opt-in IP lookup. */
    onResolveFallbackLocation?: IMapFallbackLocationResolver;
}

/**
 * Resolves where the user is, for prefilling a pin when the dataset has none.
 *
 * The browser is asked first, since it is the only source precise enough to drop a pin on. A user who
 * declines falls through to the fallback resolver the host passed, which is approximate by design.
 */
export const useUserLocation = (props: IUseUserLocation) => {
    const onResolveFallbackLocation = props.onResolveFallbackLocation;

    return useCallback(async (signal?: AbortSignal): Promise<IMapResolvedLocation | null> => {
        const browserLocation = await getBrowserLocation(signal);
        if (browserLocation) {
            return browserLocation;
        }
        if (!onResolveFallbackLocation || signal?.aborted) {
            return null;
        }
        try {
            return await onResolveFallbackLocation(signal ?? new AbortController().signal);
        } catch (error) {
            console.warn('Map: could not resolve the user location:', error);
            return null;
        }
    }, [onResolveFallbackLocation]);
};
