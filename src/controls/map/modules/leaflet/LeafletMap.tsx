import type { ReactNode } from "react";
import { useLatest } from "@core";
import { MapRoot } from "../../Map";
import type { IMapComponents } from "../../components";
import type { IMapModule, IMapProps } from "../../interfaces";
import { Leaflet, ILeafletComponents } from "./adapters/leaflet";
import { createLeafletModule } from "./createLeafletModule";

export interface ILeafletMapProps extends Omit<IMapProps, 'modules' | 'components' | 'children'> {
    /** The tile URL template; OpenStreetMap's by default. */
    tileUrl?: string;
    /** The attribution the tiles require; OpenStreetMap's by default. */
    attribution?: string;
    /** Further modules, loaded after Leaflet; read on every mount. */
    modules?: IMapModule[];
    /** Drawn in the map's box under the library's map. */
    children?: ReactNode;
    /** Replacements for the map's slots, its pins' and their popups'. */
    components?: IMapComponents & ILeafletComponents;
}

/** A `Map` drawn with Leaflet, over OpenStreetMap tiles unless told otherwise; import Leaflet's CSS in your app. */
export const LeafletMap = (props: ILeafletMapProps) => {
    const { tileUrl, attribution, modules, components, children, ...mapProps } = props;
    const { map, marker, ...mapComponents } = components ?? {};
    const libraryComponents = useLatest({ map, marker });
    const library = createLeafletModule({ tileUrl, attribution, getComponents: () => libraryComponents.current });
    //the library is set up as the map mounts, so new library props mount it again
    return <MapRoot key={`${tileUrl ?? ''}|${attribution ?? ''}`} {...mapProps} components={mapComponents} modules={[library, ...modules ?? []]}>
        <Leaflet />
        {children}
    </MapRoot>;
};
