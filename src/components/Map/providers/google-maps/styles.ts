import { mergeStyleSets } from "@fluentui/react";
import { MAP_PROVIDER_LAYOUT } from "../layout";

export const getGoogleMapsProviderStyles = () => {
    return mergeStyleSets({
        container: MAP_PROVIDER_LAYOUT.container,
        map: [MAP_PROVIDER_LAYOUT.map, {
            //@vis.gl drops its own default style once a className is set, so this repeats all of it
            position: 'relative',
            zIndex: 0
        }],
        //Google's InfoWindow grows to whatever it is given, so a tall card would push its own header off
        //the top of the map. The cap itself follows the map's height (useCardMaxHeight) and is set inline;
        //this is the "one scrollbar, owned by the popup" rule - cards inside must not scroll themselves.
        card: {
            overflowY: 'auto',
            //the vertical scrollbar takes width from a card sized to the bubble - it must not add a horizontal one
            overflowX: 'hidden'
        }
    });
};
