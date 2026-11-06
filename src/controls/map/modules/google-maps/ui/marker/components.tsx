import { Marker, MarkerProps } from "@vis.gl/react-google-maps";

/** The replaceable pieces of a pin. */
export interface IGoogleMapsUiMarkerComponents {
    /** The vis.gl marker. */
    onRenderMarker: (props: MarkerProps) => JSX.Element | null;
}

/** The defaults for {@link IGoogleMapsUiMarkerComponents}. */
export const GoogleMapsUiMarkerComponents: IGoogleMapsUiMarkerComponents = {
    onRenderMarker: props => <Marker {...props} />,
};
