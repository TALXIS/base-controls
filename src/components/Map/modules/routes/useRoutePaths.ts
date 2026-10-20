import { useEffect, useRef, useState } from 'react';
import { getRouteThroughStops, IMapDirections } from '../../core/directions';
import { IMapRoute } from '../../providers/provider';
import { IMapCoordinates } from '../../core/coordinates';

/** Routes resolved at once, so a view of many lines does not fire every request at the same instant. */
const CONCURRENCY = 2;

export interface IUseRoutePaths {
    routes: IMapRoute[];
    /** Whether the lines should follow roads rather than run straight between the pins. */
    enabled: boolean;
    /** Directions service, from whichever configured vendor has one. */
    directions?: IMapDirections;
    language?: string;
}

export interface IRoutePathsState {
    /** The routes, with `path` filled in for every one the service could resolve. */
    routes: IMapRoute[];
    /** Whether lines are still being resolved. */
    isResolving: boolean;
}

/** Identifies a route by what it is made of, so a line is only re-resolved when its stops actually move. */
const getRouteKey = (route: IMapRoute): string =>
    `${route.id}|${route.locations.map((location) => `${location.latitude},${location.longitude}`).join(';')}`;

/**
 * Snaps the lines between pins to the road network.
 *
 * Optional in every sense: a control that does not ask for it draws straight lines, a vendor with no
 * directions service leaves them straight, and a route the service cannot resolve stays straight while the
 * others are snapped.
 */
export const useRoutePaths = (props: IUseRoutePaths): IRoutePathsState => {
    const { routes, enabled, directions, language } = props;
    const [paths, setPaths] = useState<{ [routeKey: string]: IMapCoordinates[] }>({});
    const [isResolving, setIsResolving] = useState(false);
    //routes already asked about, so a line the service cannot snap is not requested on every render
    const attemptedRef = useRef(new Set<string>());
    const runIdRef = useRef(0);

    const isEnabled = enabled && !!directions;
    const routeKeys = routes.map(getRouteKey);
    const routeKey = routeKeys.join('|');

    useEffect(() => {
        const runId = ++runIdRef.current;
        if (!isEnabled) {
            attemptedRef.current = new Set();
            setPaths({});
            setIsResolving(false);
            return;
        }
        //a key changes when a route's stops move, so entries for lines that are gone are dropped here
        const currentKeys = new Set(routes.map(getRouteKey));
        attemptedRef.current.forEach((key) => {
            if (!currentKeys.has(key)) {
                attemptedRef.current.delete(key);
            }
        });
        setPaths((current) => {
            const kept = Object.keys(current).filter((key) => currentKeys.has(key));
            return kept.length === Object.keys(current).length
                ? current
                : Object.fromEntries(kept.map((key) => [key, current[key]]));
        });
        const pending = routes.filter((route) => !attemptedRef.current.has(getRouteKey(route)));
        if (!pending.length) {
            //a superseded run never cleared the flag, so a run with nothing to do still resets it
            setIsResolving(false);
            return;
        }
        const controller = new AbortController();
        setIsResolving(true);

        const resolve = async (route: IMapRoute) => {
            const key = getRouteKey(route);
            attemptedRef.current.add(key);
            try {
                const path = await getRouteThroughStops(
                    directions as IMapDirections,
                    route.locations.map(({ latitude, longitude }) => ({ latitude, longitude })),
                    { language, signal: controller.signal }
                );
                if (path && runIdRef.current === runId) {
                    setPaths((current) => ({ ...current, [key]: path.coordinates }));
                }
            } catch (error) {
                console.warn(`Map: could not snap the route "${route.id}" to roads, drawing it straight:`, error);
            }
        };

        void (async () => {
            for (let index = 0; index < pending.length; index += CONCURRENCY) {
                if (runIdRef.current !== runId) {
                    return;
                }
                await Promise.all(pending.slice(index, index + CONCURRENCY).map(resolve));
            }
            if (runIdRef.current === runId) {
                setIsResolving(false);
            }
        })();

        return () => {
            controller.abort();
        };
        //routeKey stands in for routes, which is rebuilt on every load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeKey, isEnabled, directions, language]);

    return {
        routes: isEnabled
            ? routes.map((route) => {
                const path = paths[getRouteKey(route)];
                return path ? { ...route, path } : route;
            })
            : routes,
        isResolving
    };
};
