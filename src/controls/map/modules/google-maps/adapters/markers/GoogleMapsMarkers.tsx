import { MapRecordContext, useMap, useMapRecords } from "../../../../context";
import { GoogleMapsUi, IGoogleMapsUiMarkerComponents } from "../../ui";

export interface IGoogleMapsMarkersProps {
    /** Replacements for each pin's slots; a slot component reads its record with `useMapRecord()`. */
    components?: Partial<IGoogleMapsUiMarkerComponents>;
}

/** Draws a pin for each record with a position inside the library's map. */
export const GoogleMapsMarkers = (props: IGoogleMapsMarkersProps) => {
    const map = useMap();
    return <>{useMapRecords().map(record => {
        const point = map.getPoint(record)!;
        return <MapRecordContext.Provider key={record.getRecordId()} value={record}>
            <GoogleMapsUi.Marker position={{ lat: point.latitude, lng: point.longitude }} components={props.components} />
        </MapRecordContext.Provider>;
    })}</>;
};
