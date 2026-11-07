import { InfoWindow, InfoWindowProps } from "@vis.gl/react-google-maps";

/** The replaceable pieces of the popup. */
export interface IGoogleMapsUiPopupComponents {
    /** The vis.gl info window. */
    onRenderContainer: (props: InfoWindowProps & { children?: React.ReactNode }) => JSX.Element | null;
}

/** The defaults for {@link IGoogleMapsUiPopupComponents}. */
export const GoogleMapsUiPopupComponents: IGoogleMapsUiPopupComponents = {
    onRenderContainer: props => <InfoWindow {...props} />,
};
