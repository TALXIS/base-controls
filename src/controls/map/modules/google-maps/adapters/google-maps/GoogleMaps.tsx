import { useEffect } from "react";
import { APIProvider, useMap as useGoogleMapsInstance } from "@vis.gl/react-google-maps";
import { useMapModule } from "../../../../context";
import type { IGoogleMapsInternal } from "../../GoogleMapsRuntime";
import { GoogleMapsUi, IGoogleMapsUiComponents, IGoogleMapsUiMarkerComponents } from "../../ui";
import { GoogleMapsMarkers } from "../markers";

//Czechia, shown until the map's viewport moves the view
const DEFAULT_CENTER = { latitude: 49.8175, longitude: 15.4730 };
const DEFAULT_ZOOM = 6;

/** Replacements for the Google map's slots and its pins' slots. */
export interface IGoogleMapsComponents {
    map?: Partial<IGoogleMapsUiComponents>;
    /** A slot component reads the record of its pin with `useMapRecord()`. */
    marker?: Partial<IGoogleMapsUiMarkerComponents>;
}

/** Draws the map with Google Maps, a pin for each record, and its view. */
export const GoogleMaps = () => {
    const googleMaps = useMapModule('library') as IGoogleMapsInternal;
    const components = googleMaps.getComponents();

    return <APIProvider apiKey={googleMaps.getParameters().apiKey}>
        <GoogleMapsUi defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} components={components.map}>
            <GoogleMapsInstance googleMaps={googleMaps} />
            <GoogleMapsMarkers components={components.marker} />
        </GoogleMapsUi>
    </APIProvider>;
};

//inside the Google map, where vis.gl hands out its instance
const GoogleMapsInstance = (props: { googleMaps: IGoogleMapsInternal }) => {
    const instance = useGoogleMapsInstance();
    useEffect(() => instance ? props.googleMaps.setInstance(instance) : undefined, [instance]);
    return null;
};
