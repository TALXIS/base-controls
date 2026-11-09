import { IMapFallbackLocationResolver } from '../../core/fallbackLocation';

const GEOJS_ENDPOINT = 'https://get.geojs.io/v1/ip/geo.json';

/**
 * Guesses the user location from their IP address using the public geojs.io service. Opt in only - the
 * control never calls it on its own, so a host under a CSP or a privacy review makes no surprise requests.
 * Pass it as the user location module's `resolveFallback`.
 */
export const resolveLocationFromIpAddress: IMapFallbackLocationResolver = async (signal) => {
    try {
        const response = await fetch(GEOJS_ENDPOINT, { signal });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        const latitude = parseFloat(data.latitude);
        const longitude = parseFloat(data.longitude);
        if (isNaN(latitude) || isNaN(longitude)) {
            return null;
        }
        return { latitude, longitude };
    } catch {
        return null;
    }
};
