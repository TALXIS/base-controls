import { MapUiContainer } from './container';
import { MapUiMarker } from './marker';

export * from './container';
export * from './marker';

/** The map's own UI, with no runtime behind it. */
export interface IMapUi {
    Container: typeof MapUiContainer;
    /** The Fluent pin Leaflet draws. */
    Marker: typeof MapUiMarker;
}

export const MapUi: IMapUi = {
    Container: MapUiContainer,
    Marker: MapUiMarker,
};
