import { AdvancedMarker, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useEventEmitter, useRerender } from "@core";
import { useMap, useMapModule, useMapRecord } from "../../../../context";
import { IMapUiMarkerComponents, MapUiMarker } from "../../../../ui";
import { MapMarkers } from "../../../../adapters/markers";
import type { IMapPopupComponents } from "../../../../adapters/popup";
import { MapPopupContent } from "../../../../adapters/popup/MapPopupContent";
import type { IGoogleMapsEvents, IGoogleMapsInternal } from "../../GoogleMapsRuntime";
import { GoogleMapsUi, IGoogleMapsUiPopupComponents } from "../../ui";

/** The popup a pin opens. */
export interface IGoogleMapsMarkerPopupComponents extends IMapPopupComponents {
    /** Google's info window around the content. */
    container?: Partial<IGoogleMapsUiPopupComponents>;
}

/** Replacements for a pin's and its popup's slots, by the part they belong to. */
export interface IGoogleMapsMarkerComponents {
    /** The Fluent pin, `MapUi.Marker`. */
    pin?: Partial<IMapUiMarkerComponents>;
    popup?: IGoogleMapsMarkerPopupComponents;
}

/** Replacements for a pin's slots and its popup's. */
export interface IGoogleMapsMarkersComponents {
    marker?: IGoogleMapsMarkerComponents;
}

export interface IGoogleMapsMarkersProps {
    components?: IGoogleMapsMarkersComponents;
}

/** Draws a pin for each record with a position, with its popup. */
export const GoogleMapsMarkers = (props: IGoogleMapsMarkersProps) => {
    return <MapMarkers>
        <GoogleMapsMarker components={props.components?.marker} />
    </MapMarkers>;
};

const GoogleMapsMarker = (props: { components?: IGoogleMapsMarkerComponents }) => {
    const record = useMapRecord();
    const point = useMap().getPoint(record)!;
    const googleMaps = useMapModule('library') as IGoogleMapsInternal;
    const [markerRef, marker] = useAdvancedMarkerRef();
    const { rerender } = useRerender();
    useEventEmitter<IGoogleMapsEvents>(googleMaps.events, 'onPopupChanged', rerender);
    const recordId = record.getRecordId();
    const popup = props.components?.popup;

    return <>
        <AdvancedMarker ref={markerRef} position={{ lat: point.latitude, lng: point.longitude }} onClick={() => googleMaps.openPopup(recordId)}>
            <MapUiMarker components={props.components?.pin} />
        </AdvancedMarker>
        {googleMaps.getOpenRecordId() === recordId && <GoogleMapsUi.Popup anchor={marker} onClose={() => googleMaps.closePopup()} components={popup?.container}>
            <MapPopupContent components={popup} />
        </GoogleMapsUi.Popup>}
    </>;
};
