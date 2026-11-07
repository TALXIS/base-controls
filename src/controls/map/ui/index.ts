import { MapUiContainer } from './container';
import { MapUiMarker } from './marker';
import { MapUiMarkerPin } from './marker-pin';
import { MapUiSkeleton } from './skeleton';

export * from './container';
export * from './marker';
export * from './marker-pin';
export * from './skeleton';

/** The map's own UI, with no runtime behind it. */
export interface IMapUi {
    Container: typeof MapUiContainer;
    /** The Fluent pin both map libraries draw. */
    Marker: typeof MapUiMarker;
    /** The teardrop of the Fluent pin, in a colour. */
    MarkerPin: typeof MapUiMarkerPin;
    /** Stands in for a `DatasetControl` with a map body while it loads. */
    Skeleton: typeof MapUiSkeleton;
}

export const MapUi: IMapUi = {
    Container: MapUiContainer,
    Marker: MapUiMarker,
    MarkerPin: MapUiMarkerPin,
    Skeleton: MapUiSkeleton,
};
