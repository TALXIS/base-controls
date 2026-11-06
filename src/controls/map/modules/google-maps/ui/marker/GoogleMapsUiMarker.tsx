import { GoogleMapsUiMarkerComponents, IGoogleMapsUiMarkerComponents } from './components';

export interface IGoogleMapsUiMarkerProps {
    position: google.maps.LatLngLiteral;
    /** Replacements for its slots. */
    components?: Partial<IGoogleMapsUiMarkerComponents>;
}

/** One pin, as a Google Maps marker. */
export const GoogleMapsUiMarker = (props: IGoogleMapsUiMarkerProps) => {
    const components = { ...GoogleMapsUiMarkerComponents, ...props.components };
    return components.onRenderMarker({ position: props.position });
};
