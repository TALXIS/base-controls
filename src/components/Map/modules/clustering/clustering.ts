import Supercluster, { ClusterProperties } from 'supercluster';
import { IMapClusterInfo, IMapLocation } from '../../providers/provider';
import { IMapBounds } from '../../core/coordinates';

/** Pixels within which two pins overlap enough to be drawn as one. */
export const DEFAULT_CLUSTER_RADIUS = 40;

/** Zoom from which pins are always drawn separately, however close together they are. */
export const DEFAULT_CLUSTER_MAX_ZOOM = 20;

/** Member records a cluster lists, which is what its card can show without becoming useless. */
export const DEFAULT_CLUSTER_MAX_LEAVES = 50;

/** Box covering the whole world, used before the map has reported what it is showing. */
export const WORLD_BOUNDS: IMapBounds = { north: 85, south: -85, east: 180, west: -180 };

export interface IMapClusteringOptions {
    /** Pixels within which pins merge. Larger groups more aggressively. */
    radius?: number;
    /** Zoom from which pins never merge. */
    maxZoom?: number;
    /** Member records a cluster lists. The count is always exact, however many are listed. */
    maxLeaves?: number;
}

export interface IMapClusterIndex {
    /**
     * The pins to draw for one view of the map: a record on its own stays itself, records that overlap
     * become one pin carrying the group.
     */
    getLocations(bounds: IMapBounds, zoom: number): IMapLocation[];
}

interface IClusterPointProperties {
    /** Position of the location in the array the index was built from. */
    locationIndex: number;
}

/**
 * Builds a clustering index over a set of pins. Clustering is the control's job rather than a provider's,
 * so all four vendors group identically and a dataset of thousands of records costs the map only the pins
 * inside its current view. Built once per set of pins; querying it per viewport is cheap.
 *
 * A pin carrying a `routeId` is never merged - the routes module tags the pins of the lines it draws, and a
 * line ending at a group's centroid reads as detached from the stop it connects. Pins of a route whose line
 * is not drawn carry no tag and cluster like everything else, so a zoomed-out map does not pile up every
 * routed stop individually.
 */
export const createMapClusterIndex = (
    locations: IMapLocation[],
    options: IMapClusteringOptions = {}
): IMapClusterIndex => {
    const maxLeaves = options.maxLeaves ?? DEFAULT_CLUSTER_MAX_LEAVES;
    const isUnclustered = (location: IMapLocation): boolean => !!location.routeId;
    const routedLocations = locations.filter(isUnclustered);
    const clusterableLocations = locations.filter((location) => !isUnclustered(location));
    const index = new Supercluster<IClusterPointProperties>({
        radius: options.radius ?? DEFAULT_CLUSTER_RADIUS,
        maxZoom: options.maxZoom ?? DEFAULT_CLUSTER_MAX_ZOOM,
        minPoints: 2
    });

    index.load(clusterableLocations.map((location, locationIndex) => ({
        type: 'Feature' as const,
        properties: { locationIndex },
        geometry: { type: 'Point' as const, coordinates: [location.longitude, location.latitude] }
    })));

    const getClusterInfo = (clusterId: number, count: number): IMapClusterInfo => ({
        count,
        recordIds: index.getLeaves(clusterId, maxLeaves)
            .map((leaf) => clusterableLocations[leaf.properties.locationIndex]?.recordId)
            .filter((recordId): recordId is string => !!recordId),
        expansionZoom: index.getClusterExpansionZoom(clusterId)
    });

    const isWithin = (location: IMapLocation, bounds: IMapBounds): boolean =>
        location.latitude <= bounds.north && location.latitude >= bounds.south
        && location.longitude <= bounds.east && location.longitude >= bounds.west;

    return {
        getLocations: (bounds, zoom) => {
            //supercluster indexes by integer zoom, and a map may sit between two levels
            const clusters = index.getClusters(
                [bounds.west, bounds.south, bounds.east, bounds.north],
                Math.round(zoom)
            );
            const drawn = clusters.map((feature) => {
                const [longitude, latitude] = feature.geometry.coordinates;
                const properties = feature.properties as ClusterProperties & IClusterPointProperties;
                if (!properties.cluster) {
                    return clusterableLocations[properties.locationIndex];
                }
                return {
                    id: `cluster-${properties.cluster_id}`,
                    latitude,
                    longitude,
                    cluster: getClusterInfo(properties.cluster_id, properties.point_count)
                };
            }).filter((location): location is IMapLocation => !!location);
            //pins of drawn routes pass the index by, but stay limited to the view like everything else
            return [...drawn, ...routedLocations.filter((location) => isWithin(location, bounds))];
        }
    };
};
