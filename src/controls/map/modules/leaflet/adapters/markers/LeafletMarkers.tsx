import { useMemo } from "react";
import { createPortal } from "react-dom";
import { Marker } from "react-leaflet";
import { divIcon } from "leaflet";
import type { IRecord } from "@talxis/client-libraries";
import { MapRecordContext, useMap, useMapRecords } from "../../../../context";
import { IMapUiMarkerComponents, MapUiMarker } from "../../../../ui";
import { MAP_UI_MARKER_HEIGHT, MAP_UI_MARKER_WIDTH } from "../../../../ui/marker/styles";
import { IMapPopupRendererComponents, MapPopup } from "../../../../adapters/popup";
import { ILeafletUiPopupComponents, LeafletUi } from "../../ui";

/** The popup a pin opens. */
export interface ILeafletMarkerPopupComponents extends IMapPopupRendererComponents {
    /** The whole content, composed from `MapPopup`'s parts; `card` and `header` go unused with it. */
    onRender?: () => JSX.Element | null;
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
    return <>{useMapRecords().map(record => <MapRecordContext.Provider key={record.getRecordId()} value={record}>
        <LeafletMarker record={record} {...props} />
    </MapRecordContext.Provider>)}</>;
};

const LeafletMarker = (props: ILeafletMarkersProps & { record: IRecord }) => {
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
    const marker = props.components?.marker ?? {};
    const popup = marker.popup ?? {};

    return <Marker position={[point.latitude, point.longitude]} icon={icon}>
        <LeafletUi.Popup components={popup.container}>
            {popup.onRender ? popup.onRender() : <MapPopup.Renderer components={{ card: popup.card, header: popup.header }} />}
        </LeafletUi.Popup>
        {createPortal(<MapUiMarker components={marker.pin} />, element)}
    </Marker>;
};
