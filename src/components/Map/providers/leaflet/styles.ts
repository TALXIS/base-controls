import { mergeStyleSets } from "@fluentui/react";
import { MAP_PROVIDER_LAYOUT } from "../layout";

export const getLeafletMapProviderStyles = (invertTiles: boolean) => {
    return mergeStyleSets({
        container: [MAP_PROVIDER_LAYOUT.container, {
            //raster tiles come in one fixed palette, so a dark theme filters them instead
            '.leaflet-tile-pane': invertTiles ? {
                filter: 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)'
            } : undefined,
            //Leaflet places the popup with a transform and only makes its content scroll once it exceeds
            //maxHeight. Until then the nearest scroll container is the map itself, and a card's sticky header
            //sticks to the map's edge computed from the popup's untransformed position - landing over the
            //card's rows. Always a scroll container, the content is what the header sticks to.
            '.leaflet-popup-content': {
                overflow: 'auto'
            }
        }],
        map: MAP_PROVIDER_LAYOUT.map
    });
};
