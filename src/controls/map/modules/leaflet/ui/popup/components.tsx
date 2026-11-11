import { Popup, PopupProps } from "react-leaflet";

/** The replaceable pieces of the popup. */
export interface ILeafletUiPopupComponents {
    /** The react-leaflet popup. */
    onRender: (props: PopupProps) => JSX.Element | null;
}

/** The defaults for {@link ILeafletUiPopupComponents}. */
export const LeafletUiPopupComponents: ILeafletUiPopupComponents = {
    onRender: props => <Popup {...props} />,
};
