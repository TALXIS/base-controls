import { useMemo } from 'react';
import { IMapLocation } from '../../providers/provider';
import { IMapModule, IMapViewContext } from '../interfaces';
import { createMapClusterIndex, IMapClusteringOptions, WORLD_BOUNDS } from './clustering';

/** Options for {@link createClusteringModule}. Every one has a default worth keeping. */
export type IMapClusteringModuleOptions = IMapClusteringOptions;

/**
 * Builds the clustering module: pins that overlap in the current view are drawn as one pin carrying the
 * number of records behind it, and the grouping is redone against the viewport on every pan and zoom. It
 * is what keeps a dataset of thousands readable, and what keeps the provider from ever being handed more
 * pins than the view holds.
 *
 * Clicking a grouped pin zooms to where the group comes apart; with the cards module on, it opens a card
 * listing the records instead. A pin on a drawn route is never grouped.
 *
 * Assign it to `modules.clustering`:
 *
 * @example
 * ```ts
 * modules={{ clustering: createClusteringModule() }}
 * modules={{ clustering: createClusteringModule({ radius: 60, maxZoom: 16 }) }}
 * ```
 */
export const createClusteringModule = (options: IMapClusteringModuleOptions = {}): IMapModule => {
    const { radius, maxZoom, maxLeaves } = options;

    return {
        useDrawnLocations: (locations: IMapLocation[], context: IMapViewContext): IMapLocation[] => {
            //built once per set of pins and queried per view, so panning a dataset of thousands costs a lookup
            //rather than a rebuild
            const index = useMemo(
                () => createMapClusterIndex(locations, { radius, maxZoom, maxLeaves }),
                [locations, radius, maxZoom, maxLeaves]
            );
            const bounds = context.visibleViewport.bounds;
            const zoom = context.visibleViewport.zoom;
            return useMemo(() => index.getLocations(bounds ?? WORLD_BOUNDS, zoom), [index, bounds, zoom]);
        }
    };
};
