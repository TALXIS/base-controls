import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import type { IMapModule } from "../../interfaces";
import { IGoogleMapsParameters, GoogleMapsRuntime } from "./GoogleMapsRuntime";

export interface IGoogleMapsModule extends IMapModule<'library'> { }

/** Draws the map with the Google Maps JavaScript API, under a key of yours; the map waits for the API to load. */
export const createGoogleMapsModule = (parameters: IGoogleMapsParameters): IGoogleMapsModule => ({
    name: 'library',
    //the map's other modules may read the library as they load
    priority: -100,
    onLoad: async map => {
        //the loader warns when its options are set twice, as by a second map
        if (!window.google?.maps?.importLibrary) {
            setOptions({ key: parameters.apiKey });
        }
        await importLibrary('maps');
        return new GoogleMapsRuntime({ map, parameters });
    },
    onDestroy: googleMaps => (googleMaps as GoogleMapsRuntime).destroy(),
});
