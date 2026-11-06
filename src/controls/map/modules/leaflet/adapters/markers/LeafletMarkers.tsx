import { MapRecordContext, useMap, useMapRecords } from "../../../../context";
import { ILeafletUiMarkerComponents, LeafletUi } from "../../ui";

export interface ILeafletMarkersProps {
    /** Replacements for each pin's slots; a slot component reads its record with `useMapRecord()`. */
    components?: Partial<ILeafletUiMarkerComponents>;
}

/** Draws a pin for each record with a position, its id in the popup inside the library's map. */
export const LeafletMarkers = (props: ILeafletMarkersProps) => {
    const map = useMap();
    return <>{useMapRecords().map(record => {
        const point = map.getPoint(record)!;
        return <MapRecordContext.Provider key={record.getRecordId()} value={record}>
            <LeafletUi.Marker center={[point.latitude, point.longitude]} components={props.components}>
                {record.getRecordId()}
            </LeafletUi.Marker>
        </MapRecordContext.Provider>;
    })}</>;
};
