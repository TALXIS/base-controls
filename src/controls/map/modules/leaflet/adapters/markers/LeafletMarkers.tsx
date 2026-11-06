import { useMemo } from "react";
import { createPortal } from "react-dom";
import { Marker } from "react-leaflet";
import { divIcon } from "leaflet";
import type { IRecord } from "@talxis/client-libraries";
import { MapRecordContext, useMap, useMapRecords } from "../../../../context";
import { MapUiMarker } from "../../../../ui";
import { MAP_UI_MARKER_HEIGHT, MAP_UI_MARKER_WIDTH } from "../../../../ui/marker/styles";
import { ILeafletMarkersComponents, LeafletMarkersComponents } from "./components";

export interface ILeafletMarkersProps {
    /** Replacements for each pin's slots. */
    components?: Partial<ILeafletMarkersComponents>;
}

/** Draws a pin for each record with a position, its id in the popup. */
export const LeafletMarkers = (props: ILeafletMarkersProps) => {
    const components = { ...LeafletMarkersComponents, ...props.components };
    return <>{useMapRecords().map(record => <MapRecordContext.Provider key={record.getRecordId()} value={record}>
        <LeafletMarker record={record} components={components} />
    </MapRecordContext.Provider>)}</>;
};

const LeafletMarker = (props: { record: IRecord; components: ILeafletMarkersComponents }) => {
    const point = useMap().getPoint(props.record)!;
    const element = useMemo(() => document.createElement('div'), []);
    //an empty className drops the white square Leaflet draws behind a div icon
    const icon = useMemo(() => divIcon({
        html: element,
        className: '',
        iconSize: [MAP_UI_MARKER_WIDTH, MAP_UI_MARKER_HEIGHT],
        iconAnchor: [MAP_UI_MARKER_WIDTH / 2, MAP_UI_MARKER_HEIGHT],
        popupAnchor: [0, -MAP_UI_MARKER_HEIGHT],
    }), [element]);

    return <Marker position={[point.latitude, point.longitude]} icon={icon}>
        {props.components.onRenderPopup({ children: props.record.getRecordId() })}
        {createPortal(<MapUiMarker components={props.components.marker} />, element)}
    </Marker>;
};
