import { ReactNode, useEffect } from "react";
import { useMap as useLeafletInstance } from "react-leaflet";
import { useMapModule } from "../../../../context";
import type { ILeafletInternal } from "../../LeafletRuntime";
import { LeafletUi, ILeafletUiComponents } from "../../ui";

//Czechia, shown until the map's viewport moves the view
const DEFAULT_CENTER = { latitude: 49.8175, longitude: 15.4730 };
const DEFAULT_ZOOM = 6;

export interface ILeafletProps {
    /** Replacements for the Leaflet map's slots. */
    components?: Partial<ILeafletUiComponents>;
    /** Drawn inside the Leaflet map, such as `<LeafletMarkers />`. */
    children?: ReactNode;
}

/** Draws the map with Leaflet and its view. */
export const Leaflet = (props: ILeafletProps) => {
    const leaflet = useMapModule('library') as ILeafletInternal;
    const { tileUrl, attribution } = leaflet.getParameters();

    return <LeafletUi tileUrl={tileUrl} attribution={attribution} defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} components={props.components}>
        <LeafletInstance leaflet={leaflet} />
        {props.children}
    </LeafletUi>;
};

//inside the Leaflet map, where react-leaflet hands out its instance
const LeafletInstance = (props: { leaflet: ILeafletInternal }) => {
    const instance = useLeafletInstance();
    useEffect(() => props.leaflet.setInstance(instance), [instance]);
    return null;
};
