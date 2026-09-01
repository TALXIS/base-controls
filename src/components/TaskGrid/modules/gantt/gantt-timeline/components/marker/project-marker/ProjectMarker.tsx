import { IMarkerProps, Marker } from '../Marker';

/**
 * A project boundary marker. The colour comes from the marker itself, so the same component draws both
 * ends — passing the type through rather than fixing it is what keeps them apart.
 */
export const ProjectMarker = (props: IMarkerProps) => {
    return <Marker {...props} />;
};
