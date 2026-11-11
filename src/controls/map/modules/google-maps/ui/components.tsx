import { Map as GoogleMapsMap, MapProps } from "@vis.gl/react-google-maps";

/** The replaceable pieces of the Google map. */
export interface IGoogleMapsUiComponents {
    /** The vis.gl map. */
    onRender: (props: MapProps) => JSX.Element | null;
}

/** The defaults for {@link IGoogleMapsUiComponents}. */
export const GoogleMapsUiComponents: IGoogleMapsUiComponents = {
    onRender: props => <GoogleMapsMap {...props} />,
};
