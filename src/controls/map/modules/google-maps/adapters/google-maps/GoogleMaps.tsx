import { ReactNode, useEffect } from "react";
import { APIProvider, useMap as useGoogleMapsInstance } from "@vis.gl/react-google-maps";
import { useMapModule } from "../../../../context";
import type { IGoogleMapsInternal } from "../../GoogleMapsRuntime";
import { GoogleMapsUi, IGoogleMapsUiComponents } from "../../ui";

//Czechia, shown until the map's viewport moves the view
const DEFAULT_CENTER = { latitude: 49.8175, longitude: 15.4730 };
const DEFAULT_ZOOM = 6;

export interface IGoogleMapsProps {
    /** Replacements for the Google map's slots. */
    components?: Partial<IGoogleMapsUiComponents>;
    /** Drawn inside the Google map, such as `<GoogleMapsMarkers />`. */
    children?: ReactNode;
}

/** Draws the map with Google Maps and its view. */
export const GoogleMaps = (props: IGoogleMapsProps) => {
    const googleMaps = useMapModule('library') as IGoogleMapsInternal;

    return <APIProvider apiKey={googleMaps.getParameters().apiKey}>
        <GoogleMapsUi defaultCenter={DEFAULT_CENTER} defaultZoom={DEFAULT_ZOOM} components={props.components}>
            <GoogleMapsInstance googleMaps={googleMaps} />
            {props.children}
        </GoogleMapsUi>
    </APIProvider>;
};

//inside the Google map, where vis.gl hands out its instance
const GoogleMapsInstance = (props: { googleMaps: IGoogleMapsInternal }) => {
    const instance = useGoogleMapsInstance();
    useEffect(() => instance ? props.googleMaps.setInstance(instance) : undefined, [instance]);
    return null;
};
