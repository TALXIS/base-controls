import { useEffect } from "react";
import { useMap as useLeafletInstance } from "react-leaflet";
import { useMapModule } from "../../../../context";
import type { ILeafletInternal } from "../../LeafletRuntime";
import { LeafletUi, ILeafletUiComponents, ILeafletUiMarkerComponents } from "../../ui";
import { LeafletMarkers } from "../markers";

//Czechia, shown until the map's viewport moves the view
const DEFAULT_CENTER = { latitude: 49.8175, longitude: 15.4730 };
const DEFAULT_ZOOM = 6;

/** Replacements for the Leaflet map's slots and its pins' slots. */
export interface ILeafletComponents {
    map?: Partial<ILeafletUiComponents>;
    /** A slot component reads the record of its pin with `useMapRecord()`. */
    marker?: Partial<ILeafletUiMarkerComponents>;
}

export interface ILeafletProps {
    components?: ILeafletComponents;
}

/** Draws the map with Leaflet, a pin for each record, and its view. */
export const Leaflet = (props: ILeafletProps) => {
    const leaflet = useMapModule('library') as ILeafletInternal;
    const { tileUrl, attribution } = leaflet.getTiles();

    return <LeafletUi tileUrl={tileUrl} attribution={attribution} defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} components={props.components?.map}>
        <LeafletInstance leaflet={leaflet} />
        <LeafletMarkers components={props.components?.marker} />
    </LeafletUi>;
};

//inside the Leaflet map, where react-leaflet hands out its instance
const LeafletInstance = (props: { leaflet: ILeafletInternal }) => {
    const instance = useLeafletInstance();
    useEffect(() => props.leaflet.setInstance(instance), [instance]);
    return null;
};
