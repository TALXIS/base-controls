import { ReactNode } from "react";
import { MapRecordContext, useMapRecords } from "../../context";

export interface IMapMarkersProps {
    /** One pin, drawn once per record; it reads its record with `useMapRecord()`. */
    children: ReactNode;
}

/** Draws its children once for each record with a position, inside that record's context. */
export const MapMarkers = (props: IMapMarkersProps) => {
    return <>{useMapRecords().map(record => <MapRecordContext.Provider key={record.getRecordId()} value={record}>
        {props.children}
    </MapRecordContext.Provider>)}</>;
};
