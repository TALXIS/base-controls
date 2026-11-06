import { Popup, PopupProps } from "react-leaflet";
import type { IMapUiMarkerComponents } from "../../../../ui";

/** The replaceable pieces of a pin; a slot component reads its record with `useMapRecord()`. */
export interface ILeafletMarkersComponents {
    /** The popup the pin opens on click. */
    onRenderPopup: (props: PopupProps) => JSX.Element | null;
    /** The slots of the pin, `MapUi.Marker`. */
    marker?: Partial<IMapUiMarkerComponents>;
}

/** The defaults for {@link ILeafletMarkersComponents}. */
export const LeafletMarkersComponents: ILeafletMarkersComponents = {
    onRenderPopup: props => <Popup {...props} />,
};
