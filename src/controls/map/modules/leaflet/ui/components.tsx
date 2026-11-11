import { MapContainer, MapContainerProps, TileLayer, TileLayerProps } from "react-leaflet";

/** The replaceable pieces of the Leaflet map. */
export interface ILeafletUiComponents {
    /** The react-leaflet map. */
    onRender: (props: MapContainerProps) => JSX.Element | null;
    /** The tiles under the pins. */
    onRenderTileLayer: (props: TileLayerProps) => JSX.Element | null;
}

/** The defaults for {@link ILeafletUiComponents}. */
export const LeafletUiComponents: ILeafletUiComponents = {
    onRender: props => <MapContainer {...props} />,
    onRenderTileLayer: props => <TileLayer {...props} />,
};
