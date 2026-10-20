/** A point on the map. */
export interface IMapCoordinates {
    latitude: number;
    longitude: number;
}

/** A box on the map, as the latitudes and longitudes of its edges. */
export interface IMapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}
