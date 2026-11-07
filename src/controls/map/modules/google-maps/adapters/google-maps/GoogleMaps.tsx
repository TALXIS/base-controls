import { useEffect } from "react";
import { APIProvider, useMap as useGoogleMapsInstance } from "@vis.gl/react-google-maps";
import { useMapModule } from "../../../../context";
import type { IGoogleMapsInternal } from "../../GoogleMapsRuntime";
import { GoogleMapsUi, IGoogleMapsUiComponents } from "../../ui";
import { GoogleMapsMarkers, IGoogleMapsMarkersComponents } from "../markers";

//Czechia, shown until the map's viewport moves the view
const DEFAULT_CENTER = { latitude: 49.8175, longitude: 15.4730 };
const DEFAULT_ZOOM = 6;
//Google's shared Map ID for development and demos
const DEMO_MAP_ID = 'DEMO_MAP_ID';

/** Replacements for the Google map's slots and its pins' slots. */
export interface IGoogleMapsComponents extends IGoogleMapsMarkersComponents {
    map?: Partial<IGoogleMapsUiComponents>;
}

/** Draws the map with Google Maps, a pin for each record, and its view. */
export const GoogleMaps = () => {
    const googleMaps = useMapModule('library') as IGoogleMapsInternal;
    const { map, ...markerComponents } = googleMaps.getComponents();
    const { apiKey, mapId } = googleMaps.getParameters();

    return <APIProvider apiKey={apiKey}>
        <GoogleMapsUi defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} mapId={mapId ?? DEMO_MAP_ID} components={map}>
            <GoogleMapsInstance googleMaps={googleMaps} />
            <GoogleMapsMarkers components={markerComponents} />
        </GoogleMapsUi>
    </APIProvider>;
};

//inside the Google map, where vis.gl hands out its instance
const GoogleMapsInstance = (props: { googleMaps: IGoogleMapsInternal }) => {
    const instance = useGoogleMapsInstance();
    useEffect(() => instance ? props.googleMaps.setInstance(instance) : undefined, [instance]);
    //a click on the map closes the open popup, as on Leaflet
    useEffect(() => {
        const listener = instance?.addListener('click', () => props.googleMaps.closePopup());
        return () => listener?.remove();
    }, [instance]);
    return null;
};
