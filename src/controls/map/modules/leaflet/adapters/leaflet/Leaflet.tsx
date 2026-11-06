import { useEffect } from "react";
import { useMap as useLeafletInstance } from "react-leaflet";
import { useMapModule } from "../../../../context";
import type { ILeafletInternal } from "../../LeafletRuntime";
import { LeafletUi, ILeafletUiComponents } from "../../ui";
import { ILeafletMarkersComponents, LeafletMarkers } from "../markers";

//Czechia, shown until the map's viewport moves the view
const DEFAULT_CENTER = { latitude: 49.8175, longitude: 15.4730 };
const DEFAULT_ZOOM = 6;

/** Replacements for the Leaflet map's slots and its pins' slots. */
export interface ILeafletComponents extends Partial<ILeafletMarkersComponents> {
    map?: Partial<ILeafletUiComponents>;
}

export interface ILeafletProps {
    components?: ILeafletComponents;
}

/** Draws the map with Leaflet, a pin for each record, and its view. */
export const Leaflet = (props: ILeafletProps) => {
    const leaflet = useMapModule('library') as ILeafletInternal;
    const { tileUrl, attribution } = leaflet.getTiles();
    const { map, ...markerComponents } = props.components ?? {};

    return <LeafletUi tileUrl={tileUrl} attribution={attribution} defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} components={map}>
        <LeafletInstance leaflet={leaflet} />
        <LeafletMarkers components={markerComponents} />
    </LeafletUi>;
};

//inside the Leaflet map, where react-leaflet hands out its instance
const LeafletInstance = (props: { leaflet: ILeafletInternal }) => {
    const instance = useLeafletInstance();
    useEffect(() => props.leaflet.setInstance(instance), [instance]);
    return null;
};
