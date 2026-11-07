import { MapUiContainer } from './container';
import { MapUiMarker } from './marker';
import { MapUiMarkerPin } from './marker-pin';

export * from './container';
export * from './marker';
export * from './marker-pin';

/** The map's own UI, with no runtime behind it. */
export interface IMapUi {
    Container: typeof MapUiContainer;
    /** The Fluent pin Leaflet draws. */
    Marker: typeof MapUiMarker;
    /** The teardrop of the Fluent pin, in a colour. */
    MarkerPin: typeof MapUiMarkerPin;
}

export const MapUi: IMapUi = {
    Container: MapUiContainer,
    Marker: MapUiMarker,
    MarkerPin: MapUiMarkerPin,
};
