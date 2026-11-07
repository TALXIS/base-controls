import { useMemo } from "react";
import { createPortal } from "react-dom";
import { Marker } from "react-leaflet";
import { divIcon } from "leaflet";
import { useMap, useMapRecord } from "../../../../context";
import { IMapUiMarkerComponents, MapUiMarker } from "../../../../ui";
import { MAP_UI_MARKER_HEIGHT, MAP_UI_MARKER_WIDTH } from "../../../../ui/marker/styles";
import { MapMarkers } from "../../../../adapters/markers";
import type { IMapPopupComponents } from "../../../../adapters/popup";
import { MapPopupContent } from "../../../../adapters/popup/MapPopupContent";
import { ILeafletUiPopupComponents, LeafletUi } from "../../ui";

/** The popup a pin opens. */
export interface ILeafletMarkerPopupComponents extends IMapPopupComponents {
    /** Leaflet's popup around the content. */
    container?: Partial<ILeafletUiPopupComponents>;
}

/** Replacements for a pin's and its popup's slots, by the part they belong to. */
export interface ILeafletMarkerComponents {
    /** The Fluent pin, `MapUi.Marker`. */
    pin?: Partial<IMapUiMarkerComponents>;
    popup?: ILeafletMarkerPopupComponents;
}

/** Replacements for a pin's slots and its popup's. */
export interface ILeafletMarkersComponents {
    marker?: ILeafletMarkerComponents;
}

export interface ILeafletMarkersProps {
    components?: ILeafletMarkersComponents;
}

/** Draws a pin for each record with a position, with its popup. */
export const LeafletMarkers = (props: ILeafletMarkersProps) => {
    return <MapMarkers>
        <LeafletMarker components={props.components?.marker} />
    </MapMarkers>;
};

const LeafletMarker = (props: { components?: ILeafletMarkerComponents }) => {
    const point = useMap().getPoint(useMapRecord())!;
    const element = useMemo(() => document.createElement('div'), []);
    //an empty className drops the white square Leaflet draws behind a div icon
    const icon = useMemo(() => divIcon({
        html: element,
        className: '',
        iconSize: [MAP_UI_MARKER_WIDTH, MAP_UI_MARKER_HEIGHT],
        iconAnchor: [MAP_UI_MARKER_WIDTH / 2, MAP_UI_MARKER_HEIGHT],
        popupAnchor: [0, -MAP_UI_MARKER_HEIGHT],
    }), [element]);
    const popup = props.components?.popup;

    return <Marker position={[point.latitude, point.longitude]} icon={icon}>
        <LeafletUi.Popup components={popup?.container}>
            <MapPopupContent components={popup} />
        </LeafletUi.Popup>
        {createPortal(<MapUiMarker components={props.components?.pin} />, element)}
    </Marker>;
};
