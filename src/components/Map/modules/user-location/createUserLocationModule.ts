import { IMapFallbackLocationResolver } from '../../core/fallbackLocation';
import { IMapModule, IMapModuleState } from '../interfaces';
import { useUserLocation } from './useUserLocation';

/** Options for {@link createUserLocationModule}. */
export interface IMapUserLocationModuleOptions {
    /**
     * Whether the browser is asked where the user is. On by default, since it is the only source precise
     * enough to drop a pin on - but it prompts for permission, which is why the whole module is opt in.
     */
    askBrowser?: boolean;
    /**
     * Resolves an approximate location when the browser has none, or the user declined. Pass
     * `resolveLocationFromIpAddress` to opt into the third party lookup; unset means the map stays on its
     * default centre.
     */
    resolveFallback?: IMapFallbackLocationResolver;
}

/**
 * Builds the user location module: while the dataset has no pins, the map centres on the user instead of
 * on its default centre. The browser is asked first and the map zooms in close when it answers; a fallback
 * resolver is approximate by design, so the map stays zoomed out for one.
 *
 * Nothing is asked until the dataset has actually answered with nothing to draw, so a slow dataset never
 * shows a permission prompt over pins that were about to arrive.
 *
 * Assign it to `modules.userLocation`:
 *
 * @example
 * ```ts
 * modules={{ userLocation: createUserLocationModule() }}
 * modules={{ userLocation: createUserLocationModule({ resolveFallback: resolveLocationFromIpAddress }) }}
 * ```
 */
export const createUserLocationModule = (options: IMapUserLocationModuleOptions = {}): IMapModule => {
    const { askBrowser = true, resolveFallback } = options;

    return {
        useModuleState: (): IMapModuleState => {
            const resolveUserLocation = useUserLocation({ onResolveFallbackLocation: resolveFallback });
            return { resolveFallbackLocation: askBrowser ? resolveUserLocation : resolveFallback };
        }
    };
};
