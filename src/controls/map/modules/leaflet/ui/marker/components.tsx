import { CircleMarker, CircleMarkerProps, Popup, PopupProps } from "react-leaflet";

/** The replaceable pieces of a pin. */
export interface ILeafletUiMarkerComponents {
    /** The circle. */
    onRenderMarker: (props: CircleMarkerProps) => JSX.Element | null;
    /** The popup the circle opens. */
    onRenderPopup: (props: PopupProps) => JSX.Element | null;
}

/** The defaults for {@link ILeafletUiMarkerComponents}. */
export const LeafletUiMarkerComponents: ILeafletUiMarkerComponents = {
    onRenderMarker: props => <CircleMarker {...props} />,
    onRenderPopup: props => <Popup {...props} />,
};
