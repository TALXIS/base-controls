import type { ReactNode } from "react";
import { MapRoot } from "../../Map";
import type { IMapComponents } from "../../components";
import type { IMapModule, IMapProps } from "../../interfaces";
import { GoogleMaps, IGoogleMapsComponents } from "./adapters/google-maps";
import { createGoogleMapsModule } from "./createGoogleMapsModule";

export interface IGoogleMapProps extends Omit<IMapProps, 'modules' | 'components' | 'children'> {
    /** A Google Maps JavaScript API key. */
    apiKey: string;
    /** The Map ID from Google Cloud's Map management; Google's `DEMO_MAP_ID` when left out. */
    mapId?: string;
    /** Further modules, loaded after Google Maps; read on every mount. */
    modules?: IMapModule[];
    /** Drawn in the map's box under the library's map. */
    children?: ReactNode;
    /** Replacements for the map's slots, its pins' and their popups'. */
    components?: IMapComponents & IGoogleMapsComponents;
}

/** A `Map` drawn with the Google Maps JavaScript API, under a key of yours. */
export const GoogleMap = (props: IGoogleMapProps) => {
    const { apiKey, mapId, modules, components, children, ...mapProps } = props;
    const { map, marker, ...mapComponents } = components ?? {};
    const library = createGoogleMapsModule({ apiKey, mapId, components: { map, marker } });
    return <MapRoot {...mapProps} components={mapComponents} modules={[library, ...modules ?? []]}>
        <GoogleMaps />
        {children}
    </MapRoot>;
};
