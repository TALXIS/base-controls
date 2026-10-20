import { useMemo } from 'react';
import { IMapRoute } from '../../providers/provider';
import { IMapModule, IMapModuleState, IMapPins, IMapPinsContext } from '../interfaces';
import { getMapRoutes, IMapRouteAttributes } from './routes';
import { useRoutePaths } from './useRoutePaths';

/** Options for {@link createRoutesModule}. */
export interface IMapRoutesModuleOptions {
    /** Which attributes group, order and colour the pins. Only `route` is required. */
    attributes: IMapRouteAttributes;
    /**
     * Whether a line follows the road network instead of running straight between its pins, through
     * whichever configured provider has a directions service. Off by default - it costs a request per route.
     */
    snapToRoads?: boolean;
    /**
     * Decides, per route, whether its line is drawn at all. Absent draws every route. A route this hides
     * keeps its pins, which then cluster like any other, and never costs a directions request.
     */
    isRouteVisible?: (route: IMapRoute) => boolean;
}

/**
 * Builds the routes module: pins whose records share a value are connected into a line, ordered by a
 * sequence attribute and coloured by another, and optionally snapped to the roads.
 *
 * Assign it to `modules.routes`:
 *
 * @example
 * ```ts
 * modules={{
 *     routes: createRoutesModule({
 *         attributes: { route: 'talxis_routeid', sequence: 'talxis_stopnumber', color: 'talxis_routeid.talxis_color' },
 *         snapToRoads: true
 *     })
 * }}
 * ```
 */
export const createRoutesModule = (options: IMapRoutesModuleOptions): IMapModule => {
    const { attributes, snapToRoads = false, isRouteVisible } = options;

    return {
        useModuleState: (): IMapModuleState => ({
            attributePaths: [attributes.route, attributes.sequence, attributes.color].filter((path): path is string => !!path)
        }),

        usePins: (pins: IMapPins, context: IMapPinsContext): IMapPins => {
            const { records, directions, language } = context;
            const { route, sequence, color } = attributes;
            const routed = useMemo(
                () => getMapRoutes(records, pins.locations, { route, sequence, color }, isRouteVisible),
                [records, pins.locations, route, sequence, color, isRouteVisible]
            );
            //filtered before snapping, so a hidden route never costs a directions request
            const paths = useRoutePaths({ routes: routed.routes, enabled: snapToRoads, directions, language });

            return useMemo(() => ({
                ...pins,
                locations: routed.locations,
                routes: paths.routes,
                isResolving: pins.isResolving || paths.isResolving
            }), [pins, routed.locations, paths.routes, paths.isResolving]);
        }
    };
};
