import { Popup, PopupProps } from "react-leaflet";

/** The replaceable pieces of the popup. */
export interface ILeafletUiPopupComponents {
    /** The react-leaflet popup. */
    onRenderContainer: (props: PopupProps) => JSX.Element | null;
}

/** The defaults for {@link ILeafletUiPopupComponents}. */
export const LeafletUiPopupComponents: ILeafletUiPopupComponents = {
    onRenderContainer: props => <Popup {...props} />,
};
