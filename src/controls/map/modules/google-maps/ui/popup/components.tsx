import { InfoWindow, InfoWindowProps } from "@vis.gl/react-google-maps";

/** The replaceable pieces of the popup. */
export interface IGoogleMapsUiPopupComponents {
    /** The vis.gl info window. */
    onRender: (props: InfoWindowProps & { children?: React.ReactNode }) => JSX.Element | null;
}

/** The defaults for {@link IGoogleMapsUiPopupComponents}. */
export const GoogleMapsUiPopupComponents: IGoogleMapsUiPopupComponents = {
    onRender: props => <InfoWindow {...props} />,
};
